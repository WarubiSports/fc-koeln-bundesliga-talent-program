#!/usr/bin/env node

const http = require('http');
const url = require('url');

console.log('Starting Complete FC Köln Management System...');

// Complete FC Köln Management System HTML
const FC_KOLN_APP = `<!DOCTYPE html>
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
            background: #f8fafc;
            color: #334155;
        }
        
        /* Header */
        .header {
            background: linear-gradient(135deg, #dc2626, #b91c1c);
            color: white;
            padding: 1rem 2rem;
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
        }
        
        .header-content {
            display: flex;
            justify-content: space-between;
            align-items: center;
            max-width: 1200px;
            margin: 0 auto;
        }
        
        .logo {
            font-size: 24px;
            font-weight: bold;
            text-transform: uppercase;
            letter-spacing: 1px;
        }
        
        .user-info {
            display: flex;
            align-items: center;
            gap: 1rem;
        }
        
        .logout-btn {
            background: rgba(255,255,255,0.2);
            color: white;
            border: none;
            padding: 0.5rem 1rem;
            border-radius: 5px;
            cursor: pointer;
            transition: background 0.3s;
        }
        
        .logout-btn:hover {
            background: rgba(255,255,255,0.3);
        }
        
        /* Navigation */
        .nav {
            background: white;
            border-bottom: 1px solid #e2e8f0;
            padding: 0 2rem;
        }
        
        .nav-content {
            max-width: 1200px;
            margin: 0 auto;
            display: flex;
            gap: 2rem;
        }
        
        .nav-item {
            padding: 1rem 0;
            color: #64748b;
            text-decoration: none;
            border-bottom: 2px solid transparent;
            transition: all 0.3s;
            cursor: pointer;
        }
        
        .nav-item:hover,
        .nav-item.active {
            color: #dc2626;
            border-bottom-color: #dc2626;
        }
        
        /* Main Content */
        .main {
            max-width: 1200px;
            margin: 0 auto;
            padding: 2rem;
        }
        
        .page {
            display: none;
        }
        
        .page.active {
            display: block;
        }
        
        /* Dashboard */
        .dashboard-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
            gap: 2rem;
            margin-bottom: 2rem;
        }
        
        .card {
            background: white;
            border-radius: 10px;
            padding: 2rem;
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
            border-left: 4px solid #dc2626;
        }
        
        .card h3 {
            color: #dc2626;
            margin-bottom: 1rem;
            font-size: 1.25rem;
        }
        
        .stat {
            font-size: 2rem;
            font-weight: bold;
            color: #1e293b;
            margin-bottom: 0.5rem;
        }
        
        /* Players Grid */
        .players-grid {
            display: grid;
            grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
            gap: 1.5rem;
        }
        
        .player-card {
            background: white;
            border-radius: 10px;
            padding: 1.5rem;
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
            transition: transform 0.3s;
        }
        
        .player-card:hover {
            transform: translateY(-2px);
        }
        
        .player-name {
            font-size: 1.25rem;
            font-weight: bold;
            color: #1e293b;
            margin-bottom: 0.5rem;
        }
        
        .player-details {
            color: #64748b;
            line-height: 1.6;
        }
        
        /* Forms */
        .form-section {
            background: white;
            border-radius: 10px;
            padding: 2rem;
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
            margin-bottom: 2rem;
        }
        
        .form-group {
            margin-bottom: 1.5rem;
        }
        
        .form-group label {
            display: block;
            margin-bottom: 0.5rem;
            font-weight: 600;
            color: #374151;
        }
        
        .form-group input,
        .form-group select,
        .form-group textarea {
            width: 100%;
            padding: 0.75rem;
            border: 2px solid #e2e8f0;
            border-radius: 8px;
            font-size: 1rem;
            transition: border-color 0.3s;
        }
        
        .form-group input:focus,
        .form-group select:focus,
        .form-group textarea:focus {
            outline: none;
            border-color: #dc2626;
        }
        
        .btn {
            background: #dc2626;
            color: white;
            border: none;
            padding: 0.75rem 1.5rem;
            border-radius: 8px;
            font-size: 1rem;
            font-weight: 600;
            cursor: pointer;
            transition: background 0.3s;
        }
        
        .btn:hover {
            background: #b91c1c;
        }
        
        .btn-secondary {
            background: #64748b;
        }
        
        .btn-secondary:hover {
            background: #475569;
        }
        
        /* Calendar */
        .calendar-grid {
            display: grid;
            grid-template-columns: repeat(7, 1fr);
            gap: 1px;
            background: #e2e8f0;
            border-radius: 10px;
            overflow: hidden;
        }
        
        .calendar-day {
            background: white;
            padding: 1rem;
            min-height: 100px;
            position: relative;
        }
        
        .calendar-day.other-month {
            background: #f8fafc;
            color: #94a3b8;
        }
        
        .calendar-event {
            background: #dc2626;
            color: white;
            padding: 0.25rem 0.5rem;
            border-radius: 4px;
            font-size: 0.75rem;
            margin-top: 0.25rem;
        }
        
        /* Food Orders */
        .order-card {
            background: white;
            border-radius: 10px;
            padding: 1.5rem;
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
            margin-bottom: 1rem;
            border-left: 4px solid #10b981;
        }
        
        .order-status {
            display: inline-block;
            padding: 0.25rem 0.75rem;
            border-radius: 20px;
            font-size: 0.875rem;
            font-weight: 600;
        }
        
        .status-pending {
            background: #fef3c7;
            color: #92400e;
        }
        
        .status-confirmed {
            background: #d1fae5;
            color: #065f46;
        }
        
        .status-delivered {
            background: #dbeafe;
            color: #1e40af;
        }
        
        /* Responsive */
        @media (max-width: 768px) {
            .header-content {
                flex-direction: column;
                gap: 1rem;
            }
            
            .nav-content {
                flex-wrap: wrap;
                gap: 1rem;
            }
            
            .main {
                padding: 1rem;
            }
            
            .dashboard-grid {
                grid-template-columns: 1fr;
            }
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
            color: #dc2626;
            font-size: 36px;
            font-weight: 900;
            margin-bottom: 12px;
            text-transform: uppercase;
            letter-spacing: 2px;
        }
        
        .login-subtitle {
            color: #666666;
            font-size: 18px;
            margin-bottom: 50px;
            font-weight: 400;
            line-height: 1.4;
        }
    </style>
</head>
<body>
    <!-- Login Page -->
    <div id="loginPage" class="login-container">
        <div class="login-card">
            <div class="login-logo">FC Köln</div>
            <div class="login-subtitle">International Talent Program<br>Management System</div>
            
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
    </div>

    <!-- Main Application -->
    <div id="mainApp" style="display: none;">
        <!-- Header -->
        <header class="header">
            <div class="header-content">
                <div class="logo">FC Köln Management</div>
                <div class="user-info">
                    <span id="userName">Welcome</span>
                    <button class="logout-btn" onclick="logout()">Logout</button>
                </div>
            </div>
        </header>

        <!-- Navigation -->
        <nav class="nav">
            <div class="nav-content">
                <a class="nav-item active" onclick="showPage('dashboard')">Dashboard</a>
                <a class="nav-item" onclick="showPage('players')">Players</a>
                <a class="nav-item" onclick="showPage('chores')">Chores</a>
                <a class="nav-item" onclick="showPage('calendar')">Calendar</a>
                <a class="nav-item" onclick="showPage('food-orders')">Food Orders</a>
                <a class="nav-item" onclick="showPage('communications')">Communications</a>
                <a class="nav-item" onclick="showPage('house-management')">House Management</a>
                <a class="nav-item" onclick="showPage('admin')">Admin</a>
            </div>
        </nav>

        <!-- Main Content -->
        <main class="main">
            <!-- Dashboard Page -->
            <div id="dashboard" class="page active">
                <h1>Dashboard</h1>
                <div class="dashboard-grid">
                    <div class="card">
                        <h3>Total Players</h3>
                        <div class="stat">24</div>
                        <p>Active talent program participants</p>
                    </div>
                    <div class="card">
                        <h3>Houses</h3>
                        <div class="stat">3</div>
                        <p>Widdersdorf 1, 2, and 3</p>
                    </div>
                    <div class="card">
                        <h3>This Week's Events</h3>
                        <div class="stat">8</div>
                        <p>Training sessions and matches</p>
                    </div>
                    <div class="card">
                        <h3>Pending Orders</h3>
                        <div class="stat">5</div>
                        <p>Grocery orders awaiting delivery</p>
                    </div>
                </div>
                
                <div class="form-section">
                    <h3>Recent Activity</h3>
                    <p>• New player registration: Ahmed Hassan</p>
                    <p>• Chore assignment completed: Kitchen cleaning - Widdersdorf 1</p>
                    <p>• Food order delivered: House 2 weekly groceries</p>
                    <p>• Training session scheduled: Monday 3:00 PM</p>
                </div>
            </div>

            <!-- Players Page -->
            <div id="players" class="page">
                <h1>Player Management</h1>
                <div class="form-section">
                    <h3>Add New Player</h3>
                    <div class="form-group">
                        <label>Full Name</label>
                        <input type="text" placeholder="Enter player name">
                    </div>
                    <div class="form-group">
                        <label>Position</label>
                        <select>
                            <option>Goalkeeper</option>
                            <option>Defender</option>
                            <option>Midfielder</option>
                            <option>Forward</option>
                        </select>
                    </div>
                    <div class="form-group">
                        <label>House Assignment</label>
                        <select>
                            <option>Widdersdorf 1</option>
                            <option>Widdersdorf 2</option>
                            <option>Widdersdorf 3</option>
                        </select>
                    </div>
                    <button class="btn">Add Player</button>
                </div>
                
                <div class="players-grid">
                    <div class="player-card">
                        <div class="player-name">Max Mueller</div>
                        <div class="player-details">
                            Position: Midfielder<br>
                            House: Widdersdorf 1<br>
                            Nationality: Germany<br>
                            Age: 17
                        </div>
                    </div>
                    <div class="player-card">
                        <div class="player-name">Ahmed Hassan</div>
                        <div class="player-details">
                            Position: Forward<br>
                            House: Widdersdorf 2<br>
                            Nationality: Egypt<br>
                            Age: 18
                        </div>
                    </div>
                    <div class="player-card">
                        <div class="player-name">Carlos Rodriguez</div>
                        <div class="player-details">
                            Position: Defender<br>
                            House: Widdersdorf 3<br>
                            Nationality: Spain<br>
                            Age: 17
                        </div>
                    </div>
                </div>
            </div>

            <!-- Chores Page -->
            <div id="chores" class="page">
                <h1>House Chores Management</h1>
                <div class="form-section">
                    <h3>Weekly Chore Assignments</h3>
                    <div class="dashboard-grid">
                        <div class="card">
                            <h3>Widdersdorf 1</h3>
                            <p>Kitchen cleaning: Max Mueller</p>
                            <p>Bathroom: Alex Schmidt</p>
                            <p>Common area: Jan Weber</p>
                        </div>
                        <div class="card">
                            <h3>Widdersdorf 2</h3>
                            <p>Kitchen cleaning: Ahmed Hassan</p>
                            <p>Bathroom: Luis Garcia</p>
                            <p>Common area: Tom Johnson</p>
                        </div>
                        <div class="card">
                            <h3>Widdersdorf 3</h3>
                            <p>Kitchen cleaning: Carlos Rodriguez</p>
                            <p>Bathroom: Mike Brown</p>
                            <p>Common area: Jean Dupont</p>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Calendar Page -->
            <div id="calendar" class="page">
                <h1>Training Calendar</h1>
                <div class="form-section">
                    <h3>This Week's Schedule</h3>
                    <div class="calendar-grid">
                        <div class="calendar-day">
                            <strong>Mon</strong>
                            <div class="calendar-event">Training 3:00 PM</div>
                        </div>
                        <div class="calendar-day">
                            <strong>Tue</strong>
                        </div>
                        <div class="calendar-day">
                            <strong>Wed</strong>
                            <div class="calendar-event">Training 3:00 PM</div>
                        </div>
                        <div class="calendar-day">
                            <strong>Thu</strong>
                            <div class="calendar-event">Weight Lifting</div>
                        </div>
                        <div class="calendar-day">
                            <strong>Fri</strong>
                            <div class="calendar-event">Training 3:00 PM</div>
                        </div>
                        <div class="calendar-day">
                            <strong>Sat</strong>
                            <div class="calendar-event">Match 2:00 PM</div>
                        </div>
                        <div class="calendar-day">
                            <strong>Sun</strong>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Food Orders Page -->
            <div id="food-orders" class="page">
                <h1>Food Order Management</h1>
                <div class="form-section">
                    <h3>Place New Order</h3>
                    <div class="form-group">
                        <label>House</label>
                        <select>
                            <option>Widdersdorf 1</option>
                            <option>Widdersdorf 2</option>
                            <option>Widdersdorf 3</option>
                        </select>
                    </div>
                    <div class="form-group">
                        <label>Delivery Date</label>
                        <select>
                            <option>Tuesday</option>
                            <option>Friday</option>
                        </select>
                    </div>
                    <button class="btn">Create Order</button>
                </div>
                
                <div class="order-card">
                    <h4>Widdersdorf 1 - Weekly Groceries</h4>
                    <p>Delivery: Tuesday, July 23</p>
                    <span class="order-status status-confirmed">Confirmed</span>
                </div>
                
                <div class="order-card">
                    <h4>Widdersdorf 2 - Weekly Groceries</h4>
                    <p>Delivery: Friday, July 26</p>
                    <span class="order-status status-pending">Pending</span>
                </div>
            </div>

            <!-- Communications Page -->
            <div id="communications" class="page">
                <h1>Team Communications</h1>
                <div class="form-section">
                    <h3>Send Team Message</h3>
                    <div class="form-group">
                        <label>Recipient Group</label>
                        <select>
                            <option>All Players</option>
                            <option>Widdersdorf 1</option>
                            <option>Widdersdorf 2</option>
                            <option>Widdersdorf 3</option>
                            <option>Coaching Staff</option>
                        </select>
                    </div>
                    <div class="form-group">
                        <label>Message</label>
                        <textarea rows="4" placeholder="Enter your message..."></textarea>
                    </div>
                    <button class="btn">Send Message</button>
                </div>
                
                <div class="form-section">
                    <h3>Recent Messages</h3>
                    <p><strong>Training Update:</strong> Tomorrow's session moved to 4:00 PM</p>
                    <p><strong>House Reminder:</strong> Please complete weekly chores by Sunday</p>
                    <p><strong>Match Announcement:</strong> Home match this Saturday vs. Borussia Dortmund U19</p>
                </div>
            </div>

            <!-- House Management Page -->
            <div id="house-management" class="page">
                <h1>House Management</h1>
                <div class="dashboard-grid">
                    <div class="card">
                        <h3>Widdersdorf 1</h3>
                        <p>Residents: 8 players</p>
                        <p>House Leader: Max Mueller</p>
                        <p>Chore Completion: 85%</p>
                    </div>
                    <div class="card">
                        <h3>Widdersdorf 2</h3>
                        <p>Residents: 8 players</p>
                        <p>House Leader: Ahmed Hassan</p>
                        <p>Chore Completion: 92%</p>
                    </div>
                    <div class="card">
                        <h3>Widdersdorf 3</h3>
                        <p>Residents: 8 players</p>
                        <p>House Leader: Carlos Rodriguez</p>
                        <p>Chore Completion: 78%</p>
                    </div>
                </div>
            </div>

            <!-- Admin Page -->
            <div id="admin" class="page">
                <h1>System Administration</h1>
                <div class="form-section">
                    <h3>User Management</h3>
                    <p>Manage system users, roles, and permissions</p>
                    <button class="btn">Manage Users</button>
                </div>
                
                <div class="form-section">
                    <h3>System Settings</h3>
                    <p>Configure application settings and preferences</p>
                    <button class="btn btn-secondary">System Settings</button>
                </div>
                
                <div class="form-section">
                    <h3>Data Export</h3>
                    <p>Export player data, statistics, and reports</p>
                    <button class="btn btn-secondary">Export Data</button>
                </div>
            </div>
        </main>
    </div>

    <script>
        let currentUser = null;

        // Login functionality
        document.getElementById('loginForm').addEventListener('submit', function(e) {
            e.preventDefault();
            
            const email = document.getElementById('email').value.trim();
            const password = document.getElementById('password').value;
            const messageDiv = document.getElementById('loginMessage');
            
            messageDiv.innerHTML = '';
            
            if (password === 'ITP2024') {
                let userData = null;
                
                if (email === 'max.bisinger@warubi-sports.com') {
                    userData = { name: 'Max Bisinger', email: email, role: 'admin' };
                } else if (email === 'thomas.ellinger@warubi-sports.com') {
                    userData = { name: 'Thomas Ellinger', email: email, role: 'staff' };
                } else {
                    messageDiv.innerHTML = '<div style="color: #dc2626; margin-top: 1rem;">Email not recognized. Please try again.</div>';
                    return;
                }
                
                currentUser = userData;
                localStorage.setItem('fc-koln-auth', JSON.stringify({
                    token: userData.role + '_' + Date.now(),
                    user: userData,
                    loginTime: new Date().toISOString()
                }));
                
                showMainApp();
                
            } else {
                messageDiv.innerHTML = '<div style="color: #dc2626; margin-top: 1rem;">Invalid password. Please try again.</div>';
            }
        });

        // Show main application
        function showMainApp() {
            document.getElementById('loginPage').style.display = 'none';
            document.getElementById('mainApp').style.display = 'block';
            document.getElementById('userName').textContent = \`Welcome, \${currentUser.name}\`;
        }

        // Navigation
        function showPage(pageId) {
            // Hide all pages
            const pages = document.querySelectorAll('.page');
            pages.forEach(page => page.classList.remove('active'));
            
            // Remove active from nav items
            const navItems = document.querySelectorAll('.nav-item');
            navItems.forEach(item => item.classList.remove('active'));
            
            // Show selected page
            document.getElementById(pageId).classList.add('active');
            
            // Add active to clicked nav item
            event.target.classList.add('active');
        }

        // Logout
        function logout() {
            currentUser = null;
            localStorage.removeItem('fc-koln-auth');
            document.getElementById('loginPage').style.display = 'block';
            document.getElementById('mainApp').style.display = 'none';
            
            // Reset form
            document.getElementById('email').value = 'max.bisinger@warubi-sports.com';
            document.getElementById('password').value = 'ITP2024';
            document.getElementById('loginMessage').innerHTML = '';
        }

        // Check for existing login on page load
        window.addEventListener('load', function() {
            const existingAuth = localStorage.getItem('fc-koln-auth');
            if (existingAuth) {
                try {
                    const authData = JSON.parse(existingAuth);
                    currentUser = authData.user;
                    showMainApp();
                } catch (e) {
                    console.log('Starting fresh session');
                }
            }
        });

        console.log('FC Köln Management System loaded successfully');
        console.log('Complete application with Dashboard, Players, Chores, Calendar, Food Orders, Communications, House Management, and Admin');
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
            system: 'FC Köln Management - Complete Application',
            timestamp: new Date().toISOString()
        }));
        return;
    }
    
    // Serve complete FC Köln application
    res.writeHead(200, {
        'Content-Type': 'text/html; charset=utf-8',
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0'
    });
    
    res.end(FC_KOLN_APP);
});

const PORT = process.env.PORT || 3000;

server.listen(PORT, '0.0.0.0', () => {
    console.log(\`🚀 Complete FC Köln Management System running on port \${PORT}\`);
    console.log(\`🔐 Admin credentials: max.bisinger@warubi-sports.com / ITP2024\`);
    console.log(\`👥 Staff credentials: thomas.ellinger@warubi-sports.com / ITP2024\`);
    console.log(\`📊 Features: Dashboard, Players, Chores, Calendar, Food Orders, Communications, House Management, Admin\`);
    console.log(\`🌐 Server ready at http://0.0.0.0:\${PORT}\`);
    console.log(\`✅ Complete system status: Operational\`);
});