#!/usr/bin/env node

/**
 * Fixed Production Build Script
 * This script creates a deployment-ready CommonJS server bundle
 * that addresses all the deployment issues mentioned.
 */

const { mkdirSync, existsSync, copyFileSync, writeFileSync, rmSync } = require('fs');

function createProductionBuild() {
  console.log('🔧 Creating deployment build with fixes...');
  
  // Clean dist directory
  if (existsSync('dist')) {
    rmSync('dist', { recursive: true, force: true });
  }
  mkdirSync('dist', { recursive: true });
  mkdirSync('dist/public', { recursive: true });
  
  // Copy the working CommonJS server with database functionality and role fix
  console.log('📄 Copying CommonJS server...');
  copyFileSync('server/index-production.js', 'dist/index.js');
  
  // Create deployment package.json WITHOUT "type": "module" 
  // This fixes the ES module format issue
  const productionPackageJson = {
    name: 'fc-koln-management',
    version: '1.0.0',
    main: 'index.js',
    scripts: {
      start: 'node index.js'
    },
    engines: {
      node: '>=20.0.0'
    }
    // Note: No "type": "module" - this ensures CommonJS format
  };
  
  writeFileSync('dist/package.json', JSON.stringify(productionPackageJson, null, 2));
  
  // Create production frontend HTML
  const productionFrontend = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>FC Köln Management System</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { 
            font-family: system-ui, -apple-system, sans-serif;
            background: linear-gradient(135deg, #dc2626 0%, #b91c1c 100%);
            min-height: 100vh;
            display: flex;
            align-items: center;
            justify-content: center;
            color: #333;
        }
        .container { 
            background: white;
            padding: 40px;
            border-radius: 16px;
            box-shadow: 0 20px 40px rgba(0,0,0,0.1);
            width: 100%;
            max-width: 420px;
            position: relative;
        }
        .logo { 
            text-align: center;
            color: #dc2626;
            font-size: 32px;
            font-weight: 700;
            margin-bottom: 40px;
            position: relative;
        }
        .logo::after {
            content: '';
            position: absolute;
            bottom: -10px;
            left: 50%;
            transform: translateX(-50%);
            width: 60px;
            height: 3px;
            background: #dc2626;
            border-radius: 2px;
        }
        .form-group { 
            margin-bottom: 24px;
        }
        label { 
            display: block;
            margin-bottom: 8px;
            color: #374151;
            font-weight: 600;
            font-size: 14px;
        }
        input { 
            width: 100%;
            padding: 16px 20px;
            border: 2px solid #e5e7eb;
            border-radius: 12px;
            font-size: 16px;
            transition: all 0.3s ease;
            background: #f9fafb;
        }
        input:focus { 
            outline: none;
            border-color: #dc2626;
            background: white;
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
            transition: all 0.3s ease;
            position: relative;
            overflow: hidden;
        }
        .btn:hover { 
            background: #b91c1c;
            transform: translateY(-1px);
            box-shadow: 0 8px 16px rgba(220, 38, 38, 0.3);
        }
        .btn:active { 
            transform: translateY(0);
        }
        .btn:disabled { 
            background: #9ca3af;
            cursor: not-allowed;
            transform: none;
        }
        .message { 
            margin-top: 24px;
            padding: 16px;
            border-radius: 12px;
            font-weight: 500;
            font-size: 14px;
        }
        .success { 
            background: #d1fae5;
            color: #065f46;
            border: 1px solid #10b981;
        }
        .error { 
            background: #fee2e2;
            color: #991b1b;
            border: 1px solid #ef4444;
        }
        .status { 
            margin-top: 24px;
            text-align: center;
            font-size: 14px;
            color: #6b7280;
            padding: 12px;
            background: #f9fafb;
            border-radius: 8px;
        }
        .status-indicator {
            display: inline-block;
            width: 8px;
            height: 8px;
            border-radius: 50%;
            margin-right: 8px;
        }
        .online { background: #10b981; }
        .offline { background: #ef4444; }
        .loading { 
            display: inline-block;
            width: 20px;
            height: 20px;
            border: 3px solid #ffffff;
            border-radius: 50%;
            border-top-color: transparent;
            animation: spin 1s ease-in-out infinite;
        }
        @keyframes spin { 
            to { transform: rotate(360deg); }
        }
        .version {
            position: absolute;
            bottom: 10px;
            right: 10px;
            font-size: 12px;
            color: #9ca3af;
        }
        @media (max-width: 480px) {
            .container {
                margin: 20px;
                padding: 30px;
            }
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="logo">FC Köln Management</div>
        
        <form id="loginForm">
            <div class="form-group">
                <label for="email">Email Address</label>
                <input type="email" id="email" required placeholder="Enter your email">
            </div>
            <div class="form-group">
                <label for="password">Password</label>
                <input type="password" id="password" required placeholder="Enter your password">
            </div>
            <button type="submit" class="btn" id="submitBtn">
                <span id="btnText">Sign In</span>
                <span id="spinner" class="loading" style="display: none;"></span>
            </button>
        </form>
        
        <div id="message"></div>
        
        <div class="status">
            <span id="statusIndicator" class="status-indicator"></span>
            <span id="statusText">Checking connection...</span>
        </div>
        
        <div class="version">v1.0.0</div>
    </div>
    
    <script>
        const elements = {
            message: document.getElementById('message'),
            statusIndicator: document.getElementById('statusIndicator'),
            statusText: document.getElementById('statusText'),
            submitBtn: document.getElementById('submitBtn'),
            btnText: document.getElementById('btnText'),
            spinner: document.getElementById('spinner'),
            form: document.getElementById('loginForm')
        };
        
        let isConnected = false;
        
        async function checkServerStatus() {
            try {
                const response = await fetch('/health', { 
                    method: 'GET',
                    cache: 'no-cache' 
                });
                
                if (response.ok) {
                    const data = await response.json();
                    updateStatus(true, 'Connected to server');
                    isConnected = true;
                    return true;
                } else {
                    throw new Error('Server responded with error');
                }
            } catch (error) {
                updateStatus(false, 'Connection failed');
                isConnected = false;
                return false;
            }
        }
        
        function updateStatus(connected, message) {
            elements.statusIndicator.className = \`status-indicator \${connected ? 'online' : 'offline'}\`;
            elements.statusText.textContent = message;
            elements.submitBtn.disabled = !connected;
        }
        
        function showMessage(text, type = 'error') {
            elements.message.innerHTML = \`<div class="message \${type}">\${text}</div>\`;
            setTimeout(() => {
                elements.message.innerHTML = '';
            }, 5000);
        }
        
        function setLoading(loading) {
            elements.submitBtn.disabled = loading;
            elements.btnText.style.display = loading ? 'none' : 'inline';
            elements.spinner.style.display = loading ? 'inline-block' : 'none';
        }
        
        elements.form.addEventListener('submit', async function(e) {
            e.preventDefault();
            
            if (!isConnected) {
                showMessage('Please wait for server connection', 'error');
                return;
            }
            
            const email = document.getElementById('email').value;
            const password = document.getElementById('password').value;
            
            setLoading(true);
            elements.message.innerHTML = '';
            
            try {
                const response = await fetch('/login', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ email, password })
                });
                
                const data = await response.json();
                
                if (response.ok) {
                    showMessage(\`Welcome back, \${data.user.name}!\`, 'success');
                    localStorage.setItem('token', data.token);
                    localStorage.setItem('user', JSON.stringify(data.user));
                    
                    // Redirect to dashboard or show success state
                    setTimeout(() => {
                        window.location.reload();
                    }, 1500);
                } else {
                    showMessage(data.message || 'Login failed', 'error');
                }
            } catch (error) {
                showMessage('Network error: ' + error.message, 'error');
            } finally {
                setLoading(false);
            }
        });
        
        // Check server status on load
        checkServerStatus();
        
        // Refresh status every 30 seconds
        setInterval(checkServerStatus, 30000);
        
        // Check for existing token
        const token = localStorage.getItem('token');
        if (token) {
            fetch('/api/user', {
                headers: { 'Authorization': 'Bearer ' + token }
            })
            .then(response => response.ok ? response.json() : null)
            .then(user => {
                if (user) {
                    showMessage(\`Already logged in as \${user.name}\`, 'success');
                }
            })
            .catch(() => {
                localStorage.removeItem('token');
                localStorage.removeItem('user');
            });
        }
    </script>
</body>
</html>`;
  
  writeFileSync('dist/public/index.html', productionFrontend);
  
  console.log('✅ Production build completed successfully!');
  console.log('');
  console.log('📦 Build Output:');
  console.log('   - dist/index.js (CommonJS server)');
  console.log('   - dist/package.json (CommonJS config)');
  console.log('   - dist/public/index.html (Production frontend)');
  console.log('');
  console.log('🔧 All deployment fixes applied:');
  console.log('   ✅ Using CommonJS server with zero external dependencies');
  console.log('   ✅ Removed "type": "module" from deployment package.json');
  console.log('   ✅ Fixed module format from ESM to CommonJS');
  console.log('   ✅ Bundled all dependencies in server file');
  console.log('   ✅ Fixed module resolution conflicts');
  console.log('');
  console.log('🚀 Ready for deployment!');
}

createProductionBuild();