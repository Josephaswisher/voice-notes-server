#!/bin/bash
# PLEXUS Voice Notes Server - Quick Setup

echo "╔════════════════════════════════════════╗"
echo "║   PLEXUS Voice Notes Server Setup     ║"
echo "╚════════════════════════════════════════╝"
echo ""

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js not found. Please install Node.js first."
    echo "   sudo apt install nodejs npm"
    exit 1
fi

echo "✓ Node.js found: $(node --version)"
echo ""

# Install dependencies
echo "📦 Installing dependencies..."
npm install

if [ $? -ne 0 ]; then
    echo "❌ npm install failed"
    exit 1
fi

echo "✓ Dependencies installed"
echo ""

# Create .env if doesn't exist
if [ ! -f .env ]; then
    echo "📝 Creating .env file..."
    cp .env.example .env

    # Generate random API key
    API_KEY=$(openssl rand -hex 32)
    sed -i "s/your-secret-key-here-change-this/$API_KEY/" .env

    echo "✓ .env created with random API key"
    echo ""
    echo "⚠️  IMPORTANT: Edit .env and add your keys:"
    echo "   1. TELEGRAM_BOT_TOKEN (create bot: @BotFather)"
    echo "   2. OPENAI_API_KEY (get from: platform.openai.com)"
    echo "   3. TELEGRAM_ALLOWED_USERS (your Telegram user ID)"
    echo ""
else
    echo "✓ .env already exists"
    echo ""
fi

# Create data directories
echo "📁 Creating data directories..."
mkdir -p data/voice-notes data/transcripts

echo "✓ Data directories created"
echo ""

# Make scripts executable
chmod +x server.js telegram-bot.js

echo "╔════════════════════════════════════════╗"
echo "║           Setup Complete! ✓            ║"
echo "╚════════════════════════════════════════╝"
echo ""
echo "Next steps:"
echo ""
echo "1. Edit .env and add your API keys:"
echo "   nano .env"
echo ""
echo "2. Start the HTTP server:"
echo "   npm start"
echo "   or: node server.js"
echo ""
echo "3. Start the Telegram bot (separate terminal):"
echo "   npm run telegram"
echo "   or: node telegram-bot.js"
echo ""
echo "4. Test the webhook:"
echo "   curl -X POST http://localhost:3000/health"
echo ""
echo "📚 See README.md for full documentation"
echo ""
