#!/bin/bash

# Test the voice notes server with a demo audio file

echo "🎙️  Voice Notes Server - Test Upload"
echo "===================================="
echo ""

# Configuration
API_KEY="d2f59ddd21102b61b75a476d694b46e160ff2b58fb22903237388c881028cb3e"
SERVER_URL="http://localhost:4000"

# Check if server is running
echo "1️⃣  Checking if server is running..."
if curl -s "$SERVER_URL/health" > /dev/null 2>&1; then
    echo "✅ Server is online!"
    curl -s "$SERVER_URL/health" | jq .
else
    echo "❌ Server is not running!"
    echo "   Start it with: pm2 start server.js --name voice-notes-api"
    exit 1
fi

echo ""
echo "2️⃣  Testing API endpoints..."

# Test list notes
echo ""
echo "📋 Listing current notes:"
NOTES_COUNT=$(curl -s "$SERVER_URL/voice-notes" -H "X-API-Key: $API_KEY" | jq '. | length')
echo "   Found $NOTES_COUNT notes"

# Create a demo audio file (simple beep) if we have ffmpeg
if command -v ffmpeg &> /dev/null; then
    echo ""
    echo "3️⃣  Creating demo audio file..."

    # Create a simple audio file with synthesized voice
    # (This is just a tone, but represents what would be a voice note)
    ffmpeg -f lavfi -i "sine=frequency=440:duration=2" \
           -f lavfi -i "sine=frequency=660:duration=2" \
           -filter_complex amix=inputs=2:duration=shortest \
           /tmp/demo-voice-note.mp3 -y 2>/dev/null

    if [ -f /tmp/demo-voice-note.mp3 ]; then
        echo "✅ Demo audio created: /tmp/demo-voice-note.mp3"

        echo ""
        echo "4️⃣  Uploading demo note..."

        UPLOAD_RESULT=$(curl -s -X POST "$SERVER_URL/upload" \
            -H "X-API-Key: $API_KEY" \
            -F "audio=@/tmp/demo-voice-note.mp3" \
            -F "metadata=Demo upload from test script")

        echo "$UPLOAD_RESULT" | jq .

        NOTE_ID=$(echo "$UPLOAD_RESULT" | jq -r '.voiceNoteId')

        if [ "$NOTE_ID" != "null" ]; then
            echo ""
            echo "✅ Upload successful!"
            echo "   Note ID: $NOTE_ID"
            echo ""
            echo "⏳ Waiting for processing (10 seconds)..."
            sleep 10

            echo ""
            echo "5️⃣  Fetching processed note..."
            curl -s "$SERVER_URL/voice-notes/$NOTE_ID" \
                -H "X-API-Key: $API_KEY" | jq .
        fi

        # Cleanup
        rm -f /tmp/demo-voice-note.mp3
    fi
else
    echo ""
    echo "⚠️  ffmpeg not found - skipping audio file creation"
    echo "   Install with: sudo apt install ffmpeg"
    echo ""
    echo "💡 You can manually test by uploading audio via the web UI:"
    echo "   http://localhost:4000"
fi

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "✅ Server test complete!"
echo ""
echo "🌐 Web UI: http://localhost:4000"
echo "🔑 API Key: $API_KEY"
echo ""
echo "📊 Current stats:"
echo "   Total notes: $(curl -s "$SERVER_URL/voice-notes" -H "X-API-Key: $API_KEY" | jq '. | length')"
echo ""
