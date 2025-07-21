// Simple development server for FC Köln Management System
const http = require('http');

const fcKolnInterface = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>FC Köln International Talent Program</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            background: linear-gradient(135deg, #dc2626 0%, #b91c1c 50%, #991b1b 100%);
            min-height: 100vh;
            display: flex;
            align-items: center;
            justify-content: center;
            padding: 20px;
        }
        .container {
            background: white;
            border-radius: 20px;
            box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
            padding: 50px;
            width: 100%;
            max-width: 450px;
            text-align: center;
        }
        .logo {
            color: #dc2626;
            font-size: 32px;
            font-weight: bold;
            margin-bottom: 8px;
            text-transform: uppercase;
            letter-spacing: 1px;
        }
        .subtitle {
            color: #666;
            font-size: 18px;
            margin-bottom: 40px;
            font-weight: 300;
        }
        .form-group {
            margin-bottom: 25px;
            text-align: left;
        }
        label {
            display: block;
            margin-bottom: 8px;
            font-weight: 600;
            color: #333;
            font-size: 14px;
        }
        input {
            width: 100%;
            padding: 15px;
            border: 2px solid #e5e5e5;
            border-radius: 10px;
            font-size: 16px;
            transition: all 0.3s ease;
            background: #fafafa;
        }
        input:focus {
            outline: none;
            border-color: #dc2626;
            background: white;
            box-shadow: 0 0 0 3px rgba(220, 38, 38, 0.1);
        }
        .login-btn {
            width: 100%;
            padding: 15px;
            background: linear-gradient(135deg, #dc2626, #b91c1c);
            color: white;
            border: none;
            border-radius: 10px;
            font-size: 18px;
            font-weight: bold;
            cursor: pointer;
            transition: all 0.3s ease;
            text-transform: uppercase;
            letter-spacing: 0.5px;
        }
        .login-btn:hover {
            transform: translateY(-2px);
            box-shadow: 0 10px 30px rgba(220, 38, 38, 0.3);
        }
        .message {
            margin-top: 25px;
            padding: 15px;
            border-radius: 10px;
            font-weight: 500;
            font-size: 14px;
        }
        .success {
            background: linear-gradient(135deg, #d4edda, #c3e6cb);
            color: #155724;
            border: 1px solid #c3e6cb;
        }
        .error {
            background: linear-gradient(135deg, #f8d7da, #f5c6cb);
            color: #721c24;
            border: 1px solid #f5c6cb;
        }
        .status {
            margin-top: 30px;
            padding: 15px;
            background: linear-gradient(135deg, #f8f9fa, #e9ecef);
            border-radius: 10px;
            font-size: 14px;
            color: #495057;
        }
        .status-indicator {
            display: inline-block;
            width: 8px;
            height: 8px;
            background: #28a745;
            border-radius: 50%;
            margin-right: 8px;
            animation: pulse 2s infinite;
        }
        @keyframes pulse {
            0% { opacity: 1; }
            50% { opacity: 0.5; }
            100% { opacity: 1; }
        }
        .credentials {
            margin-top: 20px;
            padding: 20px;
            background: linear-gradient(135deg, #e3f2fd, #bbdefb);
            border-radius: 10px;
            text-align: left;
        }
        .credentials h4 {
            color: #1976d2;
            margin-bottom: 10px;
            font-size: 16px;
        }
        .credentials p {
            color: #1976d2;
            font-family: 'Courier New', monospace;
            font-size: 13px;
            margin: 5px 0;
            background: rgba(255, 255, 255, 0.5);
            padding: 5px 8px;
            border-radius: 5px;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="logo">FC Köln</div>
        <div class="subtitle">International Talent Program</div>
        
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
            <span class="status-indicator"></span>
            System Online • Deployment Ready
        </div>
        
        <div class="credentials">
            <h4>Test Credentials</h4>
            <p>Admin: max.bisinger@warubi-sports.com / ITP2024</p>
            <p>Staff: thomas.ellinger@warubi-sports.com / ITP2024</p>
        </div>
    </div>
    
    <script>
        document.getElementById('loginForm').addEventListener('submit', function(e) {
            e.preventDefault();
            
            const email = document.getElementById('email').value;
            const password = document.getElementById('password').value;
            const messageDiv = document.getElementById('message');
            
            messageDiv.innerHTML = '';
            
            if (password === 'ITP2024') {
                if (email === 'max.bisinger@warubi-sports.com') {
                    messageDiv.innerHTML = '<div class="message success">✓ Login successful! Welcome Max Bisinger (Administrator)<br>FC Köln Management System is operational.</div>';
                    localStorage.setItem('fc-koln-auth', JSON.stringify({
                        token: 'admin-' + Date.now(),
                        user: { name: 'Max Bisinger', email: email, role: 'admin' },
                        loginTime: new Date().toISOString()
                    }));
                } else if (email === 'thomas.ellinger@warubi-sports.com') {
                    messageDiv.innerHTML = '<div class="message success">✓ Login successful! Welcome Thomas Ellinger (Staff)<br>FC Köln Management System is operational.</div>';
                    localStorage.setItem('fc-koln-auth', JSON.stringify({
                        token: 'staff-' + Date.now(),
                        user: { name: 'Thomas Ellinger', email: email, role: 'staff' },
                        loginTime: new Date().toISOString()
                    }));
                } else {
                    messageDiv.innerHTML = '<div class="message error">✗ Email not recognized. Please use provided credentials.</div>';
                }
            } else {
                messageDiv.innerHTML = '<div class="message error">✗ Invalid password. Please try again.</div>';
            }
        });
        
        console.log('FC Köln Management System loaded successfully');
        console.log('System Status: Online');
        console.log('Authentication: Ready');
    </script>
</body>
</html>`;

const server = http.createServer((req, res) => {
    res.writeHead(200, {
        'Content-Type': 'text/html; charset=utf-8',
        'Cache-Control': 'no-cache'
    });
    res.end(fcKolnInterface);
});

const PORT = process.env.PORT || 5000;

server.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 FC Köln Management System running on port ${PORT}`);
    console.log(`🔐 Admin: max.bisinger@warubi-sports.com / ITP2024`);
    console.log(`👥 Staff: thomas.ellinger@warubi-sports.com / ITP2024`);
    console.log(`🌐 Development server ready`);
});