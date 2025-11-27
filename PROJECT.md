# Ziphers - Zcash Wallet Extension by CipherScan

## 🎯 Vision

**Ziphers** est une extension de wallet Zcash pour navigateur (Chrome/Brave/Edge) qui permet aux utilisateurs de gérer leurs ZEC de manière privée et sécurisée, directement depuis leur navigateur.

Similaire à **Leather** (Bitcoin) ou **Unisat**, mais pour **Zcash** avec un focus sur la **privacy**.

---

## 🏗️ Architecture Technique

### Stack

- **Frontend**: React 18 + TypeScript + Vite
- **Styling**: Tailwind CSS (même style que CipherScan explorer)
- **Wallet Core**: [WebZjs](https://github.com/ChainSafe/WebZjs) by ChainSafe
- **Extension**: Chrome Extension Manifest V3
- **Storage**: Chrome Storage API (encrypted)
- **State**: Zustand

### Backend/Infrastructure (Réutilisé de CipherScan!)

- **Lightwalletd gRPC**: `https://zcash-testnet.chainsafe.dev` (ChainSafe proxy)
- **Backup Lightwalletd**: Notre propre instance sur `testnet.cipherscan.app:9067`
- **Block Explorer API**: `https://testnet.cipherscan.app/api` pour enrichir les données
- **Network**: Testnet d'abord, Mainnet plus tard

---

## ✨ Features (MVP - 4 semaines)

### Phase 1: Onboarding (Week 1)
- [ ] Créer nouveau wallet (seed BIP39 24 mots)
- [ ] Importer wallet existant (depuis seed)
- [ ] Setup password pour encryption
- [ ] Secure storage (seed encrypted dans Chrome storage)
- [ ] Backup seed phrase (export/print)

### Phase 2: Core Wallet (Week 2)
- [ ] Afficher balance (Shielded + Transparent)
- [ ] Génération Unified Address (UA)
- [ ] Afficher adresse avec QR code
- [ ] Transaction history (avec memos déchiffrés!)
- [ ] Background sync (WebZjs sync dans service worker)
- [ ] Network status indicator

### Phase 3: Send Transactions (Week 3)
- [ ] Interface Send (to address, amount, memo)
- [ ] Validation d'adresse (UA, Sapling, Transparent)
- [ ] Sélection transparent vs shielded
- [ ] Calcul de fees automatique
- [ ] Sign + Broadcast transaction
- [ ] Transaction confirmation UI
- [ ] Scan QR code pour address destination

### Phase 4: Polish (Week 4)
- [ ] Settings page (network, lightwalletd URL, etc.)
- [ ] Delete/Reset wallet
- [ ] Error handling + retry logic
- [ ] Loading states + animations
- [ ] Testnet faucet integration (bouton "Get Testnet ZEC")
- [ ] Transaction details modal (link to CipherScan explorer)
- [ ] Dark mode (déjà par défaut)

---

## 🎨 Design System

### Branding
- **Nom**: Ziphers
- **Tagline**: "Privacy-First Zcash Wallet by CipherScan"
- **Colors**: Réutilise la palette CipherScan
  - Primary: `cipher-cyan` (#00D9FF)
  - Secondary: `cipher-green` (#00FF94)
  - Background: `cipher-bg` (#0A0E17)
  - Surface: `cipher-surface` (#141B2D)
  - Border: `cipher-border` (#1E2A47)

### UI/UX
- Minimaliste, pro, focus privacy
- Inspiré de: Leather, MetaMask, Phantom
- Animations subtiles
- Feedback clair pour toutes les actions
- **Mobile-first** design (extension popup = petit écran)

---

## 🔐 Sécurité

### Stockage
- Seed phrase: **Encrypted** avec password user (AES-256-GCM)
- Keys jamais en clair dans storage
- Password jamais stocké (dérivé avec PBKDF2)

### Permissions
- **Minimal permissions** (storage + activeTab seulement)
- Pas d'accès réseau broad (seulement lightwalletd URLs)
- Content script **read-only** par défaut

### Audit
- Code open-source
- WebZjs déjà audité par ChainSafe
- Pas de analytics/tracking
- Pas de serveur central (tout client-side)

---

## 🔗 Intégration CipherScan

### API Endpoints Utilisés
```
https://testnet.cipherscan.app/api/
├─ /tx/:txid              # Transaction details
├─ /address/:address      # Address history
├─ /blocks                # Recent blocks
└─ /network/stats         # Network status
```

### Lightwalletd
```
Primaire: https://zcash-testnet.chainsafe.dev (gRPC-web proxy)
Backup:   ws://testnet.cipherscan.app:9067 (notre instance)
```

### Liens Explorer
- Click sur transaction → Ouvre `testnet.cipherscan.app/tx/:txid`
- Click sur block → Ouvre `testnet.cipherscan.app/block/:height`
- Branding "Powered by CipherScan"

---

## 📁 Structure du Projet

```
zcash-wallet-extension/
├── manifest.json                    # Extension config
├── public/
│   ├── icons/                       # Ziphers logo (16, 48, 128px)
│   └── index.html
│
├── src/
│   ├── popup/                       # Extension UI (React)
│   │   ├── App.tsx
│   │   ├── pages/
│   │   │   ├── Onboarding/
│   │   │   │   ├── Welcome.tsx
│   │   │   │   ├── CreateWallet.tsx
│   │   │   │   ├── ImportWallet.tsx
│   │   │   │   └── SetPassword.tsx
│   │   │   ├── Home.tsx            # Balance + recent txs
│   │   │   ├── Send.tsx            # Send form
│   │   │   ├── Receive.tsx         # Show address + QR
│   │   │   ├── Transactions.tsx    # Full tx history
│   │   │   └── Settings.tsx        # App settings
│   │   └── components/
│   │       ├── Balance.tsx
│   │       ├── TransactionCard.tsx
│   │       ├── AddressDisplay.tsx
│   │       ├── QRCode.tsx
│   │       └── SendForm.tsx
│   │
│   ├── background/                  # Service Worker
│   │   ├── service-worker.ts       # Background tasks
│   │   ├── wallet-manager.ts       # WebZjs wallet instance
│   │   └── sync-manager.ts         # Periodic sync
│   │
│   ├── content/                     # Content scripts
│   │   └── inject.ts               # window.zcash API for dApps
│   │
│   ├── lib/
│   │   ├── webzjs/
│   │   │   ├── wallet.ts           # WebZjs wrapper
│   │   │   ├── transactions.ts     # Send/receive logic
│   │   │   └── sync.ts             # Blockchain sync
│   │   ├── storage/
│   │   │   ├── secure-storage.ts   # Encrypted storage
│   │   │   └── wallet-state.ts     # Zustand store
│   │   ├── api/
│   │   │   ├── cipherscan.ts       # CipherScan API client
│   │   │   └── lightwalletd.ts     # Lightwalletd client
│   │   └── utils/
│   │       ├── crypto.ts           # Encryption helpers
│   │       ├── format.ts           # ZEC formatting
│   │       └── validation.ts       # Address validation
│   │
│   └── types/
│       ├── wallet.ts
│       ├── transaction.ts
│       └── network.ts
│
├── tailwind.config.js               # Same as CipherScan
├── vite.config.ts                   # Vite + Extension plugin
├── tsconfig.json
├── package.json
└── README.md
```

---

## 🚀 Commandes de Développement

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

# Watch mode (rebuild on changes)
npm run watch

# Type check
npm run type-check

# Lint
npm run lint
```

---

## 🧪 Testing Plan

### Manual Testing
1. Create wallet → Verify seed backup
2. Import wallet → Test recovery
3. Sync → Check balance accuracy
4. Send transaction → Verify on explorer
5. Receive → Check balance update
6. Restart extension → Verify persistence

### Automated Testing (Later)
- Unit tests pour crypto functions
- Integration tests pour WebZjs wrapper
- E2E tests avec Playwright

---

## 📦 Dependencies Principales

```json
{
  "dependencies": {
    "@chainsafe/webzjs-wallet": "latest",
    "@chainsafe/webzjs-keys": "latest",
    "react": "^18.3.0",
    "react-dom": "^18.3.0",
    "zustand": "^4.5.0",
    "qrcode": "^1.5.0",
    "bip39": "^3.1.0",
    "@heroicons/react": "^2.0.0"
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

## 🎯 Success Metrics (MVP)

- [ ] Wallet créé en < 1 minute
- [ ] Sync complet en < 30 secondes (pour wallet jeune)
- [ ] Transaction envoyée en < 10 secondes
- [ ] UI responsive (< 100ms interactions)
- [ ] Seed backup UX claire (utilisateur comprend l'importance)
- [ ] 0 crashes durant testing phase
- [ ] Compatible Chrome/Brave/Edge

---

## 🔮 Post-MVP (Future)

### Phase 2 Features
- [ ] Support Mainnet (toggle testnet/mainnet)
- [ ] Multiple accounts (account switching)
- [ ] Contact book (saved addresses)
- [ ] Transaction notes (user-added labels)
- [ ] Export transaction history (CSV)
- [ ] Fiat price display (via CoinGecko API)

### Phase 3 Features
- [ ] Hardware wallet support (Ledger)
- [ ] dApp connector (window.zcash API)
- [ ] WalletConnect integration
- [ ] Multi-language support
- [ ] Mobile app (React Native port)

---

## 🤝 Liens avec CipherScan Ecosystem

### Branding
- "Powered by CipherScan"
- Logo Ziphers distinct mais harmonieux avec CipherScan
- Footer link vers cipherscan.app

### Infrastructure
- Utilise lightwalletd de CipherScan
- Liens profonds vers explorer
- Partage même design system

### Marketing
- Cross-promotion (CipherScan → Ziphers, Ziphers → CipherScan)
- "Get Wallet" button sur CipherScan → Install Ziphers
- "Explore on CipherScan" button dans Ziphers

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

1. **Testnet Only Initially**: Ne PAS supporter mainnet avant audit complet
2. **No Analytics**: Respect user privacy, 0 tracking
3. **Open Source**: Tout le code public sur GitHub
4. **Security First**: Audit avant mainnet launch
5. **User Education**: Expliquer seed phrase importance (UX!)

---

## 🎉 Launch Plan

### Beta (Month 1-2)
- Testnet only
- Invite-only testing
- Feedback loop avec early users
- Itérations rapides

### Public Release (Month 3)
- Chrome Web Store submission
- Blog post sur CipherScan
- Zcash Forum announcement
- Social media (Twitter/X)

### Mainnet (Month 4+)
- Security audit complet
- Bug bounty program
- Gradual rollout
- Monitoring dashboard

---

**Last Updated**: 2025-11-27
**Status**: 🟡 Initial Setup
**Next Milestone**: Week 1 - Onboarding Complete
