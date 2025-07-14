import { writeFileSync, mkdirSync, existsSync } from 'fs';

async function buildFrontend() {
  console.log('Creating simple frontend for deployment...');
  
  // Ensure dist/public directory exists
  if (!existsSync('dist/public')) {
    mkdirSync('dist/public', { recursive: true });
  }
  
  // Create a simple HTML frontend
  const htmlContent = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>FC Köln Management System</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            background-color: #f5f5f5;
            color: #333;
            line-height: 1.6;
        }
        
        .container {
            max-width: 400px;
            margin: 100px auto;
            padding: 40px;
            background: white;
            border-radius: 10px;
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
        }
        
        .logo {
            text-align: center;
            margin-bottom: 30px;
        }
        
        .logo h1 {
            color: #dc2626;
            font-size: 24px;
            margin-bottom: 10px;
        }
        
        .form-group {
            margin-bottom: 20px;
        }
        
        label {
            display: block;
            margin-bottom: 5px;
            font-weight: 600;
        }
        
        input {
            width: 100%;
            padding: 12px;
            border: 1px solid #ddd;
            border-radius: 5px;
            font-size: 16px;
        }
        
        button {
            width: 100%;
            padding: 12px;
            background-color: #dc2626;
            color: white;
            border: none;
            border-radius: 5px;
            font-size: 16px;
            cursor: pointer;
            transition: background-color 0.2s;
        }
        
        button:hover {
            background-color: #b91c1c;
        }
        
        .error {
            color: #dc2626;
            margin-top: 10px;
            text-align: center;
        }
        
        .success {
            color: #16a34a;
            margin-top: 10px;
            text-align: center;
        }
        
        .dashboard {
            display: none;
        }
        
        .dashboard.active {
            display: block;
        }
        
        .nav {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 30px;
            padding-bottom: 20px;
            border-bottom: 2px solid #dc2626;
        }
        
        .nav h2 {
            color: #dc2626;
        }
        
        .logout {
            background-color: #6b7280;
            padding: 8px 16px;
            font-size: 14px;
            width: auto;
        }
        
        .logout:hover {
            background-color: #4b5563;
        }
        
        .grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
            gap: 20px;
        }
        
        .card {
            background: #f8fafc;
            padding: 20px;
            border-radius: 8px;
            border: 1px solid #e2e8f0;
            text-align: center;
        }
        
        .card h3 {
            color: #dc2626;
            margin-bottom: 10px;
        }
        
        .card p {
            color: #6b7280;
            font-size: 14px;
        }
    </style>
</head>
<body>
    <div class="container">
        <div id="login-form">
            <div class="logo">
                <h1>🔴 FC Köln</h1>
                <p>Management System</p>
            </div>
            
            <form id="loginForm">
                <div class="form-group">
                    <label for="email">Email:</label>
                    <input type="email" id="email" name="email" required>
                </div>
                
                <div class="form-group">
                    <label for="password">Password:</label>
                    <input type="password" id="password" name="password" required>
                </div>
                
                <button type="submit">Login</button>
                <div id="error-message" class="error"></div>
            </form>
        </div>
        
        <div id="dashboard" class="dashboard">
            <div class="nav">
                <h2>🔴 FC Köln Dashboard</h2>
                <button class="logout" onclick="logout()">Logout</button>
            </div>
            
            <div class="grid">
                <div class="card">
                    <h3>📋 Players</h3>
                    <p>Manage team roster and player information</p>
                </div>
                
                <div class="card">
                    <h3>🏠 Chores</h3>
                    <p>Track house chores and assignments</p>
                </div>
                
                <div class="card">
                    <h3>📅 Events</h3>
                    <p>Schedule practices and matches</p>
                </div>
                
                <div class="card">
                    <h3>🍽️ Food Orders</h3>
                    <p>Manage grocery orders and deliveries</p>
                </div>
                
                <div class="card">
                    <h3>💬 Messages</h3>
                    <p>Team communication and notifications</p>
                </div>
            </div>
        </div>
    </div>

    <script>
        let authToken = localStorage.getItem('authToken');
        
        // Check if user is already logged in
        if (authToken) {
            showDashboard();
        }
        
        document.getElementById('loginForm').addEventListener('submit', async (e) => {
            e.preventDefault();
            
            const email = document.getElementById('email').value;
            const password = document.getElementById('password').value;
            const errorDiv = document.getElementById('error-message');
            
            try {
                const response = await fetch('/api/login', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ email, password })
                });
                
                const data = await response.json();
                
                if (response.ok) {
                    localStorage.setItem('authToken', data.token);
                    showDashboard();
                    errorDiv.textContent = '';
                } else {
                    errorDiv.textContent = data.error || 'Login failed';
                }
            } catch (error) {
                errorDiv.textContent = 'Connection error';
            }
        });
        
        function showDashboard() {
            document.getElementById('login-form').style.display = 'none';
            document.getElementById('dashboard').classList.add('active');
        }
        
        function logout() {
            localStorage.removeItem('authToken');
            document.getElementById('login-form').style.display = 'block';
            document.getElementById('dashboard').classList.remove('active');
            document.getElementById('email').value = '';
            document.getElementById('password').value = '';
        }
    </script>
</body>
</html>`;
  
  writeFileSync('dist/public/index.html', htmlContent);
  console.log('✅ Created simple HTML frontend');
  
  console.log('🚀 Frontend deployment ready!');
  console.log('- Simple HTML/CSS/JS frontend');
  console.log('- Login form with authentication');
  console.log('- Dashboard with feature overview');
  console.log('- Admin credentials: max.bisinger@warubi-sports.com / ITP2024');
}

buildFrontend();