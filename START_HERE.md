# 🚀 START HERE - Ziphers Development

## 📍 You Are Here

Welcome to **Ziphers**, the Zcash wallet extension!

This file will guide you through the first steps when opening this project in a new Cursor window.

---

## 📚 Essential Files to Read (in order)

1. **THIS FILE** (`START_HERE.md`) - You're reading it! ✅
2. **`PROJECT.md`** - Full vision, architecture, tech stack (5 min read)
3. **`README.md`** - GitHub README, quick overview (2 min read)
4. **`TODO.md`** - Development roadmap and tasks (3 min read)
5. **`.cursorrules`** - AI assistant guidelines (already loaded by Cursor)

---

## 🎯 Quick Context

### What is Ziphers?
A **non-custodial Zcash wallet** browser extension (Chrome/Brave/Edge).
Think: **Leather** (Bitcoin) or **Unisat**, but for **Zcash** with privacy focus.

### Built By
**CipherScan** team (same team behind [testnet.cipherscan.app](https://testnet.cipherscan.app))

### Key Tech
- **WebZjs** by ChainSafe (handles all Zcash complexity)
- **React 18** + TypeScript + Vite
- **Tailwind CSS** (CipherScan design system)
- **Chrome Extension** Manifest V3

### Network
- **Testnet ONLY** for now (mainnet after security audit)
- Uses CipherScan's infrastructure (lightwalletd, API)

---

## ⚡ Next Steps (First Time Setup)

### 1. Install Dependencies

```bash
# You're already in the project folder
npm install

# This will install:
# - @chainsafe/webzjs-wallet (core wallet)
# - React + TypeScript
# - Vite + extension plugin
# - Tailwind CSS
# - Other deps
```

**Expected time:** 2-3 minutes

### 2. Review Project Structure

```bash
# Current structure (bootstrap phase)
zcash-wallet-extension/
├── .cursorrules          # AI guidance
├── .gitignore
├── PROJECT.md            # ⭐ Full documentation
├── README.md
├── TODO.md               # ⭐ Task list
├── START_HERE.md         # ⭐ This file
└── package.json

# After setup (Week 1)
zcash-wallet-extension/
├── manifest.json         # Extension config
├── public/               # Icons, assets
├── src/
│   ├── popup/           # Extension UI (React)
│   ├── background/      # Service worker
│   ├── content/         # Content scripts
│   └── lib/             # Utils, API clients
├── tailwind.config.js
├── vite.config.ts
└── tsconfig.json
```

### 3. Setup Development Environment

```bash
# Initialize Vite + React + TypeScript
npm create vite@latest . -- --template react-ts

# Install WebZjs
npm install @chainsafe/webzjs-wallet @chainsafe/webzjs-keys

# Install other dependencies
npm install zustand qrcode bip39
npm install -D @crxjs/vite-plugin @types/chrome tailwindcss

# Setup Tailwind
npx tailwindcss init -p
```

### 4. Create Initial Files

See `TODO.md` → "Week 0: Project Bootstrap" for detailed checklist.

Key files to create:
- `manifest.json` (Extension config)
- `vite.config.ts` (Build config)
- `tailwind.config.js` (Styling)
- `src/popup/App.tsx` (Main UI)
- `src/lib/webzjs/wallet.ts` (WebZjs wrapper)

### 5. Test Build

```bash
# Build extension
npm run build

# Load in Chrome:
# 1. Open chrome://extensions/
# 2. Enable "Developer mode" (top right)
# 3. Click "Load unpacked"
# 4. Select the /dist folder

# You should see:
# - Ziphers icon in extension toolbar
# - Clicking opens popup (375x600px)
```

---

## 🎨 Design System (CipherScan Colors)

```javascript
// tailwind.config.js
module.exports = {
  theme: {
    extend: {
      colors: {
        'cipher-cyan': '#00D9FF',
        'cipher-green': '#00FF94',
        'cipher-orange': '#FF6B35',
        'cipher-bg': '#0A0E17',
        'cipher-surface': '#141B2D',
        'cipher-border': '#1E2A47',
      }
    }
  }
}
```

Use these colors exclusively for consistency with CipherScan!

---

## 🔑 Key Concepts

### WebZjs Usage

```typescript
import initWasm, { initThreadPool, WebWallet } from '@chainsafe/webzjs-wallet';

// 1. Initialize (ONCE per app load!)
await initWasm();
await initThreadPool(navigator.hardwareConcurrency || 4);

// 2. Create wallet instance
const wallet = new WebWallet(
  "test",                                    // network
  "https://zcash-testnet.chainsafe.dev",    // lightwalletd
  1                                          // db version
);

// 3. Create account from seed
await wallet.create_account(seedPhrase, 0, birthdayHeight);

// 4. Sync blockchain
await wallet.sync();

// 5. Get balance
const balance = await wallet.get_balance(0);

// 6. Send transaction
const txid = await wallet.send_transaction(
  0,          // account index
  toAddress,  // recipient
  amount,     // zatoshis
  memo        // optional memo
);
```

### Storage Pattern

```typescript
// NEVER store plaintext seeds!
const encrypted = await encryptSeed(seedPhrase, password);
await chrome.storage.local.set({ wallet: encrypted });

// Always decrypt on load
const data = await chrome.storage.local.get('wallet');
const seed = await decryptSeed(data.wallet, password);
```

---

## 📖 Resources

### Documentation
- [WebZjs Docs](https://chainsafe.github.io/WebZjs/)
- [Chrome Extension Guide](https://developer.chrome.com/docs/extensions/mv3/)
- [Zcash Protocol](https://zips.z.cash/)

### Tools
- **Explorer**: https://testnet.cipherscan.app
- **Faucet**: https://testnet.zecfaucet.com
- **Lightwalletd**: https://zcash-testnet.chainsafe.dev

### Community
- **Forum**: https://forum.zcashcommunity.com
- **Discord**: https://discord.gg/zcash

---

## 🐛 Common Issues

### Issue: "WebZjs not initialized"
**Solution**: Call `initWasm()` and `initThreadPool()` before creating wallet.

### Issue: "Extension won't load"
**Solution**: Check manifest.json syntax. Must be valid JSON (no trailing commas!).

### Issue: "WASM not loading in popup"
**Solution**: Update manifest.json with `content_security_policy` for WASM.

### Issue: "Can't connect to lightwalletd"
**Solution**: Check CORS. Use gRPC-web proxy (ChainSafe provides one).

---

## 💡 Development Tips

1. **Use Cursor AI**: Ask questions! The AI knows the entire codebase and architecture.
2. **Read .cursorrules**: Guidelines for code style and patterns.
3. **Check TODO.md**: Updated task list (mark tasks as you complete them).
4. **Test frequently**: Load extension in Chrome after each feature.
5. **Security first**: Never log seeds/keys. Always encrypt storage.

---

## 🚦 Status Check

Before starting development, verify:

- [ ] Read PROJECT.md (understand vision)
- [ ] Read TODO.md (know the roadmap)
- [ ] npm dependencies installed
- [ ] Understand WebZjs basics
- [ ] Know CipherScan color palette
- [ ] Chrome DevTools open (for debugging)

If all checked, **you're ready to build!** 🚀

---

## 🎯 Your First Task

Go to `TODO.md` → "Week 0: Project Bootstrap" and start checking off items!

First concrete task: **Create manifest.json**

```json
{
  "manifest_version": 3,
  "name": "Ziphers - Zcash Wallet (Testnet)",
  "version": "0.1.0",
  "description": "Privacy-first Zcash wallet",
  ...
}
```

---

## 🤔 Questions?

- Check `PROJECT.md` for architecture details
- Check `.cursorrules` for code patterns
- Ask Cursor AI (it has full context!)
- Open GitHub issue for bugs

---

**Good luck! Let's build the best Zcash wallet! 💚🔷**

*~ The CipherScan Team*
