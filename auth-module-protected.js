/**
 * PROTECTED AUTHENTICATION MODULE
 * This file contains ONLY authentication functions
 * DO NOT MODIFY during feature additions
 * 
 * If authentication breaks, restore this file and re-import
 */

(function() {
    'use strict';
    
    // Protected authentication functions - cannot be overwritten
    const AuthModule = {
        // Show authentication tab
        showAuthTab: function(tab) {
            console.log('AUTH: Switching to tab:', tab);
            
            const loginTab = document.getElementById('loginTab');
            const registerTab = document.getElementById('registerTab');
            const forgotPasswordTab = document.getElementById('forgotPasswordTab');
            
            if (!loginTab || !registerTab || !forgotPasswordTab) {
                console.error('AUTH ERROR: Missing tab elements');
                return false;
            }
            
            // Hide all tabs
            loginTab.style.display = 'none';
            registerTab.style.display = 'none';
            forgotPasswordTab.style.display = 'none';
            
            // Remove active class from all buttons
            document.querySelectorAll('.auth-tab-btn').forEach(btn => {
                btn.classList.remove('active');
            });
            
            // Show selected tab and activate button
            if (tab === 'login') {
                loginTab.style.display = 'block';
                document.querySelector('[onclick="showAuthTab(\'login\')"]')?.classList.add('active');
            } else if (tab === 'register') {
                registerTab.style.display = 'block';
                document.querySelector('[onclick="showAuthTab(\'register\')"]')?.classList.add('active');
            }
            
            return true;
        },
        
        // Show forgot password section
        showForgotPassword: function() {
            console.log('AUTH: Showing forgot password');
            
            const forgotPasswordTab = document.getElementById('forgotPasswordTab');
            const loginTab = document.getElementById('loginTab');
            const registerTab = document.getElementById('registerTab');
            
            if (!forgotPasswordTab) {
                console.error('AUTH ERROR: Missing forgot password element');
                return false;
            }
            
            // Hide login/register tabs
            if (loginTab) loginTab.style.display = 'none';
            if (registerTab) registerTab.style.display = 'none';
            
            // Show forgot password
            forgotPasswordTab.style.display = 'block';
            
            return true;
        },
        
        // Logout function
        logout: function() {
            console.log('AUTH: Logging out');
            
            const loginPage = document.getElementById('loginPage');
            const mainApp = document.getElementById('mainApp');
            
            if (!loginPage || !mainApp) {
                console.error('AUTH ERROR: Missing login/main app elements');
                return false;
            }
            
            // Clear any stored tokens/session data
            if (typeof localStorage !== 'undefined') {
                localStorage.removeItem('userToken');
                localStorage.removeItem('currentUser');
            }
            
            // Show login page, hide main app
            loginPage.style.display = 'block';
            mainApp.style.display = 'none';
            
            // Reset to login tab
            this.showAuthTab('login');
            
            return true;
        },
        
        // Verify authentication system integrity
        verifyIntegrity: function() {
            const requiredElements = [
                'loginTab',
                'registerTab', 
                'forgotPasswordTab',
                'loginPage',
                'mainApp'
            ];
            
            const missing = requiredElements.filter(id => !document.getElementById(id));
            
            if (missing.length > 0) {
                console.error('AUTH INTEGRITY FAILURE: Missing elements:', missing);
                return false;
            }
            
            console.log('AUTH INTEGRITY: All elements present');
            return true;
        }
    };
    
    // Make functions globally available but protect from overwriting
    Object.defineProperty(window, 'showAuthTab', {
        value: AuthModule.showAuthTab,
        writable: false,
        configurable: false
    });
    
    Object.defineProperty(window, 'showForgotPassword', {
        value: AuthModule.showForgotPassword,
        writable: false,
        configurable: false
    });
    
    Object.defineProperty(window, 'logout', {
        value: AuthModule.logout,
        writable: false,
        configurable: false
    });
    
    Object.defineProperty(window, 'verifyAuthIntegrity', {
        value: AuthModule.verifyIntegrity,
        writable: false,
        configurable: false
    });
    
    // Auto-verify on load
    document.addEventListener('DOMContentLoaded', function() {
        console.log('AUTH MODULE: Protected authentication system loaded');
        setTimeout(() => {
            window.verifyAuthIntegrity();
        }, 1000);
    });
    
    // Continuous monitoring every 10 seconds
    setInterval(function() {
        if (!window.verifyAuthIntegrity()) {
            console.error('AUTH SYSTEM CORRUPTION DETECTED - IMMEDIATE ATTENTION REQUIRED');
            alert('Authentication system integrity compromised. Please refresh the page.');
        }
    }, 10000);
    
})();