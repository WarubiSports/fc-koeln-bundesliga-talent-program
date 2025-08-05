// Development server redirect to working implementation
const { spawn } = require('child_process');

console.log('🔄 Starting STABLE PERMANENT FC Köln Management System...');

// Start the stable permanent system with all features and no recurring errors
const serverProcess = spawn('node', ['fc-koln-stable-permanent.js'], {
    stdio: 'inherit',
    env: { ...process.env, PORT: '5000' }
});

serverProcess.on('error', (err) => {
    console.error('❌ Server error:', err);
});

process.on('SIGINT', () => {
    console.log('\n🛑 Shutting down server...');
    serverProcess.kill('SIGTERM');
    process.exit(0);
});