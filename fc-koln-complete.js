const http = require('http');
const url = require('url');
const path = require('path');
const fs = require('fs');

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
        }
        
        .login-subtitle {
            color: #666666;
            font-size: 18px;
            margin-bottom: 50px;
            font-weight: 400;
        }
        
        .form-group {
            margin-bottom: 1.5rem;
            text-align: left;
        }
        
        .form-group label {
            display: block;
            margin-bottom: 0.5rem;
            font-weight: 600;
            color: #374151;
        }
        
        .form-group input {
            width: 100%;
            padding: 12px 16px;
            border: 2px solid #e5e7eb;
            border-radius: 8px;
            font-size: 16px;
            transition: border-color 0.2s;
        }
        
        .form-group input:focus {
            outline: none;
            border-color: #dc2626;
        }
        
        .btn {
            width: 100%;
            background: #dc2626;
            color: white;
            border: none;
            padding: 14px 20px;
            border-radius: 8px;
            font-size: 16px;
            font-weight: 600;
            cursor: pointer;
            transition: background-color 0.2s;
        }
        
        .btn:hover {
            background: #b91c1c;
        }
        
        /* Main App */
        #mainApp {
            display: none;
        }
        
        .header {
            background: white;
            border-bottom: 1px solid #e5e7eb;
            padding: 1rem 2rem;
            display: flex;
            justify-content: space-between;
            align-items: center;
        }
        
        .logo {
            height: 40px;
        }
        
        .nav {
            display: flex;
            gap: 2rem;
        }
        
        .nav-item {
            padding: 0.5rem 1rem;
            background: none;
            border: none;
            color: #6b7280;
            cursor: pointer;
            border-radius: 6px;
            transition: all 0.2s;
        }
        
        .nav-item:hover, .nav-item.active {
            background: #dc2626;
            color: white;
        }
        
        .user-info {
            display: flex;
            align-items: center;
            gap: 1rem;
        }
        
        .page {
            display: none;
            padding: 2rem;
        }
        
        .page.active {
            display: block;
        }
        
        .dashboard-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
            gap: 2rem;
            margin-bottom: 2rem;
        }
        
        .card {
            background: white;
            border-radius: 12px;
            padding: 2rem;
            box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
        }
        
        .card h3 {
            color: #dc2626;
            margin-bottom: 1rem;
        }
        
        .grocery-section {
            background: white;
            border-radius: 12px;
            padding: 2rem;
            margin-bottom: 2rem;
        }
        
        .grocery-item {
            display: flex;
            align-items: center;
            padding: 1rem;
            border-bottom: 1px solid #f3f4f6;
        }
        
        .grocery-item:last-child {
            border-bottom: none;
        }
        
        .item-name {
            flex: 1;
            font-weight: 500;
        }
        
        .item-price {
            color: #dc2626;
            font-weight: 600;
            margin-left: 1rem;
        }
        
        .qty {
            margin-left: 0.5rem;
            color: #6b7280;
        }
        
        .order-total {
            background: #fef2f2;
            border: 2px solid #fecaca;
            border-radius: 8px;
            padding: 1rem;
            margin-top: 2rem;
            text-align: center;
        }
        
        .total-amount {
            font-size: 1.5rem;
            font-weight: 700;
            color: #dc2626;
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
    <div id="mainApp">
        <header class="header">
            <img src="attached_assets/NewCologneLogo_1753281112388.png" alt="1.FC Köln Logo" class="logo">
            <nav class="nav">
                <button class="nav-item active" onclick="showPage('dashboard')">Dashboard</button>
                <button class="nav-item" onclick="showPage('players')">Players</button>
                <button class="nav-item" onclick="showPage('food-orders')">Food Orders</button>
                <button class="nav-item" onclick="showPage('communications')">Communications</button>
            </nav>
            <div class="user-info">
                <span id="userName">Welcome</span>
                <button class="btn" onclick="logout()">Logout</button>
            </div>
        </header>

        <!-- Dashboard Page -->
        <div id="dashboard" class="page active">
            <h2>Dashboard</h2>
            <div class="dashboard-grid">
                <div class="card">
                    <h3>Player Overview</h3>
                    <p>Total Players: <strong>6</strong></p>
                    <p>Active: <strong>5</strong></p>
                    <p>Injured: <strong>1</strong></p>
                </div>
                <div class="card">
                    <h3>System Status</h3>
                    <p>All systems operational</p>
                    <p>Last updated: <span id="lastUpdate"></span></p>
                </div>
            </div>
        </div>

        <!-- Players Page -->
        <div id="players" class="page">
            <h2>Players</h2>
            <div class="card">
                <h3>Player Management</h3>
                <p>Manage player profiles, contracts, and status updates.</p>
                <div style="margin-top: 1rem;">
                    <div style="padding: 1rem; border: 1px solid #e5e7eb; border-radius: 8px; margin-bottom: 1rem;">
                        <strong>Max Finkgräfe</strong> - Forward (Active)
                    </div>
                    <div style="padding: 1rem; border: 1px solid #e5e7eb; border-radius: 8px; margin-bottom: 1rem;">
                        <strong>Tim Lemperle</strong> - Midfielder (Active)
                    </div>
                    <div style="padding: 1rem; border: 1px solid #e5e7eb; border-radius: 8px; margin-bottom: 1rem;">
                        <strong>Timo Horn</strong> - Goalkeeper (Active)
                    </div>
                </div>
            </div>
        </div>

        <!-- Food Orders Page -->
        <div id="food-orders" class="page">
            <h2>Food Orders</h2>
            <div class="grocery-section">
                <h3>Real Grocery Shopping List</h3>
                <p>Select items for your grocery order. Orders are processed Tuesday/Friday.</p>
                
                <div class="grocery-item">
                    <input type="checkbox" onchange="updateTotal()">
                    <span class="item-name">Bananas</span>
                    <span class="qty">x1 kg</span>
                    <span class="item-price">€2.49</span>
                </div>
                <div class="grocery-item">
                    <input type="checkbox" onchange="updateTotal()">
                    <span class="item-name">Chicken Breast</span>
                    <span class="qty">x500g</span>
                    <span class="item-price">€5.99</span>
                </div>
                <div class="grocery-item">
                    <input type="checkbox" onchange="updateTotal()">
                    <span class="item-name">Whole Milk</span>
                    <span class="qty">x1 L</span>
                    <span class="item-price">€1.29</span>
                </div>
                <div class="grocery-item">
                    <input type="checkbox" onchange="updateTotal()">
                    <span class="item-name">Rice (Basmati)</span>
                    <span class="qty">x1 kg</span>
                    <span class="item-price">€3.49</span>
                </div>
                <div class="grocery-item">
                    <input type="checkbox" onchange="updateTotal()">
                    <span class="item-name">Olive Oil</span>
                    <span class="qty">x500ml</span>
                    <span class="item-price">€4.99</span>
                </div>
                
                <div class="order-total">
                    <div>Order Total: <span class="total-amount" id="orderTotal">€0.00</span></div>
                    <button class="btn" onclick="submitOrder()" style="margin-top: 1rem; width: auto; padding: 0.5rem 2rem;">Submit Order</button>
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
    </div>

    <script>
        let currentUser = null;

        // Login functionality
        document.addEventListener('DOMContentLoaded', function() {
            const loginForm = document.getElementById('loginForm');
            if (loginForm) {
                loginForm.addEventListener('submit', function(e) {
                    e.preventDefault();
                    
                    const email = document.getElementById('email').value.trim();
                    const password = document.getElementById('password').value;
                    const messageDiv = document.getElementById('loginMessage');
                    
                    if (messageDiv) messageDiv.innerHTML = '';
                    
                    if (password === 'ITP2024') {
                        let userData = null;
                        
                        if (email === 'max.bisinger@warubi-sports.com') {
                            userData = { name: 'Max Bisinger', email: email, role: 'admin' };
                        } else if (email === 'thomas.ellinger@warubi-sports.com') {
                            userData = { name: 'Thomas Ellinger', email: email, role: 'staff' };
                        } else {
                            if (messageDiv) messageDiv.innerHTML = '<div style="color: #dc2626; margin-top: 1rem;">Email not recognized. Please try again.</div>';
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
                        if (messageDiv) messageDiv.innerHTML = '<div style="color: #dc2626; margin-top: 1rem;">Invalid password. Please try again.</div>';
                    }
                });
            }
            
            // Check for existing login
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
            
            // Initialize last update time
            const lastUpdateEl = document.getElementById('lastUpdate');
            if (lastUpdateEl) {
                lastUpdateEl.textContent = new Date().toLocaleTimeString();
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
            // Hide all pages
            const pages = document.querySelectorAll('.page');
            pages.forEach(page => page.classList.remove('active'));
            
            // Remove active from nav items
            const navItems = document.querySelectorAll('.nav-item');
            navItems.forEach(item => item.classList.remove('active'));
            
            // Show selected page
            const targetPage = document.getElementById(pageId);
            if (targetPage) targetPage.classList.add('active');
            
            // Add active to clicked nav item
            if (event && event.target) {
                event.target.classList.add('active');
            }
        }

        // Logout
        function logout() {
            currentUser = null;
            localStorage.removeItem('fc-koln-auth');
            document.getElementById('loginPage').style.display = 'block';
            document.getElementById('mainApp').style.display = 'none';
            
            // Reset form
            const emailEl = document.getElementById('email');
            const passwordEl = document.getElementById('password');
            const messageEl = document.getElementById('loginMessage');
            
            if (emailEl) emailEl.value = 'max.bisinger@warubi-sports.com';
            if (passwordEl) passwordEl.value = 'ITP2024';
            if (messageEl) messageEl.innerHTML = '';
        }

        // Grocery functions
        function updateTotal() {
            let total = 0;
            const checkboxes = document.querySelectorAll('#food-orders input[type="checkbox"]:checked');
            
            checkboxes.forEach(checkbox => {
                const priceText = checkbox.closest('.grocery-item').querySelector('.item-price').textContent;
                const price = parseFloat(priceText.replace('€', ''));
                total += price;
            });
            
            const totalEl = document.getElementById('orderTotal');
            if (totalEl) {
                totalEl.textContent = '€' + total.toFixed(2);
            }
        }

        function submitOrder() {
            const checkedItems = document.querySelectorAll('#food-orders input[type="checkbox"]:checked');
            
            if (checkedItems.length === 0) {
                alert('Please select at least one item before submitting your order.');
                return;
            }
            
            let orderItems = [];
            let total = 0;
            
            checkedItems.forEach(checkbox => {
                const itemRow = checkbox.closest('.grocery-item');
                const itemName = itemRow.querySelector('.item-name').textContent;
                const price = parseFloat(itemRow.querySelector('.item-price').textContent.replace('€', ''));
                
                orderItems.push(itemName);
                total += price;
            });
            
            alert('Grocery order submitted successfully!\\n\\nItems: ' + orderItems.length + '\\nTotal: €' + total.toFixed(2) + '\\n\\nYour order will be processed for the next available delivery slot.');
            
            // Clear selections
            checkedItems.forEach(checkbox => {
                checkbox.checked = false;
            });
            updateTotal();
        }

        // Communication functions
        function sendMessage() {
            alert('Message system - Send targeted messages to team members');
        }

        function sendAlert() {
            if (confirm('Send emergency alert to all team members?')) {
                alert('Emergency alert sent to all team members');
            }
        }

        console.log('1.FC Köln Bundesliga Talent Program loaded successfully');
    </script>
</body>
</html>`;

const server = http.createServer((req, res) => {
    const parsedUrl = url.parse(req.url, true);
    
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
    console.log('Complete system with Dashboard, Players, Food Orders, Communications');
    console.log('Server ready at http://0.0.0.0:' + PORT);
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