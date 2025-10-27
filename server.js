#!/usr/bin/env node
/**
 * PLEXUS-OS Voice Notes Server
 *
 * Receives voice notes via:
 * - HTTP webhook (from mobile apps, web forms)
 * - Telegram bot (easiest for mobile)
 * - Direct file upload
 *
 * Processes with:
 * - OpenAI Whisper API (paid, accurate)
 * - Local Whisper (free, runs on your machine)
 *
 * Stores:
 * - Original audio files
 * - Transcripts (plain text + metadata)
 * - SQLite database for search
 */

require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const multer = require('multer');
const cors = require('cors');
const helmet = require('helmet');
const { RateLimiterMemory } = require('rate-limiter-flexible');
const winston = require('winston');
const fs = require('fs').promises;
const path = require('path');
const { v4: uuidv4 } = require('uuid');
const OpenAI = require('openai');
const axios = require('axios');
const aiProcessor = require('./ai-processor');
const { transcribeLocal } = require('./local-whisper');

// Initialize Express
const app = express();
const PORT = process.env.PORT || 3000;

// Create data directories
const DATA_DIR = path.join(__dirname, 'data');
const VOICE_NOTES_DIR = process.env.VOICE_NOTES_DIR || path.join(DATA_DIR, 'voice-notes');
const TRANSCRIPTS_DIR = process.env.TRANSCRIPTS_DIR || path.join(DATA_DIR, 'transcripts');

// Logger setup
const logger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
  ),
  transports: [
    new winston.transports.File({ filename: path.join(DATA_DIR, 'error.log'), level: 'error' }),
    new winston.transports.File({ filename: path.join(DATA_DIR, 'combined.log') }),
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.colorize(),
        winston.format.simple()
      )
    })
  ]
});

// Rate limiter (100 requests per hour per IP)
const rateLimiter = new RateLimiterMemory({
  points: 100,
  duration: 3600,
});

// Middleware
app.use(helmet({
  contentSecurityPolicy: false, // Allow inline scripts for web UI
}));
app.use(cors());
app.use(bodyParser.json({ limit: '50mb' }));
app.use(bodyParser.urlencoded({ extended: true, limit: '50mb' }));

// Serve static files from public directory
app.use(express.static(path.join(__dirname, 'public')));

// Rate limiting middleware
const rateLimiterMiddleware = async (req, res, next) => {
  try {
    await rateLimiter.consume(req.ip);
    next();
  } catch (error) {
    logger.warn(`Rate limit exceeded for IP: ${req.ip}`);
    res.status(429).json({ error: 'Too many requests' });
  }
};

app.use(rateLimiterMiddleware);

// API key authentication middleware
const authenticateAPIKey = (req, res, next) => {
  const apiKey = req.headers['x-api-key'] || req.query.apiKey;

  if (!apiKey || apiKey !== process.env.API_SECRET_KEY) {
    logger.warn(`Unauthorized access attempt from ${req.ip}`);
    return res.status(401).json({ error: 'Unauthorized' });
  }

  next();
};

// Multer setup for file uploads
const storage = multer.diskStorage({
  destination: async (req, file, cb) => {
    await ensureDirectoryExists(VOICE_NOTES_DIR);
    cb(null, VOICE_NOTES_DIR);
  },
  filename: (req, file, cb) => {
    const uniqueName = `${Date.now()}-${uuidv4()}${path.extname(file.originalname)}`;
    cb(null, uniqueName);
  }
});

const upload = multer({
  storage,
  limits: { fileSize: 50 * 1024 * 1024 }, // 50MB limit
  fileFilter: (req, file, cb) => {
    const allowedTypes = /mp3|wav|ogg|m4a|opus|webm|oga/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);

    if (extname && mimetype) {
      cb(null, true);
    } else {
      cb(new Error('Only audio files are allowed'));
    }
  }
});

// OpenAI client (for Whisper transcription)
let openai;
if (process.env.OPENAI_API_KEY) {
  openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
}

// Helper: Ensure directory exists
async function ensureDirectoryExists(dir) {
  try {
    await fs.access(dir);
  } catch {
    await fs.mkdir(dir, { recursive: true });
    logger.info(`Created directory: ${dir}`);
  }
}

// Helper: Save metadata
async function saveMetadata(voiceNoteId, metadata) {
  await ensureDirectoryExists(TRANSCRIPTS_DIR);
  const metadataPath = path.join(TRANSCRIPTS_DIR, `${voiceNoteId}.json`);
  await fs.writeFile(metadataPath, JSON.stringify(metadata, null, 2));
  logger.info(`Metadata saved: ${metadataPath}`);
}

// Helper: Transcribe audio using OpenAI Whisper
async function transcribeWithOpenAI(audioPath) {
  if (!openai) {
    throw new Error('OpenAI API key not configured');
  }

  logger.info(`Transcribing with OpenAI Whisper: ${audioPath}`);

  const transcription = await openai.audio.transcriptions.create({
    file: fs.createReadStream(audioPath),
    model: 'whisper-1',
    language: 'en', // or auto-detect
    response_format: 'verbose_json'
  });

  return {
    text: transcription.text,
    language: transcription.language,
    duration: transcription.duration,
    segments: transcription.segments
  };
}

// Helper: Transcribe audio using local Whisper
async function transcribeWithLocalWhisper(audioPath) {
  logger.info(`Transcribing with local Whisper: ${audioPath}`);

  try {
    const result = await transcribeLocal(audioPath, {
      model: process.env.WHISPER_MODEL || 'base',
      language: 'auto'
    });

    return {
      text: result.text,
      language: result.language,
      duration: result.duration,
      segments: result.segments,
      method: 'local-whisper',
      model: result.model,
      processingTime: result.processingTime
    };
  } catch (error) {
    logger.error('Local Whisper error:', error);
    throw error;
  }
}

// Helper: Process voice note
async function processVoiceNote(audioPath, metadata = {}) {
  const voiceNoteId = path.basename(audioPath, path.extname(audioPath));

  logger.info(`Processing voice note: ${voiceNoteId}`);

  try {
    // Transcribe
    let transcription;
    if (process.env.USE_LOCAL_WHISPER === 'true') {
      transcription = await transcribeWithLocalWhisper(audioPath);
    } else if (openai) {
      transcription = await transcribeWithOpenAI(audioPath);
    } else {
      throw new Error('No transcription method configured');
    }

    // Save transcript
    const transcriptPath = path.join(TRANSCRIPTS_DIR, `${voiceNoteId}.txt`);
    await fs.writeFile(transcriptPath, transcription.text);

    // AI Processing (if enabled)
    let aiAnalysis = null;
    let smartTitle = null;
    if (process.env.ENABLE_AI_PROCESSING === 'true' && openai) {
      try {
        aiAnalysis = await aiProcessor.processTranscriptWithAI(transcription.text);
        smartTitle = await aiProcessor.generateTitle(transcription.text);
        logger.info('AI analysis completed');
      } catch (error) {
        logger.error('AI processing failed:', error.message);
      }
    }

    // Save metadata
    const fullMetadata = {
      id: voiceNoteId,
      title: smartTitle || `Voice Note ${new Date().toLocaleDateString()}`,
      timestamp: new Date().toISOString(),
      audioPath: `/audio/${path.basename(audioPath)}`,
      transcriptPath,
      transcription,
      aiAnalysis,
      duration: metadata.duration || 0,
      ...metadata
    };

    await saveMetadata(voiceNoteId, fullMetadata);

    // Optional: Send to n8n
    if (process.env.N8N_WEBHOOK_URL) {
      try {
        await axios.post(process.env.N8N_WEBHOOK_URL, fullMetadata);
        logger.info('Sent to n8n webhook');
      } catch (error) {
        logger.error('Failed to send to n8n:', error.message);
      }
    }

    logger.info(`Voice note processed successfully: ${voiceNoteId}`);

    return {
      success: true,
      voiceNoteId,
      transcription: transcription.text,
      metadata: fullMetadata
    };

  } catch (error) {
    logger.error(`Failed to process voice note: ${error.message}`);
    throw error;
  }
}

// Routes

// Health check
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    whisperMethod: process.env.USE_LOCAL_WHISPER === 'true' ? 'local' : 'openai'
  });
});

// Upload voice note (with authentication)
app.post('/upload', authenticateAPIKey, upload.single('audio'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No audio file uploaded' });
    }

    logger.info(`Voice note uploaded: ${req.file.filename}`);

    // Process in background
    processVoiceNote(req.file.path, {
      source: 'upload',
      originalName: req.file.originalname,
      size: req.file.size,
      mimeType: req.file.mimetype,
      userMetadata: req.body
    }).catch(error => {
      logger.error('Background processing error:', error);
    });

    res.json({
      success: true,
      message: 'Voice note received and processing',
      voiceNoteId: path.basename(req.file.filename, path.extname(req.file.filename))
    });

  } catch (error) {
    logger.error('Upload error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Webhook endpoint (for external services)
app.post('/webhook', authenticateAPIKey, upload.single('audio'), async (req, res) => {
  try {
    logger.info('Webhook received:', req.body);

    // Handle different webhook formats
    let audioUrl = req.body.audioUrl || req.body.audio_url || req.body.fileUrl;

    if (req.file) {
      // File uploaded directly
      processVoiceNote(req.file.path, {
        source: 'webhook-upload',
        payload: req.body
      }).catch(error => logger.error('Processing error:', error));

      return res.json({
        success: true,
        message: 'Voice note received'
      });
    } else if (audioUrl) {
      // Download from URL
      const voiceNoteId = uuidv4();
      const audioPath = path.join(VOICE_NOTES_DIR, `${voiceNoteId}.ogg`);

      // Download audio
      const response = await axios.get(audioUrl, { responseType: 'stream' });
      const writer = fs.createWriteStream(audioPath);
      response.data.pipe(writer);

      await new Promise((resolve, reject) => {
        writer.on('finish', resolve);
        writer.on('error', reject);
      });

      processVoiceNote(audioPath, {
        source: 'webhook-url',
        originalUrl: audioUrl,
        payload: req.body
      }).catch(error => logger.error('Processing error:', error));

      return res.json({
        success: true,
        message: 'Voice note downloaded and processing'
      });
    } else {
      return res.status(400).json({ error: 'No audio file or URL provided' });
    }

  } catch (error) {
    logger.error('Webhook error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Get voice note by ID
app.get('/voice-notes/:id', authenticateAPIKey, async (req, res) => {
  try {
    const { id } = req.params;
    const metadataPath = path.join(TRANSCRIPTS_DIR, `${id}.json`);

    const metadata = JSON.parse(await fs.readFile(metadataPath, 'utf8'));
    res.json(metadata);

  } catch (error) {
    if (error.code === 'ENOENT') {
      return res.status(404).json({ error: 'Voice note not found' });
    }
    res.status(500).json({ error: error.message });
  }
});

// List all voice notes
app.get('/voice-notes', authenticateAPIKey, async (req, res) => {
  try {
    await ensureDirectoryExists(TRANSCRIPTS_DIR);
    const files = await fs.readdir(TRANSCRIPTS_DIR);

    const voiceNotes = await Promise.all(
      files
        .filter(file => file.endsWith('.json'))
        .map(async file => {
          const metadata = JSON.parse(
            await fs.readFile(path.join(TRANSCRIPTS_DIR, file), 'utf8')
          );
          return metadata;
        })
    );

    // Sort by timestamp (newest first)
    voiceNotes.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

    res.json(voiceNotes);

  } catch (error) {
    logger.error('List error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Search voice notes
app.get('/search', authenticateAPIKey, async (req, res) => {
  try {
    const { q } = req.query;

    if (!q) {
      return res.status(400).json({ error: 'Query parameter "q" required' });
    }

    await ensureDirectoryExists(TRANSCRIPTS_DIR);
    const files = await fs.readdir(TRANSCRIPTS_DIR);

    const matches = [];

    for (const file of files) {
      if (!file.endsWith('.json')) continue;

      const metadata = JSON.parse(
        await fs.readFile(path.join(TRANSCRIPTS_DIR, file), 'utf8')
      );

      if (metadata.transcription && metadata.transcription.text) {
        const text = metadata.transcription.text.toLowerCase();
        if (text.includes(q.toLowerCase())) {
          matches.push(metadata);
        }
      }
    }

    res.json({
      query: q,
      matches: matches.length,
      results: matches
    });

  } catch (error) {
    logger.error('Search error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Semantic search (AI-powered)
app.get('/search/semantic', authenticateAPIKey, async (req, res) => {
  try {
    const { q } = req.query;

    if (!q) {
      return res.status(400).json({ error: 'Query parameter "q" required' });
    }

    // Get all voice notes
    await ensureDirectoryExists(TRANSCRIPTS_DIR);
    const files = await fs.readdir(TRANSCRIPTS_DIR);

    const allNotes = await Promise.all(
      files
        .filter(file => file.endsWith('.json'))
        .map(async file => {
          return JSON.parse(
            await fs.readFile(path.join(TRANSCRIPTS_DIR, file), 'utf8')
          );
        })
    );

    // Use AI semantic search
    const results = await aiProcessor.semanticSearch(q, allNotes);

    res.json(results);

  } catch (error) {
    logger.error('Semantic search error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Process voice note with AI
app.post('/voice-notes/:id/process', authenticateAPIKey, async (req, res) => {
  try {
    const { id } = req.params;
    const metadataPath = path.join(TRANSCRIPTS_DIR, `${id}.json`);

    const metadata = JSON.parse(await fs.readFile(metadataPath, 'utf8'));

    if (!metadata.transcription || !metadata.transcription.text) {
      return res.status(400).json({ error: 'No transcript available' });
    }

    // Process with AI
    const aiAnalysis = await aiProcessor.processTranscriptWithAI(metadata.transcription.text);
    const smartTitle = await aiProcessor.generateTitle(metadata.transcription.text);

    // Update metadata
    metadata.aiAnalysis = aiAnalysis;
    metadata.title = smartTitle;

    await fs.writeFile(metadataPath, JSON.stringify(metadata, null, 2));

    res.json({
      success: true,
      id,
      title: smartTitle,
      aiAnalysis
    });

  } catch (error) {
    logger.error('AI processing error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Generate daily/weekly summary
app.post('/summary/:period', authenticateAPIKey, async (req, res) => {
  try {
    const { period } = req.params;

    if (!['daily', 'weekly'].includes(period)) {
      return res.status(400).json({ error: 'Period must be "daily" or "weekly"' });
    }

    // Get recent voice notes
    await ensureDirectoryExists(TRANSCRIPTS_DIR);
    const files = await fs.readdir(TRANSCRIPTS_DIR);

    const now = new Date();
    const cutoff = new Date();
    if (period === 'daily') {
      cutoff.setDate(cutoff.getDate() - 1);
    } else {
      cutoff.setDate(cutoff.getDate() - 7);
    }

    const recentNotes = [];

    for (const file of files) {
      if (!file.endsWith('.json')) continue;

      const metadata = JSON.parse(
        await fs.readFile(path.join(TRANSCRIPTS_DIR, file), 'utf8')
      );

      if (new Date(metadata.timestamp) >= cutoff) {
        recentNotes.push(metadata);
      }
    }

    if (recentNotes.length === 0) {
      return res.json({
        period,
        summary: `No voice notes found in the ${period} period.`
      });
    }

    // Generate AI summary
    const summary = await aiProcessor.generateSummary(recentNotes, period);

    res.json({
      period,
      noteCount: recentNotes.length,
      summary
    });

  } catch (error) {
    logger.error('Summary generation error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Serve audio files
app.get('/audio/:filename', authenticateAPIKey, (req, res) => {
  const audioPath = path.join(VOICE_NOTES_DIR, req.params.filename);
  res.sendFile(audioPath);
});

// Initialize
async function init() {
  try {
    await ensureDirectoryExists(DATA_DIR);
    await ensureDirectoryExists(VOICE_NOTES_DIR);
    await ensureDirectoryExists(TRANSCRIPTS_DIR);

    logger.info('Voice Notes Server initialized');
    logger.info(`Voice notes directory: ${VOICE_NOTES_DIR}`);
    logger.info(`Transcripts directory: ${TRANSCRIPTS_DIR}`);
    logger.info(`Whisper method: ${process.env.USE_LOCAL_WHISPER === 'true' ? 'Local' : 'OpenAI API'}`);

    app.listen(PORT, () => {
      logger.info(`🎙️  Voice Notes Server running on port ${PORT}`);
      logger.info(`📡 Webhook endpoint: http://localhost:${PORT}/webhook`);
      logger.info(`📤 Upload endpoint: http://localhost:${PORT}/upload`);
      logger.info(`🔍 Search endpoint: http://localhost:${PORT}/search?q=keyword`);
      logger.info(`🔑 Use header: X-API-Key: ${process.env.API_SECRET_KEY}`);
    });

  } catch (error) {
    logger.error('Failed to initialize:', error);
    process.exit(1);
  }
}

init();
