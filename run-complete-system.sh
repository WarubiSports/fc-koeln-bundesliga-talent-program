#!/bin/bash
echo "🚀 Starting Complete FC Köln Management System"

# Kill any existing processes
pkill -f "tsx server/index.ts" 2>/dev/null || true
pkill -f "node.*index.js" 2>/dev/null || true
sleep 2

# Start the complete production server
cd dist
echo "Starting production server with all functionality..."
node index.js