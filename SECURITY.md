# 🔐 Ziphers Security Architecture

## Overview

Ziphers uses industry-standard encryption patterns, the same as MetaMask, Phantom, and Rabby wallets.

---

## 🔑 Password & Encryption Flow

### 1. Creating a Wallet

```
User enters password
    ↓
Generate random salt (32 bytes)
    ↓
PBKDF2(password, salt, 600K iterations) → Encryption Key (256-bit)
    ↓
AES-256-GCM(Encryption Key, seed phrase) → Encrypted Seed
    ↓
Store in chrome.storage.local:
  - Encrypted Seed (Base64)
  - Salt (Base64)
  - IV (Base64)
  - Version, timestamp
    ↓
⚠️  PASSWORD IS NEVER STORED ⚠️
```

### 2. Unlocking the Wallet

```
User enters password
    ↓
Retrieve from storage: encrypted seed, salt, IV
    ↓
PBKDF2(password, salt, 600K iterations) → Derive Encryption Key
    ↓
AES-256-GCM Decrypt(encrypted seed, key, IV) → Seed Phrase
    ↓
If decrypt succeeds: password was correct ✅
If decrypt fails: password was wrong ❌
    ↓
Seed phrase stays in RAM only (never written to disk)
    ↓
Session active for 15 minutes (auto-lock)
```

---

## 🛡️ Security Features

### ✅ What We Do

| Feature | Implementation | Same as |
|---------|----------------|---------|
| **Password Hashing** | PBKDF2 (600K iterations) | MetaMask, Phantom |
| **Encryption** | AES-256-GCM | MetaMask, Phantom, Rabby |
| **Salt** | 32-byte random salt per wallet | Industry standard |
| **Key Storage** | Never stored (derived on-demand) | MetaMask, Phantom |
| **Session Lock** | Auto-lock after 15min inactivity | MetaMask (default) |
| **Memory-only** | Seed in RAM during session | All wallets |

### ❌ What We DON'T Do (By Design)

- ❌ Store password (not even hashed)
- ❌ Store encryption key on disk
- ❌ Send seed/password to any server
- ❌ Log sensitive data
- ❌ Export unencrypted seed automatically

---

## 🔒 Storage Structure

### Chrome Storage (Encrypted Vault)

```json
{
  "ziphers_vault": {
    "version": 1,
    "encryptedData": "base64_encrypted_seed_and_metadata",
    "salt": "base64_random_salt",
    "iv": "base64_initialization_vector",
    "createdAt": 1732710000000
  }
}
```

**What's encrypted inside:**
- Seed phrase (24 words)
- Account name
- Birthday height
- Created timestamp

**What's NOT stored:**
- ❌ Password
- ❌ Encryption key
- ❌ Unencrypted seed

---

## 🧪 Security Algorithms

### PBKDF2 Parameters

```typescript
Algorithm: PBKDF2
Hash: SHA-256
Iterations: 600,000 (OWASP 2023 recommendation)
Key Length: 256 bits (for AES-256)
Salt: 32 bytes (256 bits) random
```

**Why 600K iterations?**
- OWASP recommends 600K for PBKDF2-SHA256 (2023)
- Makes brute-force attacks extremely expensive
- Same or higher than MetaMask (210K) and Phantom

### AES-GCM Parameters

```typescript
Algorithm: AES-GCM
Key Size: 256 bits
IV Size: 12 bytes (96 bits) - standard for GCM
Authentication: Built-in (AEAD)
```

**Why AES-GCM?**
- Authenticated encryption (prevents tampering)
- Fast in hardware (AES-NI)
- Industry standard for web crypto

---

## 🔐 Comparison with Major Wallets

| Wallet | Password Storage | Key Derivation | Encryption | Auto-Lock |
|--------|-----------------|----------------|------------|-----------|
| **Ziphers** | ❌ Never | PBKDF2 (600K) | AES-256-GCM | 15min ✅ |
| **MetaMask** | ❌ Never | PBKDF2 (210K) | AES-256-GCM | Configurable ✅ |
| **Phantom** | ❌ Never | PBKDF2 (100K+) | AES-256-GCM | Yes ✅ |
| **Rabby** | ❌ Never | PBKDF2 | AES-256-GCM | Yes ✅ |

**Ziphers is MORE secure than some wallets:**
- Higher PBKDF2 iterations than MetaMask (600K vs 210K)
- Same encryption as all major wallets (AES-256-GCM)
- Auto-lock by default

---

## 🚨 Attack Scenarios & Mitigations

### 1. Attacker gets chrome.storage.local

```
Attacker has: encrypted seed, salt, IV
Attacker needs: password (unknown)
```

**Protection:**
- Must brute-force password through PBKDF2 (600K iterations)
- Strong password = infeasible to crack
- Would take years/decades with good password

### 2. Attacker has physical access to device

```
If wallet is LOCKED:
  → Must enter password (no bypass)
  → Encryption key not in memory
  → Seed not accessible

If wallet is UNLOCKED:
  → Could access seed in RAM (memory dump)
  → But requires root/admin access
  → Auto-lock after 15min mitigates this
```

**Protection:**
- Auto-lock after inactivity
- User should lock manually when done
- Never leave device unlocked and unattended

### 3. Malicious extension wants seed

```
Chrome extension sandboxing:
  → Extensions cannot access other extensions' storage
  → Cannot read memory of other extensions
  → Cannot intercept chrome.storage API
```

**Protection:**
- Chrome's extension isolation
- Manifest V3 security model
- Content Security Policy (CSP)

### 4. XSS / Code Injection

```
Attacker injects malicious JS:
  → Could steal seed IF wallet is unlocked
  → Cannot decrypt if wallet is locked
```

**Protection:**
- Strict Content Security Policy (CSP)
- No `eval()` or inline scripts
- TypeScript (type safety)
- React (XSS protection)
- Lock wallet when not in use

---

## ✅ Security Checklist

- [x] Password never stored
- [x] Encryption key never stored
- [x] PBKDF2 with 600K iterations
- [x] AES-256-GCM encryption
- [x] Random salt per wallet
- [x] Random IV per encryption
- [x] Auto-lock after 15 minutes
- [x] Seed in memory only during session
- [x] No logging of sensitive data
- [x] Content Security Policy
- [x] Manifest V3 security model

---

## 🎓 For Users

### Best Practices

1. **Use a strong password**
   - At least 12 characters
   - Mix letters, numbers, symbols
   - Don't reuse from other sites

2. **Backup your seed phrase**
   - Write it on paper
   - Store in safe place
   - Never screenshot or email it

3. **Lock your wallet**
   - Auto-locks after 15min
   - Manually lock when done
   - Lock before closing browser

4. **Never share**
   - Never share password
   - Never share seed phrase
   - Ziphers will never ask for it

### What if...?

**Q: I forgot my password?**
→ Use your seed phrase to restore wallet with new password

**Q: I lost my seed phrase?**
→ If wallet is locked: you lost access forever (no recovery)
→ If wallet is unlocked: export seed immediately and write it down

**Q: Someone knows my password?**
→ They can access your wallet
→ Create new wallet with new password
→ Transfer funds to new wallet

**Q: Someone knows my seed phrase?**
→ They can steal ALL your funds forever
→ Create NEW seed phrase immediately
→ Transfer ALL funds to new wallet

---

## 🔬 For Developers

### Code Review Points

1. **Never log sensitive data**
   ```typescript
   // ❌ BAD
   console.log('Seed:', seedPhrase);

   // ✅ GOOD
   console.log('Seed length:', seedPhrase.split(' ').length);
   ```

2. **Always clear sensitive data from memory**
   ```typescript
   // After use
   password = '';
   seedPhrase = '';
   ```

3. **Validate all inputs**
   ```typescript
   // Check password strength
   // Validate seed phrase with BIP39
   // Sanitize all user inputs
   ```

4. **Use Web Crypto API (not custom crypto)**
   ```typescript
   // ✅ Use crypto.subtle (audited, secure)
   // ❌ Don't implement your own AES
   ```

### Audit Recommendations

Before mainnet launch:
- [ ] External security audit by reputable firm
- [ ] Penetration testing
- [ ] Code review by crypto experts
- [ ] Bug bounty program
- [ ] Formal verification (if feasible)

---

## 📚 References

- [OWASP Password Storage Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Password_Storage_Cheat_Sheet.html)
- [Web Crypto API Spec](https://www.w3.org/TR/WebCryptoAPI/)
- [NIST Guidelines for Password-Based Key Derivation](https://pages.nist.gov/800-63-3/sp800-63b.html)
- [MetaMask Security](https://metamask.io/security/)
- [Chrome Extension Security](https://developer.chrome.com/docs/extensions/mv3/security/)

---

**Last Updated**: 2025-11-27
**Security Level**: Production-ready for Testnet
**Audit Status**: ⏳ Awaiting external audit before mainnet
