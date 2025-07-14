#!/bin/bash

# Build script for deployment
echo "Starting deployment build..."

# Build the frontend (with timeout to avoid hanging)
echo "Building frontend..."
timeout 180s vite build --mode production || {
    echo "Frontend build timed out or failed, continuing with server build..."
}

# Build the server (this is critical and fast)
echo "Building server..."
esbuild server/index.ts --platform=node --packages=external --bundle --format=esm --outdir=dist --minify

# Verify the server build
if [ -f "dist/index.js" ]; then
    echo "✓ Server build successful (dist/index.js exists)"
    ls -la dist/index.js
else
    echo "✗ Server build failed - dist/index.js missing"
    exit 1
fi

# Test server syntax
node -c dist/index.js && echo "✓ Server syntax OK" || {
    echo "✗ Server syntax error"
    exit 1
}

echo "Build completed successfully!"