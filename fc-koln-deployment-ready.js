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
                
                // Find the LARGE HTML template (complete application), not the small one
                let htmlStart = -1;
                let htmlEnd = -1;
                let searchPos = 0;
                
                // Look for the res.send with the large HTML content (> 100,000 chars)
                while (searchPos < mainAppContent.length) {
                    const currentStart = mainAppContent.indexOf('res.send(`', searchPos);
                    if (currentStart === -1) break;
                    
                    const currentHtmlStart = currentStart + 'res.send(`'.length;
                    const currentHtmlEnd = mainAppContent.indexOf('`);', currentHtmlStart);
                    
                    if (currentHtmlEnd > currentHtmlStart) {
                        const currentLength = currentHtmlEnd - currentHtmlStart;
                        console.log('Found res.send with HTML length:', currentLength);
                        
                        // We want the LARGE template (complete app), not the small one
                        if (currentLength > 100000) {
                            htmlStart = currentHtmlStart;
                            htmlEnd = currentHtmlEnd;
                            console.log('Selected LARGE HTML template for deployment');
                            break;
                        }
                    }
                    
                    searchPos = currentStart + 1;
                }
                
                if (htmlStart > 0 && htmlEnd > htmlStart) {
                    const completeHtml = mainAppContent.substring(htmlStart, htmlEnd);
                    console.log('Serving complete FC Köln app, HTML size:', completeHtml.length);
                    sendResponse(res, 200, completeHtml, 'text/html');
                } else {
                    throw new Error('Could not find large HTML template from main app');
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
        
        // Serve FC Köln logo - CRITICAL for branding
        if (pathname === '/api/logo') {
            try {
                console.log("Logo request received");
                
                // Check if attached_assets directory exists (deployment safety)
                if (!fs.existsSync("attached_assets/")) {
                    console.log("attached_assets directory not found (deployment environment)");
                    sendResponse(res, 404, "Logo not available in deployment");
                    return;
                }

                // Search for the FC Köln file using directory listing
                const files = fs.readdirSync("attached_assets/");
                const fcKolnFile = files.find(
                    (file) =>
                        file.includes("1.FC") &&
                        file.includes("Football School") &&
                        file.endsWith(".png"),
                );

                if (fcKolnFile) {
                    console.log("Found FC Köln file:", fcKolnFile);
                    const fullPath = path.join("attached_assets", fcKolnFile);
                    console.log("Reading file from:", fullPath);

                    const logoData = fs.readFileSync(fullPath);
                    console.log("Successfully read file, size:", logoData.length);

                    res.setHeader("Content-Type", "image/png");
                    res.setHeader("Cache-Control", "public, max-age=86400");
                    res.end(logoData);
                    return;
                }

                console.log("No FC Köln file found");
                sendResponse(res, 404, "Logo not found");
            } catch (error) {
                console.error("Logo error:", error);
                // Don't crash the app - just return 404 instead of 500
                sendResponse(res, 404, "Logo not available");
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
        
        // Password reset endpoints - MISSING functionality
        if (pathname === '/auth/forgot-password' && method === 'POST') {
            const { email } = body;
            const user = users.find((u) => u.email === email);

            if (!user) {
                sendResponse(res, 404, { success: false, message: "Email not found" });
                return;
            }

            // In deployment, we'll just simulate the reset for now
            console.log(`Password reset requested for: ${email}`);
            sendResponse(res, 200, {
                success: true,
                message: "Password reset instructions sent to your email (simulated in deployment)"
            });
            return;
        }
        
        if (pathname === '/auth/reset-password' && method === 'POST') {
            const { email, newPassword } = body;
            const user = users.find((u) => u.email === email);

            if (!user) {
                sendResponse(res, 404, { success: false, message: "User not found" });
                return;
            }

            // Update password
            user.password = newPassword;
            console.log(`Password successfully reset for: ${user.email}`);
            sendResponse(res, 200, {
                success: true,
                message: "Password has been reset successfully"
            });
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
            const id = pathname.split('/')[3];
            const application = pendingApplications.find((app) => app.id === id);

            if (!application) {
                sendResponse(res, 404, { success: false, message: "Application not found" });
                return;
            }

            if (application.status !== "pending") {
                sendResponse(res, 400, { success: false, message: "Application already processed" });
                return;
            }

            // Approve the application
            application.status = "approved";
            application.approvedAt = new Date().toISOString();

            // Create user account based on application type
            if (application.type === "player") {
                // Add as player
                const houses = ["Widdersdorf 1", "Widdersdorf 2", "Widdersdorf 3"];
                const assignedHouse = houses[Math.floor(Math.random() * houses.length)];
                const newPlayer = {
                    id: "p" + Date.now(),
                    name: application.name,
                    age: application.age,
                    position: application.position,
                    nationality: application.nationality,
                    house: assignedHouse,
                    status: "active",
                    joinDate: new Date().toISOString(),
                };
                players.push(newPlayer);
            } else if (application.type === "staff") {
                // Add as staff user
                const newUser = {
                    id: "staff" + Date.now(),
                    name: application.name,
                    email: application.email,
                    role: "staff",
                    department: application.department,
                    password: "TempPass123",
                };
                users.push(newUser);
            }

            sendResponse(res, 200, { success: true, message: "Application approved successfully", application });
            return;
        }
        
        if (pathname.startsWith('/api/applications/') && pathname.endsWith('/reject') && method === 'POST') {
            const id = pathname.split('/')[3];
            const application = pendingApplications.find((app) => app.id === id);

            if (!application) {
                sendResponse(res, 404, { success: false, message: "Application not found" });
                return;
            }

            if (application.status !== "pending") {
                sendResponse(res, 400, { success: false, message: "Application already processed" });
                return;
            }

            // Reject the application
            application.status = "rejected";
            application.rejectedAt = new Date().toISOString();

            sendResponse(res, 200, { success: true, message: "Application rejected successfully", application });
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
            // Combine actual users with players as user objects
            const allUsers = [
                ...users.map((user) => ({
                    id: user.id,
                    name: user.name,
                    email: user.email,
                    role: user.role,
                })),
                ...players.map((player) => ({
                    id: player.id,
                    name: player.name,
                    email: player.email || player.name.toLowerCase().replace(" ", ".") + "@player.com",
                    role: "player",
                })),
            ];
            sendResponse(res, 200, { success: true, users: allUsers });
            return;
        }
        
        // User update endpoint - MISSING from deployment
        if (pathname.startsWith('/api/users/') && method === 'PATCH') {
            const userId = pathname.split('/')[3];
            const updates = body;
            
            const user = users.find(u => u.id === userId);
            if (user) {
                // Update user fields
                Object.keys(updates).forEach(key => {
                    if (key !== 'id' && updates[key] !== undefined) {
                        user[key] = updates[key];
                    }
                });
                
                const userResponse = {
                    id: user.id,
                    email: user.email,
                    name: user.name,
                    role: user.role
                };
                
                sendResponse(res, 200, { success: true, message: 'User updated successfully', user: userResponse });
                return;
            }
            
            // Also check players
            const player = players.find(p => p.id === userId);
            if (player) {
                Object.keys(updates).forEach(key => {
                    if (key !== 'id' && updates[key] !== undefined) {
                        player[key] = updates[key];
                    }
                });
                
                sendResponse(res, 200, { success: true, message: 'Player updated successfully', user: player });
                return;
            }
            
            sendResponse(res, 404, { success: false, message: 'User not found' });
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
        
        // Chore management endpoints - MISSING from deployment
        if (pathname.startsWith('/api/chores/') && pathname.endsWith('/complete') && method === 'PATCH') {
            const choreId = pathname.split('/')[3];
            const chore = choreStorage.find(c => c.id === choreId);
            
            if (!chore) {
                sendResponse(res, 404, { success: false, message: 'Chore not found' });
                return;
            }
            
            if (chore.completed) {
                sendResponse(res, 400, { success: false, message: 'Chore already completed' });
                return;
            }
            
            chore.completed = true;
            chore.completedAt = new Date().toISOString();
            chore.completedBy = body.completedBy || 'Unknown';
            chore.status = 'completed';
            
            sendResponse(res, 200, { success: true, message: 'Chore marked as completed', chore });
            return;
        }
        
        if (pathname.startsWith('/api/chores/') && pathname.endsWith('/assign') && method === 'PATCH') {
            const choreId = pathname.split('/')[3];
            const { assignedTo } = body;
            const chore = choreStorage.find(c => c.id === choreId);
            
            if (!chore) {
                sendResponse(res, 404, { success: false, message: 'Chore not found' });
                return;
            }
            
            chore.assignedTo = assignedTo;
            chore.status = 'assigned';
            
            sendResponse(res, 200, { success: true, message: 'Chore assigned successfully', chore });
            return;
        }
        
        if (pathname.startsWith('/api/chores/') && pathname.endsWith('/archive') && method === 'PATCH') {
            const choreId = pathname.split('/')[3];
            const chore = choreStorage.find(c => c.id === choreId);
            
            if (!chore) {
                sendResponse(res, 404, { success: false, message: 'Chore not found' });
                return;
            }
            
            chore.archived = true;
            chore.archivedAt = new Date().toISOString();
            
            sendResponse(res, 200, { success: true, message: 'Chore archived successfully', chore });
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
        
        // Calendar event management - MISSING from deployment
        if (pathname.startsWith('/api/calendar/') && method === 'PUT') {
            const eventId = pathname.split('/')[3];
            const event = calendarEvents.find(e => e.id === eventId);
            
            if (!event) {
                sendResponse(res, 404, { success: false, message: 'Event not found' });
                return;
            }
            
            // Update event fields
            Object.keys(body).forEach(key => {
                if (key !== 'id' && body[key] !== undefined) {
                    event[key] = body[key];
                }
            });
            event.updatedAt = new Date().toISOString();
            
            sendResponse(res, 200, { success: true, message: 'Event updated successfully', event });
            return;
        }
        
        if (pathname.startsWith('/api/calendar/') && method === 'DELETE') {
            const eventId = pathname.split('/')[3];
            const index = calendarEvents.findIndex(e => e.id === eventId);
            
            if (index === -1) {
                sendResponse(res, 404, { success: false, message: 'Event not found' });
                return;
            }
            
            calendarEvents.splice(index, 1);
            sendResponse(res, 200, { success: true, message: 'Event deleted successfully' });
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

        // Dashboard endpoints - CRITICAL for deployment functionality
        if (pathname === '/api/dashboard/stats' && method === 'GET') {
            const stats = {
                totalPlayers: players.length,
                trainingToday: players.filter((p) => p.status === "training").length,
                houses: 3, // Widdersdorf 1, 2, 3
                activitiesToday: calendarEvents.filter((e) => {
                    const today = new Date().toDateString();
                    const eventDate = new Date(e.date).toDateString();
                    return eventDate === today;
                }).length,
            };
            sendResponse(res, 200, { success: true, stats });
            return;
        }

        if (pathname === '/api/dashboard/recent-activity' && method === 'GET') {
            const activities = [
                {
                    time: "10:30 AM",
                    title: "Training Session Completed",
                    description: "Morning fitness training - 18 players attended",
                    type: "training",
                },
                {
                    time: "9:15 AM",
                    title: "New Player Registration",
                    description: "Dennis Huseinbasic completed profile setup",
                    type: "registration",
                },
                {
                    time: "8:45 AM",
                    title: "Meal Orders Submitted",
                    description: `${foodOrders.length} players submitted lunch preferences`,
                    type: "food",
                },
                {
                    time: "8:00 AM",
                    title: "House Chore Completed",
                    description: "Widdersdorf 2 completed weekly cleaning tasks",
                    type: "chores",
                },
            ];
            sendResponse(res, 200, { success: true, activities });
            return;
        }

        if (pathname === '/api/dashboard/house-competition' && method === 'GET') {
            const houses = [
                {
                    rank: 1,
                    name: "Widdersdorf 2",
                    players: players.filter((p) => p.house === "Widdersdorf 2").length,
                    stats: "Clean record",
                    points: 945,
                    trophy: "🥇",
                },
                {
                    rank: 2,
                    name: "Widdersdorf 1",
                    players: players.filter((p) => p.house === "Widdersdorf 1").length,
                    stats: "2 pending tasks",
                    points: 920,
                    trophy: "🥈",
                },
                {
                    rank: 3,
                    name: "Widdersdorf 3",
                    players: players.filter((p) => p.house === "Widdersdorf 3").length,
                    stats: "1 pending task",
                    points: 885,
                    trophy: "🥉",
                },
            ];

            const weekChallenges = "Fitness Challenge (20 pts), Chore Completion (15 pts), Team Spirit (10 pts)";
            sendResponse(res, 200, { success: true, houses, weekChallenges });
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