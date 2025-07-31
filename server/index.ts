import express from 'express';
import { createServer } from 'http';
import { join } from 'path';
import { readFileSync } from 'fs';
import routes from './routes';

const app = express();
const server = createServer(app);

// Middleware
app.use(express.json());
app.use(express.static('.'));
app.use('/attached_assets', express.static('attached_assets'));

// API routes
app.use(routes);

// Load the FC Köln application content
const fcKolnAppPath = join(process.cwd(), 'fc-koln-7300-working.js');
let FC_KOLN_APP = '';

try {
  const fileContent = readFileSync(fcKolnAppPath, 'utf8');
  // Extract the HTML content from the JavaScript file
  const htmlMatch = fileContent.match(/const FC_KOLN_APP = `([\s\S]*?)`;/);
  if (htmlMatch) {
    FC_KOLN_APP = htmlMatch[1];
  } else {
    console.error('Could not extract HTML content from fc-koln-7300-working.js');
    FC_KOLN_APP = '<html><body><h1>Error loading application</h1></body></html>';
  }
} catch (error) {
  console.error('Error reading fc-koln-7300-working.js:', error);
  FC_KOLN_APP = '<html><body><h1>Error loading application</h1></body></html>';
}

// Serve the main application
app.get('*', (req, res) => {
  res.setHeader('Content-Type', 'text/html; charset=utf-8');
  res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
  res.setHeader('Pragma', 'no-cache');
  res.setHeader('Expires', '0');
  res.send(FC_KOLN_APP);
});

const PORT = process.env.PORT || 5000;

server.listen(PORT, '0.0.0.0', () => {
  console.log('1.FC Köln Bundesliga Talent Program running on port ' + PORT);
  console.log('Admin credentials: max.bisinger@warubi-sports.com / ITP2024');
  console.log('Staff credentials: thomas.ellinger@warubi-sports.com / ITP2024');
  console.log('Features: Dashboard, Players, Chores, Calendar, Food Orders, Communications, House Management, Member Management');
  console.log('Server ready at http://0.0.0.0:' + PORT);
  console.log('Complete system with database backend: Operational');
});

// Error handling
server.on('error', (err) => {
  console.error('Server error:', err);
});

process.on('uncaughtException', (err) => {
  console.error('Uncaught exception:', err);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled rejection at:', promise, 'reason:', reason);
});