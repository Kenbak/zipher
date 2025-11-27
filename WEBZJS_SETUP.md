# WebZjs Integration Guide

## Current Status

WebZjs packages are **not yet installed** because they're not available on npm yet. The [WebZjs project](https://github.com/ChainSafe/WebZjs) is under active development.

## Installation Options

### Option 1: Wait for npm Publication

Check if packages are available:

```bash
npm info @chainsafe/webzjs-wallet
npm info @chainsafe/webzjs-keys
```

If available, install with:

```bash
npm install @chainsafe/webzjs-wallet @chainsafe/webzjs-keys
```

### Option 2: Install from GitHub (When Available)

```bash
npm install github:ChainSafe/WebZjs#packages/webzjs-wallet
```

### Option 3: Build Locally

Clone and build WebZjs locally:

```bash
# Clone the repo
git clone https://github.com/ChainSafe/WebZjs.git
cd WebZjs

# Install just (command runner)
# On Mac: brew install just
# On Linux: cargo install just

# Build
just build

# Link packages locally
cd packages/webzjs-wallet
npm link

# In this project
cd /path/to/zcash-wallet-extension
npm link @chainsafe/webzjs-wallet
```

## Code Updates Needed

Once WebZjs is installed, uncomment the following in:

### `src/lib/webzjs/wallet.ts`

Uncomment all lines marked with `// TODO: Uncomment when dependencies are installed`

### `vite.config.ts`

May need to add WASM support configuration.

## Lightwalletd URLs

- **Testnet**: `https://zcash-testnet.chainsafe.dev`
- **Mainnet**: `https://zcash-mainnet.chainsafe.dev`

These are gRPC-web proxies hosted by ChainSafe.

## Security Warning

From WebZjs README:

> These libraries are currently under development, have received no reviews or audit, and come with no guarantees whatsoever.

**Use testnet only until security audit is complete.**

## Resources

- [WebZjs GitHub](https://github.com/ChainSafe/WebZjs)
- [WebZjs Docs](https://chainsafe.github.io/WebZjs/)
- [WebZjs Demo](https://webzjs.chainsafe.dev)
