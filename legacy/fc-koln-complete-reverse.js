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

        <!-- Food Orders Page -->
        <div id="food-orders" class="page">
            <h2>Food Orders & Grocery Management</h2>
            
            <div class="card" style="margin-bottom: 2rem;">
                <h3>📅 Delivery Schedule</h3>
                <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 1rem;">
                    <div style="background: #f8fafc; padding: 1rem; border-radius: 8px; border-left: 4px solid #dc2626;">
                        <h4 style="color: #dc2626; margin-bottom: 0.5rem;">Tuesday Delivery</h4>
                        <p style="font-size: 0.9rem;">Order deadline: Monday 6 PM</p>
                        <p style="font-size: 0.9rem;">Delivery: Tuesday 8-10 AM</p>
                    </div>
                    <div style="background: #f8fafc; padding: 1rem; border-radius: 8px; border-left: 4px solid #dc2626;">
                        <h4 style="color: #dc2626; margin-bottom: 0.5rem;">Friday Delivery</h4>
                        <p style="font-size: 0.9rem;">Order deadline: Thursday 6 PM</p>
                        <p style="font-size: 0.9rem;">Delivery: Friday 8-10 AM</p>
                    </div>
                </div>
            </div>
            
            <div class="dashboard-grid">
                <div class="card">
                    <h3>🥬 Vegetables & Fruit</h3>
                    <div class="grocery-item">
                        <input type="checkbox" onchange="updateTotal()">
                        <span class="item-name">Bananas</span>
                        <span class="qty">x1 kg</span>
                        <span class="item-price">€2.49</span>
                    </div>
                    <div class="grocery-item">
                        <input type="checkbox" onchange="updateTotal()">
                        <span class="item-name">Organic Apples</span>
                        <span class="qty">x2 kg</span>
                        <span class="item-price">€4.98</span>
                    </div>
                    <div class="grocery-item">
                        <input type="checkbox" onchange="updateTotal()">
                        <span class="item-name">Fresh Spinach</span>
                        <span class="qty">x300g</span>
                        <span class="item-price">€2.19</span>
                    </div>
                    <div class="grocery-item">
                        <input type="checkbox" onchange="updateTotal()">
                        <span class="item-name">Cherry Tomatoes</span>
                        <span class="qty">x500g</span>
                        <span class="item-price">€3.29</span>
                    </div>
                </div>
                
                <div class="card">
                    <h3>🥩 Meat & Protein</h3>
                    <div class="grocery-item">
                        <input type="checkbox" onchange="updateTotal()">
                        <span class="item-name">Chicken Breast</span>
                        <span class="qty">x500g</span>
                        <span class="item-price">€5.99</span>
                    </div>
                    <div class="grocery-item">
                        <input type="checkbox" onchange="updateTotal()">
                        <span class="item-name">Ground Turkey</span>
                        <span class="qty">x400g</span>
                        <span class="item-price">€4.79</span>
                    </div>
                    <div class="grocery-item">
                        <input type="checkbox" onchange="updateTotal()">
                        <span class="item-name">Salmon Fillet</span>
                        <span class="qty">x300g</span>
                        <span class="item-price">€7.99</span>
                    </div>
                    <div class="grocery-item">
                        <input type="checkbox" onchange="updateTotal()">
                        <span class="item-name">Greek Yogurt</span>
                        <span class="qty">x2 cups</span>
                        <span class="item-price">€3.99</span>
                    </div>
                </div>
                
                <div class="card">
                    <h3>🥛 Dairy & Essentials</h3>
                    <div class="grocery-item">
                        <input type="checkbox" onchange="updateTotal()">
                        <span class="item-name">Whole Milk</span>
                        <span class="qty">x1 L</span>
                        <span class="item-price">€1.29</span>
                    </div>
                    <div class="grocery-item">
                        <input type="checkbox" onchange="updateTotal()">
                        <span class="item-name">Organic Eggs</span>
                        <span class="qty">x12 pcs</span>
                        <span class="item-price">€3.49</span>
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
                </div>
            </div>
            
            <div class="order-total">
                <div>Total Budget: <span style="color: #6b7280;">€50.00 weekly per house</span></div>
                <div>Current Order: <span class="total-amount" id="orderTotal">€0.00</span></div>
                <div style="margin-top: 1rem;">
                    <button class="btn" onclick="selectAllItems()" style="width: auto; margin-right: 0.5rem; background: #6b7280;">Select All</button>
                    <button class="btn" onclick="clearSelection()" style="width: auto; margin-right: 0.5rem; background: #6b7280;">Clear All</button>
                    <button class="btn" onclick="submitOrder()" style="width: auto; padding: 0.5rem 2rem;">Submit Order</button>
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
            
            // Show admin-only sections for admin users
            if (currentUser && currentUser.role === 'admin') {
                const adminElements = document.querySelectorAll('.admin-only');
                adminElements.forEach(element => {
                    element.style.display = 'block';
                });
            }
            
            // Show admin/staff features for admins and staff
            if (currentUser && (currentUser.role === 'admin' || currentUser.role === 'staff')) {
                const adminStaffElements = document.querySelectorAll('.admin-staff-only');
                adminStaffElements.forEach(element => {
                    element.style.display = 'block';
                });
            }
        }

        // Navigation
        window.showPage = function(pageId) {
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
        window.logout = function() {
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

        // Admin function definitions
        function systemMonitoring() {
            alert('System Monitoring - Real-time system health and performance metrics');
        }

        function userManagement() {
            alert('User Management - Manage user accounts, roles, and permissions');
        }

        function dataBackup() {
            if (confirm('Create system backup?')) {
                alert('System backup initiated - Data backup in progress');
            }
        }

        function editPlayer(playerId) {
            alert('Player Edit System - Opening detailed player profile editor for ' + playerId);
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