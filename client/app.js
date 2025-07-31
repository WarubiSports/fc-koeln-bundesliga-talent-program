// 1.FC Köln Bundesliga Talent Program - Client-side JavaScript
// This file contains all the application logic, now safely separated from template literals

// Global variables
let currentUser = null;
let currentCalendarView = 'week';
let currentCalendarDate = new Date();

// Sample data - this would come from the backend in a real application
const samplePlayers = [
    { id: 1, name: 'Max Müller', age: 19, position: 'Midfielder', house: 'W1', status: 'Active', performance: 92 },
    { id: 2, name: 'Leon Schmidt', age: 18, position: 'Forward', house: 'W1', status: 'Active', performance: 88 },
    { id: 3, name: 'Tim Weber', age: 20, position: 'Defender', house: 'W1', status: 'Active', performance: 85 },
    { id: 4, name: 'Jonas Becker', age: 19, position: 'Midfielder', house: 'W2', status: 'Active', performance: 90 },
    { id: 5, name: 'Lukas Fischer', age: 18, position: 'Goalkeeper', house: 'W2', status: 'Active', performance: 87 },
    { id: 6, name: 'David Klein', age: 20, position: 'Forward', house: 'W2', status: 'Active', performance: 89 },
    { id: 7, name: 'Felix Wagner', age: 19, position: 'Defender', house: 'W3', status: 'Active', performance: 86 },
    { id: 8, name: 'Niklas Richter', age: 18, position: 'Midfielder', house: 'W3', status: 'Active', performance: 83 }
];

const sampleChores = [
    { id: 1, title: 'Kitchen Deep Clean', assignedTo: 'Max Müller', house: 'W1', deadline: '2025-08-02', priority: 'High', status: 'Pending' },
    { id: 2, title: 'Bathroom Maintenance', assignedTo: 'Leon Schmidt', house: 'W1', deadline: '2025-08-01', priority: 'Medium', status: 'In Progress' },
    { id: 3, title: 'Common Area Organization', assignedTo: 'W2 House', house: 'W2', deadline: '2025-08-03', priority: 'Low', status: 'Pending' },
    { id: 4, title: 'Laundry Room Cleaning', assignedTo: 'Tim Weber', house: 'W1', deadline: '2025-07-31', priority: 'Urgent', status: 'Overdue' }
];

// Authentication Functions - CRITICAL: These must remain globally accessible
window.showAuthTab = function(tab) {
    const loginTab = document.getElementById('loginTab');
    const registerTab = document.getElementById('registerTab');
    const forgotTab = document.getElementById('forgotPasswordTab');
    
    // Hide all tabs
    if (loginTab) loginTab.style.display = 'none';
    if (registerTab) registerTab.style.display = 'none';
    if (forgotTab) forgotTab.style.display = 'none';
    
    // Show selected tab
    if (tab === 'login' && loginTab) {
        loginTab.style.display = 'block';
    } else if (tab === 'register' && registerTab) {
        registerTab.style.display = 'block';
    } else if (tab === 'forgot' && forgotTab) {
        forgotTab.style.display = 'block';
    }
    
    // Update tab buttons
    document.querySelectorAll('.auth-tab-btn').forEach(btn => btn.classList.remove('active'));
    const activeBtn = document.querySelector('[onclick*="showAuthTab"][onclick*="' + tab + '"]');
    if (activeBtn) activeBtn.classList.add('active');
};

window.showForgotPassword = function() {
    window.showAuthTab('forgot');
};

window.showPage = function(pageId) {
    const pages = document.querySelectorAll('.page');
    const navItems = document.querySelectorAll('.nav-item');
    
    pages.forEach(page => page.classList.remove('active'));
    navItems.forEach(item => item.classList.remove('active'));
    
    const targetPage = document.getElementById(pageId);
    if (targetPage) targetPage.classList.add('active');
    
    const targetNav = document.querySelector('[onclick*="showPage"][onclick*="' + pageId + '"]');
    if (targetNav) targetNav.classList.add('active');
    
    // Load page-specific content
    loadPageContent(pageId);
};

window.logout = function() {
    currentUser = null;
    localStorage.removeItem('fc-koln-auth');
    document.getElementById('authScreen').style.display = 'flex';
    document.getElementById('mainApp').style.display = 'none';
    
    // Reset form
    document.getElementById('email').value = 'max.bisinger@warubi-sports.com';
    document.getElementById('password').value = 'ITP2024';
    document.getElementById('loginMessage').innerHTML = '';
    
    console.log('User logged out successfully');
};

// Authentication System Initialization
function initializeAuthenticationSystem() {
    console.log('Initializing Authentication System - Permanent Stabilization Protocol');
    
    // Verification system - ensures all critical functions are accessible
    const criticalFunctions = ['showAuthTab', 'showForgotPassword', 'showPage', 'logout'];
    let systemStable = true;
    
    criticalFunctions.forEach(funcName => {
        if (typeof window[funcName] !== 'function') {
            console.error('CRITICAL FAILURE: ' + funcName + ' not accessible');
            systemStable = false;
        } else {
            console.log('Verified accessible: ' + funcName);
        }
    });
    
    if (systemStable) {
        console.log('Authentication System: STABLE & PROTECTED');
    } else {
        console.error('AUTHENTICATION SYSTEM COMPROMISED');
    }
    
    return systemStable;
}

// Advanced Protection System
function initializeAdvancedProtection() {
    // Backup authentication functions in closure for emergency restoration
    const authBackup = {
        showAuthTab: window.showAuthTab,
        showForgotPassword: window.showForgotPassword,  
        showPage: window.showPage,
        logout: window.logout
    };
    
    // Monitor for function loss every 3 seconds
    setInterval(() => {
        const criticalFunctions = ['showAuthTab', 'showForgotPassword', 'showPage', 'logout'];
        let functionsLost = false;
        
        criticalFunctions.forEach(funcName => {
            if (typeof window[funcName] !== 'function') {
                console.error('EMERGENCY: ' + funcName + ' lost, restoring from backup');
                window[funcName] = authBackup[funcName];
                functionsLost = true;
            }
        });
        
        if (functionsLost) {
            console.log('Authentication functions restored from emergency backup');
        }
    }, 3000);
    
    // Protect against page reload auth loss
    window.addEventListener('beforeunload', () => {
        localStorage.setItem('auth-functions-backup', JSON.stringify({
            timestamp: Date.now(),
            functions: Object.keys(authBackup)
        }));
    });
    
    console.log('Advanced authentication protection active');
}

// Login form handler
function handleLogin(event) {
    event.preventDefault();
    
    const email = document.getElementById('email').value.trim();
    const password = document.getElementById('password').value.trim();
    const messageDiv = document.getElementById('loginMessage');
    
    // Simple authentication check
    if ((email === 'max.bisinger@warubi-sports.com' && password === 'ITP2024') ||
        (email === 'thomas.ellinger@warubi-sports.com' && password === 'ITP2024')) {
        
        currentUser = {
            email: email,
            role: email === 'max.bisinger@warubi-sports.com' ? 'admin' : 'staff',
            name: email === 'max.bisinger@warubi-sports.com' ? 'Max Bisinger' : 'Thomas Ellinger'
        };
        
        localStorage.setItem('fc-koln-auth', JSON.stringify(currentUser));
        
        document.getElementById('authScreen').style.display = 'none';
        document.getElementById('mainApp').style.display = 'block';
        document.getElementById('userWelcome').textContent = 'Welcome, ' + currentUser.name;
        
        // Show/hide admin elements
        const adminElements = document.querySelectorAll('.admin-only');
        const staffElements = document.querySelectorAll('.staff-only');
        
        if (currentUser.role === 'admin') {
            adminElements.forEach(el => el.style.display = '');
            staffElements.forEach(el => el.style.display = '');
        } else if (currentUser.role === 'staff') {
            adminElements.forEach(el => el.style.display = 'none');
            staffElements.forEach(el => el.style.display = '');
        }
        
        // Load initial page content
        loadPageContent('dashboard');
        
        messageDiv.innerHTML = '';
    } else {
        messageDiv.innerHTML = '<div style="color: #dc2626; margin-top: 1rem;">Invalid credentials. Please try again.</div>';
    }
}

// Registration form handler
function handleRegistration(event) {
    event.preventDefault();
    
    const messageDiv = document.getElementById('registerMessage');
    const fullName = document.getElementById('regFullName').value.trim();
    
    if (fullName) {
        messageDiv.innerHTML = '<div style="color: #22c55e; margin-top: 1rem; padding: 1rem; background: #f0fdf4; border-radius: 6px;">Application submitted successfully! You will receive an email confirmation within 24 hours.</div>';
        document.getElementById('registerForm').reset();
    }
}

// Forgot password form handler
function handleForgotPassword(event) {
    event.preventDefault();
    
    const email = document.getElementById('forgotEmail').value.trim();
    const messageDiv = document.getElementById('forgotPasswordMessage');
    
    if (email) {
        messageDiv.innerHTML = '<div style="color: #22c55e; margin-top: 1rem; padding: 1rem; background: #f0fdf4; border-radius: 6px;">Password reset instructions have been sent to ' + email + '. Please check your email.</div>';
        document.getElementById('forgotEmail').value = '';
    } else {
        messageDiv.innerHTML = '<div style="color: #dc2626; margin-top: 1rem;">Please enter your email address.</div>';
    }
}

// Page content loading
function loadPageContent(pageId) {
    switch(pageId) {
        case 'players':
            loadPlayersContent();
            break;
        case 'house-management':
            loadHouseManagementContent();
            break;
        case 'food-orders':
            loadFoodOrdersContent();
            break;
        case 'communications':
            loadCommunicationsContent();
            break;
        case 'calendar':
            loadCalendarContent();
            break;
        case 'admin':
            loadAdminContent();
            break;
    }
}

// Load players content
function loadPlayersContent() {
    const playersGrid = document.querySelector('.players-grid');
    if (!playersGrid) return;
    
    playersGrid.innerHTML = samplePlayers.map(player => `
        <div class="player-card" data-player-id="${player.id}">
            <div class="player-card-header">
                <div class="player-info">
                    <h3>${player.name}</h3>
                    <div class="player-details">
                        <span class="player-position">${player.position}</span>
                        <span class="player-age">Age ${player.age}</span>
                        <span class="player-house">House ${player.house}</span>
                    </div>
                </div>
                <div class="player-status status-${player.status.toLowerCase()}">
                    ${player.status}
                </div>
            </div>
            <div class="player-card-body">
                <div class="performance-indicator">
                    <span class="performance-label">Performance</span>
                    <div class="performance-bar">
                        <div class="performance-fill" style="width: ${player.performance}%"></div>
                    </div>
                    <span class="performance-score">${player.performance}%</span>
                </div>
            </div>
            <div class="player-card-actions">
                <button class="btn btn-secondary btn-sm" onclick="editPlayer(${player.id})">Edit</button>
                <button class="btn btn-secondary btn-sm" onclick="viewPlayerProfile(${player.id})">View Profile</button>
            </div>
        </div>
    `).join('');
}

// Load house management content
function loadHouseManagementContent() {
    const choresContent = document.querySelector('.chores-content');
    if (!choresContent) return;
    
    choresContent.innerHTML = `
        <div class="chores-grid">
            ${sampleChores.map(chore => `
                <div class="chore-card priority-${chore.priority.toLowerCase()} status-${chore.status.toLowerCase().replace(' ', '-')}">
                    <div class="chore-header">
                        <h3>${chore.title}</h3>
                        <span class="chore-priority">${chore.priority}</span>
                    </div>
                    <div class="chore-details">
                        <div class="chore-assignee">
                            <strong>Assigned to:</strong> ${chore.assignedTo}
                        </div>
                        <div class="chore-house">
                            <strong>House:</strong> ${chore.house}
                        </div>
                        <div class="chore-deadline">
                            <strong>Deadline:</strong> ${new Date(chore.deadline).toLocaleDateString()}
                        </div>
                        <div class="chore-status">
                            <strong>Status:</strong> ${chore.status}
                        </div>
                    </div>
                    <div class="chore-actions">
                        <button class="btn btn-sm btn-secondary" onclick="editChore(${chore.id})">Edit</button>
                        <button class="btn btn-sm btn-success" onclick="markChoreComplete(${chore.id})">Complete</button>
                    </div>
                </div>
            `).join('')}
        </div>
    `;
}

// Load food orders content
function loadFoodOrdersContent() {
    const foodOrdersContent = document.querySelector('.food-orders-content');
    if (!foodOrdersContent) return;
    
    const currentBudget = 35.00;
    const usedBudget = 12.50;
    const remainingBudget = currentBudget - usedBudget;
    
    foodOrdersContent.innerHTML = `
        <div class="budget-overview">
            <div class="budget-card">
                <h3>Your Food Budget</h3>
                <div class="budget-details">
                    <div class="budget-item">
                        <span>Total Budget:</span>
                        <span class="budget-amount">€${currentBudget.toFixed(2)}</span>
                    </div>
                    <div class="budget-item">
                        <span>Used:</span>
                        <span class="budget-used">€${usedBudget.toFixed(2)}</span>
                    </div>
                    <div class="budget-item">
                        <span>Remaining:</span>
                        <span class="budget-remaining">€${remainingBudget.toFixed(2)}</span>
                    </div>
                </div>
                <div class="budget-progress">
                    <div class="budget-bar">
                        <div class="budget-fill" style="width: ${(usedBudget/currentBudget)*100}%"></div>
                    </div>
                </div>
            </div>
        </div>
        
        <div class="delivery-schedule">
            <h3>Delivery Schedule</h3>
            <div class="delivery-info">
                <div class="delivery-day">
                    <strong>Tuesday Delivery:</strong> Order by Monday 12:00 AM
                </div>
                <div class="delivery-day">
                    <strong>Friday Delivery:</strong> Order by Thursday 12:00 AM
                </div>
            </div>
        </div>
        
        <div class="food-ordering-section">
            <h3>Place Your Order</h3>
            <div class="food-categories">
                <button class="category-btn active" onclick="showFoodCategory('groceries')">Groceries</button>
                <button class="category-btn" onclick="showFoodCategory('snacks')">Snacks</button>
                <button class="category-btn" onclick="showFoodCategory('beverages')">Beverages</button>
            </div>
            
            <div class="food-items" id="foodItems">
                <!-- Food items will be loaded here -->
            </div>
            
            <div class="order-summary">
                <h4>Your Current Order</h4>
                <div id="orderItems">
                    <p>No items in your order yet.</p>
                </div>
                <div class="order-total">
                    <strong>Total: €0.00</strong>
                </div>
                <button class="btn btn-primary" onclick="submitFoodOrder()">Submit Order</button>
            </div>
        </div>
    `;
}

// Load communications content
function loadCommunicationsContent() {
    const chatMessages = document.getElementById('chatMessages');
    if (!chatMessages) return;
    
    const sampleMessages = [
        { sender: 'Thomas Ellinger', message: 'Good morning everyone! Training starts at 9 AM sharp.', time: '08:30', type: 'staff' },
        { sender: 'Max Müller', message: 'Got it! See you on the field.', time: '08:32', type: 'player' },
        { sender: 'Leon Schmidt', message: 'Can someone help me with the gym equipment setup?', time: '08:45', type: 'player' },
        { sender: 'You', message: 'I can help with that Leon!', time: '08:46', type: 'own' }
    ];
    
    chatMessages.innerHTML = sampleMessages.map(msg => `
        <div class="message ${msg.type}">
            <div class="message-sender">${msg.sender}</div>
            <div class="message-content">${msg.message}</div>
            <div class="message-time">${msg.time}</div>
        </div>
    `).join('');
    
    // Scroll to bottom
    chatMessages.scrollTop = chatMessages.scrollHeight;
}

// Load calendar content
function loadCalendarContent() {
    const calendarContent = document.querySelector('.calendar-content');
    if (!calendarContent) return;
    
    calendarContent.innerHTML = `
        <div class="calendar-view" id="calendarView">
            <div class="calendar-header">
                <button class="btn btn-secondary" onclick="navigateCalendar(-1)">‹ Previous</button>
                <h3 id="calendarTitle">${formatCalendarTitle()}</h3>
                <button class="btn btn-secondary" onclick="navigateCalendar(1)">Next ›</button>
            </div>
            
            <div class="calendar-grid">
                ${generateCalendarGrid()}
            </div>
        </div>
    `;
}

// Load admin content
function loadAdminContent() {
    showAdminTab('users');
}

// Utility functions
function showAddPlayerForm() {
    alert('Add Player form would open here');
}

function editPlayer(playerId) {
    alert('Edit player ' + playerId + ' form would open here');
}

function viewPlayerProfile(playerId) {
    alert('Player ' + playerId + ' profile would open here');
}

function showCreateChoreForm() {
    alert('Create chore form would open here');
}

function editChore(choreId) {
    alert('Edit chore ' + choreId + ' form would open here');
}

function markChoreComplete(choreId) {
    if (confirm('Mark this chore as complete?')) {
        alert('Chore ' + choreId + ' marked as complete');
    }
}

function showFoodCategory(category) {
    document.querySelectorAll('.category-btn').forEach(btn => btn.classList.remove('active'));
    event.target.classList.add('active');
    
    const foodItems = document.getElementById('foodItems');
    if (foodItems) {
        foodItems.innerHTML = '<p>Loading ' + category + '...</p>';
    }
}

function submitFoodOrder() {
    alert('Food order submitted successfully!');
}

function sendMessage() {
    const messageInput = document.getElementById('messageInput');
    if (messageInput && messageInput.value.trim()) {
        const chatMessages = document.getElementById('chatMessages');
        if (chatMessages) {
            const messageDiv = document.createElement('div');
            messageDiv.className = 'message own';
            messageDiv.innerHTML = `
                <div class="message-sender">You</div>
                <div class="message-content">${messageInput.value}</div>
                <div class="message-time">${new Date().toLocaleTimeString('en-US', {hour: '2-digit', minute:'2-digit'})}</div>
            `;
            chatMessages.appendChild(messageDiv);
            chatMessages.scrollTop = chatMessages.scrollHeight;
        }
        messageInput.value = '';
    }
}

function changeCalendarView(view) {
    currentCalendarView = view;
    document.querySelectorAll('.calendar-controls .btn').forEach(btn => btn.classList.remove('active'));
    event.target.classList.add('active');
    loadCalendarContent();
}

function navigateCalendar(direction) {
    if (currentCalendarView === 'month') {
        currentCalendarDate.setMonth(currentCalendarDate.getMonth() + direction);
    } else if (currentCalendarView === 'week') {
        currentCalendarDate.setDate(currentCalendarDate.getDate() + (direction * 7));
    } else {
        currentCalendarDate.setDate(currentCalendarDate.getDate() + direction);
    }
    loadCalendarContent();
}

function formatCalendarTitle() {
    const options = { year: 'numeric', month: 'long' };
    if (currentCalendarView === 'week') {
        return `Week of ${currentCalendarDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`;
    } else if (currentCalendarView === 'day') {
        return currentCalendarDate.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
    }
    return currentCalendarDate.toLocaleDateString('en-US', options);
}

function generateCalendarGrid() {
    return '<div class="calendar-placeholder">Calendar grid would be generated here based on current view</div>';
}

function showAdminTab(tabName) {
    document.querySelectorAll('.admin-tab-btn').forEach(btn => btn.classList.remove('active'));
    document.querySelectorAll('.admin-tab-content').forEach(content => content.style.display = 'none');
    
    event.target.classList.add('active');
    document.getElementById('admin' + tabName.charAt(0).toUpperCase() + tabName.slice(1) + 'Tab').style.display = 'block';
}

function closeModal() {
    document.getElementById('modalOverlay').style.display = 'none';
}

// Initialize application
document.addEventListener('DOMContentLoaded', function() {
    console.log('1.FC Köln Bundesliga Talent Program loaded successfully');
    console.log('Complete application with Dashboard, Players, Chores, Calendar, Food Orders, Communications, House Management, and Admin');
    
    // Initialize authentication system
    const authSystemStable = initializeAuthenticationSystem();
    initializeAdvancedProtection();
    
    // Set up form handlers
    const loginForm = document.getElementById('loginForm');
    if (loginForm) {
        loginForm.addEventListener('submit', handleLogin);
    }
    
    const registerForm = document.getElementById('registerForm');
    if (registerForm) {
        registerForm.addEventListener('submit', handleRegistration);
    }
    
    const forgotPasswordForm = document.getElementById('forgotPasswordForm');
    if (forgotPasswordForm) {
        forgotPasswordForm.addEventListener('submit', handleForgotPassword);
    }
    
    // Check for existing authentication
    const savedAuth = localStorage.getItem('fc-koln-auth');
    if (savedAuth) {
        try {
            currentUser = JSON.parse(savedAuth);
            document.getElementById('authScreen').style.display = 'none';
            document.getElementById('mainApp').style.display = 'block';
            document.getElementById('userWelcome').textContent = 'Welcome, ' + currentUser.name;
            
            // Show/hide admin elements
            const adminElements = document.querySelectorAll('.admin-only');
            const staffElements = document.querySelectorAll('.staff-only');
            
            if (currentUser.role === 'admin') {
                adminElements.forEach(el => el.style.display = '');
                staffElements.forEach(el => el.style.display = '');
            } else if (currentUser.role === 'staff') {
                adminElements.forEach(el => el.style.display = 'none');
                staffElements.forEach(el => el.style.display = '');
            }
            
            loadPageContent('dashboard');
        } catch (e) {
            localStorage.removeItem('fc-koln-auth');
        }
    }
    
    console.log('Enhanced features initialized successfully');
});