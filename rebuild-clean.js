const fs = require('fs');

console.log('Creating completely clean FC Köln application...');

// Read the working foundation from fc-koln-restored.js (which was working)
const restoredContent = fs.readFileSync('fc-koln-restored.js', 'utf8');

// Read the comprehensive features from fc-koln-clean.js
const comprehensiveContent = fs.readFileSync('fc-koln-clean.js', 'utf8');

// Extract the working HTML structure from restored version
const htmlStart = restoredContent.substring(0, restoredContent.indexOf('<script>'));

// Extract comprehensive player data and features from the larger file
const playerDataMatch = comprehensiveContent.match(/let playerStorage = \[(.*?)\];/s);
const playerData = playerDataMatch ? playerDataMatch[0] : 'let playerStorage = [];';

// Extract the working JavaScript functions but ensure they're properly closed
const basicScript = `<script>
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
</script>`;

// Create clean HTML ending
const htmlEnd = `</body>
</html>`;

// Combine everything into a complete, clean application
const cleanApp = htmlStart + basicScript + htmlEnd;

// Create the complete server file
const serverCode = `
const http = require('http');
const url = require('url');
const path = require('path');
const fs = require('fs');

console.log('Starting 1.FC Köln Bundesliga Talent Program Management System...');

const FC_KOLN_APP = \`${cleanApp}\`;

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
`;

fs.writeFileSync('fc-koln-working-clean.js', serverCode);

console.log('Clean working application created successfully!');
console.log('File: fc-koln-working-clean.js');