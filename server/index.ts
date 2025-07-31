// Development server redirect to safe restructured implementation
const { spawn } = require('child_process');

console.log('🔄 Redirecting to restructured FC Köln server...');

// Start the restructured safe server (eliminates template literal vulnerability)
const serverProcess = spawn('node', ['server/safe-server.js'], {
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