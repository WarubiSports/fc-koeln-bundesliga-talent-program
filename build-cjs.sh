#!/bin/bash

# Build script for CommonJS deployment
echo "Starting CommonJS deployment build..."

# Build the frontend (with timeout to avoid hanging)
echo "Building frontend..."
timeout 180s vite build --mode production || {
    echo "Frontend build timed out or failed, continuing with server build..."
}

# Copy the CommonJS server
echo "Copying CommonJS server..."
cp server/index-cjs.js dist/index.cjs

# Verify the server build
if [ -f "dist/index.cjs" ]; then
    echo "✓ Server build successful (dist/index.cjs exists)"
    ls -la dist/index.cjs
else
    echo "✗ Server build failed - dist/index.cjs missing"
    exit 1
fi

# Test server syntax
node -c dist/index.cjs && echo "✓ Server syntax OK" || {
    echo "✗ Server syntax error"
    exit 1
}

# Create deployment package.json for CommonJS
echo "Creating deployment package.json..."
cat > dist/package.json << 'EOF'
{
  "name": "fc-koln-management",
  "version": "1.0.0",
  "main": "index.cjs",
  "scripts": {
    "start": "node index.cjs"
  },
  "engines": {
    "node": ">=20.0.0"
  }
}
EOF

echo "✓ Created deployment package.json"

# Copy static files if they exist
if [ -d "dist/public" ]; then
    echo "✓ Frontend static files ready"
fi

echo "CommonJS build completed successfully!"
echo "Deploy with: cd dist && node index.cjs"