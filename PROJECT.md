# Ziphers - Zcash Wallet Extension by CipherScan

## 🎯 Vision

**Ziphers** is a browser extension wallet for Zcash (Chrome/Brave/Edge) that enables users to manage their ZEC privately and securely, directly from their browser.

Similar to **Leather** (Bitcoin) or **Unisat**, but for **Zcash** with a focus on **privacy**.

---

## 🏗️ Technical Architecture

### Stack

- **Frontend**: React 18 + TypeScript + Vite
- **Styling**: Tailwind CSS (CipherScan design system)
- **Wallet Core**: [WebZjs](https://github.com/ChainSafe/WebZjs) by ChainSafe
- **Extension**: Chrome Extension Manifest V3
- **Storage**: Chrome Storage API (encrypted)
- **State**: Zustand

### Backend/Infrastructure

- **Lightwalletd gRPC**: `https://zcash-testnet.chainsafe.dev` (ChainSafe proxy)
- **Block Explorer API**: `https://testnet.cipherscan.app/api` for enriched data
- **Network**: Testnet initially, Mainnet after security audit

---

## ✨ Features

### Core Wallet Features
- [x] Create wallet (24-word BIP39 seed phrase)
- [x] Import existing wallet
- [x] Password-based encryption
- [x] Secure storage (encrypted seed in Chrome storage)
- [x] Display balance (Shielded + Transparent)
- [x] Generate Unified Addresses (UA)
- [x] Address display with QR code
- [x] Transaction history with decrypted memos
- [x] Send transactions (shielded)
- [x] Address validation (UA, Sapling, Transparent)
- [x] Transaction confirmation UI
- [x] Settings page
- [x] Wallet reset/delete

### Roadmap
- [ ] Mainnet support (post-audit)
- [ ] Multiple accounts
- [ ] Contact book
- [ ] Hardware wallet support (Ledger)
- [ ] dApp connector API
- [ ] Multi-language support

---

## 🎨 Design System

### Branding
- **Name**: Ziphers
- **Tagline**: "Privacy-First Zcash Wallet by CipherScan"
- **Colors**: CipherScan palette
  - Primary: `cipher-cyan` (#00D9FF)
  - Secondary: `cipher-green` (#00FF94)
  - Background: `cipher-bg` (#0A0E17)
  - Surface: `cipher-surface` (#141B2D)
  - Border: `cipher-border` (#1E2A47)

### UI/UX
- Minimalist, professional, privacy-focused
- Inspired by: Leather, MetaMask, Phantom
- Subtle animations
- Clear feedback for all actions
- **Mobile-first** design (extension popup = small screen)

---

## 🔐 Security

### Storage
- Seed phrase: **Encrypted** with user password (AES-256-GCM)
- Keys never stored in plaintext
- Password never stored (derived with PBKDF2)
- Session timeout after 5 minutes

### Permissions
- **Minimal permissions** (storage + alarms only)
- No broad network access (only lightwalletd URLs)
- Content script **read-only** by default

### Audit
- Open source code
- WebZjs audited by ChainSafe
- No analytics/tracking
- No central server (fully client-side)

---

## 🔗 CipherScan Integration

### API Endpoints
```
https://testnet.cipherscan.app/api/
├─ /tx/:txid              # Transaction details
├─ /address/:address      # Address history
├─ /blocks                # Recent blocks
└─ /network/stats         # Network status
```

### Lightwalletd
```
Primary: https://zcash-testnet.chainsafe.dev (gRPC-web proxy)
```

### Explorer Links
- Click on transaction → Opens `testnet.cipherscan.app/tx/:txid`
- Click on block → Opens `testnet.cipherscan.app/block/:height`
- "Powered by CipherScan" branding

---

## 📁 Project Structure

```
zcash-wallet-extension/
├── manifest.json                    # Extension config
├── public/
│   └── icons/                       # Ziphers logo (16, 48, 128px)
│
├── src/
│   ├── popup/                       # Extension UI (React)
│   │   ├── App.tsx
│   │   └── main.tsx
│   │
│   ├── pages/
│   │   ├── Welcome.tsx             # Onboarding
│   │   ├── CreateWallet.tsx
│   │   ├── ImportWallet.tsx
│   │   ├── SetPassword.tsx
│   │   ├── Unlock.tsx
│   │   ├── Home.tsx                # Balance + recent txs
│   │   ├── Send.tsx                # Send form
│   │   ├── Receive.tsx             # Show address + QR
│   │   └── Settings.tsx            # App settings
│   │
│   ├── context/
│   │   └── WebzjsContext.tsx       # WebZjs wallet manager
│   │
│   ├── background/                  # Service Worker
│   │   └── service-worker.ts       # Background tasks
│   │
│   ├── content/                     # Content scripts
│   │   └── content-script.ts       # window.zcash API for dApps
│   │
│   ├── lib/
│   │   ├── storage/
│   │   │   ├── secure-storage.ts   # Encrypted storage
│   │   │   └── store.ts            # Zustand store
│   │   ├── api/
│   │   │   └── cipherscan.ts       # CipherScan API client
│   │   ├── zcash-sync.ts           # Blockchain sync
│   │   └── wasm-loader.ts          # WASM helpers
│   │
│   ├── types/
│   │   └── ...
│   │
│   └── styles/
│       └── index.css                # Tailwind + custom styles
│
├── tailwind.config.js               # CipherScan design system
├── vite.config.ts                   # Vite + Extension plugin
├── tsconfig.json
├── package.json
└── README.md
```

---

## 🚀 Development Commands

```bash
# Install dependencies
npm install

# Run dev mode (with HMR)
npm run dev

# Build extension
npm run build

# Load extension in Chrome
# 1. Open chrome://extensions/
# 2. Enable "Developer mode"
# 3. Click "Load unpacked"
# 4. Select the /dist folder

# Type check
npm run type-check

# Lint
npm run lint
```

---

## 🧪 Testing

### Manual Testing
1. Create wallet → Verify seed backup
2. Import wallet → Test recovery
3. Sync → Check balance accuracy
4. Send transaction → Verify on explorer
5. Receive → Check balance update
6. Restart extension → Verify persistence

### Browser Compatibility
- ✅ Chrome 88+
- ✅ Brave 1.20+
- ✅ Edge 88+

---

## 📦 Main Dependencies

```json
{
  "dependencies": {
    "@chainsafe/webzjs-wallet": "latest",
    "@chainsafe/webzjs-keys": "latest",
    "react": "^18.3.0",
    "react-dom": "^18.3.0",
    "zustand": "^4.5.0",
    "qrcode": "^1.5.0",
    "bip39": "^3.1.0"
  },
  "devDependencies": {
    "@crxjs/vite-plugin": "^2.0.0",
    "@types/chrome": "^0.0.260",
    "@vitejs/plugin-react": "^4.2.0",
    "typescript": "^5.3.0",
    "vite": "^5.0.0",
    "tailwindcss": "^3.4.0",
    "autoprefixer": "^10.4.0",
    "postcss": "^8.4.0"
  }
}
```

---

## 🤝 CipherScan Ecosystem

### Branding
- "Powered by CipherScan"
- Ziphers logo harmonizes with CipherScan design
- Footer link to cipherscan.app

### Infrastructure
- Uses CipherScan's lightwalletd
- Deep links to explorer
- Shares same design system

### Cross-Promotion
- "Get Wallet" button on CipherScan → Install Ziphers
- "Explore on CipherScan" button in Ziphers

---

## 📞 Resources

### Documentation
- [WebZjs Docs](https://chainsafe.github.io/WebZjs/)
- [Zcash Protocol Spec](https://zips.z.cash/)
- [Chrome Extension Guide](https://developer.chrome.com/docs/extensions/)

### Testnet Tools
- Faucet: https://testnet.zecfaucet.com/
- Explorer: https://testnet.cipherscan.app
- Lightwalletd: https://zcash-testnet.chainsafe.dev

### Community
- Zcash Forum: https://forum.zcashcommunity.com/
- Discord: https://discord.gg/zcash
- GitHub: https://github.com/kenbak/zcash-wallet-extension

---

## ⚠️ Important Notes

1. **Testnet Only Initially**: No mainnet support before complete security audit
2. **No Analytics**: Respects user privacy, zero tracking
3. **Open Source**: All code public on GitHub
4. **Security First**: Security audit before mainnet launch
5. **User Education**: Clear explanation of seed phrase importance

---

## 🎉 Launch Plan

### Beta Testing
- Testnet only
- Limited distribution
- Community feedback
- Rapid iterations

### Public Release
- Chrome Web Store submission
- Blog post on CipherScan
- Zcash Forum announcement
- Social media announcements

### Mainnet Support
- Complete security audit
- Bug bounty program
- Gradual rollout
- Monitoring and support

---

**Built with 💚 for privacy**
