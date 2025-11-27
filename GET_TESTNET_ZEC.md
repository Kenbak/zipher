# 💰 Get Testnet ZEC

Your address is ready to receive testnet ZEC!

---

## 📍 Your Address

```
utest1x6qmrw8tdjv43maqvz0w7nsgmznkzwcu4xy6wzmuptndg4fqk8gmssz9syv4563pdkg0yr30rmxka6dgm5srkvt579ha6qcmptdpxnuf3rhtvdw4zvdx2dxvapryezg48txyac4yxgg05xf80lw709sjtlklj9984kzpvuretdd59vqzrf45u67l3dm4ecfww3a2y5zgu2em2ch7re2
```

**This is a REAL Zcash testnet Unified Address!** 🎉

---

## 🚰 Testnet Faucets

### Option 1: Official Zcash Testnet Faucet
- URL: https://testnet.zecfaucet.com/
- Amount: ~0.1 TAZ (testnet ZEC)
- Wait time: ~10-15 minutes for confirmations

### Option 2: CipherScan Faucet (if available)
- URL: https://testnet.cipherscan.app/faucet
- Integrated with wallet

### Option 3: Community Faucets
- Check Zcash Discord/Forum for active faucets
- Some require captcha or social verification

---

## 📡 Current Status

### ✅ Working:
- Wallet created with WebZjs
- Real address generated
- Connected to RPC: `https://zcash-testnet.chainsafe.dev`

### ⏳ TODO:
- Implement `wallet.sync()` to fetch blockchain data
- Display balance in UI
- Show incoming transactions
- Periodic sync (every 30s)

---

## 🔄 Next Steps

1. **Get testnet ZEC** from faucet
2. **Wait 10-15 min** for blockchain confirmation
3. **Implement sync** to see balance
4. **Display balance** in Home screen

---

## 🧪 Testing Plan

Once sync is implemented:

```typescript
// In WebzjsContext.tsx or Home.tsx

// 1. Sync wallet with blockchain
await wallet.sync();

// 2. Get balance
const balance = await wallet.get_balance(accountId);

// 3. Convert zatoshis to ZEC
const zec = Number(balance) / 100_000_000;

// 4. Display
console.log(`Balance: ${zec} ZEC`);
```

---

## 📊 Expected Flow

```
1. User gets address (DONE ✅)
2. User requests testnet ZEC from faucet
3. Faucet sends transaction to blockchain
4. Transaction confirmed (~10 min)
5. Wallet syncs (TODO)
6. Balance updated in UI (TODO)
7. User sees ZEC in wallet! 🎉
```

---

**Tu veux qu'on implémente le sync maintenant pour voir ton balance quand tu reçois du ZEC ?** 🚀
