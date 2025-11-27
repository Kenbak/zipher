# Ziphers - Development Tasks

## 🚀 Immediate Next Steps (Setup)

### Week 0: Project Bootstrap (NOW)
- [x] Create repo structure
- [x] Write PROJECT.md documentation
- [x] Write README.md
- [x] Create .cursorrules for AI guidance
- [ ] Initialize Vite + React + TypeScript
- [ ] Install dependencies (WebZjs, Tailwind, etc.)
- [ ] Setup Tailwind with CipherScan colors
- [ ] Create manifest.json (Extension config)
- [ ] Setup vite.config.ts with @crxjs/vite-plugin
- [ ] Create basic folder structure (popup, background, lib)
- [ ] Test build pipeline (`npm run build`)
- [ ] Load extension in Chrome and verify it works

---

## 📅 Week 1: Onboarding Flow

### Day 1-2: Welcome & Create Wallet
- [ ] Create `Welcome.tsx` page (first-time user)
- [ ] Create `CreateWallet.tsx` page
  - [ ] Generate 24-word seed with bip39
  - [ ] Display seed in grid (3x8)
  - [ ] Checkbox: "I have backed up my seed"
  - [ ] Next button
- [ ] Create `ConfirmSeed.tsx` page
  - [ ] Ask user to enter 3 random words
  - [ ] Validate before proceeding

### Day 3-4: Import & Password
- [ ] Create `ImportWallet.tsx` page
  - [ ] Text area for 24 words
  - [ ] Validate seed phrase
  - [ ] Birthday height picker (optional)
- [ ] Create `SetPassword.tsx` page
  - [ ] Password input (min 8 chars)
  - [ ] Confirm password
  - [ ] Password strength indicator
- [ ] Implement encrypted storage
  - [ ] `lib/storage/secure-storage.ts`
  - [ ] AES-256-GCM encryption
  - [ ] Save to chrome.storage.local

### Day 5: WebZjs Integration
- [ ] Create `lib/webzjs/wallet.ts`
  - [ ] `initWebZjs()` function
  - [ ] `createWallet(seed, birthday)` function
  - [ ] `getWallet()` singleton
- [ ] Test wallet creation end-to-end
- [ ] Verify seed can be decrypted and loaded

---

## 📅 Week 2: Core Wallet Features

### Day 1-2: Home Page & Balance
- [ ] Create `Home.tsx` page
  - [ ] Balance display (large, prominent)
  - [ ] USD value (via CipherScan API or CoinGecko)
  - [ ] "Send" and "Receive" buttons
  - [ ] Recent transactions (3-5 items)
- [ ] Implement `useBalance()` hook
  - [ ] Fetch from WebZjs
  - [ ] Format zatoshis to ZEC
  - [ ] Auto-refresh on sync

### Day 3: Receive Page
- [ ] Create `Receive.tsx` page
  - [ ] Generate Unified Address
  - [ ] Display address with copy button
  - [ ] QR code generation
  - [ ] "Request Amount" feature (QR with amount)
- [ ] Test receiving testnet ZEC

### Day 4-5: Transaction History
- [ ] Create `Transactions.tsx` page (full list)
- [ ] Create `TransactionCard.tsx` component
  - [ ] Show: amount, date, type (in/out)
  - [ ] Show: memo (if decrypted)
  - [ ] Click → Link to CipherScan explorer
- [ ] Implement `useTransactions()` hook
- [ ] Pagination (load more)

### Day 6: Background Sync
- [ ] Setup service worker (`background/service-worker.ts`)
- [ ] Implement periodic sync (every 5 minutes)
- [ ] Sync status indicator in UI
- [ ] Handle sync errors gracefully

---

## 📅 Week 3: Send Transactions

### Day 1-2: Send Form UI
- [ ] Create `Send.tsx` page
  - [ ] Address input (with validation)
  - [ ] Amount input (with max button)
  - [ ] Memo input (optional, 512 chars)
  - [ ] Fee display (estimate)
  - [ ] "Review" button
- [ ] Create `SendReview.tsx` modal
  - [ ] Show: to, amount, memo, fee
  - [ ] "Confirm" and "Cancel" buttons
- [ ] Address validation
  - [ ] Unified Address (u1...)
  - [ ] Sapling (zs...)
  - [ ] Transparent (t1...)

### Day 3-4: Transaction Building
- [ ] Implement `lib/webzjs/transactions.ts`
  - [ ] `buildTransaction()` function
  - [ ] `signTransaction()` function
  - [ ] `broadcastTransaction()` function
- [ ] Fee calculation
- [ ] Error handling (insufficient funds, etc.)

### Day 5: Testing & Polish
- [ ] Test send flow end-to-end
- [ ] Test with different address types
- [ ] Test with memo
- [ ] Handle edge cases (0 balance, invalid address)
- [ ] Success confirmation screen
- [ ] Link to transaction on CipherScan

---

## 📅 Week 4: Polish & Launch Prep

### Day 1: Settings Page
- [ ] Create `Settings.tsx` page
  - [ ] Network (Testnet/Mainnet toggle - disabled for now)
  - [ ] Lightwalletd URL (advanced)
  - [ ] Auto-sync interval
  - [ ] Export seed phrase (with password confirmation)
  - [ ] Delete wallet (with confirmation)
- [ ] About page (version, links)

### Day 2: Error Handling
- [ ] Global error boundary
- [ ] User-friendly error messages
- [ ] Retry logic for network errors
- [ ] Offline mode detection

### Day 3: Loading States
- [ ] Skeleton loaders for all pages
- [ ] Loading spinners
- [ ] Progress bars (sync)
- [ ] Smooth transitions

### Day 4: Icons & Branding
- [ ] Design Ziphers logo (16, 48, 128px)
- [ ] Create app icon
- [ ] Favicon
- [ ] "Powered by CipherScan" footer

### Day 5: Testing & Bug Fixes
- [ ] Test on Chrome
- [ ] Test on Brave
- [ ] Test on Edge
- [ ] Fix any bugs found
- [ ] Performance audit

### Day 6-7: Documentation
- [ ] Write user guide
- [ ] Record demo video
- [ ] Create screenshots for store
- [ ] Write developer docs
- [ ] Security checklist

---

## 🔮 Post-MVP (Future)

### Features
- [ ] Multiple accounts support
- [ ] Contact book
- [ ] Transaction notes
- [ ] Hardware wallet (Ledger)
- [ ] dApp connector API
- [ ] Mainnet support (post-audit!)

### Infrastructure
- [ ] CI/CD pipeline (GitHub Actions)
- [ ] Automated tests
- [ ] Bug tracking
- [ ] Analytics (privacy-respecting)

---

## 🔒 Security Checklist (Pre-Launch)

- [ ] No sensitive data logged
- [ ] Encrypted storage verified
- [ ] No unused permissions
- [ ] CSP headers configured
- [ ] XSS vulnerabilities checked
- [ ] Dependency audit (`npm audit`)
- [ ] Code review by security expert
- [ ] Bug bounty program setup

---

## 📝 Notes

### Design Decisions
- Use CipherScan color palette exactly
- Mobile-first (extension popup = small screen)
- Minimal, clean UI (like Phantom wallet)
- Privacy-first messaging

### Technical Decisions
- WebZjs over custom Rust (faster development)
- Zustand over Redux (simpler)
- Vite over CRA (faster builds)
- Tailwind over styled-components (consistency with CipherScan)

### Open Questions
- [ ] Support custom lightwalletd URL? (advanced users)
- [ ] Show fiat prices? (need CoinGecko API)
- [ ] Address book import/export format?
- [ ] Multi-language support priority?

---

**Last Updated**: 2025-11-27  
**Current Sprint**: Week 0 (Setup)  
**Next Milestone**: Extension loads in Chrome with basic UI

