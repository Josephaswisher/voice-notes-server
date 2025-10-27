# 🚀 Voice Notes Web UI - Quick Access

**Your VoiceNotes.com-style interface is LIVE!** ✨

---

## 🌐 Access the Web UI

### Open in Browser:
```
http://localhost:4000
```

**API Key** (when prompted):
```
d2f59ddd21102b61b75a476d694b46e160ff2b58fb22903237388c881028cb3e
```

---

## 📱 What You Get

### Beautiful Dashboard
- 🎨 Modern, clean interface (inspired by VoiceNotes.com)
- 📊 All your voice notes in one place
- 🔍 Instant search (keyword + AI semantic)
- 🏷️ Auto-categorization with tags
- ⚡ Real-time updates

### AI-Powered Features
- ✨ Smart titles (auto-generated)
- 📝 Summaries (2-3 sentences)
- 🎯 Key points extraction
- ✅ Action items detection
- 😊 Sentiment analysis
- 🎨 Priority detection (High/Medium/Low)
- 🧠 Semantic search (meaning-based)
- 📊 Daily/Weekly summaries

### Upload Methods
1. **Web UI**: Drag & drop audio files
2. **Telegram Bot**: Send voice messages
3. **API**: POST to `/upload` endpoint

---

## 🎯 Quick Actions

### Upload a Voice Note
1. Open http://localhost:4000
2. Click "Upload Voice Note" button
3. Drag & drop audio file (or click to browse)
4. Wait ~10 seconds for processing
5. See AI analysis instantly!

### Search Your Notes
**Keyword Search**:
- Type in search bar
- Results update instantly

**Semantic Search** (AI-powered):
- Type your query
- Click the 🧠 brain icon
- AI finds notes by meaning, not just keywords

Example:
- Search "unhappy customers" → Finds "complaints", "issues", "problems"

### Generate Summary
1. Click 📄 icon (top-right)
2. Choose "Daily" or "Weekly"
3. AI generates comprehensive summary
4. See themes, insights, action items

---

## 🎨 Interface Overview

### Left Sidebar (Dark)
- 📥 **All Notes** - Complete library
- 📅 **Today** - Today's notes
- ⭐ **Starred** - Favorites (coming soon)
- 🏷️ **Categories** - Auto-detected tags
- 🎯 **Priority** - High/Medium/Low filters

### Main Area
- 📇 **Note Cards** - Grid view with summaries
- 🔍 **Search Bar** - Instant filtering
- 🧠 **Semantic Search** - AI-powered meaning search
- 📊 **Sort Controls** - By date, priority, duration

### Detail Panel (Right)
- Shows when you click a note
- Full transcript + AI analysis
- Audio player
- Action items with checkboxes
- All metadata

---

## ⚙️ Enable Full AI Features

Currently using: **Local Whisper** (basic transcription)

To enable ALL AI features (summaries, key points, action items):

```bash
nano /home/plexus-os/voice-notes-server/.env
```

Add:
```bash
ENABLE_AI_PROCESSING=true
OPENAI_API_KEY=sk-your-openai-key-here
```

Save and restart:
```bash
pm2 restart voice-notes-api
# OR
pkill -f "node server.js" && npm start
```

**Cost**: ~$0.016 per voice note (very affordable!)

---

## 📊 API Endpoints

### Available Now
```bash
GET  /health                    # Server status
POST /upload                    # Upload audio file
POST /webhook                   # External integrations
GET  /voice-notes               # List all notes
GET  /voice-notes/:id           # Get specific note
GET  /search?q=keyword          # Keyword search
GET  /search/semantic?q=query   # AI semantic search
POST /voice-notes/:id/process   # AI analysis
POST /summary/daily             # Daily summary
POST /summary/weekly            # Weekly summary
GET  /audio/:filename           # Stream audio
```

### Example API Call
```bash
# List all notes
curl http://localhost:4000/voice-notes \
  -H "X-API-Key: d2f59ddd21102b61b75a476d694b46e160ff2b58fb22903237388c881028cb3e"

# Upload audio
curl -X POST http://localhost:4000/upload \
  -H "X-API-Key: d2f59ddd21102b61b75a476d694b46e160ff2b58fb22903237388c881028cb3e" \
  -F "audio=@voice-note.mp3"

# Semantic search
curl "http://localhost:4000/search/semantic?q=project+deadline" \
  -H "X-API-Key: d2f59ddd21102b61b75a476d694b46e160ff2b58fb22903237388c881028cb3e"
```

---

## 🎯 Pro Tips

### Best Voice Notes
- Speak clearly and at moderate pace
- Include dates, names, numbers
- State action items explicitly ("I need to...")
- Add context (what, when, why, who)

### Example Good Note:
```
"Meeting with Sarah from Acme Corp on October 27th.
We discussed the Q4 budget - they approved $50,000.
I need to prepare feature specifications by November 1st
and schedule a follow-up meeting next week."
```

**AI will extract**:
- People: Sarah, Acme Corp
- Dates: Oct 27, Nov 1, next week
- Budget: $50,000
- Actions: prepare specs, schedule meeting
- Categories: work, client, budget, meeting

---

## 🔧 Management Commands

### Check Status
```bash
curl http://localhost:4000/health
```

### View Logs
```bash
tail -f /home/plexus-os/voice-notes-server/data/combined.log
```

### Restart Server
```bash
# If using npm directly
pkill -f "node server.js"
cd /home/plexus-os/voice-notes-server
npm start

# Or use PM2 (recommended)
pm2 restart voice-notes-api
```

### Make it Permanent (PM2)
```bash
pm2 start server.js --name voice-notes-api
pm2 save
pm2 startup
```

---

## 📱 Access from Phone

### Method 1: Local Network
```bash
# Find your local IP
hostname -I

# Access from phone on same WiFi
http://192.168.x.x:4000
```

### Method 2: ngrok (Public Access)
```bash
# Install
sudo snap install ngrok

# Get token from https://dashboard.ngrok.com/
ngrok config add-authtoken YOUR_TOKEN

# Start tunnel
ngrok http 4000

# Access from anywhere
https://abc123.ngrok.io
```

### Method 3: Telegram Bot
```bash
# Start Telegram bot (separate terminal)
npm run telegram

# Send voice messages to your bot
# They appear in web UI instantly!
```

---

## 🎉 You're All Set!

### Try it now:
1. Open **http://localhost:4000** in browser
2. Enter API key when prompted
3. Click "Upload Voice Note"
4. Drop an audio file
5. Watch the AI magic happen! ✨

---

## 🆘 Troubleshooting

**Web UI not loading?**
```bash
curl http://localhost:4000/health
# Should return: {"status":"ok",...}
```

**"Unauthorized" error?**
- Make sure you entered the correct API key
- Key: `d2f59ddd21102b61b75a476d694b46e160ff2b58fb22903237388c881028cb3e`

**Notes not showing?**
```bash
# Check if any notes exist
ls -la data/transcripts/

# Hard refresh browser
Ctrl + Shift + R
```

**AI features not working?**
- Edit `.env` and add `ENABLE_AI_PROCESSING=true`
- Add your OpenAI API key
- Restart server

---

**Server Running On**: `http://localhost:4000`
**API Key**: `d2f59ddd21102b61b75a476d694b46e160ff2b58fb22903237388c881028cb3e`

**Start using your voice notes now! 🎙️✨**
