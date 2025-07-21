const express = require('express');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 5000;

console.log('🔧 Starting simple FC Köln preview server...');

// Static middleware for serving files
app.use(express.static(path.join(__dirname, 'dist', 'public')));

// Simple FC Köln login page
app.get('*', (req, res) => {
  res.send(`<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>FC Köln International Talent Program</title>
    <style>
        body { 
            margin: 0; 
            font-family: -apple-system, BlinkMacSystemFont, sans-serif;
            background: linear-gradient(135deg, #dc2626 0%, #b91c1c 100%);
            min-height: 100vh;
            display: flex;
            align-items: center;
            justify-content: center;
        }
        .login-card { 
            background: white; 
            padding: 40px; 
            border-radius: 16px; 
            box-shadow: 0 20px 40px rgba(0,0,0,0.15); 
            width: 100%; 
            max-width: 400px; 
        }
        .logo { 
            text-align: center; 
            color: #dc2626; 
            font-size: 28px; 
            font-weight: 700; 
            margin-bottom: 30px;
        }
        .subtitle {
            text-align: center;
            color: #666;
            margin-bottom: 30px;
            font-size: 16px;
        }
        .form-group { 
            margin-bottom: 20px; 
        }
        label { 
            display: block; 
            margin-bottom: 8px; 
            font-weight: 600; 
            color: #374151;
        }
        input { 
            width: 100%; 
            padding: 12px 16px; 
            border: 2px solid #e5e7eb; 
            border-radius: 8px; 
            font-size: 16px;
            box-sizing: border-box;
        }
        input:focus { 
            outline: none; 
            border-color: #dc2626; 
            box-shadow: 0 0 0 3px rgba(220,38,38,0.1); 
        }
        button { 
            width: 100%; 
            padding: 12px; 
            background: #dc2626; 
            color: white; 
            border: none; 
            border-radius: 8px; 
            font-size: 16px; 
            font-weight: 600; 
            cursor: pointer;
        }
        button:hover { 
            background: #b91c1c; 
        }
        .message { 
            margin-top: 20px; 
            padding: 12px; 
            border-radius: 8px; 
            font-weight: 500; 
        }
        .success { 
            background: #d1fae5; 
            color: #065f46; 
            border: 1px solid #10b981; 
        }
        .error { 
            background: #fee2e2; 
            color: #991b1b; 
            border: 1px solid #ef4444; 
        }
    </style>
</head>
<body>
    <div class="login-card">
        <div class="logo">FC Köln Management</div>
        <div class="subtitle">International Talent Program</div>
        
        <form id="loginForm">
            <div class="form-group">
                <label for="email">Email Address</label>
                <input type="email" id="email" required placeholder="Enter your email" value="max.bisinger@warubi-sports.com">
            </div>
            <div class="form-group">
                <label for="password">Password</label>
                <input type="password" id="password" required placeholder="Enter your password" value="ITP2024">
            </div>
            <button type="submit" id="submitBtn">Sign In</button>
        </form>
        
        <div id="message"></div>
    </div>
    
    <script>
        document.getElementById('loginForm').addEventListener('submit', async function(e) {
            e.preventDefault();
            
            const email = document.getElementById('email').value;
            const password = document.getElementById('password').value;
            const messageDiv = document.getElementById('message');
            const submitBtn = document.getElementById('submitBtn');
            
            submitBtn.disabled = true;
            submitBtn.textContent = 'Signing in...';
            messageDiv.innerHTML = '';
            
            try {
                const response = await fetch('/api/auth/simple-login', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ email, password })
                });
                
                const data = await response.json();
                
                if (response.ok && data.token) {
                    localStorage.setItem('auth-token', data.token);
                    messageDiv.innerHTML = '<div class="message success">Login successful! Welcome to FC Köln Management System.</div>';
                    
                    // Show success for 2 seconds then redirect
                    setTimeout(() => {
                        messageDiv.innerHTML = '<div class="message success">Redirecting to dashboard...</div>';
                    }, 1000);
                } else {
                    messageDiv.innerHTML = '<div class="message error">' + (data.message || 'Login failed') + '</div>';
                }
            } catch (error) {
                messageDiv.innerHTML = '<div class="message error">Connection error: ' + error.message + '</div>';
            } finally {
                submitBtn.disabled = false;
                submitBtn.textContent = 'Sign In';
            }
        });
        
        // Test connection on load
        fetch('/api/health').then(() => console.log('Server connected')).catch(() => console.log('Server offline'));
    </script>
</body>
</html>`);
});

app.listen(PORT, () => {
  console.log(`✅ FC Köln Management System running on port ${PORT}`);
  console.log(`🔗 Open: http://localhost:${PORT}`);
  console.log(`🔑 Admin: max.bisinger@warubi-sports.com / ITP2024`);
});