# 📱 Progressive Web App (PWA) Guide

**Voice Notes is now a full Progressive Web App!**

Install it on your phone, tablet, or desktop and use it like a native app.

---

## ✨ What is a PWA?

A **Progressive Web App** is a web application that can be installed on your device and works like a native app:

- ✅ **Install to Home Screen** - One-tap access like any app
- ✅ **Offline Capability** - Works without internet (transcription requires server)
- ✅ **Push Notifications** - Get alerts for transcription completion
- ✅ **Fast Loading** - Cached assets load instantly
- ✅ **App-like Experience** - No browser UI, full-screen mode
- ✅ **Automatic Updates** - Always get the latest version

---

## 📱 Install on Mobile

### iOS (iPhone/iPad)

1. **Open Safari** - Must use Safari, not Chrome
2. Navigate to: `http://your-server:4000`
3. Tap the **Share** button (⬆️ icon)
4. Scroll down and tap **"Add to Home Screen"**
5. Tap **"Add"**
6. Voice Notes app icon appears on your home screen!

**Features on iOS**:
- Full-screen mode
- Works like native app
- Quick access from home screen
- Offline caching

### Android (Chrome)

1. **Open Chrome** browser
2. Navigate to: `http://your-server:4000`
3. You'll see an **"Install app"** banner at the bottom
4. Tap **"Install"**
5. OR: Tap menu (⋮) → **"Install app"** or **"Add to Home Screen"**
6. Voice Notes app installed!

**Features on Android**:
- Full-screen mode
- App icon in launcher
- Works like native app
- Offline support
- Push notifications

---

## 💻 Install on Desktop

### Chrome/Edge (Windows/Mac/Linux)

1. **Open Chrome or Edge** browser
2. Navigate to: `http://localhost:4000` (or your server address)
3. Look for **install icon** (⊕) in address bar
4. Click **"Install Voice Notes"**
5. OR: Menu (⋮) → **"Install Voice Notes..."**
6. App opens in its own window!

**Features on Desktop**:
- Standalone window (no browser UI)
- Appears in app launcher/dock
- Quick access from desktop
- Works offline

### Safari (Mac)

1. **Open Safari**
2. Navigate to: `http://localhost:4000`
3. File menu → **"Add to Dock"**
4. Voice Notes added to dock!

---

## 🚀 PWA Features

### 1. **Offline Caching**

The app caches all static files for instant loading:

```
✅ Cached:
- Web UI (HTML, CSS, JS)
- Handy Mode interface
- Icons and assets
- App manifest

⚠️ Requires Network:
- Transcription (needs server)
- AI analysis (needs server)
- File uploads
```

### 2. **Install Prompt**

When you first visit, you'll see a banner:

```
📱 Install Voice Notes as an app
   [Install]  [Not Now]
```

Click **"Install"** to add to your device!

### 3. **App Shortcuts**

Right-click the app icon (or long-press on mobile) for quick actions:

- **Handy Mode** - Jump straight to recording
- **All Notes** - View your note library

### 4. **Push Notifications** (Coming Soon)

Get notified when:
- Transcription complete
- New AI insights available
- Weekly summaries ready

### 5. **Share Target** (Mobile)

Share audio files from other apps directly to Voice Notes:

1. Open any app with audio file
2. Tap **Share** button
3. Select **"Voice Notes"**
4. Audio uploaded and transcribed automatically!

---

## ⚙️ PWA Configuration

### Manifest File: `public/manifest.json`

Controls app appearance and behavior:

```json
{
  "name": "Voice Notes - Handy Mode",
  "short_name": "VoiceNotes",
  "start_url": "/",
  "display": "standalone",
  "theme_color": "#667eea",
  "background_color": "#1a1a1a"
}
```

**Customization Options**:

| Property | Description | Options |
|----------|-------------|---------|
| `name` | Full app name | Any text (45 chars max) |
| `short_name` | Icon label | Any text (12 chars max) |
| `theme_color` | App bar color | Hex color code |
| `background_color` | Splash screen | Hex color code |
| `display` | Window mode | `standalone`, `fullscreen`, `minimal-ui` |
| `orientation` | Screen lock | `portrait`, `landscape`, `any` |

### Service Worker: `public/sw.js`

Handles offline caching and background tasks.

**Caching Strategies**:

1. **Static Assets** - Cache first, network fallback
   ```javascript
   // Fast loading from cache
   // Update in background
   ```

2. **API Calls** - Network first, cache fallback
   ```javascript
   // Always try live data
   // Use cache if offline
   ```

---

## 🎨 Custom Icons

Icons are automatically generated in all required sizes:

```bash
# Regenerate icons (if you want custom ones)
./generate-icons.sh
```

**Icon Sizes**:
- 72x72 - Android notification
- 96x96 - Android home screen (low-res)
- 128x128 - Chrome Web Store
- 144x144 - Windows tile
- 152x152 - iOS home screen
- 192x192 - Android home screen (standard)
- 384x384 - Android splash screen
- 512x512 - Android home screen (high-res)

**Custom Icon Tips**:
1. Create 512x512 PNG with your design
2. Place in `public/icons/icon-512x512.png`
3. Run `./generate-icons.sh` to create other sizes

---

## 🔧 Troubleshooting

### "Install" Button Doesn't Appear

**Possible Causes**:

1. **HTTPS Required** (except localhost)
   ```bash
   # Use HTTPS in production
   # localhost works without HTTPS
   ```

2. **Service Worker Not Registered**
   ```bash
   # Check browser console
   # Should see: "✅ Service Worker registered"
   ```

3. **Already Installed**
   ```bash
   # App is already installed
   # Uninstall and try again
   ```

4. **Browser Doesn't Support PWAs**
   ```bash
   # Use Chrome, Edge, or Safari
   # Firefox has limited PWA support
   ```

### Service Worker Not Updating

**Fix**:

```bash
# 1. Hard refresh: Ctrl+Shift+R (Cmd+Shift+R on Mac)
# 2. Clear cache: Browser Settings → Clear Browsing Data
# 3. Unregister service worker:
#    DevTools → Application → Service Workers → Unregister
# 4. Reload page
```

### App Won't Work Offline

**Check**:

```bash
# 1. Open DevTools → Application → Cache Storage
# 2. Should see: "voice-notes-v1.0.0"
# 3. Check files are cached

# 2. Network tab → Throttle to "Offline"
# 3. App should still load (but can't transcribe)
```

### Icons Don't Appear

**Fix**:

```bash
# Ensure icons exist
ls -lh public/icons/

# Should see 8 PNG files
# If missing:
./generate-icons.sh
```

---

## 📊 Testing PWA Functionality

### Chrome DevTools

1. **Open DevTools** (F12)
2. **Application Tab**
3. Check sections:

**Manifest**:
```
✅ Name: Voice Notes - Handy Mode
✅ Short name: VoiceNotes
✅ Start URL: /
✅ Display: standalone
✅ Icons: 8 icons loaded
```

**Service Workers**:
```
✅ Status: activated and running
✅ Scope: /
✅ Update on reload: [checkbox]
```

**Cache Storage**:
```
✅ voice-notes-v1.0.0 (6 items)
✅ voice-notes-offline-v1 (varies)
```

### Lighthouse Audit

1. **DevTools** → **Lighthouse** tab
2. Select **"Progressive Web App"**
3. Click **"Generate report"**
4. Should score **90+/100**

**PWA Checklist**:
- ✅ Installable
- ✅ Fast and reliable
- ✅ Works offline
- ✅ Optimized
- ✅ Has icons
- ✅ Has splash screen
- ✅ Has theme color

---

## 🌐 Production Deployment

### HTTPS Requirement

PWAs require HTTPS in production (except localhost):

**Options**:

1. **Reverse Proxy with SSL**
   ```bash
   # Use Nginx/Apache with Let's Encrypt
   ```

2. **Cloudflare Tunnel**
   ```bash
   cloudflared tunnel --url http://localhost:4000
   ```

3. **ngrok with HTTPS**
   ```bash
   ngrok http 4000
   # Get HTTPS URL: https://abc123.ngrok.io
   ```

### Update Manifest for Production

Edit `public/manifest.json`:

```json
{
  "start_url": "https://your-domain.com/",
  "scope": "https://your-domain.com/",
  ...
}
```

---

## 🚀 Advanced Features

### Background Sync

Upload voice notes even when offline:

```javascript
// Queues upload when offline
// Syncs automatically when back online
```

**Status**: ✅ Implemented

### Push Notifications

Get notified about transcriptions:

```javascript
// Server sends notification
// User receives even when app closed
```

**Status**: 🚧 Coming soon

### Periodic Background Sync

Check for new features/updates:

```javascript
// Runs daily to check for updates
// Updates service worker cache
```

**Status**: 🚧 Coming soon

---

## 📱 Platform Support

### iOS Safari
- ✅ Install to home screen
- ✅ Full-screen mode
- ✅ Offline caching
- ❌ Push notifications (iOS limitation)
- ❌ Background sync (iOS limitation)

### Android Chrome
- ✅ Install to home screen
- ✅ Full-screen mode
- ✅ Offline caching
- ✅ Push notifications
- ✅ Background sync
- ✅ Share target

### Desktop Chrome/Edge
- ✅ Install as app
- ✅ Standalone window
- ✅ Offline caching
- ✅ Push notifications
- ✅ Background sync

### Desktop Safari
- ✅ Add to dock
- ✅ Offline caching
- ⚠️ Limited PWA features

### Firefox
- ⚠️ Limited PWA support
- ✅ Service workers work
- ❌ No install prompt

---

## 🎯 Use Cases

### 1. **Mobile Voice Journaling**

```
Install on phone → Quick access from home screen
Open Handy Mode → Press and hold to speak
Transcription appears → Save to library
```

### 2. **Field Notes (Offline)**

```
Install on tablet → Works in remote areas
Record voice notes offline → Cached locally
Return to wifi → Automatic sync and transcription
```

### 3. **Desktop Quick Capture**

```
Install on computer → Runs in standalone window
Keyboard shortcut (SPACE) → Instant recording
Works alongside other apps → No browser clutter
```

---

## 💡 Tips & Best Practices

### 1. **Keep App Updated**

The app auto-updates service workers. When prompted:
```
"New version available! Reload to update?"
→ Click "OK" to get latest features
```

### 2. **Manage Cache Size**

Clear old cache periodically:
```javascript
// DevTools → Application → Clear Storage
// Selectively clear cache if needed
```

### 3. **Test Offline Mode**

Before relying on offline:
```
1. Install app
2. Open app, let it load
3. Turn off wifi
4. App should still open (but can't transcribe)
5. Turn on wifi → Functionality restored
```

### 4. **Custom Domain**

For best experience, use custom domain:
```
https://voicenotes.yourdomain.com
→ Looks professional
→ Easier to remember
→ Can use as "App Name" in manifest
```

---

## 📚 Resources

### PWA Standards
- [Web.dev PWA Guide](https://web.dev/progressive-web-apps/)
- [MDN PWA Documentation](https://developer.mozilla.org/en-US/docs/Web/Progressive_web_apps)
- [Google PWA Checklist](https://web.dev/pwa-checklist/)

### Tools
- **Lighthouse** - PWA auditing (built into Chrome DevTools)
- **PWA Builder** - https://www.pwabuilder.com/
- **Maskable.app** - Test icon masks for Android

### Testing
- **Chrome DevTools** - Application tab
- **Android**: `chrome://inspect` (for installed app debugging)
- **iOS**: Safari → Develop menu → [Device] → [App]

---

## ✅ Quick Checklist

Before deploying PWA:

- [ ] Test install on iOS Safari
- [ ] Test install on Android Chrome
- [ ] Test install on Desktop Chrome
- [ ] Verify offline caching works
- [ ] Check icons appear correctly
- [ ] Run Lighthouse PWA audit (score 90+)
- [ ] Test on HTTPS domain
- [ ] Verify manifest.json loads
- [ ] Check service worker registers
- [ ] Test app shortcuts work

---

## 🎉 You're Ready!

Your Voice Notes app is now a **production-ready Progressive Web App**!

**Install it anywhere**:
```
📱 iOS: Safari → Share → Add to Home Screen
📱 Android: Chrome → Install app
💻 Desktop: Chrome → Install Voice Notes
```

**Share the app**:
```
https://your-server:4000
→ Users can install with one click!
```

---

**Like Handy, but installable on any device!** 🚀
