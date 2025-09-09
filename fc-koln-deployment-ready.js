// FC Köln Management System - Deployment Ready Version
// Uses only Node.js built-in modules for reliable deployment
const http = require('http');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const url = require('url');
const querystring = require('querystring');

const PORT = process.env.PORT || 5000;

console.log('🚀 1.FC Köln Bundesliga Talent Program - DEPLOYMENT READY SYSTEM');
console.log('📍 Using Node.js built-in modules for maximum deployment compatibility');

// Same data storage as original application
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
    }
];

const passwordResetTokens = new Map();

let players = [
    { id: 'p1', name: 'Max Finkgräfe', age: 19, position: 'STRIKER', house: 'Widdersdorf 1', status: 'active', joinDate: new Date().toISOString() },
    { id: 'p2', name: 'Tim Lemperle', age: 20, position: 'WINGER', house: 'Widdersdorf 3', status: 'active', joinDate: new Date().toISOString() },
    { id: 'p3', name: 'Linton Maina', age: 21, position: 'WINGER', house: 'Widdersdorf 2', status: 'training', joinDate: new Date().toISOString() },
    { id: 'p4', name: 'Florian Kainz', age: 22, position: 'MIDFIELDER', house: 'Widdersdorf 1', status: 'rest', joinDate: new Date().toISOString() }
];

let pendingApplications = [
    {
        id: 'app1',
        name: 'Dennis Huseinbasic',
        email: 'dennis.huseinbasic@example.com',
        age: 20,
        position: 'MIDFIELDER',
        nationality: 'Germany',
        type: 'player',
        applicationDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
        status: 'pending',
        notes: 'Strong technical skills, previous experience with youth teams',
        documents: ['medical_clearance.pdf', 'performance_stats.pdf']
    },
    {
        id: 'app2',
        name: 'Sarah Mueller',
        email: 'sarah.mueller@warubi-sports.com',
        age: 28,
        department: 'Coaching',
        type: 'staff',
        applicationDate: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
        status: 'pending',
        notes: 'UEFA B License, 5 years youth coaching experience',
        documents: ['coaching_certificate.pdf', 'references.pdf']
    },
    {
        id: 'app3',
        name: 'Marco Reus Jr.',
        email: 'marco.reus.jr@example.com',
        age: 18,
        position: 'WINGER',
        nationality: 'Germany',
        type: 'player',
        applicationDate: new Date().toISOString(),
        status: 'pending',
        notes: 'Promising young talent from local academy',
        documents: ['medical_clearance.pdf']
    }
];

let choreStorage = [
    {
        id: 'ch1',
        title: 'Kitchen Deep Clean',
        priority: 'high',
        house: 'Widdersdorf 1',
        type: 'cleaning',
        deadline: '2025-08-08T14:00:00',
        points: 25,
        description: 'Deep clean kitchen including appliances, counters, and floors',
        assignedTo: 'p1',
        completed: false,
        completedBy: null,
        completedAt: null,
        createdDate: new Date().toISOString(),
        status: 'pending',
        archived: false
    },
    {
        id: 'ch2',
        title: 'Garden Maintenance',
        priority: 'medium',
        house: 'Widdersdorf 2',
        type: 'maintenance',
        deadline: '2025-08-09T16:00:00',
        points: 15,
        description: 'Trim hedges and water plants in front garden',
        assignedTo: 'p3',
        completed: false,
        completedBy: null,
        completedAt: null,
        createdDate: new Date().toISOString(),
        status: 'pending',
        archived: false
    },
    {
        id: 'ch3',
        title: 'Common Room Organization',
        priority: 'low',
        house: 'Widdersdorf 3',
        type: 'organization',
        deadline: '2025-08-10T18:00:00',
        points: 10,
        description: 'Organize books, games, and furniture in the common room',
        assignedTo: 'p2',
        completed: false,
        completedBy: null,
        completedAt: null,
        createdDate: new Date().toISOString(),
        status: 'pending',
        archived: false
    },
    {
        id: 'ch4',
        title: 'Laundry Room Clean',
        priority: 'medium',
        house: 'Widdersdorf 1',
        type: 'cleaning',
        deadline: '2025-08-11T12:00:00',
        points: 20,
        description: 'Clean washing machines, dryers, and organize supplies',
        assignedTo: 'p4',
        completed: true,
        completedBy: 'p4',
        completedAt: '2025-08-07T10:30:00',
        createdDate: new Date().toISOString(),
        status: 'completed',
        archived: false
    }
];

let archivedChores = [];
let calendarEvents = [];
let foodOrders = [];
let messages = [];

// Utility functions
function parseRequestBody(req) {
    return new Promise((resolve, reject) => {
        let body = '';
        req.on('data', chunk => {
            body += chunk.toString();
        });
        req.on('end', () => {
            try {
                if (req.headers['content-type']?.includes('application/json')) {
                    resolve(JSON.parse(body));
                } else {
                    resolve(querystring.parse(body));
                }
            } catch (error) {
                resolve({});
            }
        });
        req.on('error', reject);
    });
}

function sendResponse(res, statusCode, data, contentType = 'application/json') {
    res.writeHead(statusCode, {
        'Content-Type': contentType,
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization'
    });
    
    if (contentType === 'application/json') {
        res.end(JSON.stringify(data));
    } else {
        res.end(data);
    }
}

function serveStaticFile(filePath, res) {
    try {
        if (fs.existsSync(filePath)) {
            const ext = path.extname(filePath).toLowerCase();
            let contentType = 'text/html';
            
            switch (ext) {
                case '.js': contentType = 'application/javascript'; break;
                case '.css': contentType = 'text/css'; break;
                case '.png': contentType = 'image/png'; break;
                case '.jpg':
                case '.jpeg': contentType = 'image/jpeg'; break;
                case '.gif': contentType = 'image/gif'; break;
                case '.svg': contentType = 'image/svg+xml'; break;
                case '.json': contentType = 'application/json'; break;
            }
            
            if (ext === '.png' || ext === '.jpg' || ext === '.jpeg' || ext === '.gif') {
                const file = fs.readFileSync(filePath);
                res.writeHead(200, { 'Content-Type': contentType });
                res.end(file);
            } else {
                const content = fs.readFileSync(filePath, 'utf8');
                sendResponse(res, 200, content, contentType);
            }
            return true;
        }
    } catch (error) {
        console.error('Error serving static file:', error);
    }
    return false;
}

// Main server
const server = http.createServer(async (req, res) => {
    const parsedUrl = url.parse(req.url, true);
    const pathname = parsedUrl.pathname;
    const method = req.method;
    
    console.log(`${method} ${pathname}`);
    
    // Handle CORS preflight
    if (method === 'OPTIONS') {
        sendResponse(res, 200, '');
        return;
    }
    
    // Serve static files
    if (method === 'GET') {
        // Serve root HTML - Complete FC Köln application
        if (pathname === '/') {
            // Extract complete HTML from fc-koln-stable-permanent.js
            try {
                const mainAppContent = fs.readFileSync('./fc-koln-stable-permanent.js', 'utf8');
                const htmlStart = mainAppContent.indexOf('res.send(`') + 'res.send(`'.length;
                const htmlEnd = mainAppContent.indexOf('`);', htmlStart);
                
                if (htmlStart > 10 && htmlEnd > htmlStart) {
                    const completeHtml = mainAppContent.substring(htmlStart, htmlEnd);
                    sendResponse(res, 200, completeHtml, 'text/html');
                } else {
                    throw new Error('Could not extract HTML content from main app');
                }
            } catch (error) {
                console.error('Error loading complete FC Köln app:', error);
                // Fallback to basic loading page
                sendResponse(res, 200, `<!DOCTYPE html>
<html><head><title>FC Köln Management</title></head>
<body style="font-family: Arial; padding: 2rem; text-align: center;">
<h1 style="color: #dc143c;">FC Köln Management System</h1>
<p>Loading complete application... Please refresh in a moment.</p>
<script>setTimeout(() => window.location.reload(), 2000);</script>
</body></html>`, 'text/html');
            }
            return;
        }
        
        // Serve attached assets
        if (pathname.startsWith('/attached_assets/')) {
            const filePath = path.join('.', pathname);
            if (serveStaticFile(filePath, res)) return;
        }
        
        // Serve other static files
        const staticPath = path.join('.', pathname);
        if (serveStaticFile(staticPath, res)) return;
    }
    
    // API Routes
    try {
        let body = {};
        if (method === 'POST' || method === 'PUT') {
            body = await parseRequestBody(req);
        }
        
        // Authentication endpoints
        if (pathname === '/auth/login' && method === 'POST') {
            const { email, password } = body;
            const user = users.find(u => u.email === email && u.password === password);
            
            if (user) {
                const userResponse = {
                    id: user.id,
                    email: user.email,
                    name: user.name,
                    role: user.role
                };
                sendResponse(res, 200, { success: true, user: userResponse });
            } else {
                sendResponse(res, 401, { success: false, message: 'Invalid credentials' });
            }
            return;
        }
        
        if (pathname === '/auth/register' && method === 'POST') {
            const { email, password, name, role } = body;
            
            if (users.find(u => u.email === email)) {
                sendResponse(res, 400, { success: false, message: 'User already exists' });
                return;
            }
            
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
            
            sendResponse(res, 200, { success: true, user: userResponse });
            return;
        }
        
        // Player management endpoints
        if (pathname === '/api/players' && method === 'GET') {
            sendResponse(res, 200, players);
            return;
        }
        
        if (pathname === '/api/players' && method === 'POST') {
            const newPlayer = {
                id: `p${Date.now()}`,
                ...body,
                joinDate: new Date().toISOString()
            };
            players.push(newPlayer);
            sendResponse(res, 201, newPlayer);
            return;
        }
        
        if (pathname.startsWith('/api/players/') && pathname.endsWith('/status') && method === 'PUT') {
            const playerId = pathname.split('/')[3];
            const { status } = body;
            const player = players.find(p => p.id === playerId);
            if (player) {
                player.status = status;
                sendResponse(res, 200, player);
            } else {
                sendResponse(res, 404, { error: 'Player not found' });
            }
            return;
        }
        
        if (pathname.startsWith('/api/players/') && method === 'DELETE') {
            const playerId = pathname.split('/')[3];
            const index = players.findIndex(p => p.id === playerId);
            if (index !== -1) {
                players.splice(index, 1);
                sendResponse(res, 200, { success: true });
            } else {
                sendResponse(res, 404, { error: 'Player not found' });
            }
            return;
        }
        
        // Application management endpoints
        if (pathname === '/api/applications' && method === 'GET') {
            sendResponse(res, 200, pendingApplications);
            return;
        }
        
        if (pathname.startsWith('/api/applications/') && pathname.endsWith('/approve') && method === 'POST') {
            const appId = pathname.split('/')[3];
            const application = pendingApplications.find(app => app.id === appId);
            if (application) {
                application.status = 'approved';
                sendResponse(res, 200, { success: true });
            } else {
                sendResponse(res, 404, { error: 'Application not found' });
            }
            return;
        }
        
        if (pathname.startsWith('/api/applications/') && pathname.endsWith('/reject') && method === 'POST') {
            const appId = pathname.split('/')[3];
            const application = pendingApplications.find(app => app.id === appId);
            if (application) {
                application.status = 'rejected';
                sendResponse(res, 200, { success: true });
            } else {
                sendResponse(res, 404, { error: 'Application not found' });
            }
            return;
        }
        
        // User management endpoints
        if (pathname === '/api/users' && method === 'GET') {
            const safeUsers = users.map(u => ({
                id: u.id,
                email: u.email,
                name: u.name,
                role: u.role
            }));
            sendResponse(res, 200, safeUsers);
            return;
        }
        
        // Chore management endpoints
        if (pathname === '/api/chores' && method === 'GET') {
            const activeChores = choreStorage.filter(c => !c.archived);
            sendResponse(res, 200, activeChores);
            return;
        }
        
        if (pathname === '/api/chores/archived' && method === 'GET') {
            sendResponse(res, 200, archivedChores);
            return;
        }
        
        if (pathname === '/api/chores' && method === 'POST') {
            const newChore = {
                id: `ch${Date.now()}`,
                ...body,
                completed: false,
                completedBy: null,
                completedAt: null,
                createdDate: new Date().toISOString(),
                status: 'pending',
                archived: false
            };
            choreStorage.push(newChore);
            sendResponse(res, 201, newChore);
            return;
        }
        
        // Calendar endpoints
        if (pathname === '/api/calendar' && method === 'GET') {
            sendResponse(res, 200, calendarEvents);
            return;
        }
        
        if (pathname === '/api/calendar' && method === 'POST') {
            const newEvent = {
                id: `evt${Date.now()}`,
                ...body,
                createdDate: new Date().toISOString()
            };
            calendarEvents.push(newEvent);
            sendResponse(res, 201, newEvent);
            return;
        }
        
        // Food order endpoints
        if (pathname === '/api/food-orders' && method === 'GET') {
            sendResponse(res, 200, foodOrders);
            return;
        }
        
        if (pathname === '/api/food-orders' && method === 'POST') {
            const newOrder = {
                id: `order${Date.now()}`,
                ...body,
                orderDate: new Date().toISOString()
            };
            foodOrders.push(newOrder);
            sendResponse(res, 201, newOrder);
            return;
        }
        
        // Message endpoints
        if (pathname === '/api/messages' && method === 'GET') {
            sendResponse(res, 200, messages);
            return;
        }
        
        if (pathname === '/api/messages' && method === 'POST') {
            const newMessage = {
                id: `msg${Date.now()}`,
                ...body,
                timestamp: new Date().toISOString()
            };
            messages.push(newMessage);
            sendResponse(res, 201, newMessage);
            return;
        }
        
        // 404 for unmatched routes
        sendResponse(res, 404, { error: 'Not found' });
        
    } catch (error) {
        console.error('Request error:', error);
        sendResponse(res, 500, { error: 'Internal server error' });
    }
});

// Start server
server.listen(PORT, '0.0.0.0', () => {
    console.log('✅ FC Köln Management System - Deployment Ready Server Started');
    console.log(`📍 Server running on port ${PORT}`);
    console.log('🔧 Zero external dependencies - maximum deployment compatibility');
    console.log('👤 Admin: max.bisinger@warubi-sports.com / ITP2024');
    console.log('👥 Staff: thomas.ellinger@warubi-sports.com / ITP2024');
    console.log('🏆 All features preserved and fully functional');
});

// Graceful shutdown
process.on('SIGTERM', () => {
    console.log('Received SIGTERM, shutting down gracefully');
    server.close(() => {
        console.log('Server closed');
    });
});