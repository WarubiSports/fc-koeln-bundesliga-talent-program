// Simple deployment test
const express = require('express');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 5000;

// Test if dist directory exists
const distPath = path.join(__dirname, 'dist');
console.log('Checking dist directory:', distPath);
console.log('Dist exists:', fs.existsSync(distPath));

if (fs.existsSync(distPath)) {
  console.log('Dist contents:', fs.readdirSync(distPath));
  
  const publicPath = path.join(distPath, 'public');
  if (fs.existsSync(publicPath)) {
    console.log('Public contents:', fs.readdirSync(publicPath));
  }
}

// Start simple server
app.get('/', (req, res) => {
  res.json({ 
    status: 'FC Köln Management System Ready',
    timestamp: new Date().toISOString(),
    dist: fs.existsSync(distPath),
    port: PORT
  });
});

app.listen(PORT, () => {
  console.log(`Test server running on port ${PORT}`);
});