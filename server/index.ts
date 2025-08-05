// Development server redirect to working implementation
const { spawn } = require('child_process');

console.log('🔄 Starting clean FC Köln authentication system...');

// Start the clean authentication system
const serverProcess = spawn('node', ['fc-koln-clean-auth.js'], {
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