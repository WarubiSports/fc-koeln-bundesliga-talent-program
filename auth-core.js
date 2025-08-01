/**
 * PROTECTED AUTHENTICATION CORE MODULE
 * Immutable authentication functions - cannot be overwritten
 * This file is loaded separately and provides authentication isolation
 */

(function() {
    'use strict';
    
    // Authentication state management
    let authState = {
        isAuthenticated: false,
        currentUser: null,
        sessionToken: null
    };
    
    // Core authentication functions
    const AuthCore = {
        // Show authentication tab with error handling
        showAuthTab: function(tab) {
            try {
                const loginTab = document.getElementById('loginTab');
                const registerTab = document.getElementById('registerTab');
                const forgotPasswordTab = document.getElementById('forgotPasswordTab');
                
                if (!loginTab || !registerTab || !forgotPasswordTab) {
                    console.error('AUTH CORE: Missing required tab elements');
                    return false;
                }
                
                // Hide all tabs
                [loginTab, registerTab, forgotPasswordTab].forEach(el => {
                    el.style.display = 'none';
                });
                
                // Remove active classes
                document.querySelectorAll('.auth-tab-btn').forEach(btn => {
                    btn.classList.remove('active');
                });
                
                // Show selected tab
                if (tab === 'login') {
                    loginTab.style.display = 'block';
                    document.querySelector('[onclick*="login"]')?.classList.add('active');
                } else if (tab === 'register') {
                    registerTab.style.display = 'block';
                    document.querySelector('[onclick*="register"]')?.classList.add('active');
                }
                
                return true;
            } catch (error) {
                console.error('AUTH CORE ERROR in showAuthTab:', error);
                return false;
            }
        },
        
        // Show forgot password section
        showForgotPassword: function() {
            try {
                const forgotPasswordTab = document.getElementById('forgotPasswordTab');
                const loginTab = document.getElementById('loginTab');
                const registerTab = document.getElementById('registerTab');
                
                if (!forgotPasswordTab) {
                    console.error('AUTH CORE: Missing forgot password element');
                    return false;
                }
                
                // Hide other tabs
                if (loginTab) loginTab.style.display = 'none';
                if (registerTab) registerTab.style.display = 'none';
                
                // Show forgot password
                forgotPasswordTab.style.display = 'block';
                
                return true;
            } catch (error) {
                console.error('AUTH CORE ERROR in showForgotPassword:', error);
                return false;
            }
        },
        
        // Secure logout function
        logout: function() {
            try {
                const loginPage = document.getElementById('loginPage');
                const mainApp = document.getElementById('mainApp');
                
                if (!loginPage || !mainApp) {
                    console.error('AUTH CORE: Missing login/main app elements');
                    return false;
                }
                
                // Clear authentication state
                authState.isAuthenticated = false;
                authState.currentUser = null;
                authState.sessionToken = null;
                
                // Clear localStorage
                if (typeof localStorage !== 'undefined') {
                    localStorage.removeItem('userToken');
                    localStorage.removeItem('currentUser');
                    localStorage.removeItem('sessionData');
                }
                
                // Show login page, hide main app
                loginPage.style.display = 'block';
                mainApp.style.display = 'none';
                
                // Reset to login tab
                this.showAuthTab('login');
                
                console.log('AUTH CORE: User logged out successfully');
                return true;
            } catch (error) {
                console.error('AUTH CORE ERROR in logout:', error);
                return false;
            }
        },
        
        // System integrity verification
        verifySystemIntegrity: function() {
            const requiredElements = [
                'loginTab', 'registerTab', 'forgotPasswordTab',
                'loginPage', 'mainApp'
            ];
            
            const missing = requiredElements.filter(id => !document.getElementById(id));
            
            if (missing.length > 0) {
                console.error('AUTH CORE INTEGRITY FAILURE: Missing elements:', missing);
                return false;
            }
            
            // Verify functions are accessible
            const requiredFunctions = ['showAuthTab', 'showForgotPassword', 'logout'];
            const missingFunctions = requiredFunctions.filter(fn => typeof window[fn] !== 'function');
            
            if (missingFunctions.length > 0) {
                console.error('AUTH CORE INTEGRITY FAILURE: Missing functions:', missingFunctions);
                return false;
            }
            
            return true;
        },
        
        // Get current authentication state
        getAuthState: function() {
            return { ...authState }; // Return copy to prevent mutation
        },
        
        // Set authentication state (internal use)
        setAuthState: function(newState) {
            authState = { ...authState, ...newState };
        }
    };
    
    // Make functions globally available with protection
    Object.defineProperty(window, 'showAuthTab', {
        value: AuthCore.showAuthTab.bind(AuthCore),
        writable: false,
        configurable: false,
        enumerable: true
    });
    
    Object.defineProperty(window, 'showForgotPassword', {
        value: AuthCore.showForgotPassword.bind(AuthCore),
        writable: false,
        configurable: false,
        enumerable: true
    });
    
    Object.defineProperty(window, 'logout', {
        value: AuthCore.logout.bind(AuthCore),
        writable: false,
        configurable: false,
        enumerable: true
    });
    
    Object.defineProperty(window, 'verifyAuthIntegrity', {
        value: AuthCore.verifySystemIntegrity.bind(AuthCore),
        writable: false,
        configurable: false,
        enumerable: true
    });
    
    Object.defineProperty(window, 'getAuthState', {
        value: AuthCore.getAuthState.bind(AuthCore),
        writable: false,
        configurable: false,
        enumerable: true
    });
    
    // Continuous monitoring system
    let integrityCheckInterval;
    
    function startIntegrityMonitoring() {
        // Initial verification after DOM loads
        document.addEventListener('DOMContentLoaded', function() {
            setTimeout(() => {
                if (AuthCore.verifySystemIntegrity()) {
                    console.log('AUTH CORE: System integrity verified');
                } else {
                    console.error('AUTH CORE: System integrity compromised on load');
                }
            }, 2000);
        });
        
        // Continuous monitoring every 15 seconds
        integrityCheckInterval = setInterval(() => {
            if (!AuthCore.verifySystemIntegrity()) {
                console.error('AUTH CORE: CRITICAL - System integrity compromised during runtime');
                
                // Attempt to restore functions
                try {
                    if (typeof window.showAuthTab !== 'function') {
                        Object.defineProperty(window, 'showAuthTab', {
                            value: AuthCore.showAuthTab.bind(AuthCore),
                            writable: false,
                            configurable: false
                        });
                    }
                    if (typeof window.showForgotPassword !== 'function') {
                        Object.defineProperty(window, 'showForgotPassword', {
                            value: AuthCore.showForgotPassword.bind(AuthCore),
                            writable: false,
                            configurable: false
                        });
                    }
                    if (typeof window.logout !== 'function') {
                        Object.defineProperty(window, 'logout', {
                            value: AuthCore.logout.bind(AuthCore),
                            writable: false,
                            configurable: false
                        });
                    }
                    console.log('AUTH CORE: Functions restored automatically');
                } catch (restoreError) {
                    console.error('AUTH CORE: Failed to restore functions:', restoreError);
                }
            }
        }, 15000);
    }
    
    // Initialize monitoring
    startIntegrityMonitoring();
    
    // Expose the core module for debugging (read-only)
    Object.defineProperty(window, 'AuthCore', {
        value: Object.freeze(AuthCore),
        writable: false,
        configurable: false
    });
    
    console.log('AUTH CORE: Protected authentication module loaded');
    
})();