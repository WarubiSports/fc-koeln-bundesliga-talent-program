#!/bin/bash

# FC Köln Management System - Working Development Script
# This script starts the production build which bypasses all CommonJS issues

echo "🔧 Starting FC Köln Management System..."

# Kill any existing processes
pkill -f "tsx.*server" || true
pkill -f "node.*index.js" || true
sleep 2

# Kill anything on port 5000
lsof -ti:5000 | xargs kill -9 || true
sleep 1

# Build the production version
echo "📦 Building production version..."
npm run build

# Start the server
echo "🚀 Starting FC Köln Management System..."
cd dist && node index.js