const express = require('express');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 3000;

// Serve static files from production build
const distPath = path.resolve(__dirname, '../dist/public');
console.log('Serving static files from:', distPath);

if (fs.existsSync(distPath)) {
  app.use(express.static(distPath));
  
  // API routes can be added here
  app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
  });
  
  // Serve React app for all other routes
  app.get('*', (req, res) => {
    res.sendFile(path.resolve(distPath, 'index.html'));
  });
  
  app.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 FC Köln Management System running on port ${PORT}`);
    console.log(`📱 Complete React application with all features`);
    console.log(`🔐 Admin: max.bisinger@warubi-sports.com / ITP2024`);
    console.log(`👨‍💼 Staff: thomas.ellinger@warubi-sports.com / ITP2024`);
  });
} else {
  console.error('Build directory not found:', distPath);
  console.log('Please run: node build-complete-app.js');
  process.exit(1);
}