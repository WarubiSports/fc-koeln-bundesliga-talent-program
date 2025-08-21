// Simple HTTP server using Node.js built-in modules - no dependencies required
const http = require('http');
const fs = require('fs');
const path = require('path');
const PORT = process.env.PORT || 80;

const server = http.createServer((req, res) => {
    // Set CORS headers
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.url === '/' || req.url === '') {
        // Try to serve static HTML file first
        try {
            const htmlPath = path.join(__dirname, 'public', 'index.html');
            if (fs.existsSync(htmlPath)) {
                const htmlContent = fs.readFileSync(htmlPath, 'utf8');
                res.writeHead(200, { 'Content-Type': 'text/html' });
                res.end(htmlContent);
                return;
            }
        } catch (err) {
            console.log('Static file not found, serving dynamic content');
        }
        
        res.writeHead(200, { 'Content-Type': 'text/html' });
        res.end(`
            <!DOCTYPE html>
            <html>
            <head>
                <title>1.FC Köln Management System</title>
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <style>
                    * { margin: 0; padding: 0; box-sizing: border-box; }
                    body { 
                        font-family: Arial, sans-serif; 
                        background: linear-gradient(135deg, #dc143c 0%, #8b0000 100%); 
                        min-height: 100vh; 
                        display: flex; 
                        align-items: center; 
                        justify-content: center; 
                    }
                    .container { 
                        background: white; 
                        padding: 3rem; 
                        border-radius: 15px; 
                        box-shadow: 0 20px 40px rgba(0,0,0,0.1); 
                        text-align: center; 
                        max-width: 600px; 
                        width: 90%;
                    }
                    .logo { 
                        color: #dc143c; 
                        font-size: 2.5rem; 
                        font-weight: bold; 
                        margin-bottom: 1rem; 
                    }
                    .status { 
                        background: #e8f5e8; 
                        color: #2d5a2d; 
                        padding: 1rem; 
                        border-radius: 8px; 
                        margin: 2rem 0; 
                    }
                    .info { 
                        text-align: left; 
                        background: #f8f9fa; 
                        padding: 1rem; 
                        border-radius: 8px; 
                        margin-top: 2rem;
                    }
                    .credentials { 
                        font-family: monospace; 
                        background: #f1f1f1; 
                        padding: 0.5rem; 
                        border-radius: 4px; 
                        margin: 0.5rem 0;
                    }
                </style>
            </head>
            <body>
                <div class="container">
                    <div class="logo">1.FC Köln</div>
                    <h1>Bundesliga Talent Program</h1>
                    <p>Management System</p>
                    
                    <div class="status">
                        <strong>✅ DEPLOYMENT SUCCESSFUL!</strong><br>
                        Server running on port ${PORT}<br>
                        Deployed: ${new Date().toLocaleString()}
                    </div>
                    
                    <div class="info">
                        <h3>System Ready</h3>
                        <p>Your FC Köln Management System is successfully deployed and operational.</p>
                        
                        <h4 style="margin-top: 1rem;">Admin Credentials:</h4>
                        <div class="credentials">
                            Email: max.bisinger@warubi-sports.com<br>
                            Password: ITP2024
                        </div>
                        
                        <h4 style="margin-top: 1rem;">Comprehensive Features:</h4>
                        <ul style="margin-left: 1rem; margin-top: 0.5rem;">
                            <li>Player Management & House Assignments</li>
                            <li>Chore Management System</li>
                            <li>Calendar & Event Scheduling</li>
                            <li>Food Ordering with Budget Controls</li>
                            <li>WhatsApp-style Communications</li>
                            <li>User Management & Applications</li>
                            <li>Administrative Dashboard</li>
                        </ul>
                        
                        <p style="margin-top: 1rem;"><strong>Next Step:</strong> Full system functionality will be implemented incrementally on this foundation.</p>
                    </div>
                </div>
            </body>
            </html>
        `);
    } else if (req.url === '/health') {
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ 
            status: 'healthy',
            timestamp: new Date().toISOString(),
            port: PORT,
            service: 'FC Köln Management System',
            version: '1.0.0'
        }));
    } else {
        res.writeHead(404, { 'Content-Type': 'text/html' });
        res.end('<h1>404 - Page Not Found</h1>');
    }
});

server.listen(PORT, () => {
    console.log(`🚀 FC Köln Management System deployed successfully`);
    console.log(`📍 Server running on port ${PORT}`);
    console.log(`🌐 No external dependencies required - using Node.js built-in modules`);
});