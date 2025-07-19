// Complete FC Köln Management System - Working Development Server
const express = require('express');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// Serve the production build
const distPath = path.join(__dirname, 'dist', 'public');
app.use(express.static(distPath));

// All other routes serve the React app
app.get('*', (req, res) => {
  res.sendFile(path.join(distPath, 'index.html'));
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 FC Köln Management System running on port ${PORT}`);
  console.log(`📱 Access your app at: http://localhost:${PORT}`);
  console.log(`🔐 Admin: max.bisinger@warubi-sports.com / ITP2024`);
  console.log(`👨‍💼 Staff: thomas.ellinger@warubi-sports.com / ITP2024`);
});