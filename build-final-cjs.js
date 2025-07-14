// Final comprehensive deployment build (CommonJS format)
const fs = require('fs');
const path = require('path');

function createFinalBuild() {
  console.log('🔧 Creating final deployment build...');
  
  // Clean and create dist directory
  if (fs.existsSync('dist')) {
    fs.rmSync('dist', { recursive: true, force: true });
  }
  fs.mkdirSync('dist', { recursive: true });
  fs.mkdirSync('dist/public', { recursive: true });
  
  // Copy working CommonJS server
  console.log('📄 Copying CommonJS server...');
  fs.copyFileSync('server/index-cjs.js', 'dist/index.js');
  
  // Create deployment package.json (CommonJS)
  const deploymentPackageJson = {
    name: 'fc-koln-management',
    version: '1.0.0',
    main: 'index.js',
    scripts: {
      start: 'node index.js'
    },
    engines: {
      node: '>=20.0.0'
    }
  };
  
  fs.writeFileSync('dist/package.json', JSON.stringify(deploymentPackageJson, null, 2));
  
  // Create production frontend
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
        }
        .container { 
            background: white;
            padding: 40px;
            border-radius: 16px;
            box-shadow: 0 20px 40px rgba(0,0,0,0.1);
            width: 100%;
            max-width: 420px;
        }
        .logo { 
            text-align: center;
            color: #dc2626;
            font-size: 32px;
            font-weight: 700;
            margin-bottom: 40px;
        }
        .form-group { margin-bottom: 24px; }
        label { 
            display: block;
            margin-bottom: 8px;
            color: #374151;
            font-weight: 600;
        }
        input { 
            width: 100%;
            padding: 16px;
            border: 2px solid #e5e7eb;
            border-radius: 12px;
            font-size: 16px;
            transition: border-color 0.3s;
        }
        input:focus { 
            outline: none;
            border-color: #dc2626;
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
            transition: background 0.3s;
        }
        .btn:hover { background: #b91c1c; }
        .btn:disabled { 
            background: #9ca3af;
            cursor: not-allowed;
        }
        .message { 
            margin-top: 24px;
            padding: 16px;
            border-radius: 12px;
            font-weight: 500;
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
    </style>
</head>
<body>
    <div class="container">
        <div class="logo">FC Köln Management</div>
        
        <form id="loginForm">
            <div class="form-group">
                <label for="email">Email</label>
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
            Status: <span id="statusText">Checking...</span>
        </div>
    </div>
    
    <script>
        const elements = {
            message: document.getElementById('message'),
            statusText: document.getElementById('statusText'),
            submitBtn: document.getElementById('submitBtn'),
            btnText: document.getElementById('btnText'),
            spinner: document.getElementById('spinner'),
            form: document.getElementById('loginForm')
        };
        
        async function checkStatus() {
            try {
                const response = await fetch('/health');
                if (response.ok) {
                    elements.statusText.textContent = 'Connected';
                    elements.statusText.style.color = '#10b981';
                    elements.submitBtn.disabled = false;
                    return true;
                }
            } catch (error) {
                elements.statusText.textContent = 'Connection failed';
                elements.statusText.style.color = '#ef4444';
                elements.submitBtn.disabled = true;
                return false;
            }
        }
        
        function showMessage(text, type = 'error') {
            elements.message.innerHTML = '<div class="message ' + type + '">' + text + '</div>';
        }
        
        function setLoading(loading) {
            elements.submitBtn.disabled = loading;
            elements.btnText.style.display = loading ? 'none' : 'inline';
            elements.spinner.style.display = loading ? 'inline-block' : 'none';
        }
        
        elements.form.addEventListener('submit', async function(e) {
            e.preventDefault();
            
            const email = document.getElementById('email').value;
            const password = document.getElementById('password').value;
            
            setLoading(true);
            elements.message.innerHTML = '';
            
            try {
                const response = await fetch('/api/login', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ email, password })
                });
                
                const data = await response.json();
                
                if (response.ok) {
                    showMessage('Welcome, ' + data.user.name + '!', 'success');
                    localStorage.setItem('token', data.token);
                } else {
                    showMessage(data.message || 'Login failed', 'error');
                }
            } catch (error) {
                showMessage('Network error: ' + error.message, 'error');
            } finally {
                setLoading(false);
            }
        });
        
        // Check status on load
        checkStatus();
        setInterval(checkStatus, 30000);
    </script>
</body>
</html>`;
  
  fs.writeFileSync('dist/public/index.html', productionFrontend);
  
  console.log('✅ Final deployment build completed');
  console.log('');
  console.log('📦 Generated files:');
  console.log('   - dist/index.js (CommonJS server)');
  console.log('   - dist/package.json (CommonJS config)');
  console.log('   - dist/public/index.html (Production frontend)');
  console.log('');
  console.log('🚀 Ready for deployment!');
}

createFinalBuild();