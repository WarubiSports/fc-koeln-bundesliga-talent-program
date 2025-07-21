#!/bin/bash

# Kill any existing servers
pkill -f "tsx server/index.ts" 2>/dev/null || true
pkill -f "node index.js" 2>/dev/null || true
pkill -f "simple-preview.js" 2>/dev/null || true

echo "🔧 Starting FC Köln Management System..."

# Use the production build which includes authentication API
cd dist
node index.js &

echo "✅ Server started in background"
echo "🔗 Available at: http://localhost:5000"
echo "🔑 Admin login: max.bisinger@warubi-sports.com / ITP2024"

# Keep script running to show output
sleep 3
curl -s http://localhost:5000/api/health > /dev/null && echo "✅ Health check passed" || echo "❌ Health check failed"