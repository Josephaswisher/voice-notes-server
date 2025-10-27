#!/usr/bin/env node
/**
 * Telegram Bot for Voice Notes
 *
 * Usage:
 * 1. Create bot: Talk to @BotFather on Telegram
 * 2. Get token: /newbot command
 * 3. Add token to .env: TELEGRAM_BOT_TOKEN=...
 * 4. Get your user ID: /start command
 * 5. Add to .env: TELEGRAM_ALLOWED_USERS=your-id
 * 6. Run: node telegram-bot.js
 *
 * Send voice notes to bot, get transcripts back!
 */

require('dotenv').config();
const TelegramBot = require('node-telegram-bot-api');
const fs = require('fs').promises;
const path = require('path');
const { v4: uuidv4 } = require('uuid');
const OpenAI = require('openai');
const axios = require('axios');

// Configuration
const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const ALLOWED_USERS = (process.env.TELEGRAM_ALLOWED_USERS || '').split(',').filter(Boolean);
const DATA_DIR = path.join(__dirname, 'data');
const VOICE_NOTES_DIR = path.join(DATA_DIR, 'voice-notes');
const TRANSCRIPTS_DIR = path.join(DATA_DIR, 'transcripts');

if (!BOT_TOKEN) {
  console.error('❌ TELEGRAM_BOT_TOKEN not set in .env');
  console.error('   Create a bot: https://t.me/BotFather');
  process.exit(1);
}

// Initialize bot
const bot = new TelegramBot(BOT_TOKEN, { polling: true });

// OpenAI for transcription
let openai;
if (process.env.OPENAI_API_KEY) {
  openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
}

// Helper: Check if user is allowed
function isAllowed(userId) {
  if (ALLOWED_USERS.length === 0) {
    console.warn('⚠️  No TELEGRAM_ALLOWED_USERS set - allowing all users');
    return true;
  }
  return ALLOWED_USERS.includes(String(userId));
}

// Helper: Ensure directory exists
async function ensureDirectoryExists(dir) {
  try {
    await fs.access(dir);
  } catch {
    await fs.mkdir(dir, { recursive: true });
  }
}

// Helper: Download file from Telegram
async function downloadTelegramFile(fileId) {
  try {
    const file = await bot.getFile(fileId);
    const fileUrl = `https://api.telegram.org/file/bot${BOT_TOKEN}/${file.file_path}`;

    const voiceNoteId = uuidv4();
    const ext = path.extname(file.file_path) || '.ogg';
    const localPath = path.join(VOICE_NOTES_DIR, `${voiceNoteId}${ext}`);

    // Download
    const response = await axios.get(fileUrl, { responseType: 'arraybuffer' });
    await fs.writeFile(localPath, response.data);

    return { localPath, voiceNoteId, fileSize: file.file_size };
  } catch (error) {
    console.error('Download error:', error);
    throw error;
  }
}

// Helper: Transcribe audio
async function transcribe(audioPath) {
  if (!openai) {
    return {
      text: '[OpenAI API key not configured. Add OPENAI_API_KEY to .env]',
      method: 'none'
    };
  }

  try {
    console.log(`Transcribing: ${audioPath}`);

    const transcription = await openai.audio.transcriptions.create({
      file: await fs.readFile(audioPath),
      model: 'whisper-1',
      response_format: 'verbose_json'
    });

    return {
      text: transcription.text,
      language: transcription.language,
      duration: transcription.duration,
      method: 'openai-whisper'
    };
  } catch (error) {
    console.error('Transcription error:', error);
    return {
      text: `[Transcription failed: ${error.message}]`,
      method: 'error'
    };
  }
}

// Helper: Save metadata
async function saveMetadata(voiceNoteId, metadata) {
  await ensureDirectoryExists(TRANSCRIPTS_DIR);
  const metadataPath = path.join(TRANSCRIPTS_DIR, `${voiceNoteId}.json`);
  await fs.writeFile(metadataPath, JSON.stringify(metadata, null, 2));

  const transcriptPath = path.join(TRANSCRIPTS_DIR, `${voiceNoteId}.txt`);
  await fs.writeFile(transcriptPath, metadata.transcription.text);
}

// Command: /start
bot.onText(/\/start/, async (msg) => {
  const chatId = msg.chat.id;
  const userId = msg.from.id;
  const username = msg.from.username || msg.from.first_name;

  console.log(`/start from user ${userId} (${username})`);

  const welcomeMessage = `
🎙️ *PLEXUS Voice Notes Bot*

Send me voice messages and I'll transcribe them!

*Your User ID:* \`${userId}\`

*Commands:*
/start - Show this message
/list - List recent voice notes
/search <keyword> - Search transcripts
/stats - Show statistics
/help - Get help

Just send a voice message to get started!
  `;

  bot.sendMessage(chatId, welcomeMessage, { parse_mode: 'Markdown' });
});

// Command: /help
bot.onText(/\/help/, async (msg) => {
  const chatId = msg.chat.id;

  const helpMessage = `
📖 *Help*

*How to use:*
1. Record voice message in Telegram
2. Send it to this bot
3. Wait for transcription (usually <10 seconds)
4. Get transcript + saved to database

*Commands:*
/list - Show recent voice notes
/search <keyword> - Find specific notes
/stats - View statistics

*Tips:*
• Speak clearly for better accuracy
• Keep notes under 5 minutes
• Use /search to find old notes

*Setup:*
If you're the owner, add your user ID to .env:
\`TELEGRAM_ALLOWED_USERS=${msg.from.id}\`
  `;

  bot.sendMessage(chatId, helpMessage, { parse_mode: 'Markdown' });
});

// Command: /list
bot.onText(/\/list/, async (msg) => {
  const chatId = msg.chat.id;
  const userId = msg.from.id;

  if (!isAllowed(userId)) {
    return bot.sendMessage(chatId, '❌ Unauthorized. Add your user ID to TELEGRAM_ALLOWED_USERS in .env');
  }

  try {
    await ensureDirectoryExists(TRANSCRIPTS_DIR);
    const files = await fs.readdir(TRANSCRIPTS_DIR);

    const jsonFiles = files.filter(f => f.endsWith('.json'));

    if (jsonFiles.length === 0) {
      return bot.sendMessage(chatId, '📭 No voice notes yet. Send one to get started!');
    }

    // Get last 10
    const recent = jsonFiles.slice(-10).reverse();

    let message = `📋 *Recent Voice Notes* (${jsonFiles.length} total)\n\n`;

    for (const file of recent) {
      const metadata = JSON.parse(
        await fs.readFile(path.join(TRANSCRIPTS_DIR, file), 'utf8')
      );

      const date = new Date(metadata.timestamp).toLocaleString();
      const preview = metadata.transcription.text.substring(0, 50);

      message += `🎙 *${date}*\n`;
      message += `   ${preview}...\n`;
      message += `   ID: \`${metadata.id}\`\n\n`;
    }

    bot.sendMessage(chatId, message, { parse_mode: 'Markdown' });

  } catch (error) {
    console.error('List error:', error);
    bot.sendMessage(chatId, `❌ Error: ${error.message}`);
  }
});

// Command: /search
bot.onText(/\/search (.+)/, async (msg, match) => {
  const chatId = msg.chat.id;
  const userId = msg.from.id;
  const query = match[1];

  if (!isAllowed(userId)) {
    return bot.sendMessage(chatId, '❌ Unauthorized');
  }

  try {
    await ensureDirectoryExists(TRANSCRIPTS_DIR);
    const files = await fs.readdir(TRANSCRIPTS_DIR);

    const matches = [];

    for (const file of files) {
      if (!file.endsWith('.json')) continue;

      const metadata = JSON.parse(
        await fs.readFile(path.join(TRANSCRIPTS_DIR, file), 'utf8')
      );

      if (metadata.transcription.text.toLowerCase().includes(query.toLowerCase())) {
        matches.push(metadata);
      }
    }

    if (matches.length === 0) {
      return bot.sendMessage(chatId, `🔍 No results for "${query}"`);
    }

    let message = `🔍 *Search Results* (${matches.length} found)\n\nQuery: "${query}"\n\n`;

    for (const m of matches.slice(0, 5)) {
      const date = new Date(m.timestamp).toLocaleString();
      message += `🎙 *${date}*\n`;
      message += `   ${m.transcription.text.substring(0, 100)}...\n\n`;
    }

    bot.sendMessage(chatId, message, { parse_mode: 'Markdown' });

  } catch (error) {
    console.error('Search error:', error);
    bot.sendMessage(chatId, `❌ Error: ${error.message}`);
  }
});

// Command: /stats
bot.onText(/\/stats/, async (msg) => {
  const chatId = msg.chat.id;
  const userId = msg.from.id;

  if (!isAllowed(userId)) {
    return bot.sendMessage(chatId, '❌ Unauthorized');
  }

  try {
    await ensureDirectoryExists(TRANSCRIPTS_DIR);
    const files = await fs.readdir(TRANSCRIPTS_DIR);

    const jsonFiles = files.filter(f => f.endsWith('.json'));
    const totalNotes = jsonFiles.length;

    let totalDuration = 0;
    let totalWords = 0;

    for (const file of jsonFiles) {
      const metadata = JSON.parse(
        await fs.readFile(path.join(TRANSCRIPTS_DIR, file), 'utf8')
      );

      if (metadata.transcription.duration) {
        totalDuration += metadata.transcription.duration;
      }

      if (metadata.transcription.text) {
        totalWords += metadata.transcription.text.split(/\s+/).length;
      }
    }

    const avgDuration = totalNotes > 0 ? (totalDuration / totalNotes).toFixed(1) : 0;
    const avgWords = totalNotes > 0 ? Math.floor(totalWords / totalNotes) : 0;

    const statsMessage = `
📊 *Voice Notes Statistics*

Total Notes: ${totalNotes}
Total Duration: ${Math.floor(totalDuration / 60)} minutes
Total Words: ${totalWords.toLocaleString()}

Average Duration: ${avgDuration}s per note
Average Words: ${avgWords} words per note

Storage: ${VOICE_NOTES_DIR}
    `;

    bot.sendMessage(chatId, statsMessage, { parse_mode: 'Markdown' });

  } catch (error) {
    console.error('Stats error:', error);
    bot.sendMessage(chatId, `❌ Error: ${error.message}`);
  }
});

// Handle voice messages
bot.on('voice', async (msg) => {
  const chatId = msg.chat.id;
  const userId = msg.from.id;
  const username = msg.from.username || msg.from.first_name;

  console.log(`Voice message from ${username} (${userId})`);

  if (!isAllowed(userId)) {
    console.warn(`Unauthorized user: ${userId}`);
    return bot.sendMessage(
      chatId,
      `❌ Unauthorized. Your user ID: \`${userId}\`\n\nAdd it to .env: TELEGRAM_ALLOWED_USERS=${userId}`,
      { parse_mode: 'Markdown' }
    );
  }

  try {
    // Send processing message
    const processingMsg = await bot.sendMessage(
      chatId,
      '🎙️ Processing voice note...'
    );

    // Download audio
    await ensureDirectoryExists(VOICE_NOTES_DIR);
    const { localPath, voiceNoteId, fileSize } = await downloadTelegramFile(msg.voice.file_id);

    console.log(`Downloaded: ${voiceNoteId}, size: ${fileSize} bytes`);

    // Update status
    await bot.editMessageText(
      '🔄 Transcribing...',
      {
        chat_id: chatId,
        message_id: processingMsg.message_id
      }
    );

    // Transcribe
    const transcription = await transcribe(localPath);

    // Save metadata
    const metadata = {
      id: voiceNoteId,
      timestamp: new Date().toISOString(),
      source: 'telegram',
      user: {
        id: userId,
        username: username
      },
      audioPath: localPath,
      fileSize,
      duration: msg.voice.duration,
      transcription
    };

    await saveMetadata(voiceNoteId, metadata);

    console.log(`Transcribed: ${voiceNoteId}`);

    // Send result
    await bot.deleteMessage(chatId, processingMsg.message_id);

    const resultMessage = `
✅ *Transcription Complete*

${transcription.text}

---
Duration: ${msg.voice.duration}s
Language: ${transcription.language || 'auto'}
ID: \`${voiceNoteId}\`
    `;

    bot.sendMessage(chatId, resultMessage, { parse_mode: 'Markdown' });

    // Optional: Forward to n8n
    if (process.env.N8N_WEBHOOK_URL) {
      try {
        await axios.post(process.env.N8N_WEBHOOK_URL, metadata);
        console.log('Sent to n8n webhook');
      } catch (error) {
        console.error('n8n webhook error:', error.message);
      }
    }

  } catch (error) {
    console.error('Voice processing error:', error);
    bot.sendMessage(chatId, `❌ Error: ${error.message}`);
  }
});

// Handle audio messages (sent as files)
bot.on('audio', async (msg) => {
  const chatId = msg.chat.id;
  bot.sendMessage(chatId, '🎵 Audio file received. Please send as voice message for transcription.');
});

// Error handling
bot.on('polling_error', (error) => {
  console.error('Polling error:', error);
});

// Initialize
async function init() {
  try {
    await ensureDirectoryExists(DATA_DIR);
    await ensureDirectoryExists(VOICE_NOTES_DIR);
    await ensureDirectoryExists(TRANSCRIPTS_DIR);

    const botInfo = await bot.getMe();

    console.log('╔════════════════════════════════════════╗');
    console.log('║   PLEXUS Voice Notes Telegram Bot     ║');
    console.log('╚════════════════════════════════════════╝');
    console.log('');
    console.log(`🤖 Bot: @${botInfo.username}`);
    console.log(`🆔 Bot ID: ${botInfo.id}`);
    console.log(`📁 Storage: ${VOICE_NOTES_DIR}`);
    console.log(`🎤 Transcription: ${openai ? 'OpenAI Whisper' : 'Not configured'}`);
    console.log('');

    if (ALLOWED_USERS.length > 0) {
      console.log(`✅ Allowed users: ${ALLOWED_USERS.join(', ')}`);
    } else {
      console.log('⚠️  WARNING: No TELEGRAM_ALLOWED_USERS set - allowing all users');
      console.log('   Set in .env: TELEGRAM_ALLOWED_USERS=your-user-id');
    }

    console.log('');
    console.log('🚀 Bot is running! Send /start to begin.');
    console.log('');

  } catch (error) {
    console.error('❌ Initialization failed:', error);
    process.exit(1);
  }
}

init();
