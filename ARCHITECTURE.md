# 🏗️ Ziphers Architecture

## Overview

Ziphers follows Chrome Extension best practices with **clean separation** between UI and business logic.

---

## 📐 Architecture Diagram

```
┌─────────────────────────────────────────────────────────┐
│                    POPUP (UI Layer)                     │
│  - React 18 + TypeScript + Tailwind                    │
│  - Pages: Welcome, CreateWallet, Unlock, Home, etc.    │
│  - NO WebZjs import (just UI)                          │
│  - NO crypto operations (just display)                 │
└──────────────────┬──────────────────────────────────────┘
                   │
                   │ chrome.runtime.sendMessage()
                   │ (Type-safe message passing)
                   ↓
┌─────────────────────────────────────────────────────────┐
│              SERVICE WORKER (Logic Layer)               │
│  - WebZjs initialization (WASM + Thread Pool)          │
│  - Wallet operations (create, sign, send)              │
│  - Blockchain sync                                      │
│  - Message handlers                                     │
│  - Background tasks (periodic sync)                     │
└──────────────────┬──────────────────────────────────────┘
                   │
                   │ gRPC-web (HTTPS)
                   ↓
┌─────────────────────────────────────────────────────────┐
│           LIGHTWALLETD (Blockchain Node)                │
│  - https://zcash-testnet.chainsafe.dev                 │
│  - Block data, transaction broadcast                    │
└─────────────────────────────────────────────────────────┘
```

---

## 🔄 Message Passing Flow

### Example: Get Wallet Address

```
1. USER clicks "Copy Address" in popup
       ↓
2. Home.tsx calls getWalletAddress()
       ↓
3. wallet-manager.ts sends message:
   {
     type: 'GET_ADDRESS',
     requestId: '123',
     data: { accountId: 0 }
   }
       ↓
4. SERVICE WORKER receives message
       ↓
5. Calls walletInstance.get_current_address(0)
       ↓
6. Returns response:
   {
     success: true,
     requestId: '123',
     data: { address: 'u1...' }
   }
       ↓
7. Home.tsx displays address
       ↓
8. USER clicks copy → clipboard
```

---

## 📁 File Structure

```
src/
├── popup/                    # UI LAYER (React)
│   ├── App.tsx              # Router
│   └── main.tsx             # Entry point
│
├── pages/                    # UI PAGES
│   ├── Welcome.tsx          # Onboarding
│   ├── CreateWallet.tsx     # Generate seed
│   ├── ConfirmSeed.tsx      # Verify backup
│   ├── ImportWallet.tsx     # Import existing
│   ├── SetPassword.tsx      # Password setup
│   ├── Unlock.tsx           # Password entry
│   └── Home.tsx             # Main wallet view
│
├── background/               # LOGIC LAYER
│   └── service-worker.ts    # ⭐ WebZjs runs here!
│
├── lib/                      # UTILITIES
│   ├── wallet-manager.ts    # High-level wallet ops (popup side)
│   ├── storage/
│   │   ├── secure-storage.ts   # AES-256-GCM encryption
│   │   ├── wallet-state.ts     # Zustand store (runtime state)
│   │   └── store.ts            # App state (navigation)
│   └── webzjs/
│       └── wallet.ts        # WebZjs wrapper (NOT used in popup)
│
├── types/
│   ├── messages.ts          # Message types for popup ↔ service worker
│   └── wallet.ts            # Wallet data types
│
└── styles/
    └── index.css            # Tailwind + custom styles
```

---

## 🔐 Security Layers

### Layer 1: Encrypted Storage

```
User Password (never stored)
    ↓
PBKDF2 (600K iterations)
    ↓
Encryption Key (in memory only)
    ↓
AES-256-GCM
    ↓
Encrypted Seed (in chrome.storage.local)
```

### Layer 2: Service Worker Isolation

- Service worker runs in **separate context**
- Cannot be accessed by other extensions
- Cannot be accessed by web pages
- Chrome's sandboxing protects it

### Layer 3: Message Passing

- **Type-safe** messages (TypeScript)
- **No direct access** to wallet from popup
- **Validation** in service worker
- **Error handling** for all operations

---

## 🚀 Why This Architecture?

### ✅ Advantages

1. **Clean Separation**
   - UI code never touches WebZjs
   - Logic isolated in service worker
   - Easy to test/debug

2. **Performance**
   - WebZjs (60MB WASM) not in popup bundle
   - Popup loads fast
   - Background operations don't block UI

3. **Security**
   - Seed phrase never exposed to popup context
   - Crypto operations isolated
   - Message passing adds validation layer

4. **Scalability**
   - Easy to add new features
   - Multiple accounts support ready
   - Can add hardware wallet later

5. **Production-Ready**
   - Same pattern as MetaMask, Phantom, Rabby
   - Follows Chrome Extension best practices
   - Maintainable and testable

### ⚠️ Trade-offs

1. **Complexity**
   - Message passing adds boilerplate
   - More files to manage
   - Async communication

2. **Debugging**
   - Must debug service worker separately
   - Console logs in different contexts
   - Harder to trace flow

3. **Development**
   - Service worker reload needed
   - Can't use HMR for service worker
   - Build step required

**BUT: These trade-offs are worth it for production quality! ✅**

---

## 🔧 Build Process

### Standard Build

```bash
npm run build
```

**Steps:**
1. TypeScript compile (`tsc`)
2. Vite build (popup + service worker)
3. Post-build script (copy WebZjs to dist/)

### What Gets Built

```
dist/
├── index.html                    # Popup HTML
├── manifest.json                 # Extension manifest
├── icons/                        # Extension icons
├── assets/
│   ├── popup-*.js               # Popup bundle (React UI)
│   └── service-worker.ts-*.js   # Service worker bundle
└── lib/
    └── webzjs-wallet/           # 📦 WebZjs (58 MB WASM)
        ├── webzjs_wallet.js
        ├── webzjs_wallet_bg.wasm
        └── snippets/            # Web workers for multi-threading
```

**Note:** WebZjs is **excluded** from Vite bundle and copied post-build.

---

## 📡 Message API Reference

### Available Messages

| Message Type | Direction | Purpose |
|--------------|-----------|---------|
| `INIT_WALLET` | Popup → SW | Create WebZjs wallet from seed |
| `GET_ADDRESS` | Popup → SW | Get current Zcash address |
| `GET_BALANCE` | Popup → SW | Get wallet balance |
| `SYNC_WALLET` | Popup → SW | Trigger blockchain sync |
| `SEND_TRANSACTION` | Popup → SW | Sign and broadcast tx |
| `GET_WALLET_STATUS` | Popup → SW | Check if wallet initialized |

### Example: Initialize Wallet

```typescript
import { sendMessageToServiceWorker, generateRequestId } from '@/types/messages';

const response = await sendMessageToServiceWorker<InitWalletResponse>({
  type: 'INIT_WALLET',
  requestId: generateRequestId(),
  data: {
    accountName: 'Account 1',
    seedPhrase: '...',
    accountHdIndex: 0,
    birthdayHeight: 2800000,
  },
});

// response.accountId
// response.address (REAL Zcash Unified Address!)
```

---

## 🧪 Testing Strategy

### Unit Tests

- `secure-storage.ts` - encryption/decryption
- `messages.ts` - message validation
- Utility functions

### Integration Tests

- Popup → Service Worker communication
- WebZjs wallet operations
- Encrypted storage round-trip

### E2E Tests

- Full onboarding flow
- Send/receive transactions
- Lock/unlock wallet

---

## 🔮 Future Extensions

### Multi-Account Support

Service worker can manage multiple accounts:

```typescript
const accounts = [
  { id: 0, name: 'Main', address: 'u1...' },
  { id: 1, name: 'Savings', address: 'u1...' },
];
```

### Hardware Wallet

Service worker communicates with hardware:

```
Popup → Service Worker → USB/Bluetooth → Ledger
```

### dApp Connector

Web pages can request wallet operations:

```
dApp → Content Script → Service Worker → Approval Popup
```

---

## 📚 References

- [Chrome Extension Architecture](https://developer.chrome.com/docs/extensions/mv3/architecture-overview/)
- [Service Workers](https://developer.chrome.com/docs/extensions/mv3/service_workers/)
- [Message Passing](https://developer.chrome.com/docs/extensions/mv3/messaging/)
- [WebZjs Docs](https://chainsafe.github.io/WebZjs/)

---

**Last Updated**: 2025-11-27
**Status**: ✅ Production-Ready Architecture
**WebZjs**: Loads in Service Worker (no build issues!)
