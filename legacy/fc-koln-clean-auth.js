const express = require('express');
const path = require('path');
const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static('.'));

// In-memory user storage (replace with database in production)
const users = [
    {
        id: 'admin1',
        email: 'max.bisinger@warubi-sports.com',
        password: 'ITP2024',
        name: 'Max Bisinger',
        role: 'admin'
    },
    {
        id: 'staff1', 
        email: 'thomas.ellinger@warubi-sports.com',
        password: 'ITP2024',
        name: 'Thomas Ellinger',
        role: 'staff'
    },
    {
        id: 'staff2',
        email: 'th.el@warubi-sports.com', 
        password: 'ITP2024',
        name: 'Thomas Ellinger',
        role: 'staff'
    }
];

// Authentication endpoints
app.post('/auth/login', (req, res) => {
    const { email, password } = req.body;
    
    const user = users.find(u => u.email === email && u.password === password);
    
    if (user) {
        const userResponse = {
            id: user.id,
            email: user.email,
            name: user.name,
            role: user.role
        };
        res.json({ success: true, user: userResponse });
    } else {
        res.status(401).json({ success: false, message: 'Invalid credentials' });
    }
});

app.post('/auth/register', (req, res) => {
    const { email, password, name, role } = req.body;
    
    // Check if user already exists
    if (users.find(u => u.email === email)) {
        return res.status(400).json({ success: false, message: 'User already exists' });
    }
    
    // Create new user
    const newUser = {
        id: `user_${Date.now()}`,
        email,
        password,
        name,
        role: role || 'player'
    };
    
    users.push(newUser);
    
    const userResponse = {
        id: newUser.id,
        email: newUser.email,
        name: newUser.name,
        role: newUser.role
    };
    
    res.json({ success: true, user: userResponse });
});

app.post('/auth/forgot-password', (req, res) => {
    const { email } = req.body;
    
    const user = users.find(u => u.email === email);
    
    if (user) {
        // In a real app, send email here
        console.log(`Password reset requested for: ${email}`);
        res.json({ success: true, message: 'Password reset instructions sent to your email' });
    } else {
        res.status(404).json({ success: false, message: 'Email not found' });
    }
});

// Serve the main HTML file
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
            background: linear-gradient(135deg, #dc143c 0%, #8b0000 100%);
            min-height: 100vh;
            display: flex;
            align-items: center;
            justify-content: center;
        }
        
        .auth-container {
            background: white;
            border-radius: 12px;
            padding: 2rem;
            box-shadow: 0 20px 40px rgba(0,0,0,0.1);
            width: 100%;
            max-width: 400px;
        }
        
        .logo {
            text-align: center;
            margin-bottom: 2rem;
        }
        
        .logo h1 {
            color: #dc143c;
            font-size: 1.5rem;
            font-weight: bold;
        }
        
        .logo p {
            color: #666;
            font-size: 0.9rem;
            margin-top: 0.5rem;
        }
        
        .tab-buttons {
            display: flex;
            margin-bottom: 2rem;
            border-radius: 8px;
            overflow: hidden;
            background: #f5f5f5;
        }
        
        .tab-btn {
            flex: 1;
            padding: 0.75rem;
            background: transparent;
            border: none;
            cursor: pointer;
            font-weight: 500;
            transition: all 0.3s ease;
        }
        
        .tab-btn.active {
            background: #dc143c;
            color: white;
        }
        
        .auth-form {
            display: none;
        }
        
        .auth-form.active {
            display: block;
        }
        
        .form-group {
            margin-bottom: 1rem;
        }
        
        .form-group label {
            display: block;
            margin-bottom: 0.5rem;
            color: #333;
            font-weight: 500;
        }
        
        .form-group input, .form-group select {
            width: 100%;
            padding: 0.75rem;
            border: 2px solid #e1e5e9;
            border-radius: 6px;
            font-size: 1rem;
            transition: border-color 0.3s ease;
        }
        
        .form-group input:focus, .form-group select:focus {
            outline: none;
            border-color: #dc143c;
        }
        
        .btn {
            width: 100%;
            padding: 0.75rem;
            background: #dc143c;
            color: white;
            border: none;
            border-radius: 6px;
            font-size: 1rem;
            font-weight: 500;
            cursor: pointer;
            transition: background-color 0.3s ease;
        }
        
        .btn:hover {
            background: #b91c3c;
        }
        
        .forgot-link {
            text-align: center;
            margin-top: 1rem;
        }
        
        .forgot-link a {
            color: #dc143c;
            text-decoration: none;
            font-size: 0.9rem;
        }
        
        .forgot-link a:hover {
            text-decoration: underline;
        }
        
        .message {
            padding: 0.75rem;
            border-radius: 6px;
            margin-bottom: 1rem;
            text-align: center;
        }
        
        .message.success {
            background: #d4edda;
            color: #155724;
            border: 1px solid #c3e6cb;
        }
        
        .message.error {
            background: #f8d7da;
            color: #721c24;
            border: 1px solid #f5c6cb;
        }
        
        .main-app {
            display: none;
            text-align: center;
        }
        
        .main-app.active {
            display: block;
        }
        
        .dashboard {
            background: white;
            border-radius: 12px;
            padding: 2rem;
            margin: 2rem auto;
            max-width: 800px;
            box-shadow: 0 4px 6px rgba(0,0,0,0.1);
        }
        
        .user-info {
            margin-bottom: 2rem;
            padding: 1rem;
            background: #f8f9fa;
            border-radius: 8px;
        }
        
        .logout-btn {
            background: #6c757d;
            margin-top: 1rem;
        }
        
        .logout-btn:hover {
            background: #5a6268;
        }
    </style>
</head>
<body>
    <div class="auth-container" id="authContainer">
        <div class="logo">
            <h1>1.FC Köln</h1>
            <p>Bundesliga Talent Program</p>
        </div>
        
        <div class="tab-buttons">
            <button class="tab-btn active" onclick="showTab('login')">Sign In</button>
            <button class="tab-btn" onclick="showTab('register')">Join Program</button>
        </div>
        
        <div id="message"></div>
        
        <!-- Login Form -->
        <form class="auth-form active" id="loginForm">
            <div class="form-group">
                <label for="loginEmail">Email</label>
                <input type="email" id="loginEmail" value="max.bisinger@warubi-sports.com" required>
            </div>
            <div class="form-group">
                <label for="loginPassword">Password</label>
                <input type="password" id="loginPassword" value="ITP2024" required>
            </div>
            <button type="submit" class="btn">Sign In</button>
            <div class="forgot-link">
                <a href="#" onclick="showTab('forgot')">Forgot Password?</a>
            </div>
        </form>
        
        <!-- Register Form -->
        <form class="auth-form" id="registerForm">
            <div class="form-group">
                <label for="registerName">Full Name</label>
                <input type="text" id="registerName" required>
            </div>
            <div class="form-group">
                <label for="registerEmail">Email</label>
                <input type="email" id="registerEmail" required>
            </div>
            <div class="form-group">
                <label for="registerPassword">Password</label>
                <input type="password" id="registerPassword" required>
            </div>
            <div class="form-group">
                <label for="registerRole">Role</label>
                <select id="registerRole" required>
                    <option value="player">Player</option>
                    <option value="staff">Staff</option>
                </select>
            </div>
            <button type="submit" class="btn">Join Program</button>
        </form>
        
        <!-- Forgot Password Form -->
        <form class="auth-form" id="forgotForm">
            <div class="form-group">
                <label for="forgotEmail">Email</label>
                <input type="email" id="forgotEmail" required>
            </div>
            <button type="submit" class="btn">Send Reset Instructions</button>
            <div class="forgot-link">
                <a href="#" onclick="showTab('login')">← Back to Sign In</a>
            </div>
        </form>
    </div>
    
    <!-- Main Application -->
    <div class="main-app" id="mainApp">
        <div class="dashboard">
            <div class="user-info" id="userInfo">
                <!-- User info will be populated here -->
            </div>
            <h2>Welcome to FC Köln Talent Program</h2>
            <p>Authentication system is working correctly!</p>
            <button class="btn logout-btn" onclick="logout()">Logout</button>
        </div>
    </div>

    <script>
        let currentUser = null;
        
        // Tab switching
        function showTab(tab) {
            // Hide all forms
            document.querySelectorAll('.auth-form').forEach(form => {
                form.classList.remove('active');
            });
            
            // Remove active from all buttons
            document.querySelectorAll('.tab-btn').forEach(btn => {
                btn.classList.remove('active');
            });
            
            // Show selected form
            if (tab === 'login') {
                document.getElementById('loginForm').classList.add('active');
                document.querySelectorAll('.tab-btn')[0].classList.add('active');
            } else if (tab === 'register') {
                document.getElementById('registerForm').classList.add('active');
                document.querySelectorAll('.tab-btn')[1].classList.add('active');
            } else if (tab === 'forgot') {
                document.getElementById('forgotForm').classList.add('active');
            }
            
            clearMessage();
        }
        
        // Message handling
        function showMessage(text, type) {
            const messageDiv = document.getElementById('message');
            messageDiv.innerHTML = \`<div class="message \${type}">\${text}</div>\`;
        }
        
        function clearMessage() {
            document.getElementById('message').innerHTML = '';
        }
        
        // Authentication functions
        async function makeRequest(url, data) {
            try {
                const response = await fetch(url, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(data)
                });
                
                return await response.json();
            } catch (error) {
                console.error('Request failed:', error);
                return { success: false, message: 'Network error' };
            }
        }
        
        // Login
        document.getElementById('loginForm').addEventListener('submit', async (e) => {
            e.preventDefault();
            
            const email = document.getElementById('loginEmail').value;
            const password = document.getElementById('loginPassword').value;
            
            const result = await makeRequest('/auth/login', { email, password });
            
            if (result.success) {
                currentUser = result.user;
                showMainApp();
                showMessage('Login successful!', 'success');
            } else {
                showMessage(result.message || 'Login failed', 'error');
            }
        });
        
        // Register
        document.getElementById('registerForm').addEventListener('submit', async (e) => {
            e.preventDefault();
            
            const name = document.getElementById('registerName').value;
            const email = document.getElementById('registerEmail').value;
            const password = document.getElementById('registerPassword').value;
            const role = document.getElementById('registerRole').value;
            
            const result = await makeRequest('/auth/register', { name, email, password, role });
            
            if (result.success) {
                currentUser = result.user;
                showMainApp();
                showMessage('Registration successful!', 'success');
            } else {
                showMessage(result.message || 'Registration failed', 'error');
            }
        });
        
        // Forgot Password
        document.getElementById('forgotForm').addEventListener('submit', async (e) => {
            e.preventDefault();
            
            const email = document.getElementById('forgotEmail').value;
            
            const result = await makeRequest('/auth/forgot-password', { email });
            
            if (result.success) {
                showMessage(result.message, 'success');
            } else {
                showMessage(result.message || 'Reset failed', 'error');
            }
        });
        
        // Show main application
        function showMainApp() {
            document.getElementById('authContainer').style.display = 'none';
            document.getElementById('mainApp').classList.add('active');
            
            // Update user info
            const userInfo = document.getElementById('userInfo');
            userInfo.innerHTML = \`
                <h3>Welcome, \${currentUser.name}!</h3>
                <p><strong>Email:</strong> \${currentUser.email}</p>
                <p><strong>Role:</strong> \${currentUser.role}</p>
            \`;
        }
        
        // Logout
        function logout() {
            currentUser = null;
            document.getElementById('authContainer').style.display = 'block';
            document.getElementById('mainApp').classList.remove('active');
            showTab('login');
            clearMessage();
        }
        
        // Check for saved authentication on page load
        window.addEventListener('load', () => {
            const savedAuth = localStorage.getItem('fc-koln-auth');
            if (savedAuth) {
                try {
                    const authData = JSON.parse(savedAuth);
                    currentUser = authData.user;
                    showMainApp();
                } catch (e) {
                    localStorage.removeItem('fc-koln-auth');
                }
            }
        });
    </script>
</body>
</html>
    `);
});

app.listen(PORT, '0.0.0.0', () => {
    console.log('🚀 1.FC Köln Bundesliga Talent Program Management System');
    console.log('🏃 Starting clean authentication system...');
    console.log(`📍 Server running on port ${PORT}`);
    console.log('👤 Admin credentials: max.bisinger@warubi-sports.com / ITP2024');
    console.log('👥 Staff credentials: thomas.ellinger@warubi-sports.com / ITP2024');
    console.log('✅ Clean authentication system ready!');
});