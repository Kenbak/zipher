# 🧪 Testing Ziphers Extension

## Load Extension in Chrome

1. **Build the extension:**
   ```bash
   npm run build
   ```

2. **Open Chrome Extensions page:**
   - Chrome: `chrome://extensions/`
   - Brave: `brave://extensions/`
   - Edge: `edge://extensions/`

3. **Enable Developer Mode:**
   - Toggle "Developer mode" in top right corner

4. **Load unpacked extension:**
   - Click "Load unpacked"
   - Select the `dist/` folder
   - Extension should appear with Ziphers icon

5. **Pin the extension:**
   - Click puzzle icon in Chrome toolbar
   - Pin "Ziphers - Zcash Wallet (Testnet)"

---

## Test Wallet Creation (Real Zcash Address!)

### Step 1: Open Extension
- Click Ziphers icon in toolbar
- Should see Welcome screen

### Step 2: Create New Wallet
- Click "Create New Wallet"
- **IMPORTANT:** Write down the seed phrase! (testnet only, but good practice)
- Click "I've Written It Down"

### Step 3: Confirm Seed Phrase
- Select words in correct order
- Click "Continue"

### Step 4: Set Password
- Enter a strong password (e.g., `Test1234!`)
- Confirm password
- Click "Continue"

### Step 5: See Your Address! 🎉
- **Home screen should display a REAL Zcash Unified Address!**
- Format: `u1...` (testnet unified address)
- Click address or copy icon to copy to clipboard

---

## Debug Service Worker

### Open Service Worker DevTools:
1. Go to `chrome://extensions/`
2. Find "Ziphers" extension
3. Click "service worker" link (blue text)
4. DevTools opens for service worker

### Expected Console Logs:
```
[ServiceWorker] Ziphers service worker starting...
[ServiceWorker] Ready!
[ServiceWorker] Message received: INIT_WALLET
[ServiceWorker] Loading WebZjs module...
[ServiceWorker] Initializing WASM...
[ServiceWorker] Initializing thread pool...
[ServiceWorker] ✅ WebZjs initialized!
[ServiceWorker] Creating wallet...
[ServiceWorker] ✅ Wallet created!
[ServiceWorker] ✅ Address: u1xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
```

---

## Test Checklist

- [ ] Extension loads without errors
- [ ] Welcome screen displays
- [ ] Seed phrase generation works (24 words)
- [ ] Seed confirmation works
- [ ] Password screen works
- [ ] Home screen displays after password set
- [ ] **REAL Zcash address displays (starts with `u1`)**
- [ ] Copy address works
- [ ] Lock/unlock works (close extension, reopen)
- [ ] Only password required on reopen (not seed!)

---

## Known Issues

### If WebZjs Fails to Initialize:
- Check service worker console for errors
- Look for WASM loading errors
- Check CSP (Content Security Policy) allows `wasm-unsafe-eval`

### If Circular Dependency Error (Should NOT happen with Parcel):
- This was the Vite issue
- Parcel should handle it correctly
- If it happens, something is wrong with the build

### If Address is `u1mock...`:
- Service worker isn't receiving messages correctly
- Check message passing between popup and service worker
- Verify `chrome.runtime.sendMessage` is working

---

## Get Testnet ZEC

Once you have your address:

1. Visit: https://testnet.zecfaucet.com/
2. Paste your `u1...` address
3. Click "Get Testnet ZEC"
4. Wait 10-15 minutes for confirmation
5. Sync wallet to see balance

---

## Development Mode

Run in watch mode:
```bash
npm run dev
```

Then reload extension:
- Go to `chrome://extensions/`
- Click reload icon on Ziphers card
- Service worker restarts automatically

---

**Last Updated:** 2025-11-27
**Status:** ✅ Ready to test real Zcash address generation!
