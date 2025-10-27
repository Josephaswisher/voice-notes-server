# 🎙️ Voice Notes Server

**FREE, privacy-first voice transcription. Like VoiceNotes.com, but you own everything.**

Press and hold → Speak → Instant transcription. Unlimited. Forever. $0/month.

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![Node.js Version](https://img.shields.io/badge/node-%3E%3D18.0.0-brightgreen.svg)](https://nodejs.org/)
[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg)](CONTRIBUTING.md)
[![Docker](https://img.shields.io/badge/docker-ready-blue.svg)](Dockerfile)
[![PWA](https://img.shields.io/badge/PWA-installable-purple.svg)](PWA_GUIDE.md)

## 🚀 Deploy in 60 Seconds

```bash
# One command to get started
git clone https://github.com/Josephaswisher/voice-notes-server.git
cd voice-notes-server && cp .env.example .env && docker-compose up -d
```

**Or use 1-click deploy**: [See all deployment options →](EASY_DEPLOY.md)

> **New?** Try the [live demo](http://localhost:4000) first → Install later

## ✨ Features

### 🎯 Core Features
- 🎙️ **Voice Note Capture** - Upload via web, API, or Telegram bot
- ⚡ **[Handy Mode](HANDY_MODE.md)** - Press-and-hold real-time transcription (inspired by [Handy](https://github.com/cjpais/Handy))
- 📱 **[Progressive Web App](PWA_GUIDE.md)** - Install on phone/tablet/desktop like a native app
- 🆓 **FREE Local Transcription** - OpenAI Whisper (no API costs!)
- 🧠 **Voice Activity Detection** - Silero VAD filters silence automatically
- 🌐 **Beautiful Web UI** - VoiceNotes.com-inspired dashboard
- 🔍 **Smart Search** - Keyword + AI semantic search
- 📱 **Mobile Access** - Telegram bot integration
- 🎵 **Audio Playback** - Built-in audio player
- 📊 **Real-time Updates** - Instant sync across devices
- ⚡ **Offline Caching** - Works offline with service workers

### 🧠 AI Features (Optional)
- ✨ **Smart Titles** - Auto-generated descriptive titles
- 📝 **Auto-Summaries** - 2-3 sentence overviews
- 🎯 **Key Points** - Bullet-point extraction
- ✅ **Action Items** - Task detection with checkboxes
- 🏷️ **Auto-Categories** - Smart tagging (#work, #personal, etc)
- 😊 **Sentiment Analysis** - Positive/neutral/negative detection
- 🔴 **Priority Detection** - High/medium/low classification
- 📈 **Daily/Weekly Summaries** - Aggregate insights

### 🌍 Multi-Language Support
- 99+ languages supported
- Automatic language detection
- High accuracy across all languages

## 🚀 Quick Start

### Prerequisites
- Node.js >= 18.0.0
- npm or yarn
- Python 3.8+ (for local Whisper)
- ffmpeg (for audio processing)

### Installation

```bash
# Clone the repository
git clone https://github.com/YOUR_USERNAME/voice-notes-server.git
cd voice-notes-server

# Install dependencies
npm install

# Install local Whisper (FREE transcription)
sudo apt-get install -y ffmpeg
pipx install openai-whisper

# Configure environment
cp .env.example .env
nano .env  # Add your configuration

# Start the server
npm start

# Or with PM2 (recommended for production)
pm2 start server.js --name voice-notes-api
pm2 save
```

### Access

**Web UI**: http://localhost:4000

**API**: Use the API key from your `.env` file

## 📖 Documentation

- [🚀 Quick Start Guide](🚀-START-HERE.md)
- [⚡ Handy Mode - Real-Time Transcription](HANDY_MODE.md) ⭐ NEW!
- [📱 Progressive Web App (PWA) Guide](PWA_GUIDE.md) ⭐ NEW!
- [📱 Telegram Bot Setup](TELEGRAM_SETUP.md)
- [🎨 Web UI Guide](WEB_UI_COMPLETE.md)
- [🆓 Local Whisper Setup](LOCAL_WHISPER_SETUP.md)
- [🧠 AI Features](VOICENOTES_FEATURES.md)
- [📊 Complete Setup](SETUP_COMPLETE.md)

## 💰 Cost

### FREE Tier (Default)
- ✅ Transcription: **$0.00** (local Whisper)
- ✅ Storage: **$0.00** (self-hosted)
- ✅ Web UI: **$0.00**
- ✅ Telegram: **$0.00**

**Total: $0.00/month**

### With OpenAI AI Features (Optional)
- 💰 AI Analysis: ~$0.01 per note
- **Example**: 100 notes/month = $1.00/month

## 🎯 Use Cases

### Personal
- 📝 Daily journal with AI summaries
- 💡 Idea capture with auto-categorization
- ✅ Voice-to-task conversion
- 📅 Meeting notes with action items

### Professional
- 🤝 Client call summaries
- 📞 Interview transcripts
- 🔬 Research observations
- 📊 Field notes with sentiment analysis

### Teams
- 🗣️ Daily standup summaries
- 💭 Brainstorming sessions
- 📋 Action item tracking
- 📈 Feedback analysis

## 🔧 Configuration

### Environment Variables

```bash
# Server
PORT=4000
NODE_ENV=production
API_SECRET_KEY=your-secret-key

# Transcription
USE_LOCAL_WHISPER=true          # FREE local transcription
WHISPER_MODEL=base               # tiny, base, small, medium, large

# OpenAI (optional)
OPENAI_API_KEY=sk-your-key      # For AI features
ENABLE_AI_PROCESSING=true        # Enable AI analysis

# Telegram Bot (optional)
TELEGRAM_BOT_TOKEN=your-token
TELEGRAM_ALLOWED_USERS=user-id-1,user-id-2

# Storage
VOICE_NOTES_DIR=./data/voice-notes
TRANSCRIPTS_DIR=./data/transcripts
```

### Whisper Models

| Model | Speed | Accuracy | RAM | Best For |
|-------|-------|----------|-----|----------|
| tiny | 5s | 75% | 500MB | Quick tests |
| base | 8s | 85% | 800MB | **Default** ✨ |
| small | 15s | 90% | 1.5GB | Better accuracy |
| medium | 30s | 95% | 3GB | High accuracy |
| large | 60s | 98% | 5GB | Professional |

## 📡 API Endpoints

### Upload Voice Note
```bash
POST /upload
Headers: X-API-Key: your-key
Body: multipart/form-data with 'audio' field
```

### List Voice Notes
```bash
GET /voice-notes
Headers: X-API-Key: your-key
```

### Search
```bash
GET /search?q=keyword
GET /search/semantic?q=query  # AI semantic search
Headers: X-API-Key: your-key
```

### Generate Summary
```bash
POST /summary/daily
POST /summary/weekly
Headers: X-API-Key: your-key
```

## 📱 Mobile Access

### Telegram Bot
```bash
# Set up in 5 minutes
./setup-telegram.sh

# Send voice messages from phone
# Get instant transcripts!
```

### Public Access (ngrok)
```bash
ngrok http 4000
# Access from anywhere: https://abc123.ngrok.io
```

## 🛠️ Development

### Running Tests
```bash
npm test
```

### Linting
```bash
npm run lint
```

### Local Development
```bash
npm run dev  # Runs with nodemon for auto-reload
```

## 🤝 Contributing

Contributions are welcome! Please read [CONTRIBUTING.md](CONTRIBUTING.md) for details.

### Development Setup
1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- [OpenAI Whisper](https://github.com/openai/whisper) - Amazing speech recognition
- [VoiceNotes.com](https://voicenotes.com) - Inspiration for features
- [Express.js](https://expressjs.com/) - Web framework
- [Telegram Bot API](https://core.telegram.org/bots/api) - Bot integration

## 🆘 Support

- 📖 [Documentation](docs/)
- 🐛 [Issue Tracker](https://github.com/YOUR_USERNAME/voice-notes-server/issues)
- 💬 [Discussions](https://github.com/YOUR_USERNAME/voice-notes-server/discussions)

## 🗺️ Roadmap

- [ ] Mobile app (iOS/Android)
- [ ] Voice search
- [ ] Speaker diarization
- [ ] Meeting minutes generator
- [ ] Calendar integration
- [ ] Team collaboration features
- [ ] Chrome extension
- [ ] Obsidian/Notion plugins

## ⭐ Star History

If you find this project useful, please consider giving it a star! ⭐

---

**Made with ❤️ by the Voice Notes team**

**Self-hosted • Privacy-first • Completely FREE**
