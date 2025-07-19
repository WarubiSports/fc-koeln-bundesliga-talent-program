// Start the working production server
const { spawn } = require('child_process');
const path = require('path');

console.log('🚀 Starting FC Köln Management System (Production)...');

const distPath = path.join(__dirname, 'dist');
process.chdir(distPath);

const server = spawn('node', ['index.js'], {
  stdio: 'inherit',
  env: { ...process.env, PORT: 5000 }
});

server.on('error', (err) => {
  console.error('Failed to start server:', err);
});

server.on('close', (code) => {
  console.log(`Server exited with code ${code}`);
});