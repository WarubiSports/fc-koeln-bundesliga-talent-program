#!/bin/bash
# Start both Express backend and Vite frontend

# Kill any existing processes
pkill -f 'tsx watch' 2>/dev/null || true
pkill -f 'vite' 2>/dev/null || true

# Start Express backend on port 5001
echo "Starting Express API server on port 5001..."
NODE_ENV=development tsx watch server/index.ts &
BACKEND_PID=$!

# Wait for backend to be ready
sleep 3

# Start Vite frontend on port 5000
echo "Starting Vite dev server on port 5000..."
npx vite --host 0.0.0.0 --port 5000 &
FRONTEND_PID=$!

# Wait for both processes
wait $BACKEND_PID $FRONTEND_PID
