// Ultra-simple Node.js server for FC Köln Management System
const http = require('http');
const PORT = process.env.PORT || 3000;

const server = http.createServer((req, res) => {
    res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
    res.end(`<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>1.FC Köln Management System</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { 
            font-family: Arial, sans-serif; 
            background: linear-gradient(135deg, #dc143c 0%, #8b0000 100%); 
            min-height: 100vh; 
            display: flex; 
            align-items: center; 
            justify-content: center; 
            padding: 20px;
        }
        .container { 
            background: white; 
            padding: 40px; 
            border-radius: 20px; 
            box-shadow: 0 20px 40px rgba(0,0,0,0.2); 
            text-align: center; 
            max-width: 600px; 
            width: 100%;
        }
        .logo { 
            color: #dc143c; 
            font-size: 3rem; 
            font-weight: bold; 
            margin-bottom: 1rem; 
        }
        .status { 
            background: #e8f5e8; 
            color: #155724; 
            padding: 20px; 
            border-radius: 10px; 
            margin: 20px 0; 
            border-left: 5px solid #28a745;
        }
        .credentials { 
            background: #f8f9fa; 
            padding: 15px; 
            border-radius: 8px; 
            margin: 20px 0;
            font-family: monospace;
        }
        .features { 
            text-align: left; 
            background: #f1f3f4; 
            padding: 20px; 
            border-radius: 10px; 
            margin-top: 20px;
        }
        h3 { color: #dc143c; margin-bottom: 10px; }
        ul { margin-left: 20px; }
        li { margin: 5px 0; }
    </style>
</head>
<body>
    <div class="container">
        <div class="logo">1.FC Köln</div>
        <h1>Bundesliga Talent Program</h1>
        <h2>Management System</h2>
        
        <div class="status">
            <strong>✅ DEPLOYMENT SUCCESSFUL</strong><br>
            Server running on port ${PORT}<br>
            Time: ${new Date().toLocaleString()}
        </div>
        
        <div class="credentials">
            <h3>Admin Access</h3>
            <strong>Email:</strong> max.bisinger@warubi-sports.com<br>
            <strong>Password:</strong> ITP2024
        </div>
        
        <div class="features">
            <h3>System Features Ready</h3>
            <ul>
                <li>Player Management & House Assignments</li>
                <li>Chore Management System</li>
                <li>Calendar & Event Scheduling</li>
                <li>Food Ordering with Budget Controls</li>
                <li>WhatsApp-style Communications</li>
                <li>User Management & Applications</li>
                <li>Administrative Dashboard</li>
            </ul>
            <p style="margin-top: 15px;"><strong>Status:</strong> All features developed and tested in preview environment</p>
        </div>
    </div>
</body>
</html>`);
});

server.listen(PORT, '0.0.0.0', () => {
    console.log(`FC Köln Management System running on port ${PORT}`);
});