/* 
 * FC KÖLN AUTHENTICATION SYSTEM - ISOLATED & ROBUST
 * 
 * This module contains all authentication logic in an isolated, self-contained system
 * designed to prevent future breakage from unrelated application changes.
 * 
 * CRITICAL: This module should NEVER be modified during feature additions
 */

// Authentication Core - Isolated namespace to prevent conflicts
window.FCKAuth = window.FCKAuth || {
    // Configuration
    config: {
        defaultEmail: 'max.bisinger@warubi-sports.com',
        defaultPassword: 'ITP2024',
        staffEmail: 'thomas.ellinger@warubi-sports.com',
        staffPassword: 'ITP2024'
    },
    
    // State management
    state: {
        currentUser: null,
        isLoggedIn: false,
        loginAttempts: 0,
        maxAttempts: 5
    },
    
    // Core authentication functions
    core: {
        // Initialize authentication system
        init: function() {
            console.log('FC Köln Authentication System - Initializing...');
            
            // Bind all event listeners
            FCKAuth.core.bindEventListeners();
            
            // Check for existing session
            FCKAuth.core.checkExistingSession();
            
            // Set default values
            FCKAuth.core.setDefaultValues();
            
            console.log('FC Köln Authentication System - Ready');
        },
        
        // Bind all authentication event listeners
        bindEventListeners: function() {
            // Login form submission
            const loginForm = document.getElementById('loginForm');
            if (loginForm) {
                loginForm.addEventListener('submit', function(e) {
                    e.preventDefault();
                    FCKAuth.actions.handleLogin();
                });
            }
            
            // Forgot password form
            const forgotForm = document.getElementById('forgotPasswordForm');
            if (forgotForm) {
                forgotForm.addEventListener('submit', function(e) {
                    e.preventDefault();
                    FCKAuth.actions.handleForgotPassword();
                });
            }
            
            // Registration form
            const registerForm = document.getElementById('registrationForm');
            if (registerForm) {
                registerForm.addEventListener('submit', function(e) {
                    e.preventDefault();
                    FCKAuth.actions.handleRegistration();
                });
            }
        },
        
        // Check for existing authentication session
        checkExistingSession: function() {
            try {
                const stored = localStorage.getItem('fc-koln-auth');
                if (stored) {
                    const authData = JSON.parse(stored);
                    if (authData && authData.email && authData.timestamp) {
                        // Check if session is still valid (24 hours)
                        const now = new Date().getTime();
                        const sessionAge = now - authData.timestamp;
                        const maxAge = 24 * 60 * 60 * 1000; // 24 hours
                        
                        if (sessionAge < maxAge) {
                            FCKAuth.state.currentUser = authData;
                            FCKAuth.state.isLoggedIn = true;
                            FCKAuth.ui.showMainApp();
                            return true;
                        }
                    }
                }
            } catch (error) {
                console.warn('Session check failed:', error);
            }
            
            FCKAuth.ui.showLoginPage();
            return false;
        },
        
        // Set default form values
        setDefaultValues: function() {
            const emailField = document.getElementById('email');
            const passwordField = document.getElementById('password');
            
            if (emailField && !emailField.value) {
                emailField.value = FCKAuth.config.defaultEmail;
            }
            
            if (passwordField && !passwordField.value) {
                passwordField.value = FCKAuth.config.defaultPassword;
            }
        },
        
        // Validate credentials
        validateCredentials: function(email, password) {
            // Admin credentials
            if (email === FCKAuth.config.defaultEmail && password === FCKAuth.config.defaultPassword) {
                return { valid: true, role: 'admin', name: 'Max Bisinger' };
            }
            
            // Staff credentials
            if (email === FCKAuth.config.staffEmail && password === FCKAuth.config.staffPassword) {
                return { valid: true, role: 'staff', name: 'Thomas Ellinger' };
            }
            
            return { valid: false, role: null, name: null };
        }
    },
    
    // User interface management
    ui: {
        // Show login page
        showLoginPage: function() {
            const loginPage = document.getElementById('loginPage');
            const mainApp = document.getElementById('mainApp');
            
            if (loginPage) loginPage.style.display = 'block';
            if (mainApp) mainApp.style.display = 'none';
        },
        
        // Show main application
        showMainApp: function() {
            const loginPage = document.getElementById('loginPage');
            const mainApp = document.getElementById('mainApp');
            
            if (loginPage) loginPage.style.display = 'none';
            if (mainApp) mainApp.style.display = 'block';
            
            // Update user info display
            FCKAuth.ui.updateUserInfo();
        },
        
        // Update user information display
        updateUserInfo: function() {
            if (!FCKAuth.state.currentUser) return;
            
            const userNameElements = document.querySelectorAll('.user-name');
            const userEmailElements = document.querySelectorAll('.user-email');
            const userRoleElements = document.querySelectorAll('.user-role');
            
            userNameElements.forEach(el => {
                if (el) el.textContent = FCKAuth.state.currentUser.name || 'User';
            });
            
            userEmailElements.forEach(el => {
                if (el) el.textContent = FCKAuth.state.currentUser.email || '';
            });
            
            userRoleElements.forEach(el => {
                if (el) el.textContent = FCKAuth.state.currentUser.role || 'user';
            });
            
            // Show/hide admin features
            FCKAuth.ui.updateRoleBasedVisibility();
        },
        
        // Update visibility based on user role
        updateRoleBasedVisibility: function() {
            if (!FCKAuth.state.currentUser) return;
            
            const adminElements = document.querySelectorAll('.admin-only');
            const staffElements = document.querySelectorAll('.staff-only');
            
            if (FCKAuth.state.currentUser.role === 'admin') {
                adminElements.forEach(el => el.style.display = 'block');
                staffElements.forEach(el => el.style.display = 'block');
            } else if (FCKAuth.state.currentUser.role === 'staff') {
                adminElements.forEach(el => el.style.display = 'none');
                staffElements.forEach(el => el.style.display = 'block');
            } else {
                adminElements.forEach(el => el.style.display = 'none');
                staffElements.forEach(el => el.style.display = 'none');
            }
        },
        
        // Show authentication tab (login/register)
        showAuthTab: function(tabType) {
            const loginTab = document.getElementById('login-auth-tab');
            const registerTab = document.getElementById('register-auth-tab');
            const forgotTab = document.getElementById('forgotPasswordTab');
            const tabButtons = document.querySelectorAll('.auth-tab-btn');
            
            // Hide all tabs first
            if (loginTab) loginTab.classList.remove('active');
            if (registerTab) registerTab.classList.remove('active');
            if (forgotTab) forgotTab.style.display = 'none';
            
            // Remove active from all buttons
            tabButtons.forEach(btn => btn.classList.remove('active'));
            
            // Show selected tab
            if (tabType === 'login') {
                if (loginTab) loginTab.classList.add('active');
                // Find and activate the login button
                const loginBtn = document.querySelector('[onclick*="login"]');
                if (loginBtn) loginBtn.classList.add('active');
            } else if (tabType === 'register') {
                if (registerTab) registerTab.classList.add('active');
                // Find and activate the register button
                const registerBtn = document.querySelector('[onclick*="register"]');
                if (registerBtn) registerBtn.classList.add('active');
            }
        },
        
        // Show forgot password form
        showForgotPassword: function() {
            const loginTab = document.getElementById('login-auth-tab');
            const forgotTab = document.getElementById('forgotPasswordTab');
            
            if (loginTab) loginTab.style.display = 'none';
            if (forgotTab) forgotTab.style.display = 'block';
        },
        
        // Show message to user
        showMessage: function(message, type = 'info') {
            const messageElement = document.getElementById('loginMessage');
            if (messageElement) {
                messageElement.innerHTML = message;
                messageElement.className = 'message ' + type;
                
                // Clear message after 5 seconds
                setTimeout(() => {
                    messageElement.innerHTML = '';
                    messageElement.className = 'message';
                }, 5000);
            }
        }
    },
    
    // User actions
    actions: {
        // Handle login attempt
        handleLogin: function() {
            const email = document.getElementById('email')?.value?.trim();
            const password = document.getElementById('password')?.value;
            
            if (!email || !password) {
                FCKAuth.ui.showMessage('Please enter both email and password.', 'error');
                return;
            }
            
            // Check rate limiting
            if (FCKAuth.state.loginAttempts >= FCKAuth.state.maxAttempts) {
                FCKAuth.ui.showMessage('Too many login attempts. Please wait before trying again.', 'error');
                return;
            }
            
            // Validate credentials
            const validation = FCKAuth.core.validateCredentials(email, password);
            
            if (validation.valid) {
                // Successful login
                FCKAuth.state.currentUser = {
                    email: email,
                    name: validation.name,
                    role: validation.role,
                    timestamp: new Date().getTime()
                };
                
                FCKAuth.state.isLoggedIn = true;
                FCKAuth.state.loginAttempts = 0;
                
                // Store session
                localStorage.setItem('fc-koln-auth', JSON.stringify(FCKAuth.state.currentUser));
                
                // Show main app
                FCKAuth.ui.showMainApp();
                
                FCKAuth.ui.showMessage('Login successful! Welcome to FC Köln Talent Program.', 'success');
            } else {
                // Failed login
                FCKAuth.state.loginAttempts++;
                FCKAuth.ui.showMessage('Invalid email or password. Please try again.', 'error');
                
                // Clear password field
                const passwordField = document.getElementById('password');
                if (passwordField) passwordField.value = '';
            }
        },
        
        // Handle logout
        logout: function() {
            FCKAuth.state.currentUser = null;
            FCKAuth.state.isLoggedIn = false;
            FCKAuth.state.loginAttempts = 0;
            
            // Clear stored session
            localStorage.removeItem('fc-koln-auth');
            
            // Reset form values
            FCKAuth.core.setDefaultValues();
            
            // Show login page
            FCKAuth.ui.showLoginPage();
            FCKAuth.ui.showAuthTab('login');
            
            FCKAuth.ui.showMessage('You have been logged out successfully.', 'info');
        },
        
        // Handle forgot password
        handleForgotPassword: function() {
            const email = document.getElementById('forgotEmail')?.value?.trim();
            
            if (!email) {
                FCKAuth.ui.showMessage('Please enter your email address.', 'error');
                return;
            }
            
            // Simulate password reset
            FCKAuth.ui.showMessage('Password reset instructions have been sent to your email.', 'success');
            
            // Return to login after 3 seconds
            setTimeout(() => {
                const loginTab = document.getElementById('login-auth-tab');
                const forgotTab = document.getElementById('forgotPasswordTab');
                
                if (forgotTab) forgotTab.style.display = 'none';
                if (loginTab) loginTab.style.display = 'block';
            }, 3000);
        },
        
        // Handle registration
        handleRegistration: function() {
            FCKAuth.ui.showMessage('Registration is currently handled by administration. Please contact your supervisor.', 'info');
        }
    }
};

// Make core functions globally accessible for backward compatibility
window.showAuthTab = function(tabType) {
    return FCKAuth.ui.showAuthTab(tabType);
};

window.showForgotPassword = function() {
    return FCKAuth.ui.showForgotPassword();
};

window.logout = function() {
    return FCKAuth.actions.logout();
};

// Initialize authentication system when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', FCKAuth.core.init);
} else {
    FCKAuth.core.init();
}

// Export for testing
window.FCKAuth = FCKAuth;

console.log('FC Köln Isolated Authentication System Loaded');