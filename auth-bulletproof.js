// FC Köln BULLETPROOF Authentication System
// This module is completely isolated and syntax-error proof
(function() {
    'use strict';
    
    // Core authentication data - IMMUTABLE
    const AUTH_DATA = Object.freeze({
        users: Object.freeze([
            Object.freeze({
                id: 'admin1',
                email: 'max.bisinger@warubi-sports.com',
                password: 'ITP2024',
                name: 'Max Bisinger',
                role: 'admin'
            }),
            Object.freeze({
                id: 'staff1',
                email: 'thomas.ellinger@warubi-sports.com',
                password: 'ITP2024',
                name: 'Thomas Ellinger',
                role: 'staff'
            }),
            Object.freeze({
                id: 'p1',
                email: 'max.finkgrafe@fc-koln.de',
                password: 'player123',
                name: 'Max Finkgräfe',
                role: 'player'
            })
        ])
    });
    
    // Authentication functions - IMMUTABLE
    const AuthCore = Object.freeze({
        validateLogin: function(email, password) {
            if (!email || !password) return null;
            
            const user = AUTH_DATA.users.find(u => 
                u.email.toLowerCase() === email.toLowerCase() && 
                u.password === password
            );
            
            return user ? Object.freeze({...user}) : null;
        },
        
        getCurrentUser: function() {
            try {
                const userData = localStorage.getItem('fckoln_currentUser');
                return userData ? JSON.parse(userData) : null;
            } catch (e) {
                return null;
            }
        },
        
        setCurrentUser: function(user) {
            try {
                if (user) {
                    localStorage.setItem('fckoln_currentUser', JSON.stringify(user));
                } else {
                    localStorage.removeItem('fckoln_currentUser');
                }
                return true;
            } catch (e) {
                return false;
            }
        },
        
        logout: function() {
            localStorage.removeItem('fckoln_currentUser');
            window.location.reload();
        }
    });
    
    // Protected login function
    function handleLogin() {
        const email = document.getElementById('email');
        const password = document.getElementById('password');
        const errorDiv = document.getElementById('loginError');
        
        if (!email || !password) return false;
        
        const user = AuthCore.validateLogin(email.value, password.value);
        
        if (user) {
            AuthCore.setCurrentUser(user);
            window.location.reload();
            return true;
        } else {
            if (errorDiv) {
                errorDiv.textContent = 'Invalid credentials. Please try again.';
                errorDiv.style.display = 'block';
            }
            return false;
        }
    }
    
    // Initialize authentication on page load
    function initAuth() {
        const currentUser = AuthCore.getCurrentUser();
        
        if (!currentUser) {
            // Show login screen
            document.body.innerHTML = `
                <div style="min-height: 100vh; display: flex; align-items: center; justify-content: center; background: linear-gradient(135deg, #dc143c 0%, #8b0000 100%);">
                    <div style="background: white; padding: 2rem; border-radius: 12px; box-shadow: 0 8px 32px rgba(0,0,0,0.3); width: 100%; max-width: 400px;">
                        <div style="text-align: center; margin-bottom: 2rem;">
                            <h1 style="color: #dc143c; margin: 0; font-size: 1.5rem;">1.FC Köln</h1>
                            <p style="color: #666; margin: 0.5rem 0 0 0;">Bundesliga Talent Program</p>
                        </div>
                        <div id="loginError" style="background: #fee; color: #c53030; padding: 0.75rem; border-radius: 4px; margin-bottom: 1rem; display: none;"></div>
                        <div style="margin-bottom: 1rem;">
                            <label style="display: block; margin-bottom: 0.5rem; font-weight: 600;">Email:</label>
                            <input type="email" id="email" style="width: 100%; padding: 0.75rem; border: 1px solid #ddd; border-radius: 4px; font-size: 1rem;" />
                        </div>
                        <div style="margin-bottom: 1.5rem;">
                            <label style="display: block; margin-bottom: 0.5rem; font-weight: 600;">Password:</label>
                            <input type="password" id="password" style="width: 100%; padding: 0.75rem; border: 1px solid #ddd; border-radius: 4px; font-size: 1rem;" />
                        </div>
                        <button onclick="window.handleLogin()" style="width: 100%; padding: 0.75rem; background: #dc143c; color: white; border: none; border-radius: 4px; font-size: 1rem; font-weight: 600; cursor: pointer;">Login</button>
                        <div style="margin-top: 1rem; font-size: 0.8rem; color: #666;">
                            <p><strong>Admin:</strong> max.bisinger@warubi-sports.com / ITP2024</p>
                            <p><strong>Staff:</strong> thomas.ellinger@warubi-sports.com / ITP2024</p>
                        </div>
                    </div>
                </div>
            `;
            return false;
        }
        
        // User is authenticated, continue with main app
        window.currentUser = currentUser;
        return true;
    }
    
    // Expose necessary functions to global scope
    window.handleLogin = handleLogin;
    window.AuthCore = AuthCore;
    window.initAuth = initAuth;
    
    // Auto-initialize if DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initAuth);
    } else {
        initAuth();
    }
})();