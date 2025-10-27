# 🚀 Voice Notes Server - Quick Start

**Get started in 5 minutes!**

---

## Option 1: Telegram Bot (Recommended - Easiest!)

### Step 1: Create Telegram Bot

1. Open Telegram
2. Search: `@BotFather`
3. Send: `/newbot`
4. Choose name: `My Voice Notes Bot`
5. Choose username: `myvoicenotes_bot` (must end in "bot")
6. **Copy the token** (looks like: `123456789:ABCdefGHIjklMNOpqrsTUVwxyz`)

### Step 2: Configure

```bash
cd /home/plexus-os/voice-notes-server
nano .env
```

Add your token:
```
TELEGRAM_BOT_TOKEN=paste-your-token-here
OPENAI_API_KEY=sk-your-openai-key-here  # Get from platform.openai.com
```

Save: `Ctrl+O`, `Enter`, `Ctrl+X`

### Step 3: Start Bot

```bash
npm run telegram
```

Or with PM2 (background):
```bash
pm2 start telegram-bot.js --name voice-notes-bot
pm2 save
```

### Step 4: Get Your User ID

1. Find your bot on Telegram (search for username)
2. Send: `/start`
3. Bot replies with your user ID
4. Add to `.env`:
   ```
   TELEGRAM_ALLOWED_USERS=your-user-id
   ```

### Step 5: Send Voice Note!

1. Record voice message in Telegram
2. Send to your bot
3. Get instant transcript! ✨

**That's it!** 🎉

---

## Option 2: HTTP API (For Integrations)

### Step 1: Start Server

```bash
cd /home/plexus-os/voice-notes-server
npm start
```

Or with PM2:
```bash
pm2 start server.js --name voice-notes-api
pm2 save
```

### Step 2: Get API Key

```bash
grep API_SECRET_KEY .env
```

Copy the key.

### Step 3: Test

```bash
# Health check
curl http://localhost:3000/health

# Upload audio file
curl -X POST http://localhost:3000/upload \
  -H "X-API-Key: your-api-key-here" \
  -F "audio=@voice-note.mp3"
```

---

## Mobile Access (Optional)

### Quick: ngrok

```bash
# Install
sudo snap install ngrok

# Get free token: https://dashboard.ngrok.com/
ngrok config add-authtoken your-token

# Start tunnel
ngrok http 3000

# Copy HTTPS URL (e.g., https://abc123.ngrok.io)
# Use this URL from anywhere!
```

---

## Testing Without OpenAI (Free)

Don't have OpenAI API key yet? No problem!

Edit `.env`:
```
USE_LOCAL_WHISPER=true
```

**Note**: This will show placeholder transcripts. To actually transcribe:
1. Get OpenAI API key ($0.006/minute)
2. Or install local Whisper (coming soon)

---

## Quick Commands

**Start HTTP server**:
```bash
cd /home/plexus-os/voice-notes-server
npm start
```

**Start Telegram bot**:
```bash
npm run telegram
```

**Both with PM2** (background):
```bash
pm2 start server.js --name voice-notes-api
pm2 start telegram-bot.js --name voice-notes-bot
pm2 save
pm2 startup  # Auto-start on boot
```

**View logs**:
```bash
pm2 logs voice-notes-bot
pm2 logs voice-notes-api
```

**Stop services**:
```bash
pm2 stop voice-notes-bot voice-notes-api
```

---

## Troubleshooting

### Bot not starting?

**Error**: `TELEGRAM_BOT_TOKEN not set`
- Edit `.env` and add token from BotFather

**Error**: `401 Unauthorized`
- Check token is correct
- Make sure no spaces in `.env`

### Transcription not working?

**Shows placeholder text**:
- Add `OPENAI_API_KEY` to `.env`
- Get key: https://platform.openai.com/api-keys

**Error**: `Insufficient quota`
- Add credits to OpenAI account
- Costs: $0.006 per minute (~$0.36 per hour)

### Can't access from phone?

- Use ngrok for public URL
- Or use Telegram bot (works from anywhere!)

---

## Next Steps

Once running:

1. **Test it**: Send voice note via Telegram
2. **Search**: `/search keyword` to find notes
3. **Stats**: `/stats` to see usage
4. **Integrate**: Add n8n webhook URL to `.env`
5. **Automate**: Set up PM2 for always-on

---

## Get OpenAI API Key

1. Go to: https://platform.openai.com/signup
2. Create account (or sign in)
3. Add payment method: https://platform.openai.com/account/billing
4. Create API key: https://platform.openai.com/api-keys
5. Copy key (starts with `sk-`)
6. Add to `.env`: `OPENAI_API_KEY=sk-...`

**Costs**: Very cheap!
- $0.006 per minute of audio
- 1 hour = $0.36
- 100 hours = $36

---

## Support

- **Full docs**: `cat README.md`
- **Example API calls**: See README.md
- **Logs**: `tail -f data/combined.log`

---

**Ready to capture voice notes! 🎙️**
