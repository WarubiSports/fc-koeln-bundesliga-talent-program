
const http = require('http');
const url = require('url');
const path = require('path');
const fs = require('fs');

console.log('Starting 1.FC Köln Bundesliga Talent Program Management System...');

const FC_KOLN_APP = `#!/usr/bin/env node

const http = require('http');
const url = require('url');
const fs = require('fs');
const path = require('path');

console.log('Starting 1.FC Köln Bundesliga Talent Program Management System...');

// Complete FC Köln Management System HTML
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
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            background: #f8fafc;
            color: #334155;
        }
        
        /* Login Page */
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
        
        .login-logo {
            margin-bottom: 2rem;
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
            line-height: 1.2;
        }
        
        .login-subtitle {
            color: #666666;
            font-size: 18px;
            margin-bottom: 50px;
            font-weight: 400;
            line-height: 1.4;
        }
        
        .form-group {
            margin-bottom: 1.5rem;
            text-align: left;
        }
        
        .form-label {
            display: block;
            color: #374151;
            font-weight: 500;
            margin-bottom: 0.5rem;
        }
        
        .form-input {
            width: 100%;
            padding: 0.75rem;
            border: 2px solid #e5e7eb;
            border-radius: 8px;
            font-size: 1rem;
            transition: border-color 0.3s;
        }
        
        .form-input:focus {
            outline: none;
            border-color: #dc2626;
        }
        
        /* Auth Tabs */
        .auth-tabs {
            display: flex;
            background: #f1f5f9;
            border-radius: 8px;
            padding: 4px;
            margin-bottom: 2rem;
        }
        
        .auth-tab-btn {
            flex: 1;
            padding: 0.75rem;
            text-align: center;
            border-radius: 6px;
            cursor: pointer;
            transition: all 0.3s;
            font-weight: 600;
            background: none;
            border: none;
            color: #6b7280;
        }
        
        .auth-tab-btn.active {
            background: white;
            color: #dc2626;
            box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        }
        
        .auth-tab-content {
            display: none;
        }
        
        .auth-tab-content.active {
            display: block;
        }
        
        .public-registration {
            text-align: left;
        }
        
        .registration-intro {
            text-align: center;
            color: #6b7280;
            margin-bottom: 2rem;
            font-size: 1.1rem;
        }
        
        .btn {
            width: 100%;
            padding: 0.75rem;
            background: #dc2626;
            color: white;
            border: none;
            border-radius: 8px;
            font-size: 1rem;
            font-weight: 600;
            cursor: pointer;
            transition: background 0.3s;
        }
        
        .btn:hover {
            background: #b91c1c;
        }
        
        /* Main App */
        #mainApp {
            display: none;
        }
        
        .header {
            background: linear-gradient(135deg, #dc2626 0%, #b91c1c 50%, #991b1b 100%);
            color: white;
            padding: 1rem 2rem;
            display: flex;
            justify-content: space-between;
            align-items: center;
            box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
        }
        
        .logo {
            height: 50px;
            filter: brightness(0) invert(1);
        }
        
        .nav {
            display: flex;
            gap: 1rem;
        }
        
        .nav-item {
            padding: 0.75rem 1.5rem;
            background: rgba(255, 255, 255, 0.1);
            border: 1px solid rgba(255, 255, 255, 0.2);
            color: white;
            cursor: pointer;
            border-radius: 8px;
            transition: all 0.3s ease;
            font-weight: 500;
        }
        
        .nav-item:hover {
            background: rgba(255, 255, 255, 0.2);
            transform: translateY(-1px);
        }
        
        .nav-item.active {
            background: white;
            color: #dc2626;
            font-weight: 600;
        }
        
        .user-info {
            display: flex;
            align-items: center;
            gap: 1rem;
            color: white;
        }
        
        .page {
            display: none;
            padding: 2rem;
            min-height: calc(100vh - 100px);
            background: linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%);
        }
        
        .page.active {
            display: block;
        }
        
        .page h2 {
            color: #dc2626;
            font-size: 2rem;
            font-weight: 700;
            margin-bottom: 2rem;
            text-align: center;
        }
        
        .dashboard-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
            gap: 2rem;
            margin-bottom: 2rem;
        }
        
        .card {
            background: white;
            border-radius: 16px;
            padding: 2rem;
            box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
            border: 1px solid rgba(220, 38, 38, 0.1);
            transition: all 0.3s ease;
        }
        
        .card:hover {
            transform: translateY(-5px);
            box-shadow: 0 20px 40px rgba(220, 38, 38, 0.15);
        }
        
        .card h3 {
            color: #dc2626;
            margin-bottom: 1rem;
            font-size: 1.5rem;
            font-weight: 600;
        }
        
        .stat-card {
            background: linear-gradient(135deg, #dc2626 0%, #b91c1c 100%);
            color: white;
            text-align: center;
        }
        
        .stat-card h3 {
            color: white;
            font-size: 3rem;
            margin-bottom: 0.5rem;
        }
        
        .stat-card p {
            font-size: 1.2rem;
            opacity: 0.9;
        }
        
        .admin-only {
            display: none;
        }
        
        .admin-staff-only {
            display: none;
        }
    </style>
</head>
<body>
    <!-- Login Page -->
    <div id="loginPage" class="login-container">
        <div class="login-card">
            <div class="login-logo">
                <img src="attached_assets/NewCologneLogo_1753281112388.png" alt="1.FC Köln Logo" class="fc-koln-logo">
            </div>
            <h1>1.FC Köln Bundesliga Talent Program</h1>
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
                
                <div id="loginMessage"></div>
            </div>
            
            <!-- Registration Tab -->
            <div id="register-auth-tab" class="auth-tab-content">
                <div class="public-registration">
                    <p class="registration-intro">1.FC Köln Bundesliga Talent Program Registration</p>
                    <form>
                        <div class="form-group">
                            <label>First Name</label>
                            <input type="text" placeholder="Enter first name" required>
                        </div>
                        <div class="form-group">
                            <label>Last Name</label>
                            <input type="text" placeholder="Enter last name" required>
                        </div>
                        <div class="form-group">
                            <label>Email Address</label>
                            <input type="email" placeholder="Enter email address" required>
                        </div>
                        <div class="form-group">
                            <label>Position</label>
                            <select required>
                                <option value="">Select position</option>
                                <option value="goalkeeper">Goalkeeper</option>
                                <option value="defender">Defender</option>
                                <option value="midfielder">Midfielder</option>
                                <option value="forward">Forward</option>
                            </select>
                        </div>
                        <button type="submit" class="btn">Submit Registration</button>
                    </form>
                </div>
            </div>
        </div>
    </div>

    <!-- Main Application -->
    <div id="mainApp">
        <header class="header">
            <img src="attached_assets/NewCologneLogo_1753281112388.png" alt="1.FC Köln Logo" class="logo">
            <nav class="nav">
                <button class="nav-item active" onclick="showPage('dashboard')">Dashboard</button>
                <button class="nav-item" onclick="showPage('players')">Players</button>
                <button class="nav-item" onclick="showPage('chores')">Chores</button>
                <button class="nav-item" onclick="showPage('calendar')">Calendar</button>
                <button class="nav-item" onclick="showPage('food-orders')">Food Orders</button>
                <button class="nav-item" onclick="showPage('communications')">Communications</button>
                <button class="nav-item admin-only" onclick="showPage('house-management')" style="display: none;">House Management</button>
                <button class="nav-item admin-only" onclick="showPage('admin')" style="display: none;">Admin</button>
            </nav>
            <div class="user-info">
                <span id="userName">Welcome</span>
                <button class="btn" onclick="logout()">Logout</button>
            </div>
        </header>

        <!-- Dashboard Page -->
        <div id="dashboard" class="page active">
            <h2>1.FC Köln Bundesliga Talent Program Dashboard</h2>
            <div class="dashboard-grid">
                <div class="card stat-card">
                    <h3>21</h3>
                    <p>Total Players</p>
                </div>
                <div class="card stat-card">
                    <h3>18</h3>
                    <p>Active Players</p>
                </div>
                <div class="card stat-card">
                    <h3>3</h3>
                    <p>Houses</p>
                </div>
                <div class="card">
                    <h3>Recent Activity</h3>
                    <div style="space-y: 0.5rem;">
                        <p>• Max Finkgräfe completed kitchen cleaning</p>
                        <p>• Tim Lemperle submitted grocery order</p>
                        <p>• Widdersdorf 1 weekly meeting scheduled</p>
                        <p>• Training session attendance updated</p>
                    </div>
                </div>
                <div class="card">
                    <h3>House Competition Leaderboard</h3>
                    <div style="space-y: 0.5rem;">
                        <div style="display: flex; justify-content: space-between; padding: 0.5rem; background: #f3f4f6; border-radius: 6px; margin-bottom: 0.5rem;">
                            <span>🥇 Widdersdorf 1</span>
                            <span style="font-weight: 600; color: #dc2626;">485 pts</span>
                        </div>
                        <div style="display: flex; justify-content: space-between; padding: 0.5rem; background: #f3f4f6; border-radius: 6px; margin-bottom: 0.5rem;">
                            <span>🥈 Widdersdorf 3</span>
                            <span style="font-weight: 600; color: #dc2626;">467 pts</span>
                        </div>
                        <div style="display: flex; justify-content: space-between; padding: 0.5rem; background: #f3f4f6; border-radius: 6px;">
                            <span>🥉 Widdersdorf 2</span>
                            <span style="font-weight: 600; color: #dc2626;">441 pts</span>
                        </div>
                    </div>
                </div>
                <div class="card">
                    <h3>System Status</h3>
                    <p style="color: #059669; font-weight: 600;">✅ All systems operational</p>
                    <p>Last updated: <span id="lastUpdate"></span></p>
                    <p>Active sessions: 12</p>
                    <p>Database status: Healthy</p>
                </div>
            </div>
        </div>

        <!-- Players Page -->
        <div id="players" class="page">
            <h2>Player Management</h2>
            <div class="dashboard-grid">
                <div class="card">
                    <h3>Max Finkgräfe</h3>
                    <div style="background: linear-gradient(135deg, #dc2626 0%, #b91c1c 100%); color: white; padding: 1rem; border-radius: 8px; margin-bottom: 1rem;">
                        <p style="margin: 0; font-weight: 600;">Forward • Active</p>
                        <p style="margin: 0; opacity: 0.9;">Age: 19 • Germany</p>
                    </div>
                    <p><strong>House:</strong> Widdersdorf 1, Room 8A</p>
                    <p><strong>Contract:</strong> 2024-2026</p>
                    <p><strong>Join Date:</strong> 2024-01-15</p>
                    <div style="margin-top: 1rem;">
                        <button class="btn" style="width: auto; font-size: 0.9rem; padding: 0.5rem 1rem;">View Profile</button>
                        <button class="btn admin-staff-only" onclick="editPlayer('max')" style="width: auto; margin-left: 0.5rem; background: #f59e0b; font-size: 0.9rem; padding: 0.5rem 1rem;">Edit</button>
                    </div>
                </div>
                
                <div class="card">
                    <h3>Tim Lemperle</h3>
                    <div style="background: linear-gradient(135deg, #dc2626 0%, #b91c1c 100%); color: white; padding: 1rem; border-radius: 8px; margin-bottom: 1rem;">
                        <p style="margin: 0; font-weight: 600;">Midfielder • Active</p>
                        <p style="margin: 0; opacity: 0.9;">Age: 20 • Germany</p>
                    </div>
                    <p><strong>House:</strong> Widdersdorf 2, Room 3B</p>
                    <p><strong>Contract:</strong> 2023-2025</p>
                    <p><strong>Join Date:</strong> 2023-08-01</p>
                    <div style="margin-top: 1rem;">
                        <button class="btn" style="width: auto; font-size: 0.9rem; padding: 0.5rem 1rem;">View Profile</button>
                        <button class="btn admin-staff-only" onclick="editPlayer('tim')" style="width: auto; margin-left: 0.5rem; background: #f59e0b; font-size: 0.9rem; padding: 0.5rem 1rem;">Edit</button>
                    </div>
                </div>
                
                <div class="card">
                    <h3>Timo Horn</h3>
                    <div style="background: linear-gradient(135deg, #dc2626 0%, #b91c1c 100%); color: white; padding: 1rem; border-radius: 8px; margin-bottom: 1rem;">
                        <p style="margin: 0; font-weight: 600;">Goalkeeper • Active</p>
                        <p style="margin: 0; opacity: 0.9;">Age: 23 • Germany</p>
                    </div>
                    <p><strong>House:</strong> Widdersdorf 3, Room 5A</p>
                    <p><strong>Contract:</strong> 2023-2026</p>
                    <p><strong>Join Date:</strong> 2023-07-15</p>
                    <div style="margin-top: 1rem;">
                        <button class="btn" style="width: auto; font-size: 0.9rem; padding: 0.5rem 1rem;">View Profile</button>
                        <button class="btn admin-staff-only" onclick="editPlayer('timo')" style="width: auto; margin-left: 0.5rem; background: #f59e0b; font-size: 0.9rem; padding: 0.5rem 1rem;">Edit</button>
                    </div>
                </div>
                
                <div class="card">
                    <h3>Amela Huseinbašić</h3>
                    <div style="background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%); color: white; padding: 1rem; border-radius: 8px; margin-bottom: 1rem;">
                        <p style="margin: 0; font-weight: 600;">Midfielder • Injured</p>
                        <p style="margin: 0; opacity: 0.9;">Age: 18 • Germany</p>
                    </div>
                    <p><strong>House:</strong> Widdersdorf 2, Room 11B</p>
                    <p><strong>Contract:</strong> 2024-2025</p>
                    <p><strong>Status:</strong> Knee injury recovery</p>
                    <div style="margin-top: 1rem;">
                        <button class="btn" style="width: auto; font-size: 0.9rem; padding: 0.5rem 1rem;">View Profile</button>
                        <button class="btn admin-staff-only" onclick="editPlayer('amela')" style="width: auto; margin-left: 0.5rem; background: #f59e0b; font-size: 0.9rem; padding: 0.5rem 1rem;">Edit</button>
                    </div>
                </div>
            </div>
        </div>

        <!-- Chores Page -->
        <div id="chores" class="page">
            <h2>House Management - Chores</h2>
            <div class="card">
                <h3>Current Chores</h3>
                <p>Manage house assignments and track completion status.</p>
                <div style="margin-top: 1rem;">
                    <div style="padding: 1rem; border: 1px solid #e5e7eb; border-radius: 8px; margin-bottom: 1rem;">
                        <strong>Kitchen Cleaning</strong> - Assigned to Widdersdorf 1<br>
                        <small>Due: Today | Priority: High</small>
                    </div>
                    <div style="padding: 1rem; border: 1px solid #e5e7eb; border-radius: 8px; margin-bottom: 1rem;">
                        <strong>Grocery Shopping</strong> - Assigned to Max Finkgräfe<br>
                        <small>Due: Tomorrow | Priority: Medium</small>
                    </div>
                </div>
            </div>
        </div>

        <!-- Calendar Page -->
        <div id="calendar" class="page">
            <h2>Calendar & Events</h2>
            <div class="card">
                <h3>Upcoming Events</h3>
                <p>Training sessions, matches, and important dates.</p>
                <div style="margin-top: 1rem;">
                    <div style="padding: 1rem; border: 1px solid #e5e7eb; border-radius: 8px; margin-bottom: 1rem;">
                        <strong>Training Session</strong><br>
                        <small>Today 15:00 - RheinEnergie Stadium</small>
                    </div>
                    <div style="padding: 1rem; border: 1px solid #e5e7eb; border-radius: 8px; margin-bottom: 1rem;">
                        <strong>Team Meeting</strong><br>
                        <small>Tomorrow 10:00 - Conference Room</small>
                    </div>
                </div>
            </div>
        </div>

        <!-- Food Orders Page -->
        <div id="food-orders" class="page">
            <h2>Food Orders</h2>
            <div class="card">
                <h3>Grocery Shopping</h3>
                <p>Order groceries for your house. Delivery schedule: Tuesday and Friday.</p>
                <div style="margin-top: 1rem;">
                    <div style="padding: 1rem; border: 1px solid #e5e7eb; border-radius: 8px; margin-bottom: 1rem;">
                        <strong>Basic Items Available</strong><br>
                        <small>Fruits, vegetables, meat, dairy products, grains</small>
                    </div>
                    <div style="margin-top: 1rem;">
                        <button class="btn" onclick="orderGroceries()" style="width: auto; padding: 0.5rem 1.5rem;">Place Order</button>
                    </div>
                </div>
            </div>
        </div>

        <!-- Communications Page -->
        <div id="communications" class="page">
            <h2>Communications</h2>
            <div class="card">
                <h3>Message Center</h3>
                <p>Send and receive messages with team members.</p>
                <div style="margin-top: 1rem;">
                    <button class="btn" onclick="sendMessage()" style="width: auto; margin-right: 1rem;">Send Message</button>
                    <button class="btn" onclick="sendAlert()" style="width: auto; background: #f59e0b;">Send Alert</button>
                </div>
            </div>
        </div>

        <!-- House Management Page -->
        <div id="house-management" class="page">
            <h2>House Management</h2>
            <div class="card">
                <h3>Housing Overview</h3>
                <p>Manage house assignments, chores, and facilities.</p>
                <div style="margin-top: 1rem;">
                    <div style="padding: 1rem; border: 1px solid #e5e7eb; border-radius: 8px; margin-bottom: 1rem;">
                        <strong>Widdersdorf 1</strong> - 8 players<br>
                        <small>Status: All assignments current</small>
                    </div>
                    <div style="padding: 1rem; border: 1px solid #e5e7eb; border-radius: 8px; margin-bottom: 1rem;">
                        <strong>Widdersdorf 2</strong> - 7 players<br>
                        <small>Status: 2 pending chores</small>
                    </div>
                    <div style="padding: 1rem; border: 1px solid #e5e7eb; border-radius: 8px; margin-bottom: 1rem;">
                        <strong>Widdersdorf 3</strong> - 6 players<br>
                        <small>Status: All clear</small>
                    </div>
                </div>
            </div>
        </div>

        <!-- Admin Page -->
        <div id="admin" class="page">
            <h2>System Administration</h2>
            <div class="card">
                <h3>Admin Controls</h3>
                <p>Full system management and oversight capabilities.</p>
                <div style="margin-top: 1rem;">
                    <button class="btn" onclick="systemMonitoring()" style="width: auto; margin-right: 1rem; margin-bottom: 0.5rem;">System Monitoring</button>
                    <button class="btn" onclick="userManagement()" style="width: auto; margin-right: 1rem; margin-bottom: 0.5rem;">User Management</button>
                    <button class="btn" onclick="dataBackup()" style="width: auto; margin-right: 1rem; margin-bottom: 0.5rem;">Data Backup</button>
                </div>
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
</script></body>
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
