const express = require('express');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 5000;

// Serve static files
app.use(express.static('.'));

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'healthy', timestamp: new Date().toISOString() });
});

// Serve the FC Köln working interface
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'fc-koln-working.html'));
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`FC Köln Management System running on port ${PORT}`);
  console.log(`Admin: max.bisinger@warubi-sports.com / ITP2024`);
  console.log(`Staff: thomas.ellinger@warubi-sports.com / ITP2024`);
});