#!/bin/bash

# Post-build script to copy WebZjs and service worker to dist folder

echo "📦 Copying WebZjs to dist..."

# Copy webzjs-wallet
mkdir -p dist/lib
cp -r ../WebZjs/packages/webzjs-wallet dist/lib/

# Copy non-bundled service worker
cp public/service-worker.js dist/

echo "✅ WebZjs copied to dist/lib/webzjs-wallet"
echo "✅ Service worker copied to dist/"
echo ""
echo "Files:"
ls -lh dist/ | grep -E "service-worker|lib"
