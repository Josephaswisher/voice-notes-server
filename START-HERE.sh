#!/bin/bash

# Voice Notes Server - Quick Start Script
# Opens the web UI in your default browser

echo "🎙️  Voice Notes Server - Quick Start"
echo "===================================="
echo ""

# Check if server is running
if curl -s http://localhost:4000/health > /dev/null 2>&1; then
    echo "✅ Server is running on port 4000"
    echo ""
    echo "📊 Server Status:"
    curl -s http://localhost:4000/health | jq .
    echo ""
    echo "🌐 Web UI: http://localhost:4000"
    echo "🔑 API Key: d2f59ddd21102b61b75a476d694b46e160ff2b58fb22903237388c881028cb3e"
    echo ""
    echo "Opening web UI in browser..."

    # Open in browser (works on most systems)
    if command -v xdg-open > /dev/null; then
        xdg-open http://localhost:4000
    elif command -v gnome-open > /dev/null; then
        gnome-open http://localhost:4000
    elif command -v open > /dev/null; then
        open http://localhost:4000
    else
        echo "Please open http://localhost:4000 in your browser"
    fi
else
    echo "❌ Server is not running!"
    echo ""
    echo "Starting server now..."
    cd "$(dirname "$0")"
    npm start &

    echo "Waiting for server to start..."
    sleep 3

    if curl -s http://localhost:4000/health > /dev/null 2>&1; then
        echo "✅ Server started successfully!"
        echo ""
        echo "🌐 Web UI: http://localhost:4000"
        echo "🔑 API Key: d2f59ddd21102b61b75a476d694b46e160ff2b58fb22903237388c881028cb3e"
        echo ""

        # Open in browser
        if command -v xdg-open > /dev/null; then
            xdg-open http://localhost:4000
        elif command -v gnome-open > /dev/null; then
            gnome-open http://localhost:4000
        elif command -v open > /dev/null; then
            open http://localhost:4000
        else
            echo "Please open http://localhost:4000 in your browser"
        fi
    else
        echo "❌ Failed to start server"
        echo "Check logs at: data/combined.log"
    fi
fi

echo ""
echo "📚 Quick Commands:"
echo "   View logs:  tail -f data/combined.log"
echo "   Check status: curl http://localhost:4000/health"
echo "   Stop server: pkill -f 'node server.js'"
echo ""
