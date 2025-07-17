#!/bin/bash

echo "🚀 Starting FC Köln Management System in production mode..."

# Build the application
echo "📦 Building application..."
npm run build

# Navigate to dist and start the server
echo "🔥 Starting production server..."
cd dist
node index.js