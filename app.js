#!/usr/bin/env node

const http = require('http');
const url = require('url');

console.log('Starting FC Köln Management System...');

const HTML_CONTENT = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>FC Köln International Talent Program</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            background: linear-gradient(135deg, #dc2626 0%, #b91c1c 50%, #991b1b 100%);
            min-height: 100vh;
            display: flex;
            align-items: center;
            justify-content: center;
            padding: 20px;
        }
        
        .container {
            background: #ffffff;
            border-radius: 20px;
            box-shadow: 0 25px 50px rgba(0, 0, 0, 0.25);
            padding: 60px 50px;
            width: 100%;
            max-width: 480px;
            text-align: center;
        }
        
        .logo {
            color: #dc2626;
            font-size: 36px;
            font-weight: 900;
            margin-bottom: 12px;
            text-transform: uppercase;
            letter-spacing: 2px;
        }
        
        .subtitle {
            color: #666666;
            font-size: 18px;
            margin-bottom: 50px;
            font-weight: 400;
            line-height: 1.4;
        }
        
        .form-group {
            margin-bottom: 30px;
            text-align: left;
        }
        
        .form-group label {
            display: block;
            margin-bottom: 10px;
            font-weight: 600;
            color: #333333;
            font-size: 15px;
        }
        
        .form-group input {
            width: 100%;
            padding: 18px 20px;
            border: 2px solid #e5e7eb;
            border-radius: 12px;
            font-size: 16px;
            transition: all 0.3s ease;
            background: #f9fafb;
        }
        
        .form-group input:focus {
            outline: none;
            border-color: #dc2626;
            background: #ffffff;
            box-shadow: 0 0 0 4px rgba(220, 38, 38, 0.1);
        }
        
        .login-btn {
            width: 100%;
            padding: 18px;
            background: linear-gradient(135deg, #dc2626, #b91c1c);
            color: white;
            border: none;
            border-radius: 12px;
            font-size: 18px;
            font-weight: 700;
            cursor: pointer;
            transition: all 0.3s ease;
            text-transform: uppercase;
            letter-spacing: 1px;
            margin-top: 10px;
        }
        
        .login-btn:hover {
            transform: translateY(-3px);
            box-shadow: 0 15px 35px rgba(220, 38, 38, 0.4);
        }
        
        .message {
            margin-top: 30px;
            padding: 20px;
            border-radius: 12px;
            font-weight: 600;
            font-size: 15px;
            line-height: 1.5;
        }
        
        .success {
            background: linear-gradient(135deg, #d1fae5, #a7f3d0);
            color: #065f46;
            border: 2px solid #10b981;
        }
        
        .error {
            background: linear-gradient(135deg, #fee2e2, #fecaca);
            color: #7f1d1d;
            border: 2px solid #ef4444;
        }
        
        .status {
            margin-top: 40px;
            padding: 20px;
            background: linear-gradient(135deg, #f1f5f9, #e2e8f0);
            border-radius: 12px;
            font-size: 16px;
            color: #475569;
            font-weight: 500;
        }
        
        .status-dot {
            display: inline-block;
            width: 12px;
            height: 12px;
            background: #10b981;
            border-radius: 50%;
            margin-right: 10px;
            animation: pulse 2s infinite;
        }
        
        @keyframes pulse {
            0%, 100% { opacity: 1; }
            50% { opacity: 0.5; }
        }
        
        .credentials {
            margin-top: 25px;
            padding: 25px;
            background: linear-gradient(135deg, #dbeafe, #bfdbfe);
            border-radius: 12px;
            text-align: left;
            border: 2px solid #3b82f6;
        }
        
        .credentials h4 {
            color: #1e40af;
            margin-bottom: 15px;
            font-size: 18px;
            font-weight: 700;
        }
        
        .credentials p {
            color: #1e40af;
            font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
            font-size: 14px;
            margin: 8px 0;
            background: rgba(255, 255, 255, 0.7);
            padding: 8px 12px;
            border-radius: 8px;
            font-weight: 500;
        }
        
        @media (max-width: 600px) {
            .container {
                padding: 40px 30px;
                margin: 10px;
            }
            
            .logo {
                font-size: 28px;
            }
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="logo">FC Köln</div>
        <div class="subtitle">International Talent Program<br>Management System</div>
        
        <form id="loginForm">
            <div class="form-group">
                <label for="email">Email Address</label>
                <input type="email" id="email" value="max.bisinger@warubi-sports.com" required>
            </div>
            
            <div class="form-group">
                <label for="password">Password</label>
                <input type="password" id="password" value="ITP2024" required>
            </div>
            
            <button type="submit" class="login-btn">Sign In</button>
        </form>
        
        <div id="message"></div>
        
        <div class="status">
            <span class="status-dot"></span>
            System Online • Ready for Authentication
        </div>
        
        <div class="credentials">
            <h4>Available Accounts</h4>
            <p>Admin: max.bisinger@warubi-sports.com / ITP2024</p>
            <p>Staff: thomas.ellinger@warubi-sports.com / ITP2024</p>
        </div>
    </div>
    
    <script>
        document.getElementById('loginForm').addEventListener('submit', function(e) {
            e.preventDefault();
            
            const email = document.getElementById('email').value.trim();
            const password = document.getElementById('password').value;
            const messageDiv = document.getElementById('message');
            
            messageDiv.innerHTML = '';
            
            if (password === 'ITP2024') {
                let message = '';
                let userData = null;
                
                if (email === 'max.bisinger@warubi-sports.com') {
                    message = '✓ Authentication successful!<br><strong>Welcome Max Bisinger (Administrator)</strong><br>FC Köln Management System is now operational.';
                    userData = { name: 'Max Bisinger', email: email, role: 'admin' };
                } else if (email === 'thomas.ellinger@warubi-sports.com') {
                    message = '✓ Authentication successful!<br><strong>Welcome Thomas Ellinger (Staff)</strong><br>FC Köln Management System is now operational.';
                    userData = { name: 'Thomas Ellinger', email: email, role: 'staff' };
                } else {
                    messageDiv.innerHTML = '<div class="message error">✗ Email address not recognized.<br>Please use one of the provided test accounts.</div>';
                    return;
                }
                
                messageDiv.innerHTML = '<div class="message success">' + message + '</div>';
                
                // Store authentication data
                const authData = {
                    token: userData.role + '_' + Date.now(),
                    user: userData,
                    loginTime: new Date().toISOString(),
                    system: 'FC Köln Management'
                };
                
                localStorage.setItem('fc-koln-auth', JSON.stringify(authData));
                
                console.log('Authentication successful:', userData.name);
                console.log('Role:', userData.role);
                console.log('System ready for', userData.name);
                
            } else {
                messageDiv.innerHTML = '<div class="message error">✗ Invalid password.<br>Please check your credentials and try again.</div>';
            }
        });
        
        // System initialization
        console.log('FC Köln Management System loaded successfully');
        console.log('System Status: Online and Ready');
        console.log('Authentication: Available');
        console.log('Environment: Production Deployment');
        
        // Check for existing authentication
        const existingAuth = localStorage.getItem('fc-koln-auth');
        if (existingAuth) {
            try {
                const authData = JSON.parse(existingAuth);
                console.log('Previous session found for:', authData.user.name);
            } catch (e) {
                console.log('Starting fresh session');
            }
        }
    </script>
</body>
</html>`;

const server = http.createServer((req, res) => {
    const parsedUrl = url.parse(req.url, true);
    
    // Handle health check
    if (parsedUrl.pathname === '/health') {
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ 
            status: 'healthy', 
            system: 'FC Köln Management',
            timestamp: new Date().toISOString()
        }));
        return;
    }
    
    // Serve FC Köln interface for all other routes
    res.writeHead(200, {
        'Content-Type': 'text/html; charset=utf-8',
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0'
    });
    
    res.end(HTML_CONTENT);
});

const PORT = process.env.PORT || 3000;

server.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 FC Köln Management System running on port ${PORT}`);
    console.log(`🔐 Admin credentials: max.bisinger@warubi-sports.com / ITP2024`);
    console.log(`👥 Staff credentials: thomas.ellinger@warubi-sports.com / ITP2024`);
    console.log(`🌐 Server ready at http://0.0.0.0:${PORT}`);
    console.log(`✅ System status: Operational`);
});

// Error handling
server.on('error', (err) => {
    console.error('❌ Server error:', err);
});

process.on('uncaughtException', (err) => {
    console.error('❌ Uncaught exception:', err);
});

process.on('unhandledRejection', (reason, promise) => {
    console.error('❌ Unhandled rejection at:', promise, 'reason:', reason);
});