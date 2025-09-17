const http = require('http');
const url = require('url');
const path = require('path');
const fs = require('fs');

console.log('Starting 1.FC Köln Bundesliga Talent Program Management System...');

const FC_KOLN_APP = `<!DOCTYPE html>
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
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            background: linear-gradient(135deg, #dc2626 0%, #b91c1c 100%);
            min-height: 100vh;
            color: #333;
        }
        
        .login-container {
            display: flex;
            justify-content: center;
            align-items: center;
            min-height: 100vh;
            padding: 2rem;
        }
        
        .login-card {
            background: white;
            padding: 3rem;
            border-radius: 20px;
            box-shadow: 0 20px 60px rgba(0,0,0,0.3);
            width: 100%;
            max-width: 450px;
            text-align: center;
        }
        
        .logo-container {
            margin-bottom: 2rem;
        }
        
        .logo-container img {
            width: 80px;
            height: 80px;
            object-fit: contain;
        }
        
        .login-title {
            font-size: 1.8rem;
            font-weight: bold;
            color: #dc2626;
            margin-bottom: 0.5rem;
        }
        
        .login-subtitle {
            color: #666;
            margin-bottom: 2rem;
            font-size: 0.9rem;
        }
        
        .auth-tabs {
            display: flex;
            margin-bottom: 2rem;
            border-radius: 10px;
            background: #f5f5f5;
            padding: 4px;
        }
        
        .auth-tab-btn {
            flex: 1;
            padding: 12px 16px;
            border: none;
            background: transparent;
            border-radius: 8px;
            cursor: pointer;
            font-weight: 500;
            transition: all 0.3s ease;
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
            margin-bottom: 1.5rem;
            text-align: left;
        }
        
        .form-group label {
            display: block;
            margin-bottom: 0.5rem;
            font-weight: 500;
            color: #333;
        }
        
        .form-group input, .form-group select {
            width: 100%;
            padding: 12px 16px;
            border: 2px solid #e5e7eb;
            border-radius: 10px;
            font-size: 1rem;
            transition: border-color 0.3s ease;
        }
        
        .form-group input:focus, .form-group select:focus {
            outline: none;
            border-color: #dc2626;
        }
        
        .btn {
            width: 100%;
            padding: 14px;
            background: #dc2626;
            color: white;
            border: none;
            border-radius: 10px;
            font-size: 1rem;
            font-weight: 600;
            cursor: pointer;
            transition: background-color 0.3s ease;
        }
        
        .btn:hover {
            background: #b91c1c;
        }
        
        .main-app {
            display: none;
            padding: 2rem;
        }
        
        .header {
            background: white;
            padding: 1rem 2rem;
            border-radius: 10px;
            margin-bottom: 2rem;
            display: flex;
            justify-content: space-between;
            align-items: center;
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
        }
        
        .nav {
            display: flex;
            gap: 1rem;
        }
        
        .nav-item {
            padding: 10px 20px;
            background: #f5f5f5;
            border: none;
            border-radius: 8px;
            cursor: pointer;
            font-weight: 500;
            transition: all 0.3s ease;
        }
        
        .nav-item.active {
            background: #dc2626;
            color: white;
        }
        
        .page {
            display: none;
            background: white;
            padding: 2rem;
            border-radius: 10px;
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
        }
        
        .page.active {
            display: block;
        }
        
        .card {
            background: #f9f9f9;
            padding: 1.5rem;
            border-radius: 10px;
            margin-bottom: 1rem;
        }
        
        .player-card {
            display: flex;
            justify-content: space-between;
            align-items: center;
            background: white;
            padding: 1rem;
            border-radius: 8px;
            margin-bottom: 1rem;
            box-shadow: 0 2px 5px rgba(0,0,0,0.1);
        }
        
        .player-info h4 {
            color: #dc2626;
            margin-bottom: 0.5rem;
        }
        
        .player-actions {
            display: flex;
            gap: 0.5rem;
        }
        
        .btn-small {
            padding: 6px 12px;
            font-size: 0.9rem;
            border-radius: 6px;
        }
        
        .btn-view {
            background: #059669;
            color: white;
            border: none;
        }
        
        .btn-edit {
            background: #dc2626;
            color: white;
            border: none;
        }
    </style>
</head>
<body>
    <!-- Login Page -->
    <div id="loginPage" class="login-container">
        <div class="login-card">
            <div class="logo-container">
                <img src="/attached_assets/NewCologneLogo_1753281112388.png" alt="1.FC Köln Logo">
            </div>
            
            <div class="login-title">1.FC Köln</div>
            <div class="login-subtitle">Management System</div>
            
            <!-- Login/Registration Tabs -->
            <div class="auth-tabs">
                <button class="auth-tab-btn active" onclick="showAuthTab('login')">Sign In</button>
                <button class="auth-tab-btn" onclick="showAuthTab('register')">Join Program</button>
            </div>
            
            <!-- Login Form -->
            <div id="login-auth-tab" class="auth-tab-content active">
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
            </div>
            
            <!-- Registration Form -->
            <div id="register-auth-tab" class="auth-tab-content">
                <form id="registerForm">
                    <div class="form-group">
                        <label for="regEmail">Email Address</label>
                        <input type="email" id="regEmail" required>
                    </div>
                    
                    <div class="form-group">
                        <label for="regName">Full Name</label>
                        <input type="text" id="regName" required>
                    </div>
                    
                    <div class="form-group">
                        <label for="regRole">Role</label>
                        <select id="regRole" required>
                            <option value="">Select Role</option>
                            <option value="player">Player</option>
                            <option value="staff">Staff</option>
                        </select>
                    </div>
                    
                    <div class="form-group">
                        <label for="regPassword">Password</label>
                        <input type="password" id="regPassword" required>
                    </div>
                    
                    <button type="submit" class="btn">Join Program</button>
                </form>
            </div>
        </div>
    </div>

    <!-- Main Application -->
    <div id="mainApp" class="main-app">
        <div class="header">
            <h1>1.FC Köln Talent Program</h1>
            <div class="nav">
                <button class="nav-item active" onclick="showPage('dashboard')">Dashboard</button>
                <button class="nav-item" onclick="showPage('players')">Players</button>
                <button class="nav-item" onclick="showPage('chores')">Housing</button>
                <button class="nav-item" onclick="showPage('calendar')">Calendar</button>
                <button class="nav-item" onclick="showPage('food')">Food Orders</button>
                <button class="nav-item" onclick="showPage('communications')">Communications</button>
                <button class="nav-item" onclick="showPage('admin')">Admin</button>
                <button class="nav-item" onclick="logout()">Logout</button>
            </div>
        </div>

        <!-- Dashboard Page -->
        <div id="dashboard" class="page active">
            <h2>Dashboard</h2>
            <div class="card">
                <h3 id="userName">Welcome</h3>
                <p>Welcome to the 1.FC Köln Bundesliga Talent Program Management System.</p>
            </div>
        </div>

        <!-- Players Page -->
        <div id="players" class="page">
            <h2>Player Management</h2>
            <div class="player-card">
                <div class="player-info">
                    <h4>Max Mueller</h4>
                    <p>Germany, Age 17 - Midfielder</p>
                    <small>W1 | 96% Performance | Active</small>
                </div>
                <div class="player-actions">
                    <button class="btn-small btn-view">View</button>
                    <button class="btn-small btn-edit">Edit</button>
                </div>
            </div>
            
            <div class="player-card">
                <div class="player-info">
                    <h4>Ahmed Hassan</h4>
                    <p>Egypt, Age 18 - Forward</p>
                    <small>W2 | 94% Performance | Active</small>
                </div>
                <div class="player-actions">
                    <button class="btn-small btn-view">View</button>
                    <button class="btn-small btn-edit">Edit</button>
                </div>
            </div>
            
            <div class="player-card">
                <div class="player-info">
                    <h4>Carlos Rodriguez</h4>
                    <p>Spain, Age 17 - Defender</p>
                    <small>W3 | 88% Performance | Injured</small>
                </div>
                <div class="player-actions">
                    <button class="btn-small btn-view">View</button>
                    <button class="btn-small btn-edit">Edit</button>
                </div>
            </div>
        </div>

        <!-- Other Pages (simplified) -->
        <div id="chores" class="page">
            <h2>Housing Management</h2>
            <div class="card">
                <h3>Chore Management</h3>
                <p>Advanced chore system with priority levels and deadlines.</p>
            </div>
        </div>

        <div id="calendar" class="page">
            <h2>Calendar & Events</h2>
            <div class="card">
                <h3>Schedule Management</h3>
                <p>Training schedules, matches, and events.</p>
            </div>
        </div>

        <div id="food" class="page">
            <h2>Food Orders</h2>
            <div class="card">
                <h3>Grocery Management</h3>
                <p>Weekly grocery orders and meal planning.</p>
            </div>
        </div>

        <div id="communications" class="page">
            <h2>Communications</h2>
            <div class="card">
                <h3>Message System</h3>
                <p>Internal messaging and notifications.</p>
            </div>
        </div>

        <div id="admin" class="page">
            <h2>System Administration</h2>
            <div class="card">
                <h3>Admin Controls</h3>
                <p>Full system management and oversight capabilities.</p>
            </div>
        </div>
    </div>

    <script>
        let currentUser = null;

        // Auth tab management - globally accessible
        window.showAuthTab = function(tabType) {
            const loginTab = document.getElementById('login-auth-tab');
            const registerTab = document.getElementById('register-auth-tab');
            const tabButtons = document.querySelectorAll('.auth-tab-btn');
            
            if (!loginTab || !registerTab) return;
            
            // Remove active from all tabs and buttons
            loginTab.classList.remove('active');
            registerTab.classList.remove('active');
            tabButtons.forEach(btn => btn.classList.remove('active'));
            
            // Show selected tab
            if (tabType === 'login') {
                loginTab.classList.add('active');
                event.target.classList.add('active');
            } else if (tabType === 'register') {
                registerTab.classList.add('active');
                event.target.classList.add('active');
            }
        };

        // Mock user data
        const users = {
            'max.bisinger@warubi-sports.com': {
                email: 'max.bisinger@warubi-sports.com',
                password: 'ITP2024',
                name: 'Max Bisinger',
                role: 'admin'
            },
            'thomas.ellinger@warubi-sports.com': {
                email: 'thomas.ellinger@warubi-sports.com',
                password: 'ITP2024',
                name: 'Thomas Ellinger',
                role: 'staff'
            }
        };

        // Login functionality
        document.addEventListener('DOMContentLoaded', function() {
            const loginForm = document.getElementById('loginForm');
            if (loginForm) {
                loginForm.addEventListener('submit', function(e) {
                    e.preventDefault();
                    
                    const email = document.getElementById('email').value;
                    const password = document.getElementById('password').value;
                    
                    const user = users[email];
                    if (user && user.password === password) {
                        currentUser = user;
                        showMainApp();
                    } else {
                        alert('Invalid credentials. Please try again.');
                    }
                });
            }
            
            const registerForm = document.getElementById('registerForm');
            if (registerForm) {
                registerForm.addEventListener('submit', function(e) {
                    e.preventDefault();
                    alert('Registration functionality will be implemented soon!');
                });
            }
        });

        // Show main application
        function showMainApp() {
            document.getElementById('loginPage').style.display = 'none';
            document.getElementById('mainApp').style.display = 'block';
            const userNameEl = document.getElementById('userName');
            if (userNameEl && currentUser) {
                userNameEl.textContent = 'Welcome, ' + currentUser.name;
            }
        }

        // Navigation
        window.showPage = function(pageId) {
            document.querySelectorAll('.page').forEach(page => {
                page.classList.remove('active');
            });
            
            document.querySelectorAll('.nav-item').forEach(item => {
                item.classList.remove('active');
            });
            
            document.getElementById(pageId).classList.add('active');
            event.target.classList.add('active');
        };

        // Logout function
        window.logout = function() {
            currentUser = null;
            document.getElementById('mainApp').style.display = 'none';
            document.getElementById('loginPage').style.display = 'flex';
            document.getElementById('loginForm').reset();
        };

        console.log('1.FC Köln Bundesliga Talent Program loaded successfully');
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
            system: 'FC Köln Management - Clean Application',
            timestamp: new Date().toISOString()
        }));
        return;
    }
    
    // Serve static assets
    if (parsedUrl.pathname.startsWith('/attached_assets/')) {
        const filePath = path.join(__dirname, parsedUrl.pathname);
        
        fs.readFile(filePath, (err, data) => {
            if (err) {
                res.writeHead(404, { 'Content-Type': 'text/html' });
                res.end('<h1>404 - Asset Not Found</h1>');
                return;
            }
            
            const ext = path.extname(filePath).toLowerCase();
            let contentType = 'application/octet-stream';
            if (ext === '.png') contentType = 'image/png';
            else if (ext === '.jpg' || ext === '.jpeg') contentType = 'image/jpeg';
            else if (ext === '.gif') contentType = 'image/gif';
            else if (ext === '.svg') contentType = 'image/svg+xml';
            
            res.writeHead(200, { 'Content-Type': contentType });
            res.end(data);
        });
        return;
    }
    
    // Serve main application
    res.writeHead(200, {
        'Content-Type': 'text/html; charset=utf-8',
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0'
    });
    
    res.end(FC_KOLN_APP);
});

const PORT = process.env.PORT || 5000;

server.listen(PORT, '0.0.0.0', () => {
    console.log('1.FC Köln Bundesliga Talent Program running on port ' + PORT);
    console.log('Admin credentials: max.bisinger@warubi-sports.com / ITP2024');  
    console.log('Staff credentials: thomas.ellinger@warubi-sports.com / ITP2024');
    console.log('Server ready at http://0.0.0.0:' + PORT);
    console.log('Complete system status: Operational');
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