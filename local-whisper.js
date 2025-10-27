#!/usr/bin/env node
/**
 * Local Whisper Transcription Module
 *
 * Uses locally installed Whisper (via pipx) to transcribe audio files
 * Completely FREE - no API costs!
 */

const { execFile } = require('child_process');
const { promisify } = require('util');
const fs = require('fs').promises;
const path = require('path');

const execFileAsync = promisify(execFile);

/**
 * Transcribe audio file using local Whisper
 *
 * @param {string} audioPath - Path to audio file
 * @param {object} options - Transcription options
 * @param {string} options.model - Whisper model size (tiny, base, small, medium, large)
 * @param {string} options.language - Language code (en, es, fr, etc.) or 'auto'
 * @param {string} options.outputDir - Directory for output files
 * @returns {Promise<object>} Transcription result
 */
async function transcribeLocal(audioPath, options = {}) {
    const {
        model = process.env.WHISPER_MODEL || 'base',
        language = 'auto',
        outputDir = path.dirname(audioPath)
    } = options;

    try {
        // Check if whisper is installed
        try {
            await execFileAsync('which', ['whisper']);
        } catch (error) {
            throw new Error('Whisper not installed. Run: pipx install openai-whisper');
        }

        // Build whisper command
        const whisperArgs = [
            audioPath,
            '--model', model,
            '--output_dir', outputDir,
            '--output_format', 'json',
            '--output_format', 'txt',
            '--verbose', 'False'
        ];

        // Add language if specified
        if (language !== 'auto') {
            whisperArgs.push('--language', language);
        }

        console.log(`[Whisper] Transcribing: ${path.basename(audioPath)}`);
        console.log(`[Whisper] Model: ${model}`);
        console.log(`[Whisper] Language: ${language === 'auto' ? 'auto-detect' : language}`);

        // Run whisper
        const startTime = Date.now();
        const { stdout, stderr } = await execFileAsync('whisper', whisperArgs, {
            maxBuffer: 10 * 1024 * 1024 // 10MB buffer
        });

        const duration = ((Date.now() - startTime) / 1000).toFixed(2);
        console.log(`[Whisper] Completed in ${duration}s`);

        // Read the output JSON file
        const baseName = path.basename(audioPath, path.extname(audioPath));
        const jsonPath = path.join(outputDir, `${baseName}.json`);
        const txtPath = path.join(outputDir, `${baseName}.txt`);

        let transcriptionData;
        try {
            const jsonContent = await fs.readFile(jsonPath, 'utf8');
            transcriptionData = JSON.parse(jsonContent);
        } catch (error) {
            console.warn('[Whisper] Could not read JSON output, using text output');
            const textContent = await fs.readFile(txtPath, 'utf8');
            transcriptionData = {
                text: textContent.trim(),
                segments: [],
                language: 'unknown'
            };
        }

        // Clean up JSON file (keep txt for records)
        try {
            await fs.unlink(jsonPath);
        } catch (error) {
            // Ignore cleanup errors
        }

        return {
            text: transcriptionData.text || '',
            language: transcriptionData.language || 'unknown',
            duration: transcriptionData.duration || 0,
            segments: transcriptionData.segments || [],
            model: model,
            method: 'local-whisper',
            processingTime: parseFloat(duration)
        };

    } catch (error) {
        console.error('[Whisper] Transcription error:', error.message);

        // Return error details
        return {
            text: `[Transcription failed: ${error.message}]`,
            language: 'unknown',
            duration: 0,
            segments: [],
            model: model,
            method: 'local-whisper-error',
            error: error.message
        };
    }
}

/**
 * Get available Whisper models
 */
function getAvailableModels() {
    return {
        'tiny': 'Fastest, least accurate (~75MB)',
        'base': 'Fast, decent accuracy (~145MB) - Recommended',
        'small': 'Balanced speed/accuracy (~500MB)',
        'medium': 'Slow, high accuracy (~1.5GB)',
        'large': 'Slowest, highest accuracy (~3GB)'
    };
}

/**
 * Check if Whisper is installed and working
 */
async function checkWhisperInstalled() {
    try {
        const { stdout } = await execFileAsync('whisper', ['--version']);
        return {
            installed: true,
            version: stdout.trim()
        };
    } catch (error) {
        return {
            installed: false,
            error: error.message
        };
    }
}

module.exports = {
    transcribeLocal,
    getAvailableModels,
    checkWhisperInstalled
};

// CLI usage
if (require.main === module) {
    const audioPath = process.argv[2];

    if (!audioPath) {
        console.log('Usage: node local-whisper.js <audio-file>');
        console.log('');
        console.log('Available models:', Object.keys(getAvailableModels()).join(', '));
        console.log('Set model: WHISPER_MODEL=small node local-whisper.js audio.mp3');
        process.exit(1);
    }

    transcribeLocal(audioPath)
        .then(result => {
            console.log('\n=== Transcription Result ===');
            console.log('Text:', result.text);
            console.log('Language:', result.language);
            console.log('Duration:', result.duration, 'seconds');
            console.log('Processing Time:', result.processingTime, 'seconds');
            console.log('Model:', result.model);
        })
        .catch(error => {
            console.error('Error:', error);
            process.exit(1);
        });
}
