const fs = require('fs');
const path = require('path');

console.log('🚀 Creating production build for deployment...');

// Create dist directory
const distDir = path.join(__dirname, 'dist');
if (!fs.existsSync(distDir)) {
  fs.mkdirSync(distDir, { recursive: true });
}

// Copy the working FC Köln interface
const workingHtml = fs.readFileSync(path.join(__dirname, 'fc-koln-working.html'), 'utf8');

// Create a simple server that serves the working interface
const serverCode = `const express = require('express');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 5000;

console.log('🔥 FC Köln Management System starting...');

// Serve static files
app.use(express.static(__dirname));

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'healthy', 
    timestamp: new Date().toISOString(),
    system: 'FC Köln Management'
  });
});

// Authentication endpoint for compatibility
app.post('/api/auth/login', express.json(), (req, res) => {
  const { email, password } = req.body;
  
  const validCredentials = [
    { email: 'max.bisinger@warubi-sports.com', password: 'ITP2024', name: 'Max Bisinger', role: 'admin' },
    { email: 'thomas.ellinger@warubi-sports.com', password: 'ITP2024', name: 'Thomas Ellinger', role: 'staff' }
  ];
  
  const user = validCredentials.find(cred => cred.email === email && cred.password === password);
  
  if (user) {
    const token = 'token_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    res.json({
      message: 'Login successful',
      token,
      user: { name: user.name, email: user.email, role: user.role }
    });
  } else {
    res.status(401).json({ message: 'Invalid credentials' });
  }
});

// Serve the FC Köln working interface for all routes
app.get('*', (req, res) => {
  res.send(\`${workingHtml.replace(/`/g, '\\`')}\`);
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(\`✅ FC Köln Management System running on port \${PORT}\`);
  console.log(\`🔗 Available at: http://localhost:\${PORT}\`);
  console.log(\`🔑 Admin: max.bisinger@warubi-sports.com / ITP2024\`);
  console.log(\`👤 Staff: thomas.ellinger@warubi-sports.com / ITP2024\`);
  console.log(\`🎯 System: Production Ready\`);
});`;

// Write the server file
fs.writeFileSync(path.join(distDir, 'index.js'), serverCode);

// Create package.json for deployment
const packageJson = {
  "name": "fc-koln-management-production",
  "version": "1.0.0",
  "description": "FC Köln International Talent Program Management System",
  "main": "index.js",
  "scripts": {
    "start": "node index.js"
  },
  "dependencies": {
    "express": "^4.18.0"
  },
  "engines": {
    "node": ">=18.0.0"
  }
};

fs.writeFileSync(path.join(distDir, 'package.json'), JSON.stringify(packageJson, null, 2));

console.log('✅ Production build completed successfully!');
console.log('📦 Created:');
console.log('   - dist/index.js (Production server with FC Köln interface)');
console.log('   - dist/package.json (Deployment configuration)');
console.log('');
console.log('🚀 Ready for deployment!');
console.log('   - Server includes embedded FC Köln working interface');
console.log('   - Authentication endpoints for compatibility');
console.log('   - Zero external file dependencies');
console.log('   - Production-ready Express server');