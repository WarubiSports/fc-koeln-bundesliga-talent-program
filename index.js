const express = require('express');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 5000;

// Serve static files from dist/public
const publicPath = path.join(__dirname, 'dist', 'public');

if (fs.existsSync(publicPath)) {
  app.use(express.static(publicPath));
} else {
  console.log('Public directory not found, serving basic response');
}

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    timestamp: new Date().toISOString(),
    app: 'FC Köln Management System'
  });
});

// Serve React app for all other routes
app.get('*', (req, res) => {
  const indexPath = path.join(publicPath, 'index.html');
  if (fs.existsSync(indexPath)) {
    res.sendFile(indexPath);
  } else {
    res.json({ 
      message: 'FC Köln Management System',
      status: 'ready',
      timestamp: new Date().toISOString()
    });
  }
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`FC Köln Management System running on port ${PORT}`);
  console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
});