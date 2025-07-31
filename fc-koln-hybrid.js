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
            background: #f8fafc;
            min-height: 100vh;
        }
        
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
            display: flex;
            align-items: center;
            gap: 15px;
            font-size: 20px;
            font-weight: bold;
        }
        
        .fc-koln-logo-small {
            width: 40px;
            height: 40px;
        }
        
        .main-nav {
            display: flex;
            gap: 2rem;
        }
        
        .nav-item {
            padding: 0.5rem 1rem;
            border-radius: 6px;
            cursor: pointer;
            transition: all 0.2s;
            color: rgba(255,255,255,0.9);
        }
        
        .nav-item:hover, .nav-item.active {
            background: rgba(255,255,255,0.1);
            color: white;
        }
        
        .user-info {
            display: flex;
            align-items: center;
            gap: 1rem;
        }
        
        .logout-btn {
            background: rgba(255,255,255,0.1);
            color: white;
            border: 1px solid rgba(255,255,255,0.2);
            padding: 0.5rem 1rem;
            border-radius: 6px;
            cursor: pointer;
            transition: all 0.2s;
        }
        
        .logout-btn:hover {
            background: rgba(255,255,255,0.2);
        }
        
        .container {
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
        
        .dashboard-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
            gap: 1.5rem;
            margin-bottom: 2rem;
        }
        
        .card {
            background: white;
            padding: 1.5rem;
            border-radius: 12px;
            box-shadow: 0 2px 8px rgba(0,0,0,0.1);
            border: 1px solid #e5e7eb;
        }
        
        .gradient-card {
            background: linear-gradient(135deg, #ffffff, #f8fafc);
            border-left: 4px solid #dc2626;
        }
        
        .card-icon {
            font-size: 2rem;
            margin-bottom: 0.5rem;
        }
        
        .stat-number {
            font-size: 2rem;
            font-weight: bold;
            color: #dc2626;
        }
        
        .stat-change {
            font-size: 0.875rem;
            margin-top: 0.5rem;
        }
        
        .stat-change.positive {
            color: #059669;
        }
        
        .stat-change.neutral {
            color: #6b7280;
        }
        
        .form-section {
            background: white;
            padding: 1.5rem;
            border-radius: 12px;
            box-shadow: 0 2px 8px rgba(0,0,0,0.1);
            margin-bottom: 1.5rem;
        }
        
        .activity-timeline {
            display: flex;
            flex-direction: column;
            gap: 1rem;
        }
        
        .activity-item {
            display: flex;
            align-items: center;
            gap: 1rem;
            padding: 0.75rem;
            background: #f8fafc;
            border-radius: 8px;
            border-left: 3px solid #dc2626;
        }
        
        .activity-icon {
            font-size: 1.25rem;
        }
        
        .activity-content p {
            margin: 0;
            font-weight: 500;
        }
        
        .activity-content small {
            color: #6b7280;
        }
        
        .admin-only {
            display: none;
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
    <div id="mainApp" class="main-app" style="display: none;">
        <!-- Header -->
        <div class="header">
            <div class="header-content">
                <div class="logo">
                    <img src="attached_assets/NewCologneLogo_1753281112388.png" alt="1.FC Köln" class="fc-koln-logo-small">
                    <span>1.FC Köln Bundesliga Talent Program</span>
                </div>
                
                <nav class="main-nav">
                    <div class="nav-item" onclick="showPage('dashboard')">Dashboard</div>
                    <div class="nav-item" onclick="showPage('players')">Players</div>
                    <div class="nav-item" onclick="showPage('chores')">Chores</div>
                    <div class="nav-item" onclick="showPage('calendar')">Calendar</div>
                    <div class="nav-item" onclick="showPage('food-orders')">Food Orders</div>
                    <div class="nav-item" onclick="showPage('communications')">Communications</div>
                    <div class="nav-item admin-only" onclick="showPage('house-management')">House Management</div>
                    <div class="nav-item admin-only" onclick="showPage('admin')">Admin</div>
                </nav>
                
                <div class="user-info">
                    <span id="userName">Admin</span>
                    <button class="logout-btn" onclick="logout()">Logout</button>
                </div>
            </div>
        </div>

        <!-- Dashboard Page -->
        <div id="dashboard" class="page active">
            <div class="container">
                <h2>Dashboard Overview</h2>
                
                <!-- Quick Stats -->
                <div class="dashboard-grid">
                    <div class="card gradient-card">
                        <div class="card-icon">👥</div>
                        <h3>Active Players</h3>
                        <div class="stat-number">24</div>
                        <p class="stat-change positive">+2 this month</p>
                    </div>
                    
                    <div class="card gradient-card">
                        <div class="card-icon">📋</div>
                        <h3>Pending Chores</h3>
                        <div class="stat-number">8</div>
                        <p class="stat-change neutral">3 overdue</p>
                    </div>
                    
                    <div class="card gradient-card">
                        <div class="card-icon">🍽️</div>
                        <h3>Food Orders</h3>
                        <div class="stat-number">€420</div>
                        <p class="stat-change positive">This week</p>
                    </div>
                    
                    <div class="card gradient-card">
                        <div class="card-icon">🏠</div>
                        <h3>Houses</h3>
                        <div class="stat-number">3</div>
                        <p class="stat-change neutral">W1, W2, W3</p>
                    </div>
                </div>
                
                <!-- Recent Activity -->
                <div class="form-section">
                    <h3>Recent Activity</h3>
                    <div class="activity-timeline">
                        <div class="activity-item">
                            <div class="activity-icon">✅</div>
                            <div class="activity-content">
                                <p><strong>Max Finkgräfe</strong> completed kitchen cleaning</p>
                                <small>2 hours ago</small>
                            </div>
                        </div>
                        <div class="activity-item">
                            <div class="activity-icon">🛒</div>
                            <div class="activity-content">
                                <p><strong>Tim Lemperle</strong> placed food order (€28.50)</p>
                                <small>4 hours ago</small>
                            </div>
                        </div>
                        <div class="activity-item">
                            <div class="activity-icon">📅</div>
                            <div class="activity-content">
                                <p><strong>Training Session</strong> scheduled for tomorrow</p>
                                <small>1 day ago</small>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <!-- Players Page -->
        <div id="players" class="page">
            <div class="container">
                <h2>Player Management</h2>
                <p>Individual food ordering system with €35 budget limits per player</p>
                <p>Enhanced player management UI with modal-based editing system</p>
            </div>
        </div>

        <!-- Chores Page -->
        <div id="chores" class="page">
            <div class="container">
                <h2>Chore Management</h2>
                <p>Advanced chore management with deadline-based assignments and priority system</p>
                <p>Four-tier priority system, house-specific assignments</p>
            </div>
        </div>

        <!-- Calendar Page -->
        <div id="calendar" class="page">
            <div class="container">
                <h2>Calendar & Events</h2>
                <p>Unified calendar system with Day/Week/Month views</p>
            </div>
        </div>

        <!-- Food Orders Page -->
        <div id="food-orders" class="page">
            <div class="container">
                <h2>Food Orders</h2>
                <p>Individual food ordering with €35 budget limits per player grouped by house for admin oversight</p>
                <p>Personal budget limits with real-time tracking and validation</p>
            </div>
        </div>

        <!-- Communications Page -->
        <div id="communications" class="page">
            <div class="container">
                <h2>Communications</h2>
                <p>WhatsApp-style communications functionality accessible to all users</p>
            </div>
        </div>

        <!-- House Management Page -->
        <div id="house-management" class="page admin-only">
            <div class="container">
                <h2>House Management</h2>
                <p>Admin house summary feature with consolidated order management</p>
                <p>Consolidated shopping lists grouped by residence</p>
            </div>
        </div>

        <!-- Admin Page -->
        <div id="admin" class="page admin-only">
            <div class="container">
                <h2>Admin Panel</h2>
                <p>Comprehensive admin controls with security and emergency protocols</p>
                <p>Five categories of system management</p>
            </div>
        </div>
    </div>

    <script>
        console.log('FC Köln Authentication System - Loading...');
        
        // Global variables
        let currentUser = null;
        
        // Page navigation function
        function showPage(pageId) {
            console.log('Navigating to page:', pageId);
            
            // Hide all pages
            const pages = document.querySelectorAll('.page');
            pages.forEach(page => page.classList.remove('active'));
            
            // Remove active from nav items
            const navItems = document.querySelectorAll('.nav-item');
            navItems.forEach(item => item.classList.remove('active'));
            
            // Show selected page
            const targetPage = document.getElementById(pageId);
            if (targetPage) {
                targetPage.classList.add('active');
            }
            
            // Add active to clicked nav item
            const targetNav = Array.from(navItems).find(item => 
                item.textContent.toLowerCase().replace(/\s+/g, '-') === pageId ||
                item.onclick?.toString().includes(pageId)
            );
            if (targetNav) {
                targetNav.classList.add('active');
            }
        }
        
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
                            document.getElementById('userName').textContent = 'Welcome, ' + currentUser.name;
                            
                            // Show admin-only navigation items for admins
                            const adminOnlyItems = document.querySelectorAll('.admin-only');
                            if (currentUser.role === 'admin') {
                                adminOnlyItems.forEach(item => {
                                    item.style.display = 'block';
                                });
                            }
                            
                            // Initialize dashboard
                            showPage('dashboard');
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