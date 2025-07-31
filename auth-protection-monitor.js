// AUTHENTICATION PROTECTION MONITOR - ADDITIONAL SAFEGUARDS
// This provides continuous monitoring and automatic recovery

class AuthenticationProtectionMonitor {
    constructor() {
        this.criticalFunctions = ['showAuthTab', 'showForgotPassword', 'showPage', 'logout', 'login'];
        this.checkInterval = 5000; // Check every 5 seconds
        this.recoveryAttempts = 0;
        this.maxRecoveryAttempts = 3;
        this.isMonitoring = false;
        
        this.startMonitoring();
    }
    
    startMonitoring() {
        if (this.isMonitoring) return;
        this.isMonitoring = true;
        
        console.log('Authentication Protection Monitor: ACTIVE');
        
        // Initial check
        this.performSecurityCheck();
        
        // Continuous monitoring
        this.monitorInterval = setInterval(() => {
            this.performSecurityCheck();
        }, this.checkInterval);
        
        // DOM mutation observer to detect structural changes
        this.setupDOMObserver();
    }
    
    performSecurityCheck() {
        const results = {
            functionsAccessible: true,
            elementsPresent: true,
            clickHandlersWorking: true,
            timestamp: new Date().toISOString()
        };
        
        // Check function accessibility
        this.criticalFunctions.forEach(funcName => {
            if (typeof window[funcName] !== 'function') {
                results.functionsAccessible = false;
                console.error(`Authentication Monitor: ${funcName} not accessible`);
            }
        });
        
        // Check critical DOM elements
        const criticalElements = ['loginTab', 'forgotPasswordTab', 'email', 'password'];
        criticalElements.forEach(elementId => {
            if (!document.getElementById(elementId)) {
                results.elementsPresent = false;
                console.error(`Authentication Monitor: Element ${elementId} missing`);
            }
        });
        
        // Test click handlers
        const loginButton = document.querySelector('[onclick*="showAuthTab"]');
        const forgotButton = document.querySelector('[onclick*="showForgotPassword"]');
        
        if (!loginButton || !forgotButton) {
            results.clickHandlersWorking = false;
            console.error('Authentication Monitor: Click handlers not found');
        }
        
        // If any issues detected, attempt recovery
        if (!results.functionsAccessible || !results.elementsPresent || !results.clickHandlersWorking) {
            this.attemptRecovery();
        } else {
            // Reset recovery attempts on successful check
            this.recoveryAttempts = 0;
        }
        
        return results;
    }
    
    attemptRecovery() {
        if (this.recoveryAttempts >= this.maxRecoveryAttempts) {
            console.error('CRITICAL: Authentication system failed recovery. Manual intervention required.');
            this.notifyUser();
            return;
        }
        
        this.recoveryAttempts++;
        console.log(`Authentication Monitor: Attempting recovery (${this.recoveryAttempts}/${this.maxRecoveryAttempts})`);
        
        // Re-initialize authentication functions
        this.reinitializeAuthFunctions();
        
        // Verify recovery
        setTimeout(() => {
            const checkResult = this.performSecurityCheck();
            if (checkResult.functionsAccessible && checkResult.elementsPresent) {
                console.log('Authentication Monitor: Recovery successful');
                this.recoveryAttempts = 0;
            }
        }, 1000);
    }
    
    reinitializeAuthFunctions() {
        // Core authentication functions restoration
        window.showAuthTab = function(tab) {
            const loginTab = document.getElementById('loginTab');
            const forgotTab = document.getElementById('forgotPasswordTab');
            
            if (tab === 'login') {
                if (loginTab) loginTab.style.display = 'block';
                if (forgotTab) forgotTab.style.display = 'none';
            } else if (tab === 'forgot') {
                if (loginTab) loginTab.style.display = 'none';
                if (forgotTab) forgotTab.style.display = 'block';
            }
            
            document.querySelectorAll('.auth-tab-btn').forEach(btn => btn.classList.remove('active'));
            const activeBtn = document.querySelector(`[onclick="showAuthTab('${tab}')"]`);
            if (activeBtn) activeBtn.classList.add('active');
        };

        window.showForgotPassword = function() {
            window.showAuthTab('forgot');
        };

        window.showPage = function(pageId) {
            const pages = document.querySelectorAll('.page');
            const navItems = document.querySelectorAll('.nav-item');
            
            pages.forEach(page => page.classList.remove('active'));
            navItems.forEach(item => item.classList.remove('active'));
            
            const targetPage = document.getElementById(pageId);
            if (targetPage) targetPage.classList.add('active');
            
            const targetNav = document.querySelector(`[onclick="showPage('${pageId}')"]`);
            if (targetNav) targetNav.classList.add('active');
        };

        window.logout = function() {
            document.getElementById('authScreen').style.display = 'flex';
            document.getElementById('mainApp').style.display = 'none';
            sessionStorage.clear();
            localStorage.removeItem('userRole');
            console.log('User logged out successfully');
        };
        
        console.log('Authentication functions re-initialized');
    }
    
    setupDOMObserver() {
        const observer = new MutationObserver((mutations) => {
            let authElementsModified = false;
            
            mutations.forEach((mutation) => {
                if (mutation.type === 'childList') {
                    // Check if authentication-related elements were removed
                    const authElements = ['loginTab', 'forgotPasswordTab', 'authScreen'];
                    authElements.forEach(elementId => {
                        if (!document.getElementById(elementId)) {
                            authElementsModified = true;
                        }
                    });
                }
            });
            
            if (authElementsModified) {
                console.warn('Authentication Monitor: DOM changes detected, performing security check');
                this.performSecurityCheck();
            }
        });
        
        observer.observe(document.body, {
            childList: true,
            subtree: true
        });
        
        this.domObserver = observer;
    }
    
    notifyUser() {
        // Create visible warning for user
        const warningDiv = document.createElement('div');
        warningDiv.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: #dc2626;
            color: white;
            padding: 15px;
            border-radius: 8px;
            z-index: 10000;
            font-family: Arial, sans-serif;
            box-shadow: 0 4px 12px rgba(0,0,0,0.3);
        `;
        warningDiv.innerHTML = `
            <strong>Authentication System Alert</strong><br>
            Critical authentication failure detected.<br>
            Please refresh the page or contact support.
        `;
        document.body.appendChild(warningDiv);
        
        setTimeout(() => {
            if (warningDiv.parentNode) {
                warningDiv.parentNode.removeChild(warningDiv);
            }
        }, 10000);
    }
    
    stopMonitoring() {
        this.isMonitoring = false;
        if (this.monitorInterval) {
            clearInterval(this.monitorInterval);
        }
        if (this.domObserver) {
            this.domObserver.disconnect();
        }
        console.log('Authentication Protection Monitor: STOPPED');
    }
}

// Auto-start protection monitor
window.authProtectionMonitor = new AuthenticationProtectionMonitor();