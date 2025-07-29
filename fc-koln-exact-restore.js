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
        * { margin: 0; padding: 0; box-sizing: border-box; }
        
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            background: #f8fafc;
            color: #334155;
        }
        
        .login-container {
            min-height: 100vh;
            background: linear-gradient(135deg, #dc2626 0%, #b91c1c 50%, #991b1b 100%);
            display: flex;
            align-items: center;
            justify-content: center;
            padding: 20px;
        }
        
        .login-card {
            background: white;
            border-radius: 20px;
            box-shadow: 0 25px 50px rgba(0, 0, 0, 0.25);
            padding: 60px 50px;
            width: 100%;
            max-width: 480px;
            text-align: center;
        }
        
        .fc-koln-logo {
            height: 120px;
            width: auto;
            margin-bottom: 1rem;
        }
        
        .login-card h1 {
            color: #dc2626;
            font-size: 24px;
            font-weight: 700;
            margin-bottom: 0.5rem;
        }
        
        .login-subtitle {
            color: #666666;
            font-size: 18px;
            margin-bottom: 50px;
            font-weight: 400;
        }
        
        .auth-tabs {
            display: flex;
            margin-bottom: 30px;
            border-radius: 12px;
            background: #f1f5f9;
            padding: 6px;
        }
        
        .auth-tab-btn {
            flex: 1;
            padding: 12px 24px;
            border: none;
            background: transparent;
            border-radius: 8px;
            cursor: pointer;
            font-weight: 600;
            transition: all 0.3s ease;
            color: #64748b;
        }
        
        .auth-tab-btn.active {
            background: #dc2626;
            color: white;
            box-shadow: 0 2px 4px rgba(220, 38, 38, 0.2);
        }
        
        .auth-tab-content { display: none; }
        .auth-tab-content.active { display: block; }
        
        .form-group {
            margin-bottom: 24px;
            text-align: left;
        }
        
        .form-group label {
            display: block;
            margin-bottom: 8px;
            font-weight: 600;
            color: #374151;
        }
        
        .form-group input, .form-group select {
            width: 100%;
            padding: 16px 20px;
            border: 2px solid #e5e7eb;
            border-radius: 12px;
            font-size: 16px;
            transition: border-color 0.3s ease;
            background: #ffffff;
        }
        
        .form-group input:focus, .form-group select:focus {
            outline: none;
            border-color: #dc2626;
            box-shadow: 0 0 0 3px rgba(220, 38, 38, 0.1);
        }
        
        .btn {
            width: 100%;
            padding: 16px;
            background: #dc2626;
            color: white;
            border: none;
            border-radius: 12px;
            font-size: 16px;
            font-weight: 600;
            cursor: pointer;
            transition: background-color 0.3s ease;
        }
        
        .btn:hover { background: #b91c1c; }
        
        .main-app { display: none; background: #f8fafc; min-height: 100vh; }
        
        .header {
            background: white;
            padding: 20px 40px;
            box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
            display: flex;
            justify-content: space-between;
            align-items: center;
        }
        
        .header h1 {
            color: #dc2626;
            font-size: 24px;
            font-weight: 700;
        }
        
        .nav {
            display: flex;
            gap: 4px;
        }
        
        .nav-item {
            padding: 12px 20px;
            background: transparent;
            border: none;
            border-radius: 8px;
            cursor: pointer;
            font-weight: 500;
            transition: all 0.3s ease;
            color: #64748b;
        }
        
        .nav-item:hover { background: #f1f5f9; }
        .nav-item.active { background: #dc2626; color: white; }
        
        .content { padding: 40px; }
        
        .page { display: none; }
        .page.active { display: block; }
        
        .page h2 {
            color: #1e293b;
            font-size: 28px;
            font-weight: 700;
            margin-bottom: 30px;
        }
        
        .player-card {
            background: white;
            border-radius: 12px;
            padding: 20px;
            margin-bottom: 16px;
            box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
            display: flex;
            justify-content: space-between;
            align-items: center;
        }
        
        .player-info h4 {
            color: #1e293b;
            font-size: 18px;
            font-weight: 600;
            margin-bottom: 4px;
        }
        
        .player-details {
            color: #64748b;
            margin-bottom: 8px;
        }
        
        .player-stats {
            display: flex;
            gap: 12px;
            align-items: center;
        }
        
        .house-badge {
            padding: 4px 8px;
            border-radius: 4px;
            font-size: 12px;
            font-weight: 600;
            color: white;
        }
        
        .house-w1 { background: #dc2626; }
        .house-w2 { background: #059669; }
        .house-w3 { background: #2563eb; }
        
        .performance {
            font-weight: 600;
            color: #059669;
        }
        
        .status {
            padding: 4px 8px;
            border-radius: 4px;
            font-size: 12px;
            font-weight: 500;
        }
        
        .status-active { background: #dcfce7; color: #166534; }
        .status-injured { background: #fef3c7; color: #92400e; }
        
        .player-actions {
            display: flex;
            gap: 8px;
        }
        
        .btn-sm {
            padding: 8px 16px;
            font-size: 14px;
            border-radius: 6px;
            border: none;
            cursor: pointer;
            font-weight: 500;
        }
        
        .btn-view { background: #059669; color: white; }
        .btn-edit { background: #dc2626; color: white; }
        
        .stats-section {
            background: white;
            border-radius: 12px;
            padding: 30px;
            margin-top: 30px;
            box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
        }
        
        .stats-header {
            display: flex;
            align-items: center;
            margin-bottom: 30px;
        }
        
        .stats-header h3 {
            color: #1e293b;
            font-size: 20px;
            font-weight: 600;
            margin-left: 8px;
        }
        
        .stats-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
            gap: 20px;
            margin-bottom: 30px;
        }
        
        .stat-card {
            background: #f8fafc;
            border-radius: 8px;
            padding: 20px;
            text-align: center;
        }
        
        .stat-title {
            color: #64748b;
            font-size: 14px;
            margin-bottom: 8px;
        }
        
        .stat-number {
            color: #dc2626;
            font-size: 24px;
            font-weight: 700;
            margin-bottom: 4px;
        }
        
        .stat-subtitle {
            color: #64748b;
            font-size: 12px;
        }
        
        .recent-requests {
            margin-top: 20px;
        }
        
        .request-item {
            background: white;
            border-left: 4px solid #fbbf24;
            padding: 16px;
            margin-bottom: 8px;
            border-radius: 0 8px 8px 0;
            display: flex;
            justify-content: space-between;
            align-items: center;
        }
        
        .request-approved {
            border-left-color: #10b981;
            background: #f0fdf4;
        }
        
        .request-actions {
            display: flex;
            gap: 8px;
        }
        
        .card {
            background: white;
            border-radius: 12px;
            padding: 30px;
            box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
            margin-bottom: 20px;
        }
        
        .card h3 {
            color: #1e293b;
            font-size: 20px;
            font-weight: 600;
            margin-bottom: 12px;
        }
    </style>
</head>
<body>
    <div id="loginPage" class="login-container">
        <div class="login-card">
            <img src="/attached_assets/NewCologneLogo_1753281112388.png" alt="1.FC Köln Logo" class="fc-koln-logo">
            <h1>1.FC Köln</h1>
            <div class="login-subtitle">Bundesliga Talent Program</div>
            
            <div class="auth-tabs">
                <button class="auth-tab-btn active" onclick="showAuthTab('login')">Sign In</button>
                <button class="auth-tab-btn" onclick="showAuthTab('register')">Join Program</button>
            </div>
            
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

    <div id="mainApp" class="main-app">
        <div class="header">
            <h1>1.FC Köln Talent Program</h1>
            <div class="nav">
                <button class="nav-item active" onclick="showPage('dashboard')">Dashboard</button>
                <button class="nav-item" onclick="showPage('players')">Players</button>
                <button class="nav-item" onclick="showPage('housing')">Housing</button>
                <button class="nav-item" onclick="showPage('calendar')">Calendar</button>
                <button class="nav-item" onclick="showPage('food')">Food Orders</button>
                <button class="nav-item" onclick="showPage('communications')">Communications</button>
                <button class="nav-item" onclick="showPage('admin')">Admin</button>
                <button class="nav-item" onclick="logout()">Logout</button>
            </div>
        </div>

        <div class="content">
            <div id="dashboard" class="page active">
                <h2>Dashboard</h2>
                <div class="card">
                    <h3 id="userName">Welcome</h3>
                    <p>Welcome to the 1.FC Köln Bundesliga Talent Program Management System.</p>
                </div>
            </div>

            <div id="players" class="page">
                <h2>Player Management</h2>
                
                <div class="player-card">
                    <div class="player-info">
                        <h4>Max Mueller</h4>
                        <div class="player-details">Germany, Age 17</div>
                        <div class="player-details">Midfielder</div>
                        <div class="player-stats">
                            <span class="house-badge house-w1">W1</span>
                            <span class="performance">96% 9.2</span>
                            <span class="status status-active">Active</span>
                        </div>
                    </div>
                    <div class="player-actions">
                        <button class="btn-sm btn-view" onclick="viewPlayer('max-mueller')">View</button>
                        <button class="btn-sm btn-edit" onclick="editPlayer('max-mueller')">Edit</button>
                    </div>
                </div>

                <div class="player-card">
                    <div class="player-info">
                        <h4>Ahmed Hassan</h4>
                        <div class="player-details">Egypt, Age 18</div>
                        <div class="player-details">Forward</div>
                        <div class="player-stats">
                            <span class="house-badge house-w2">W2</span>
                            <span class="performance">94% 8.8</span>
                            <span class="status status-active">Active</span>
                        </div>
                    </div>
                    <div class="player-actions">
                        <button class="btn-sm btn-view" onclick="viewPlayer('ahmed-hassan')">View</button>
                        <button class="btn-sm btn-edit" onclick="editPlayer('ahmed-hassan')">Edit</button>
                    </div>
                </div>

                <div class="player-card">
                    <div class="player-info">
                        <h4>Carlos Rodriguez</h4>
                        <div class="player-details">Spain, Age 17</div>
                        <div class="player-details">Defender</div>
                        <div class="player-stats">
                            <span class="house-badge house-w3">W3</span>
                            <span class="performance">88% 8.1</span>
                            <span class="status status-injured">Injured</span>
                        </div>
                    </div>
                    <div class="player-actions">
                        <button class="btn-sm btn-view" onclick="viewPlayer('carlos-rodriguez')">View</button>
                        <button class="btn-sm btn-edit" onclick="editPlayer('carlos-rodriguez')">Edit</button>
                    </div>
                </div>

                <div class="player-card">
                    <div class="player-info">
                        <h4>Luis Garcia</h4>
                        <div class="player-details">Argentina, Age 16</div>
                        <div class="player-details">Midfielder</div>
                        <div class="player-stats">
                            <span class="house-badge house-w2">W2</span>
                            <span class="performance">98% 9.5</span>
                            <span class="status status-active">Active</span>
                        </div>
                    </div>
                    <div class="player-actions">
                        <button class="btn-sm btn-view" onclick="viewPlayer('luis-garcia')">View</button>
                        <button class="btn-sm btn-edit" onclick="editPlayer('luis-garcia')">Edit</button>
                    </div>
                </div>

                <div class="player-card">
                    <div class="player-info">
                        <h4>Alex Schmidt</h4>
                        <div class="player-details">Germany, Age 17</div>
                        <div class="player-details">Goalkeeper</div>
                        <div class="player-stats">
                            <span class="house-badge house-w1">W1</span>
                            <span class="performance">92% 8.7</span>
                            <span class="status status-active">Active</span>
                        </div>
                    </div>
                    <div class="player-actions">
                        <button class="btn-sm btn-view" onclick="viewPlayer('alex-schmidt')">View</button>
                        <button class="btn-sm btn-edit" onclick="editPlayer('alex-schmidt')">Edit</button>
                    </div>
                </div>

                <div class="stats-section">
                    <div class="stats-header">
                        <span>📊</span>
                        <h3>Practice Excuse Statistics</h3>
                    </div>
                    
                    <div class="stats-grid">
                        <div class="stat-card">
                            <div class="stat-title">Illness</div>
                            <div class="stat-number">8</div>
                            <div class="stat-subtitle">requests</div>
                            <div class="stat-subtitle">Most common this month</div>
                        </div>
                        
                        <div class="stat-card">
                            <div class="stat-title">Family Emergency</div>
                            <div class="stat-number">3</div>
                            <div class="stat-subtitle">requests</div>
                            <div class="stat-subtitle">All approved</div>
                        </div>
                        
                        <div class="stat-card">
                            <div class="stat-title">Academic Conflict</div>
                            <div class="stat-number">5</div>
                            <div class="stat-subtitle">requests</div>
                            <div class="stat-subtitle">Exam periods</div>
                        </div>
                        
                        <div class="stat-card">
                            <div class="stat-title">Medical Appointment</div>
                            <div class="stat-number">4</div>
                            <div class="stat-subtitle">requests</div>
                            <div class="stat-subtitle">Routine check-ups</div>
                        </div>
                    </div>

                    <div class="recent-requests">
                        <h4 style="margin-bottom: 16px; color: #1e293b;">Recent Excuse Requests</h4>
                        
                        <div class="request-item">
                            <div>
                                <strong>Max Mueller</strong> - Family emergency (Today)
                            </div>
                            <div class="request-actions">
                                <button class="btn-sm" style="background: #059669; color: white;">Approve</button>
                                <button class="btn-sm" style="background: #dc2626; color: white;">Decline</button>
                            </div>
                        </div>
                        
                        <div class="request-item request-approved">
                            <div>
                                <strong>Carlos Rodriguez</strong> - Medical appointment (Yesterday) - Approved
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div id="housing" class="page">
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
    </div>

    <script>
        let currentUser = null;

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

        // Auth tab management
        function showAuthTab(tabType) {
            const loginTab = document.getElementById('login-auth-tab');
            const registerTab = document.getElementById('register-auth-tab');
            const tabButtons = document.querySelectorAll('.auth-tab-btn');
            
            if (!loginTab || !registerTab) return;
            
            loginTab.classList.remove('active');
            registerTab.classList.remove('active');
            tabButtons.forEach(btn => btn.classList.remove('active'));
            
            if (tabType === 'login') {
                loginTab.classList.add('active');
                event.target.classList.add('active');
            } else if (tabType === 'register') {
                registerTab.classList.add('active');
                event.target.classList.add('active');
            }
        }

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
        function showPage(pageId) {
            document.querySelectorAll('.page').forEach(page => {
                page.classList.remove('active');
            });
            
            document.querySelectorAll('.nav-item').forEach(item => {
                item.classList.remove('active');
            });
            
            document.getElementById(pageId).classList.add('active');
            event.target.classList.add('active');
        }

        // Logout function
        function logout() {
            currentUser = null;
            document.getElementById('mainApp').style.display = 'none';
            document.getElementById('loginPage').style.display = 'flex';
            document.getElementById('loginForm').reset();
        }

        // Player management functions
        function viewPlayer(playerId) {
            alert('Viewing player details for: ' + playerId);
        }

        function editPlayer(playerId) {
            alert('Opening player editor for: ' + playerId);
        }

        console.log('1.FC Köln Bundesliga Talent Program loaded successfully');
    </script>
</body>
</html>`;

const server = http.createServer((req, res) => {
    const parsedUrl = url.parse(req.url, true);
    
    if (parsedUrl.pathname === '/health') {
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ 
            status: 'healthy', 
            system: 'FC Köln Management - Exact Restore',
            timestamp: new Date().toISOString()
        }));
        return;
    }
    
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
    console.log('EXACT RESTORE: Clean application matching original screenshots');
});

server.on('error', (err) => {
    console.error('Server error:', err);
});

process.on('uncaughtException', (err) => {
    console.error('Uncaught exception:', err);
});

process.on('unhandledRejection', (reason, promise) => {
    console.error('Unhandled rejection at:', promise, 'reason:', reason);
});