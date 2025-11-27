#!/bin/bash

# Post-build script to copy WebZjs to dist folder
# This is needed because WebZjs is excluded from Vite bundle
# and loaded dynamically at runtime in the service worker

echo "📦 Copying WebZjs to dist..."

# Copy webzjs-wallet
mkdir -p dist/lib
cp -r ../WebZjs/packages/webzjs-wallet dist/lib/

echo "✅ WebZjs copied to dist/lib/webzjs-wallet"
echo "Files:"
ls -lh dist/lib/webzjs-wallet/ | head -10

