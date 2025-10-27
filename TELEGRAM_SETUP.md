# 📱 Telegram Bot Setup - Step-by-Step Guide

**Send voice messages from anywhere → Instant transcription & AI analysis** ✨

---

## 🎯 What You'll Get

- 📱 Send voice messages from your phone
- ⚡ Instant transcription (< 10 seconds)
- 🧠 AI analysis (summaries, key points, actions)
- 🌐 Notes appear in web UI immediately
- 🔒 Secure (only you can use the bot)
- 🚀 Works from anywhere in the world

---

## 📋 Setup Steps (5 Minutes)

### Step 1: Create Telegram Bot

1. Open Telegram on your phone or computer
2. Search for `@BotFather` (verified account with blue checkmark)
3. Start chat and send: `/newbot`
4. BotFather asks: "Alright, a new bot. How are we going to call it?"
   - Enter a name: `My Voice Notes Bot` (or any name you like)
5. BotFather asks: "Now choose a username for your bot."
   - Must end in "bot"
   - Example: `myvoicenotes_bot` or `yourname_voice_bot`
   - Must be unique across all Telegram
6. **Success!** BotFather replies with your bot token

**Copy the token** - looks like:
```
123456789:ABCdefGHIjklMNOpqrsTUVwxyz-1234567890
```

### Step 2: Configure the Bot

Edit the `.env` file:
```bash
nano /home/plexus-os/voice-notes-server/.env
```

Find this line:
```bash
TELEGRAM_BOT_TOKEN=your-telegram-bot-token
```

Replace with your actual token:
```bash
TELEGRAM_BOT_TOKEN=123456789:ABCdefGHIjklMNOpqrsTUVwxyz-1234567890
```

**Save**: `Ctrl+O`, `Enter`, `Ctrl+X`

### Step 3: Get Your User ID

Start the bot (temporarily):
```bash
cd /home/plexus-os/voice-notes-server
npm run telegram
```

Now on Telegram:
1. Find your bot (search for the username you created)
2. Click "START" or send `/start`
3. Bot replies with: **"Your User ID: 123456789"**
4. **Copy this number!**

Press `Ctrl+C` to stop the bot for now.

### Step 4: Set Allowed Users (Security)

Edit `.env` again:
```bash
nano .env
```

Find:
```bash
TELEGRAM_ALLOWED_USERS=your-telegram-user-id
```

Replace with your user ID:
```bash
TELEGRAM_ALLOWED_USERS=123456789
```

**Multiple users?** Separate with commas:
```bash
TELEGRAM_ALLOWED_USERS=123456789,987654321,555666777
```

**Save**: `Ctrl+O`, `Enter`, `Ctrl+X`

### Step 5: Start the Bot (Production Mode)

Using PM2 (recommended):
```bash
pm2 start telegram-bot.js --name voice-notes-bot
pm2 save
```

Or run directly:
```bash
npm run telegram
```

---

## ✅ Test It!

### Send a Voice Message

1. Open Telegram
2. Go to your bot
3. **Record a voice message** (hold microphone button)
4. Send it!

Bot replies with:
```
✅ Transcription Complete

[Your transcript here...]

📝 Summary: [AI summary if enabled]
🎯 Key Points:
  • Point 1
  • Point 2

✅ Action Items:
  • Task 1

🏷️ Categories: #category1 #category2
😊 Sentiment: Positive
🔴 Priority: High
```

### Check Web UI

1. Open: http://localhost:4000
2. Your note appears instantly!
3. Click to see full details

---

## 🎙️ Bot Commands

Send these to your bot:

### `/start`
```
Start the bot and get your User ID
```

### `/help`
```
Show all available commands
```

### `/list`
```
Show recent voice notes (last 10)
```

### `/search keyword`
```
Search your notes
Example: /search meeting
```

### `/stats`
```
Your voice notes statistics:
- Total notes
- Total duration
- Most used categories
```

### `/latest`
```
Get your most recent voice note
```

---

## 🔧 Configuration Options

### Enable AI Processing

Edit `.env`:
```bash
ENABLE_AI_PROCESSING=true
OPENAI_API_KEY=sk-your-openai-key
```

**Without AI**: Basic transcription only
**With AI**: Full VoiceNotes.com experience!

### Customize Bot Responses

Edit `telegram-bot.js` to customize:
- Welcome message
- Response format
- Additional commands
- Auto-replies

---

## 📊 What the Bot Does

### On Voice Message:

1. **Downloads audio** from Telegram servers
2. **Transcribes** using OpenAI Whisper (or local)
3. **AI Analysis** (if enabled):
   - Generates summary
   - Extracts key points
   - Detects action items
   - Assigns categories
   - Analyzes sentiment
   - Determines priority
4. **Saves** to database
5. **Replies** with transcript + analysis
6. **Updates** web UI instantly

### Processing Time:
- Short note (30s): ~5 seconds
- Medium note (2 min): ~10 seconds
- Long note (5 min): ~15 seconds

---

## 🔒 Security Features

### User Whitelist
Only allowed users can use bot:
```bash
TELEGRAM_ALLOWED_USERS=123456789,987654321
```

Anyone else gets:
```
❌ Unauthorized. This bot is private.
```

### Bot Token Security
- Never share your bot token
- If leaked, create new bot with BotFather
- Token gives full control of your bot

### Rate Limiting
Built-in protection:
- 100 requests/hour per user
- Prevents spam/abuse

---

## 📱 Mobile Workflow

### Capture Ideas Anywhere

**Morning Commute**:
```
🎤 "Idea for new feature: Add voice search
     to the dashboard. Should be quick search
     with autocomplete..."
```
→ Instant transcription
→ Categorized as #ideas #features
→ Action items extracted

**After Meeting**:
```
🎤 "Met with client today. They want delivery
     by December 1st. Budget approved for $50k.
     Need to schedule follow-up next week..."
```
→ Dates extracted: Dec 1, next week
→ Budget: $50k
→ Action: Schedule follow-up
→ Category: #work #client #meeting

**Shopping/Errands**:
```
🎤 "Need to buy milk, eggs, bread.
     Also pick up prescription from pharmacy..."
```
→ Shopping list extracted
→ Action items created
→ Category: #personal #errands

---

## 🎯 Pro Tips

### Voice Message Best Practices

1. **Speak Clearly**: Better transcription accuracy
2. **One Topic Per Message**: Easier AI categorization
3. **State Dates/Names**: AI extracts them better
4. **Include Actions**: "I need to...", "Must do..."

### Example Good Messages:

✅ **Good**:
```
"Meeting with John tomorrow at 3pm about Q4 project.
He wants status update. I need to prepare slides
and send them by tonight."
```

❌ **Less Optimal**:
```
"Uh... so like... tomorrow... yeah...
meeting thing... need to do stuff..."
```

### Multiple Short Notes > One Long Note

Better:
- ✅ 3 focused notes (1 min each)
- Better categorization
- Easier to search
- Clearer action items

Worse:
- ❌ 1 long rambling note (10 min)
- Mixed topics
- Harder to extract actions

---

## 🚀 Advanced Features

### Forward Voice Messages

**From other chats**:
1. Someone sends you voice message
2. Forward it to your bot
3. Bot transcribes it!

Great for:
- Meeting recordings
- Interviews
- Podcasts snippets

### Batch Processing

Send multiple voice messages quickly:
- Bot queues them
- Processes in order
- Replies to each individually

### Integration with Web UI

**Bidirectional sync**:
- Send via Telegram → Appears in web
- Upload via web → Searchable via bot

### n8n Automation

Bot can trigger n8n workflows:
- Create Notion pages
- Add tasks to Todoist
- Send email summaries
- Calendar events

---

## 🆘 Troubleshooting

### Bot not responding?

**Check if running**:
```bash
pm2 list
# Should show: voice-notes-bot | online
```

**View logs**:
```bash
pm2 logs voice-notes-bot
```

**Restart**:
```bash
pm2 restart voice-notes-bot
```

### "Unauthorized" error?

**Check allowed users**:
```bash
grep TELEGRAM_ALLOWED_USERS .env
```

**Add your user ID**:
```bash
nano .env
# Add: TELEGRAM_ALLOWED_USERS=YOUR_USER_ID
pm2 restart voice-notes-bot
```

### Transcription fails?

**Check configuration**:
```bash
grep OPENAI_API_KEY .env
# OR
grep USE_LOCAL_WHISPER .env
```

**Enable local Whisper** (free):
```bash
echo "USE_LOCAL_WHISPER=true" >> .env
pm2 restart voice-notes-bot
```

### Bot shows "offline" in Telegram?

**Token issue**:
- Verify token is correct in `.env`
- No extra spaces/quotes
- Format: `TELEGRAM_BOT_TOKEN=123456:ABC...`

**Restart bot**:
```bash
pm2 restart voice-notes-bot
```

---

## 📊 PM2 Management

### Check Status
```bash
pm2 status
```

Shows:
```
┌─────┬───────────────────┬─────────┬─────────┐
│ id  │ name              │ status  │ cpu     │
├─────┼───────────────────┼─────────┼─────────┤
│ 0   │ voice-notes-api   │ online  │ 0%      │
│ 1   │ voice-notes-bot   │ online  │ 0%      │
└─────┴───────────────────┴─────────┴─────────┘
```

### View Logs
```bash
# Real-time logs
pm2 logs voice-notes-bot

# Last 100 lines
pm2 logs voice-notes-bot --lines 100

# Error logs only
pm2 logs voice-notes-bot --err
```

### Restart
```bash
pm2 restart voice-notes-bot
```

### Stop
```bash
pm2 stop voice-notes-bot
```

### Auto-start on Boot
```bash
pm2 startup
pm2 save
```

---

## 🎉 You're Ready!

### Quick Start Commands

```bash
# 1. Edit config
nano .env
# Add: TELEGRAM_BOT_TOKEN=...
# Add: TELEGRAM_ALLOWED_USERS=...

# 2. Start bot
pm2 start telegram-bot.js --name voice-notes-bot
pm2 save

# 3. Test it
# Send voice message to your bot on Telegram

# 4. Check web UI
# Open http://localhost:4000
# Your note appears!
```

---

## 📚 Next Steps

### Enable Full AI
```bash
nano .env
# Add: ENABLE_AI_PROCESSING=true
# Add: OPENAI_API_KEY=sk-...
pm2 restart voice-notes-bot
```

### Set Up Public Access (ngrok)
```bash
sudo snap install ngrok
ngrok config add-authtoken YOUR_TOKEN
ngrok http 4000
# Access web UI from anywhere!
```

### Integrate with n8n
```bash
# Add to .env:
N8N_WEBHOOK_URL=http://localhost:5678/webhook/voice-notes
pm2 restart voice-notes-bot
```

---

**Your Telegram bot is ready to capture voice notes from anywhere!** 📱✨

**Cost**: $0.006/minute (very affordable!)
**Speed**: ~10 seconds per note
**Quality**: Professional-grade transcription

**Start sending voice messages now!** 🎙️
