// Development server redirect to working implementation
const { spawn } = require('child_process');

console.log('🔄 Redirecting to working FC Köln server...');

// Start the working server
const serverProcess = spawn('node', ['server.js'], {
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