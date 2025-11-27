#!/bin/bash
set -e

echo "🔨 Building Ziphers WASM..."

# Check if wasm-pack is installed
if ! command -v wasm-pack &> /dev/null; then
    echo "❌ wasm-pack not found. Installing..."
    cargo install wasm-pack
fi

# Build for web target
wasm-pack build --target web --out-dir ../public/wasm --release

echo "✅ WASM built successfully!"
echo "📦 Output: public/wasm/"
echo ""
echo "Files generated:"
ls -lh ../public/wasm/

