# 🚀 Easy Deployment Guide

**Get Voice Notes running in 5 minutes with ZERO coding knowledge!**

Choose your deployment method based on your comfort level:

---

## 🎯 Quick Comparison

| Method | Time | Difficulty | Cost | Best For |
|--------|------|-----------|------|----------|
| **Docker** | 2 min | ⭐ Easy | FREE | Most people |
| **Railway** | 1 min | ⭐ Super Easy | FREE tier | Click and go |
| **Render** | 3 min | ⭐ Easy | FREE tier | Set and forget |
| **DigitalOcean** | 5 min | ⭐⭐ Medium | $5/mo | Full control |
| **Local** | 10 min | ⭐⭐⭐ Hard | FREE | Tech-savvy |

---

## 🐳 Option 1: Docker (RECOMMENDED)

**Why**: One command, works everywhere, easiest setup.

### Prerequisites
- Computer with Docker installed ([Get Docker](https://docs.docker.com/get-docker/))

### Step 1: Download the App

```bash
# Clone or download from GitHub
git clone https://github.com/Josephaswisher/voice-notes-server.git
cd voice-notes-server

# OR download ZIP from GitHub and extract
```

### Step 2: Create Configuration

```bash
# Copy the example config
cp .env.example .env

# Edit config (optional - has defaults)
nano .env
```

**Minimal .env** (everything else is optional):
```bash
API_SECRET_KEY=your-secret-key-here
```

### Step 3: Start the App

```bash
# One command to start everything!
docker-compose up -d

# Check if running
docker-compose ps

# View logs
docker-compose logs -f
```

### Step 4: Open the App

```
🌐 Web UI: http://localhost:4000
⚡ Handy Mode: http://localhost:4000/handy-mode.html
```

### Managing the App

```bash
# Stop the app
docker-compose down

# Update to latest version
git pull
docker-compose up -d --build

# View logs
docker-compose logs -f

# Restart
docker-compose restart
```

**That's it! 🎉**

---

## ☁️ Option 2: Railway (1-Click Deploy)

**Why**: Literally one click. No terminal needed. FREE hosting.

### Step 1: Click Deploy Button

[![Deploy on Railway](https://railway.app/button.svg)](https://railway.app/template/voice-notes)

### Step 2: Configure

1. **Fork the repository** when prompted
2. **Set environment variables**:
   ```
   PORT=4000
   API_SECRET_KEY=your-secret-key
   USE_LOCAL_WHISPER=true
   WHISPER_MODEL=base
   ```
3. Click **"Deploy"**

### Step 3: Access Your App

Railway will give you a URL like:
```
https://voice-notes-production-abc123.up.railway.app
```

### Features
- ✅ Automatic HTTPS
- ✅ Auto-updates when you push to GitHub
- ✅ FREE tier: 500 hours/month
- ✅ Custom domain support

**FREE Tier Limits**:
- 500 execution hours/month
- Enough for ~16 hours/day
- Perfect for personal use!

---

## 🎨 Option 3: Render (Free Hosting)

**Why**: Free hosting, auto-deploys from GitHub, zero configuration.

### Step 1: Connect GitHub

1. Go to [render.com](https://render.com)
2. Sign up (free)
3. Click **"New +"** → **"Web Service"**
4. Connect your GitHub account
5. Select `voice-notes-server` repository

### Step 2: Configure

**Settings**:
- **Name**: voice-notes
- **Environment**: Docker
- **Plan**: Free
- **Build Command**: (auto-detected from Dockerfile)
- **Start Command**: (auto-detected)

**Environment Variables**:
```
PORT=4000
API_SECRET_KEY=your-secret-key
USE_LOCAL_WHISPER=true
WHISPER_MODEL=base
```

### Step 3: Deploy

Click **"Create Web Service"** → Render builds and deploys!

Your app will be at:
```
https://voice-notes.onrender.com
```

**FREE Tier**:
- Unlimited apps
- Auto-sleep after 15 min inactivity
- Wakes up automatically when accessed

---

## 🌊 Option 4: DigitalOcean App Platform

**Why**: Reliable, fast, great for production. $5/month.

### Step 1: Create App

1. Go to [DigitalOcean App Platform](https://cloud.digitalocean.com/apps)
2. Click **"Create App"**
3. Select **"GitHub"** → Choose repository
4. Select branch: **main**

### Step 2: Configure

**Settings**:
- **Resource Type**: Web Service
- **Dockerfile Path**: Dockerfile
- **HTTP Port**: 4000
- **Instance Size**: Basic ($5/mo)

**Environment Variables**:
```
API_SECRET_KEY=your-secret-key
USE_LOCAL_WHISPER=true
WHISPER_MODEL=base
OPENAI_API_KEY=sk-... (optional)
```

### Step 3: Deploy

Click **"Create Resources"** → App deploys in ~5 minutes

**Benefits**:
- ✅ Always on (no sleep)
- ✅ Fast performance
- ✅ Free SSL certificate
- ✅ Custom domains
- ✅ Auto-scaling

**Cost**: $5/month

---

## 💻 Option 5: Your Own Server

**Why**: Full control, maximum privacy, cheapest long-term.

### VPS Providers (Pick One)

| Provider | Price | Link |
|----------|-------|------|
| **DigitalOcean** | $5/mo | [Get $200 credit](https://m.do.co/c/abc123) |
| **Linode** | $5/mo | [Get $100 credit](https://linode.com) |
| **Vultr** | $5/mo | [Sign up](https://vultr.com) |
| **Hetzner** | €4/mo | [Sign up](https://hetzner.com) |

### Quick Setup (Ubuntu 22.04)

```bash
# 1. SSH into your server
ssh root@your-server-ip

# 2. Install Docker
curl -fsSL https://get.docker.com | sh

# 3. Clone the repository
git clone https://github.com/Josephaswisher/voice-notes-server.git
cd voice-notes-server

# 4. Create .env file
cp .env.example .env
nano .env  # Set API_SECRET_KEY

# 5. Start the app
docker-compose up -d

# 6. Optional: Set up domain with SSL
# See PRODUCTION_GUIDE.md
```

**Access**:
```
http://your-server-ip:4000
```

---

## 🏠 Option 6: Home Server / Raspberry Pi

**Why**: Run on existing hardware, 100% FREE, complete privacy.

### Supported Devices
- ✅ Any Linux computer
- ✅ Raspberry Pi 4 (4GB+ RAM recommended)
- ✅ Old laptop/desktop
- ✅ NAS (Synology, QNAP)

### Setup

```bash
# 1. Install Docker
curl -fsSL https://get.docker.com | sh

# 2. Clone repository
git clone https://github.com/Josephaswisher/voice-notes-server.git
cd voice-notes-server

# 3. Configure
cp .env.example .env
# Edit .env with your settings

# 4. Start
docker-compose up -d

# 5. Access on local network
http://raspberrypi.local:4000
# OR
http://192.168.1.X:4000
```

### Optional: Remote Access

**Method 1: Cloudflare Tunnel (FREE)**
```bash
# Install cloudflared
curl -L https://github.com/cloudflare/cloudflared/releases/latest/download/cloudflared-linux-amd64 -o cloudflared
chmod +x cloudflared

# Start tunnel
./cloudflared tunnel --url http://localhost:4000

# You'll get a URL like:
# https://abc-def-ghi.trycloudflare.com
```

**Method 2: ngrok (FREE tier)**
```bash
# Install ngrok
curl -s https://ngrok-agent.s3.amazonaws.com/ngrok.asc | sudo tee /etc/apt/trusted.gpg.d/ngrok.asc >/dev/null
echo "deb https://ngrok-agent.s3.amazonaws.com buster main" | sudo tee /etc/apt/sources.list.d/ngrok.list
sudo apt update && sudo apt install ngrok

# Start tunnel
ngrok http 4000

# Get HTTPS URL from output
```

---

## 📱 Mobile-Only Setup

**Why**: You only have a phone, no computer needed!

### Option A: Termux (Android)

1. **Install Termux** from F-Droid (not Google Play)
2. **Setup**:
```bash
# Update packages
pkg update && pkg upgrade

# Install dependencies
pkg install nodejs git

# Clone repository
git clone https://github.com/Josephaswisher/voice-notes-server.git
cd voice-notes-server

# Install
npm install

# Start
npm start
```

3. **Access**: Open Chrome, go to `http://localhost:4000`

### Option B: Use Free Hosting (Railway/Render)

See Option 2 or 3 above - works entirely from phone browser!

---

## 🔧 Troubleshooting

### Docker Won't Start

```bash
# Check Docker is running
docker --version
docker ps

# If not running:
sudo systemctl start docker

# Check logs
docker-compose logs
```

### Port 4000 Already in Use

```bash
# Find what's using port 4000
sudo lsof -i :4000

# Kill the process
sudo kill -9 <PID>

# OR change port in docker-compose.yml:
ports:
  - "5000:4000"  # Now use port 5000 instead
```

### Can't Access from Other Devices

```bash
# Check firewall
sudo ufw allow 4000

# Get your IP address
ip addr show | grep "inet "

# Access from other devices using:
http://YOUR-IP:4000
```

### Whisper Transcription Slow

```bash
# Use faster model
# Edit .env:
WHISPER_MODEL=tiny   # Fastest, less accurate
WHISPER_MODEL=base   # Balanced (default)
WHISPER_MODEL=small  # Slower, more accurate
```

### Out of Memory

```bash
# Reduce Whisper model size
WHISPER_MODEL=tiny

# OR increase Docker memory:
# Docker Desktop → Settings → Resources → Memory: 4GB+
```

---

## 🎯 Which Method Should You Choose?

### For Complete Beginners
→ **Railway** (1-click deploy, nothing to install)

### For Home Use
→ **Docker** (easy, runs on your computer)

### For Always-On Access
→ **Render** (free hosting, no sleep)

### For Best Performance
→ **DigitalOcean** ($5/mo, professional)

### For Maximum Privacy
→ **Home Server** (100% your data, 100% your control)

---

## 🚀 After Deployment

### 1. Secure Your Installation

```bash
# Change default API key
nano .env
# Set strong API_SECRET_KEY

# Restart
docker-compose restart
```

### 2. Enable HTTPS (Production)

```bash
# Option A: Cloudflare Tunnel (easiest)
cloudflared tunnel --url http://localhost:4000

# Option B: Nginx + Let's Encrypt (traditional)
# See PRODUCTION_GUIDE.md
```

### 3. Install as PWA

1. Open app in browser
2. Look for install prompt or icon
3. Click "Install"
4. Access like native app!

### 4. Set Up Telegram Bot (Optional)

```bash
# Follow guide:
cat TELEGRAM_SETUP.md
```

---

## 💡 Pro Tips

### Tip 1: Custom Domain

Most hosting platforms support custom domains:

```
1. Buy domain from Namecheap/Google Domains
2. Point DNS to hosting platform
3. Enable SSL (automatic on most platforms)
4. Access: https://voicenotes.yourdomain.com
```

### Tip 2: Auto-Backups

```bash
# Backup voice notes data
docker-compose exec voice-notes tar -czf /tmp/backup.tar.gz /app/data

# Copy to host
docker cp voice-notes-server:/tmp/backup.tar.gz ./backup-$(date +%Y%m%d).tar.gz

# Automate with cron:
0 2 * * * cd /path/to/voice-notes-server && docker-compose exec voice-notes tar -czf /tmp/backup.tar.gz /app/data && docker cp voice-notes-server:/tmp/backup.tar.gz ./backups/backup-$(date +\%Y\%m\%d).tar.gz
```

### Tip 3: Multiple Users

```bash
# Create separate instances with different ports
cp -r voice-notes-server voice-notes-user2
cd voice-notes-user2

# Edit docker-compose.yml:
ports:
  - "4001:4000"  # Different port

docker-compose up -d
```

### Tip 4: Performance Monitoring

```bash
# Check Docker stats
docker stats voice-notes-server

# Check logs
docker-compose logs -f --tail=100

# Health check
curl http://localhost:4000/
```

---

## 📚 Additional Resources

- **Full Documentation**: [README.md](README.md)
- **Handy Mode Guide**: [HANDY_MODE.md](HANDY_MODE.md)
- **PWA Installation**: [PWA_GUIDE.md](PWA_GUIDE.md)
- **Telegram Bot**: [TELEGRAM_SETUP.md](TELEGRAM_SETUP.md)
- **Production Setup**: [PRODUCTION_GUIDE.md](PRODUCTION_GUIDE.md)
- **GitHub Issues**: [Report Problems](https://github.com/Josephaswisher/voice-notes-server/issues)

---

## ❓ Frequently Asked Questions

### Q: Do I need to pay for anything?

**A:** No! Everything is FREE:
- ✅ Software: FREE (open source)
- ✅ Transcription: FREE (local Whisper)
- ✅ Hosting options: Railway/Render have FREE tiers
- 💰 Optional: $5/mo for better hosting (DigitalOcean)

### Q: Can I use this on my phone?

**A:** Yes! Three ways:
1. Install as PWA (works like native app)
2. Use Telegram bot (send voice messages)
3. Access web UI from mobile browser

### Q: Is my data private?

**A:** 100% YES if self-hosted:
- Audio never leaves your server
- Transcription happens locally
- No third-party services (unless you enable OpenAI features)
- You control everything

### Q: How accurate is the transcription?

**A:** Very accurate:
- Whisper Base model: ~85% accuracy
- Whisper Medium: ~95% accuracy
- Whisper Large: ~98% accuracy
- Supports 99+ languages automatically

### Q: Can multiple people use it?

**A:** Yes:
- Each person gets their own API key
- Install on multiple devices
- Share via Telegram bot
- Or deploy separate instances

### Q: What if I get stuck?

**A:**
1. Check [TROUBLESHOOTING.md](TROUBLESHOOTING.md)
2. Search [GitHub Issues](https://github.com/Josephaswisher/voice-notes-server/issues)
3. Open new issue with details
4. Join community Discord (coming soon)

---

## 🎉 You're Ready!

Pick your deployment method above and get started in minutes.

**Most Popular Choice**: Docker (works everywhere, easiest)

```bash
git clone https://github.com/Josephaswisher/voice-notes-server.git
cd voice-notes-server
cp .env.example .env
docker-compose up -d
```

Open http://localhost:4000 → Start speaking! 🎙️

---

**Need help?** [Open an issue](https://github.com/Josephaswisher/voice-notes-server/issues) - we're here to help! 💙
