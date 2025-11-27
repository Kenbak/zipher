#!/bin/bash

# Script to setup WebZjs locally for development

set -e

echo "🔧 Setting up WebZjs locally..."

# Check if WebZjs directory exists
if [ -d "../WebZjs" ]; then
  echo "✅ WebZjs directory already exists"
  cd ../WebZjs
  git pull
else
  echo "📥 Cloning WebZjs repository..."
  cd ..
  git clone https://github.com/ChainSafe/WebZjs.git
  cd WebZjs
fi

# Check prerequisites
echo "🔍 Checking prerequisites..."

if ! command -v rustc &> /dev/null; then
  echo "❌ Rust is not installed. Install from: https://rustup.rs/"
  exit 1
fi

if ! command -v just &> /dev/null; then
  echo "⚠️  'just' command runner not found"
  echo "Install with: brew install just (Mac) or cargo install just"
  exit 1
fi

if ! command -v wasm-pack &> /dev/null; then
  echo "⚠️  'wasm-pack' not found. Installing..."
  cargo install wasm-pack
fi

echo "✅ All prerequisites found"

# Build WebZjs
echo "🔨 Building WebZjs (this may take a while)..."
just build

# Install JS dependencies
echo "📦 Installing JavaScript dependencies..."
if command -v yarn &> /dev/null; then
  yarn
else
  echo "⚠️  Yarn not found, using npm..."
  npm install
fi

# Link packages
echo "🔗 Linking WebZjs packages..."
cd packages/webzjs-wallet
npm link

# Return to wallet project and link
cd ../../../zcash-wallet-extension
npm link @chainsafe/webzjs-wallet

echo "✅ WebZjs setup complete!"
echo ""
echo "Next steps:"
echo "1. Uncomment WebZjs code in src/lib/webzjs/wallet.ts"
echo "2. Run 'npm run dev' to test the extension"
