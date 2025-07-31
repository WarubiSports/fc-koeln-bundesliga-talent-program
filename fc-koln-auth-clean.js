const express = require('express');
const path = require('path');
const app = express();
const PORT = process.env.PORT || 5000;

// Serve static files
app.use('/attached_assets', express.static(path.join(__dirname, 'attached_assets')));

// Parse JSON and URL-encoded data
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get('/', (req, res) => {
    res.send(`
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>1.FC Köln Bundesliga Talent Program</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            background: linear-gradient(135deg, #dc2626 0%, #991b1b 100%);
            min-height: 100vh;
            display: flex;
            align-items: center;
            justify-content: center;
        }
        
        .login-container {
            background: white;
            padding: 2rem;
            border-radius: 12px;
            box-shadow: 0 20px 40px rgba(0,0,0,0.1);
            width: 100%;
            max-width: 400px;
            text-align: center;
        }
        
        .fc-koln-logo {
            width: 80px;
            height: 80px;
            margin: 0 auto 1rem;
        }
        
        h1 {
            color: #dc2626;
            margin-bottom: 0.5rem;
            font-size: 1.5rem;
        }
        
        .subtitle {
            color: #666;
            margin-bottom: 2rem;
        }
        
        .auth-tabs {
            display: flex;
            margin-bottom: 1.5rem;
            border-radius: 8px;
            overflow: hidden;
            border: 2px solid #f3f4f6;
        }
        
        .auth-tab-btn {
            flex: 1;
            padding: 0.75rem;
            border: none;
            background: #f9fafb;
            color: #374151;
            cursor: pointer;
            transition: all 0.2s;
        }
        
        .auth-tab-btn.active {
            background: #dc2626;
            color: white;
        }
        
        .auth-tab-content {
            display: none;
        }
        
        .auth-tab-content.active {
            display: block;
        }
        
        .form-group {
            margin-bottom: 1rem;
            text-align: left;
        }
        
        label {
            display: block;
            margin-bottom: 0.5rem;
            font-weight: 500;
            color: #374151;
        }
        
        input {
            width: 100%;
            padding: 0.75rem;
            border: 2px solid #e5e7eb;
            border-radius: 6px;
            font-size: 1rem;
        }
        
        input:focus {
            outline: none;
            border-color: #dc2626;
        }
        
        .btn {
            width: 100%;
            padding: 0.75rem;
            background: #dc2626;
            color: white;
            border: none;
            border-radius: 6px;
            font-size: 1rem;
            cursor: pointer;
            transition: background-color 0.2s;
        }
        
        .btn:hover {
            background: #b91c1c;
        }
        
        #loginMessage {
            margin-top: 1rem;
            padding: 0.5rem;
            border-radius: 4px;
        }
        
        .success {
            background: #dcfce7;
            color: #166534;
        }
        
        .error {
            background: #fef2f2;
            color: #dc2626;
        }
        
        .main-app {
            display: none;
            background: white;
            min-height: 100vh;
            padding: 2rem;
        }
        
        .header {
            background: #dc2626;
            color: white;
            padding: 1rem;
            margin: -2rem -2rem 2rem -2rem;
            text-align: center;
        }
    </style>
</head>
<body>
    <!-- Login Page -->
    <div id="loginPage" class="login-container">
        <div class="login-logo">
            <img src="attached_assets/NewCologneLogo_1753281112388.png" alt="1.FC Köln Logo" class="fc-koln-logo">
        </div>
        <h1>1.FC Köln Bundesliga Talent Program</h1>
        <div class="subtitle">Management System</div>
        
        <!-- Login/Registration Tabs -->
        <div class="auth-tabs">
            <button class="auth-tab-btn active" onclick="switchTab('login')">Sign In</button>
            <button class="auth-tab-btn" onclick="switchTab('register')">Join Program</button>
        </div>
        
        <!-- Login Form -->
        <div id="loginTab" class="auth-tab-content active">
            <form id="loginForm">
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
            
            <div id="loginMessage"></div>
        </div>
        
        <!-- Registration Tab -->
        <div id="registerTab" class="auth-tab-content">
            <div class="form-group">
                <label>Registration Type</label>
                <p>Select your role to continue with registration</p>
            </div>
            
            <button class="btn" style="margin-bottom: 1rem;">Player Registration</button>
            <button class="btn">Staff Registration</button>
        </div>
    </div>
    
    <!-- Main Application -->
    <div id="mainApp" class="main-app">
        <div class="header">
            <h1>Welcome to 1.FC Köln Talent Program</h1>
            <p id="welcomeMessage">Dashboard will load here</p>
        </div>
        
        <div style="text-align: center; padding: 2rem;">
            <h2>Authentication Successful!</h2>
            <p>Main application interface would load here</p>
            <button class="btn" onclick="logout()" style="max-width: 200px; margin-top: 1rem;">Logout</button>
        </div>
    </div>

    <script>
        console.log('FC Köln Authentication System - Loading...');
        
        // Global variables
        let currentUser = null;
        
        // Tab switching function
        function switchTab(tabType) {
            console.log('Switching to tab:', tabType);
            
            const loginTab = document.getElementById('loginTab');
            const registerTab = document.getElementById('registerTab');
            const loginBtn = document.querySelector('.auth-tab-btn:first-child');
            const registerBtn = document.querySelector('.auth-tab-btn:last-child');
            
            // Remove active classes
            loginTab.classList.remove('active');
            registerTab.classList.remove('active');
            loginBtn.classList.remove('active');
            registerBtn.classList.remove('active');
            
            // Add active class to selected tab
            if (tabType === 'login') {
                loginTab.classList.add('active');
                loginBtn.classList.add('active');
            } else if (tabType === 'register') {
                registerTab.classList.add('active');
                registerBtn.classList.add('active');
            }
            
            console.log('Tab switched successfully to:', tabType);
        }
        
        // Login form handler
        document.addEventListener('DOMContentLoaded', function() {
            console.log('DOM loaded, setting up authentication...');
            
            const loginForm = document.getElementById('loginForm');
            if (loginForm) {
                loginForm.addEventListener('submit', function(e) {
                    e.preventDefault();
                    console.log('Login form submitted');
                    
                    const email = document.getElementById('email').value.trim();
                    const password = document.getElementById('password').value;
                    const messageEl = document.getElementById('loginMessage');
                    
                    console.log('Login attempt for email:', email);
                    
                    // Clear previous messages
                    messageEl.innerHTML = '';
                    messageEl.className = '';
                    
                    // Validate credentials
                    if (password === 'ITP2024' && 
                        (email === 'max.bisinger@warubi-sports.com' || email === 'thomas.ellinger@warubi-sports.com')) {
                        
                        console.log('Login successful!');
                        
                        // Set current user
                        currentUser = {
                            email: email,
                            name: email.includes('max.bisinger') ? 'Max Bisinger' : 'Thomas Ellinger',
                            role: email.includes('max.bisinger') ? 'admin' : 'staff'
                        };
                        
                        // Show success message
                        messageEl.innerHTML = 'Login successful! Welcome to FC Köln.';
                        messageEl.className = 'success';
                        
                        // Switch to main app after short delay
                        setTimeout(function() {
                            document.getElementById('loginPage').style.display = 'none';
                            document.getElementById('mainApp').style.display = 'block';
                            document.getElementById('welcomeMessage').textContent = 'Welcome, ' + currentUser.name + ' (' + currentUser.role + ')';
                        }, 1000);
                        
                    } else {
                        console.log('Login failed - invalid credentials');
                        messageEl.innerHTML = 'Invalid email or password. Please try again.';
                        messageEl.className = 'error';
                    }
                });
                
                console.log('Login form handler attached successfully');
            } else {
                console.error('Login form not found!');
            }
        });
        
        // Logout function
        function logout() {
            console.log('Logging out...');
            currentUser = null;
            document.getElementById('loginPage').style.display = 'block';
            document.getElementById('mainApp').style.display = 'none';
            document.getElementById('loginMessage').innerHTML = '';
            document.getElementById('loginMessage').className = '';
        }
        
        console.log('FC Köln Authentication System - Ready');
    </script>
</body>
</html>
    `);
});

const server = app.listen(PORT, '0.0.0.0', () => {
    console.log('🔄 Redirecting to clean FC Köln authentication test...');
    console.log('Starting clean authentication test...');
    console.log('1.FC Köln Clean Auth Test running on port ' + PORT);
    console.log('Test credentials: max.bisinger@warubi-sports.com / ITP2024');
    console.log('Server ready at http://0.0.0.0:' + PORT);
    console.log('Authentication system status: Clean & Isolated');
});

// Error handling
server.on('error', (err) => {
    console.error('Server error:', err);
});