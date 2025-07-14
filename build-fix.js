#!/usr/bin/env node

// Fixed deployment build script that uses CommonJS format
import { mkdirSync, existsSync, copyFileSync, writeFileSync, readFileSync } from 'fs';
import { join } from 'path';

function buildFixed() {
  console.log('🔧 Building with CommonJS format fix...');
  
  // Ensure dist directory exists
  if (!existsSync('dist')) {
    mkdirSync('dist', { recursive: true });
  }
  
  try {
    // Copy the working CommonJS server directly
    console.log('📁 Copying CommonJS server...');
    copyFileSync('server/index-cjs.js', 'dist/index.js');
    console.log('✅ Server copied successfully');
    
    // Create a deployment-ready package.json WITHOUT "type": "module"
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
    
    writeFileSync('dist/package.json', JSON.stringify(deploymentPackageJson, null, 2));
    console.log('✅ Created deployment package.json (CommonJS)');
    
    // Copy any existing frontend assets
    if (existsSync('dist/public')) {
      console.log('📁 Frontend assets found');
    } else {
      console.log('⚠️ No frontend assets found, creating minimal index.html');
      mkdirSync('dist/public', { recursive: true });
      
      const minimalHTML = `<!DOCTYPE html>
<html>
<head>
    <title>FC Köln Management</title>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <style>
        body { font-family: Arial, sans-serif; margin: 0; padding: 20px; }
        .container { max-width: 400px; margin: 0 auto; }
        .form-group { margin-bottom: 15px; }
        label { display: block; margin-bottom: 5px; }
        input { width: 100%; padding: 8px; border: 1px solid #ddd; border-radius: 4px; }
        button { width: 100%; padding: 10px; background: #dc2626; color: white; border: none; border-radius: 4px; cursor: pointer; }
        button:hover { background: #b91c1c; }
        .error { color: #dc2626; margin-top: 10px; }
        .success { color: #059669; margin-top: 10px; }
    </style>
</head>
<body>
    <div class="container">
        <h1>FC Köln Management</h1>
        <form id="loginForm">
            <div class="form-group">
                <label for="email">Email:</label>
                <input type="email" id="email" name="email" required>
            </div>
            <div class="form-group">
                <label for="password">Password:</label>
                <input type="password" id="password" name="password" required>
            </div>
            <button type="submit">Login</button>
        </form>
        <div id="message"></div>
    </div>
    
    <script>
        document.getElementById('loginForm').addEventListener('submit', async function(e) {
            e.preventDefault();
            const email = document.getElementById('email').value;
            const password = document.getElementById('password').value;
            const messageDiv = document.getElementById('message');
            
            try {
                const response = await fetch('/api/login', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ email, password })
                });
                
                const data = await response.json();
                
                if (response.ok) {
                    messageDiv.innerHTML = '<div class="success">Login successful! Welcome ' + data.user.name + '</div>';
                    localStorage.setItem('token', data.token);
                } else {
                    messageDiv.innerHTML = '<div class="error">Error: ' + data.message + '</div>';
                }
            } catch (error) {
                messageDiv.innerHTML = '<div class="error">Network error: ' + error.message + '</div>';
            }
        });
    </script>
</body>
</html>`;
      
      writeFileSync('dist/public/index.html', minimalHTML);
      console.log('✅ Created minimal frontend');
    }
    
    console.log('🚀 Fixed deployment ready!');
    console.log('- Server: dist/index.js (CommonJS format)');
    console.log('- Package: dist/package.json (no ES modules)');
    console.log('- Target: Node.js 20');
    console.log('');
    console.log('Test locally with: cd dist && node index.js');
    
  } catch (error) {
    console.error('❌ Build failed:', error);
    process.exit(1);
  }
}

buildFixed();