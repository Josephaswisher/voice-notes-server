# 🎙️ Handy Mode - Real-Time Transcription

**Inspired by [Handy](https://github.com/cjpais/Handy)** - Privacy-first speech-to-text

---

## What is Handy Mode?

A **real-time dictation interface** inspired by cjpais/Handy that brings press-and-hold transcription to your voice notes server.

### How It Works

```
Press and hold → Speak → Release → Instant transcription
```

Just like Handy, but integrated with your voice notes system for automatic saving!

---

## Features

### ✨ Handy-Inspired Features

- ✅ **Voice Activity Detection (VAD)** - Uses Silero VAD to detect speech
- ✅ **Press-and-Hold Interface** - Simple, intuitive recording
- ✅ **Real-time Feedback** - Visual indicators when speech detected
- ✅ **Keyboard Shortcut** - Press SPACE to record (hands-free!)
- ✅ **Privacy-First** - All processing on your server
- ✅ **Offline Capable** - Works with local Whisper

### 🎯 Enhanced Features

- 💾 **Auto-Save to Library** - Transcriptions saved to your voice notes
- 📊 **Session Stats** - Track words, sessions, total time
- 📋 **One-Click Copy** - Copy text to clipboard
- 🧠 **AI Analysis** - Optional GPT-4 summaries and key points
- 🔍 **Searchable Archive** - Find old dictations instantly

---

## Quick Start

### Access Handy Mode

```bash
# 1. Ensure server is running
pm2 status voice-notes-api

# 2. Open in browser
http://localhost:4000/handy-mode.html
```

### Usage

**Mouse/Trackpad**:
1. Press and hold microphone button
2. Speak naturally
3. Release to transcribe

**Keyboard**:
1. Press and hold SPACE bar
2. Speak naturally
3. Release to transcribe

**Mobile/Touch**:
1. Press and hold microphone
2. Speak naturally
3. Release to transcribe

---

## Comparison: Handy vs Handy Mode

| Feature | Original Handy | Handy Mode (Ours) |
|---------|----------------|-------------------|
| **Platform** | Desktop app (Tauri) | Web app |
| **Transcription** | Local Whisper/Parakeet | Your server (Whisper) |
| **Output** | Types into ANY app | Browser + saves to library |
| **Privacy** | 100% offline | Server-based (still private) |
| **Storage** | None (direct typing) | Automatic archive |
| **AI Features** | None | Optional summaries |
| **Access** | Desktop only | Any device + Telegram |
| **Global Hotkey** | Yes (OS-level) | Yes (browser-level) |

---

## Technical Details

### Voice Activity Detection (VAD)

Uses **@ricky0123/vad-web** (same Silero VAD as Handy):

```javascript
const vad = await MicVAD.new({
  onSpeechStart: () => {
    // Visual feedback: speech detected
  },
  onSpeechEnd: (audio) => {
    // Could process chunks in real-time
  },
  positiveSpeechThreshold: 0.8,
  minSpeechFrames: 5
});
```

**Benefits**:
- Filters silence automatically
- Real-time speech detection
- Reduces processing time
- Same tech as Handy!

### Architecture

```
Browser (Handy Mode)
    ↓ WebRTC Audio
Voice Activity Detection (Silero VAD)
    ↓ Detected Speech
Your Voice Notes Server
    ↓ Local Whisper
Transcription + AI Analysis
    ↓ Save
Database Archive
```

---

## Advanced Features

### 1. Keyboard Shortcuts

| Key | Action |
|-----|--------|
| **SPACE** (hold) | Record audio |
| **Ctrl+C** | Copy transcript |
| **Ctrl+S** | Save to notes |
| **Ctrl+Backspace** | Clear transcript |

### 2. Real-Time Streaming (Future)

```javascript
// Stream audio chunks as you speak
mediaRecorder.ondataavailable = async (e) => {
  const formData = new FormData();
  formData.append('audio', e.data);

  // Real-time transcription endpoint
  const res = await fetch('/transcribe-stream', {
    method: 'POST',
    body: formData
  });

  const { partial_text } = await res.json();
  // Show partial transcription while speaking
};
```

### 3. Desktop Integration (Future)

Convert to Electron/Tauri app for:
- **Global hotkeys** (OS-level, works in any app)
- **Auto-paste** (types into active window)
- **System tray** (always available)
- **Offline mode** (bundled Whisper)

---

## Building a True Handy Clone

Want to build a standalone desktop app like Handy?

### Option 1: Fork Handy

```bash
# Clone Handy
git clone https://github.com/cjpais/Handy.git
cd Handy

# Modify transcription backend to use your server
# Edit src/lib/transcribe.ts
async function transcribe(audioBuffer) {
  // Original: Local Whisper
  // New: Send to your voice notes server
  const response = await fetch('http://localhost:4000/upload', {
    method: 'POST',
    body: audioBuffer,
    headers: { 'X-API-Key': process.env.VOICE_NOTES_API_KEY }
  });

  const { transcript } = await response.json();
  return transcript;
}
```

### Option 2: Build with Tauri (Like Handy)

```bash
# Create new Tauri app
npm create tauri-app

# Stack:
# - Rust backend (fast, lightweight)
# - React frontend (your handy-mode.html)
# - Global shortcuts (rdev)
# - Auto-paste (enigo)
```

**Benefits of Tauri**:
- 50-100MB app size (vs Electron's 200MB+)
- Native performance
- Low memory usage
- Cross-platform (Mac/Windows/Linux)

---

## Use Cases

### 1. **Quick Dictation**
```
Press SPACE → "Send email to John about project status" → Release
→ Copy text → Paste into email client
```

### 2. **Meeting Notes**
```
During meeting:
Press SPACE → Speak key points → Release
Repeat throughout meeting
End: Click "Save to Notes"
→ Full transcript in your library with AI summary
```

### 3. **Voice Commands**
```
Press SPACE → "Remind me to call Sarah tomorrow at 2pm" → Release
→ AI detects action item
→ Saved with priority flag
```

### 4. **Code Documentation**
```
Press SPACE → Explain code logic verbally → Release
→ Transcribed documentation
→ Save to notes
→ Copy to code comments
```

---

## Performance

### Speed Comparison

| Method | Time (1 min audio) | Model |
|--------|-------------------|-------|
| **Original Handy** | ~5-10s | Whisper (GPU) |
| **Original Handy** | ~12s | Parakeet V3 (CPU) |
| **Your Server** | ~8-15s | Whisper Base (CPU) |
| **Your Server** | ~30s | Whisper Medium (CPU) |

**Optimize for Speed**:
```bash
# Use faster model
nano .env
WHISPER_MODEL=tiny  # 5s processing

# Or use GPU acceleration (if available)
# Install CUDA + faster-whisper
pipx install faster-whisper
```

---

## Privacy & Security

### Data Flow

```
1. Microphone → Browser (local)
2. Browser → Your Server (localhost or VPN)
3. Server → Local Whisper (never leaves server)
4. Transcription → Database (your server)
```

**No external services!** (unless you enable OpenAI AI features)

### Make It Fully Offline

```bash
# Disable AI features (OpenAI)
nano .env
ENABLE_AI_PROCESSING=false

# Now 100% offline:
# ✅ Whisper: Local
# ✅ VAD: Browser-based
# ✅ Storage: Your server
# ✅ No internet needed
```

---

## Roadmap

### Short-term
- [ ] Add real-time streaming (transcribe while speaking)
- [ ] Multi-language support UI
- [ ] Custom VAD sensitivity settings
- [ ] Pause/resume recording

### Medium-term
- [ ] Desktop app (Tauri)
- [ ] Global hotkeys (works in any app)
- [ ] Auto-paste into active window
- [ ] Offline mode (bundled Whisper)

### Long-term
- [ ] Speaker diarization (multiple speakers)
- [ ] Punctuation model
- [ ] Custom vocabulary training
- [ ] Voice commands ("new paragraph", "send")

---

## Contributing

Inspired by Handy's "most forkable" philosophy!

**Fork this project and customize**:
- Add your own AI models
- Customize UI/UX
- Integrate with your tools
- Build desktop versions

MIT License - fork away! 🚀

---

## Credits

- **[Handy](https://github.com/cjpais/Handy)** by cjpais - Inspiration and design philosophy
- **[Silero VAD](https://github.com/snakers4/silero-vad)** - Voice Activity Detection
- **[@ricky0123/vad-web](https://github.com/ricky0123/vad)** - Browser VAD implementation
- **[OpenAI Whisper](https://github.com/openai/whisper)** - Transcription model

---

## FAQ

### Q: Why not just use Handy?

**A:** You should! Handy is excellent for:
- **Universal dictation** (types into ANY app)
- **100% offline** operation
- **Lightweight** desktop app

Use **Handy Mode** when you want:
- **Searchable archive** of all dictations
- **AI analysis** (summaries, action items)
- **Multi-device access** (web + mobile)
- **Integration** with your existing voice notes system

### Q: Can I use both?

**A:** Absolutely! Use:
- **Handy** for quick dictation (emails, docs, messages)
- **Handy Mode** for important voice notes you want to keep

### Q: How do I make it work globally (like Handy)?

**A:** Build a desktop app:
1. Fork this project
2. Convert to Electron/Tauri
3. Add global hotkey support
4. Add auto-paste functionality

See "Building a True Handy Clone" section above.

### Q: Is this as private as Handy?

**A:** Almost!
- **Handy**: 100% local, never leaves computer
- **Handy Mode**: Processing on your server (still private if self-hosted)

For 100% offline: Disable AI features and use local Whisper.

---

**Ready to try it?**

```bash
# Open Handy Mode
http://localhost:4000/handy-mode.html

# Press and hold SPACE, speak, release
# Instant transcription! 🎙️✨
```

**Like Handy, but with archiving and AI superpowers!**
