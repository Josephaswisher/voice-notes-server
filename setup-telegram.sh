#!/bin/bash

# Interactive Telegram Bot Setup Script
# Makes setting up the bot super easy!

echo "📱 Telegram Bot Setup Wizard"
echo "============================="
echo ""

cd "$(dirname "$0")"

# Check if .env exists
if [ ! -f .env ]; then
    echo "❌ .env file not found!"
    exit 1
fi

echo "This wizard will help you set up your Telegram bot in 3 easy steps:"
echo ""
echo "  1️⃣  Get bot token from @BotFather"
echo "  2️⃣  Configure the bot"
echo "  3️⃣  Get your user ID and set permissions"
echo ""
read -p "Ready to start? (y/n) " -n 1 -r
echo ""

if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo "Setup cancelled."
    exit 0
fi

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "  Step 1: Create Your Telegram Bot"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "📱 Instructions:"
echo "   1. Open Telegram (on phone or computer)"
echo "   2. Search for: @BotFather"
echo "   3. Send: /newbot"
echo "   4. Choose a name: 'My Voice Notes Bot' (or anything you like)"
echo "   5. Choose username: must end in 'bot' (example: myvoice_bot)"
echo ""
echo "BotFather will give you a TOKEN that looks like:"
echo "   123456789:ABCdefGHIjklMNOpqrsTUVwxyz-1234567890"
echo ""
read -p "Press Enter when you have your bot token..."
echo ""

# Get bot token
while true; do
    read -p "📝 Paste your bot token here: " BOT_TOKEN

    if [[ -z "$BOT_TOKEN" ]]; then
        echo "❌ Token cannot be empty. Please try again."
        continue
    fi

    # Basic validation (should be number:alphanumeric)
    if [[ ! "$BOT_TOKEN" =~ ^[0-9]+:[A-Za-z0-9_-]+$ ]]; then
        echo "⚠️  Token format looks incorrect."
        read -p "   Use it anyway? (y/n) " -n 1 -r
        echo ""
        if [[ ! $REPLY =~ ^[Yy]$ ]]; then
            continue
        fi
    fi

    break
done

# Update .env
echo ""
echo "💾 Saving bot token to .env..."

# Check if TELEGRAM_BOT_TOKEN exists in .env
if grep -q "^TELEGRAM_BOT_TOKEN=" .env; then
    # Replace existing
    sed -i "s|^TELEGRAM_BOT_TOKEN=.*|TELEGRAM_BOT_TOKEN=$BOT_TOKEN|" .env
else
    # Add new
    echo "TELEGRAM_BOT_TOKEN=$BOT_TOKEN" >> .env
fi

echo "✅ Bot token saved!"
echo ""

# Ask about OpenAI API key
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "  Step 2: Configure Transcription"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "Choose transcription method:"
echo "  1) OpenAI Whisper API (paid, very accurate) - $0.006/minute"
echo "  2) Local Whisper (free, runs on your computer) - coming soon"
echo ""
read -p "Choice (1 or 2): " -n 1 -r
echo ""

if [[ $REPLY == "1" ]]; then
    echo ""
    echo "📝 You'll need an OpenAI API key."
    echo "   Get one at: https://platform.openai.com/api-keys"
    echo ""

    # Check if already have key
    if grep -q "^OPENAI_API_KEY=sk-" .env; then
        EXISTING_KEY=$(grep "^OPENAI_API_KEY=" .env | cut -d= -f2 | cut -c1-20)
        echo "Found existing key: ${EXISTING_KEY}..."
        read -p "Keep existing key? (y/n) " -n 1 -r
        echo ""

        if [[ $REPLY =~ ^[Nn]$ ]]; then
            read -p "Enter new OpenAI API key: " OPENAI_KEY
            sed -i "s|^OPENAI_API_KEY=.*|OPENAI_API_KEY=$OPENAI_KEY|" .env
            echo "✅ API key updated!"
        else
            echo "✅ Using existing API key"
        fi
    else
        read -p "Enter your OpenAI API key (or press Enter to skip): " OPENAI_KEY

        if [[ -n "$OPENAI_KEY" ]]; then
            if grep -q "^OPENAI_API_KEY=" .env; then
                sed -i "s|^OPENAI_API_KEY=.*|OPENAI_API_KEY=$OPENAI_KEY|" .env
            else
                echo "OPENAI_API_KEY=$OPENAI_KEY" >> .env
            fi
            echo "✅ API key saved!"
        else
            echo "⚠️  Skipped - bot will show placeholder transcripts"
        fi
    fi

    # Disable local whisper
    sed -i "s|^USE_LOCAL_WHISPER=.*|USE_LOCAL_WHISPER=false|" .env

elif [[ $REPLY == "2" ]]; then
    echo "✅ Using local Whisper (free)"
    sed -i "s|^USE_LOCAL_WHISPER=.*|USE_LOCAL_WHISPER=true|" .env
fi

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "  Step 3: Get Your User ID & Set Permissions"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "Starting bot temporarily to get your user ID..."
echo ""

# Start bot in background
npm run telegram > /tmp/telegram-bot-setup.log 2>&1 &
BOT_PID=$!

sleep 3

# Check if bot started
if ! kill -0 $BOT_PID 2>/dev/null; then
    echo "❌ Bot failed to start!"
    echo ""
    echo "Error log:"
    cat /tmp/telegram-bot-setup.log
    exit 1
fi

echo "✅ Bot is running!"
echo ""
echo "📱 Now on Telegram:"
echo "   1. Find your bot (search for the username you created)"
echo "   2. Click 'START' or send: /start"
echo "   3. Bot will reply with 'Your User ID: 123456789'"
echo "   4. Copy that number"
echo ""
echo "⏳ Waiting for you to start the bot..."
read -p "Press Enter when you have your User ID..."
echo ""

# Get user ID
while true; do
    read -p "📝 Paste your User ID here: " USER_ID

    if [[ -z "$USER_ID" ]]; then
        echo "❌ User ID cannot be empty. Please try again."
        continue
    fi

    # Validate it's a number
    if [[ ! "$USER_ID" =~ ^[0-9]+$ ]]; then
        echo "⚠️  User ID should be a number."
        read -p "   Use it anyway? (y/n) " -n 1 -r
        echo ""
        if [[ ! $REPLY =~ ^[Yy]$ ]]; then
            continue
        fi
    fi

    break
done

# Stop temporary bot
echo ""
echo "🛑 Stopping temporary bot..."
kill $BOT_PID 2>/dev/null
sleep 2

# Update .env with user ID
if grep -q "^TELEGRAM_ALLOWED_USERS=" .env; then
    sed -i "s|^TELEGRAM_ALLOWED_USERS=.*|TELEGRAM_ALLOWED_USERS=$USER_ID|" .env
else
    echo "TELEGRAM_ALLOWED_USERS=$USER_ID" >> .env
fi

echo "✅ User ID saved!"
echo ""

# Optional: Enable AI processing
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "  Bonus: Enable AI Features (Optional)"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "AI features add:"
echo "  ✨ Smart titles (instead of 'Voice Note 2025-10-27')"
echo "  📝 Summaries (2-3 sentences)"
echo "  🎯 Key points extraction"
echo "  ✅ Action items detection"
echo "  🏷️ Auto-categorization"
echo "  😊 Sentiment analysis"
echo "  🔴 Priority detection"
echo ""
echo "Cost: ~$0.01 per note (very affordable!)"
echo ""
read -p "Enable AI features? (y/n) " -n 1 -r
echo ""

if [[ $REPLY =~ ^[Yy]$ ]]; then
    if grep -q "^OPENAI_API_KEY=sk-" .env; then
        sed -i "s|^ENABLE_AI_PROCESSING=.*|ENABLE_AI_PROCESSING=true|" .env || echo "ENABLE_AI_PROCESSING=true" >> .env
        echo "✅ AI features enabled!"
    else
        echo "⚠️  Need OpenAI API key first"
        read -p "   Enter OpenAI API key now? (y/n) " -n 1 -r
        echo ""
        if [[ $REPLY =~ ^[Yy]$ ]]; then
            read -p "OpenAI API key: " OPENAI_KEY
            if [[ -n "$OPENAI_KEY" ]]; then
                if grep -q "^OPENAI_API_KEY=" .env; then
                    sed -i "s|^OPENAI_API_KEY=.*|OPENAI_API_KEY=$OPENAI_KEY|" .env
                else
                    echo "OPENAI_API_KEY=$OPENAI_KEY" >> .env
                fi
                sed -i "s|^ENABLE_AI_PROCESSING=.*|ENABLE_AI_PROCESSING=true|" .env || echo "ENABLE_AI_PROCESSING=true" >> .env
                echo "✅ AI features enabled!"
            fi
        fi
    fi
else
    echo "ℹ️  AI features disabled (you can enable later)"
fi

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "  🎉 Setup Complete!"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "✅ Telegram bot configured"
echo "✅ User permissions set"
echo "✅ Transcription method selected"
echo ""

# Ask if they want to start the bot now
echo "Ready to start the bot?"
echo ""
read -p "Start bot now? (y/n) " -n 1 -r
echo ""

if [[ $REPLY =~ ^[Yy]$ ]]; then
    echo ""
    echo "🚀 Starting bot with PM2..."

    # Check if already running
    if pm2 list | grep -q "voice-notes-bot"; then
        echo "   Bot already exists in PM2, restarting..."
        pm2 restart voice-notes-bot
    else
        pm2 start telegram-bot.js --name voice-notes-bot
    fi

    pm2 save

    sleep 2

    # Check if running
    if pm2 list | grep -q "voice-notes-bot.*online"; then
        echo ""
        echo "✅ Bot is running!"
        echo ""
        echo "📊 View logs:"
        echo "   pm2 logs voice-notes-bot"
        echo ""
        echo "🎙️ Test it:"
        echo "   1. Open Telegram"
        echo "   2. Go to your bot"
        echo "   3. Send a voice message"
        echo "   4. Get instant transcript!"
        echo ""
    else
        echo "❌ Bot failed to start"
        echo "   View logs: pm2 logs voice-notes-bot"
    fi
else
    echo ""
    echo "To start the bot later:"
    echo "   pm2 start telegram-bot.js --name voice-notes-bot"
    echo "   pm2 save"
    echo ""
fi

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "📚 Documentation: TELEGRAM_SETUP.md"
echo "🌐 Web UI: http://localhost:4000"
echo "📱 Telegram: Your bot is ready!"
echo ""
echo "Happy voice noting! 🎙️✨"
echo ""
