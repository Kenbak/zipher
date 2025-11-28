# 🔷 Ziphers - Zcash Wallet Extension

> Privacy-first Zcash wallet for your browser. By CipherScan.

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![Network: Testnet](https://img.shields.io/badge/Network-Testnet-orange.svg)](https://testnet.cipherscan.app)
[![Status: In Development](https://img.shields.io/badge/Status-In%20Development-yellow.svg)]()

---

## 🎯 What is Ziphers?

**Ziphers** is a non-custodial Zcash wallet extension for Chrome, Brave, and Edge browsers. It allows you to:

- ✅ **Send and receive ZEC** with full privacy (shielded transactions)
- ✅ **Manage multiple accounts** from a single seed phrase
- ✅ **View transaction history** with encrypted memos
- ✅ **Connect to dApps** (coming soon)
- ✅ **Stay private** - no tracking, no analytics, open source

---

## 🚀 Quick Start

### For Users

1. **Install** (when released):
   - Visit Chrome Web Store (link TBD)
   - Click "Add to Chrome"

2. **Setup**:
   - Create new wallet or import existing seed phrase
   - Set a strong password
   - Backup your seed phrase securely!

3. **Get Testnet ZEC**:
   - Visit [Testnet Faucet](https://testnet.zecfaucet.com/)
   - Enter your Ziphers address
   - Wait for funds to arrive (~75 seconds)

### For Developers

```bash
# Clone repo
git clone https://github.com/kenbak/zcash-wallet-extension.git
cd zcash-wallet-extension

# Install dependencies
npm install

# Run in dev mode
npm run dev

# Build extension
npm run build

# Load in Chrome:
# 1. Open chrome://extensions/
# 2. Enable "Developer mode"
# 3. Click "Load unpacked"
# 4. Select the /dist folder
```

---

## 🏗️ Tech Stack

- **Frontend**: React 18 + TypeScript + Vite
- **Wallet Core**: [WebZjs](https://github.com/ChainSafe/WebZjs) by ChainSafe
- **Styling**: Tailwind CSS
- **Storage**: Chrome Storage API (encrypted)
- **State**: Zustand
- **Extension**: Manifest V3

---

## 📋 Features

### ✅ MVP (Current)
- [x] Create wallet (24-word seed phrase)
- [x] Import existing wallet
- [x] Encrypted storage
- [x] Display balance (shielded + transparent)
- [x] Generate Unified Addresses
- [x] Send shielded transactions
- [x] Transaction history with memos
- [x] QR code support

### 🔮 Roadmap
- [ ] Mainnet support (post-audit)
- [ ] Multiple accounts
- [ ] Contact book
- [ ] Hardware wallet support (Ledger)
- [ ] dApp connector (window.zcash API)
- [ ] Mobile app (React Native)

---

## 🔐 Security

### How We Protect You

1. **Encrypted Storage**: Your seed phrase is encrypted with AES-256-GCM
2. **No Cloud**: Everything stays in your browser (no servers)
3. **No Tracking**: Zero analytics, zero data collection
4. **Open Source**: All code is public and auditable
5. **Minimal Permissions**: Only requests what's needed

### Security Audit

- ⏳ Pending (before mainnet release)
- ✅ WebZjs audited by ChainSafe

### Report a Vulnerability

Please email: security@cipherscan.app (or open a private GitHub issue)

---

## 🤝 Powered by CipherScan

Ziphers is built by the same team behind [CipherScan](https://cipherscan.app), the leading Zcash block explorer.

**Infrastructure**:
- Uses CipherScan's lightwalletd nodes
- Links to CipherScan explorer for transaction details
- Shares the same design system

---

## 📚 Documentation

- [Project Overview](PROJECT.md) - Full vision and architecture
- [Security Policy](SECURITY.md) - Encryption and security details
- [Architecture](ARCHITECTURE.md) - Technical architecture

---

## 🧪 Testing

**Testnet Only (Currently)**

⚠️ **DO NOT USE WITH REAL FUNDS** - This is testnet software under development.

Get testnet ZEC for free: https://testnet.zecfaucet.com/

---

## 🌐 Links

- **Website**: https://ziphers.cipherscan.app (TBD)
- **Explorer**: https://testnet.cipherscan.app
- **Faucet**: https://testnet.zecfaucet.com
- **Docs**: https://docs.ziphers.app (TBD)
- **Forum**: https://forum.zcashcommunity.com

---

## 🤝 Contributing

We welcome contributions!

### Development Setup

```bash
# Install dependencies
npm install

# Start dev server
npm run dev

# Build extension
npm run build
```

### Reporting Bugs

Please use [GitHub Issues](https://github.com/kenbak/zcash-wallet-extension/issues) and include:
- Steps to reproduce
- Expected vs actual behavior
- Screenshots if applicable
- Browser version
- Extension version

---

## 📜 License

MIT License - see [LICENSE](LICENSE) file for details

---

## ⚠️ Disclaimer

This software is provided "as is", without warranty of any kind. Use at your own risk.

Always:
- ✅ Backup your seed phrase securely
- ✅ Use testnet first
- ✅ Never share your seed phrase
- ✅ Verify addresses before sending
- ✅ Start with small amounts

---

## 🙏 Acknowledgments

- [ChainSafe](https://chainsafe.io/) for WebZjs
- [Zcash Community](https://z.cash/) for the amazing protocol
- [Electric Coin Company](https://electriccoin.co/) for Zcash development
- [Zcash Foundation](https://zfnd.org/) for ecosystem support

---

**Built with 💚 for privacy**

*Ziphers by CipherScan - Where Privacy Meets Simplicity*
