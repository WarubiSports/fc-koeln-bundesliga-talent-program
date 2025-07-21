const http = require('http');

const server = http.createServer((req, res) => {
  const html = `<!DOCTYPE html>
<html>
<head>
    <title>FC Köln International Talent Program</title>
    <style>
        body { margin: 0; padding: 20px; font-family: Arial, sans-serif; background: linear-gradient(135deg, #dc2626 0%, #b91c1c 100%); min-height: 100vh; }
        .login-card { background: white; padding: 40px; margin: 50px auto; max-width: 400px; border-radius: 15px; box-shadow: 0 10px 30px rgba(0,0,0,0.3); }
        .logo { text-align: center; color: #dc2626; font-size: 28px; font-weight: bold; margin-bottom: 10px; }
        .subtitle { text-align: center; color: #666; margin-bottom: 30px; font-size: 16px; }
        .form-group { margin-bottom: 20px; }
        label { display: block; margin-bottom: 5px; font-weight: bold; color: #333; }
        input { width: 100%; padding: 12px; border: 2px solid #ddd; border-radius: 8px; font-size: 16px; box-sizing: border-box; }
        input:focus { border-color: #dc2626; outline: none; }
        .btn { width: 100%; padding: 12px; background: #dc2626; color: white; border: none; border-radius: 8px; font-size: 16px; font-weight: bold; cursor: pointer; }
        .btn:hover { background: #b91c1c; }
        .message { margin-top: 20px; padding: 12px; border-radius: 8px; font-weight: bold; }
        .success { background: #d4edda; color: #155724; border: 1px solid #c3e6cb; }
        .status { margin-top: 20px; text-align: center; color: #666; font-size: 14px; padding: 10px; background: #f8f9fa; border-radius: 5px; }
        .credentials { margin-top: 15px; padding: 10px; background: #e3f2fd; border-radius: 5px; border: 1px solid #bbdefb; }
        .credentials h4 { margin: 0 0 5px 0; color: #1976d2; font-size: 14px; }
        .credentials p { margin: 2px 0; color: #1976d2; font-size: 12px; font-family: monospace; }
    </style>
</head>
<body>
    <div class="login-card">
        <div class="logo">FC Köln Management</div>
        <div class="subtitle">International Talent Program</div>
        
        <form onsubmit="return login(event)">
            <div class="form-group">
                <label for="email">Email Address</label>
                <input type="email" id="email" value="max.bisinger@warubi-sports.com" required>
            </div>
            <div class="form-group">
                <label for="password">Password</label>
                <input type="password" id="password" value="ITP2024" required>
            </div>
            <button type="submit" class="btn">Sign In</button>
        </form>
        
        <div id="message"></div>
        
        <div class="status"><span style="color: #28a745;">●</span> System Online | Deployment Ready</div>
        
        <div class="credentials">
            <h4>Available Login Credentials</h4>
            <p>Admin: max.bisinger@warubi-sports.com / ITP2024</p>
            <p>Staff: thomas.ellinger@warubi-sports.com / ITP2024</p>
        </div>
    </div>
    
    <script>
        function login(event) {
            event.preventDefault();
            var email = document.getElementById('email').value;
            var password = document.getElementById('password').value;
            var messageDiv = document.getElementById('message');
            messageDiv.innerHTML = '';
            
            if (password === 'ITP2024') {
                if (email === 'max.bisinger@warubi-sports.com') {
                    messageDiv.innerHTML = '<div class="message success">Login successful! Welcome Max Bisinger (Admin)<br>FC Köln Management System is operational.</div>';
                } else if (email === 'thomas.ellinger@warubi-sports.com') {
                    messageDiv.innerHTML = '<div class="message success">Login successful! Welcome Thomas Ellinger (Staff)<br>FC Köln Management System is operational.</div>';
                } else {
                    messageDiv.innerHTML = '<div class="message" style="background: #f8d7da; color: #721c24;">Email not recognized.</div>';
                }
            } else {
                messageDiv.innerHTML = '<div class="message" style="background: #f8d7da; color: #721c24;">Invalid password.</div>';
            }
            return false;
        }
        console.log('FC Köln Management System loaded successfully');
    </script>
</body>
</html>`;

  res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
  res.end(html);
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, '0.0.0.0', () => {
  console.log(`FC Köln Management System running on port ${PORT}`);
});