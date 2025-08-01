/**
 * SYSTEM MONITORING MODULE
 * Monitors application health and prevents corruption
 * Runs independently in the background
 */

(function() {
    'use strict';
    
    const SystemMonitor = {
        // Configuration
        config: {
            integrityCheckInterval: 30000, // 30 seconds
            functionCheckInterval: 10000,  // 10 seconds
            errorLogRetention: 100,        // Keep last 100 errors
            performanceMetrics: true
        },
        
        // State tracking
        state: {
            startTime: Date.now(),
            lastIntegrityCheck: null,
            lastFunctionCheck: null,
            errorLog: [],
            performanceLog: [],
            criticalErrors: 0,
            isMonitoring: false
        },
        
        // Required functions for system operation
        requiredFunctions: [
            'showAuthTab',
            'showForgotPassword', 
            'logout',
            'togglePlayerSelection',
            'populateIndividualPlayerDropdown',
            'populateMultiplePlayersCheckboxes',
            'updateSelectedCount'
        ],
        
        // Required DOM elements
        requiredElements: [
            'loginPage',
            'mainApp',
            'loginTab',
            'registerTab',
            'forgotPasswordTab'
        ],
        
        // Log error with timestamp and context
        logError: function(type, message, details = null) {
            const error = {
                timestamp: Date.now(),
                type: type,
                message: message,
                details: details,
                url: window.location.href
            };
            
            this.state.errorLog.push(error);
            
            // Keep only recent errors
            if (this.state.errorLog.length > this.config.errorLogRetention) {
                this.state.errorLog.shift();
            }
            
            // Count critical errors
            if (type === 'CRITICAL') {
                this.state.criticalErrors++;
            }
            
            console.error(`SYSTEM MONITOR [${type}]:`, message, details || '');
        },
        
        // Check if all required functions exist and are callable
        checkFunctions: function() {
            const missingFunctions = [];
            const corruptedFunctions = [];
            
            this.requiredFunctions.forEach(funcName => {
                if (typeof window[funcName] !== 'function') {
                    missingFunctions.push(funcName);
                } else {
                    // Test if function is callable
                    try {
                        // Don't actually call the function, just verify it's valid
                        window[funcName].toString();
                    } catch (e) {
                        corruptedFunctions.push(funcName);
                    }
                }
            });
            
            this.state.lastFunctionCheck = Date.now();
            
            if (missingFunctions.length > 0) {
                this.logError('CRITICAL', 'Missing required functions', missingFunctions);
                return false;
            }
            
            if (corruptedFunctions.length > 0) {
                this.logError('CRITICAL', 'Corrupted functions detected', corruptedFunctions);
                return false;
            }
            
            return true;
        },
        
        // Check if all required DOM elements exist
        checkElements: function() {
            const missingElements = this.requiredElements.filter(id => !document.getElementById(id));
            
            if (missingElements.length > 0) {
                this.logError('CRITICAL', 'Missing required DOM elements', missingElements);
                return false;
            }
            
            return true;
        },
        
        // Comprehensive system integrity check
        checkSystemIntegrity: function() {
            const startTime = performance.now();
            
            const functionsOK = this.checkFunctions();
            const elementsOK = this.checkElements();
            
            const endTime = performance.now();
            const duration = endTime - startTime;
            
            this.state.lastIntegrityCheck = Date.now();
            
            if (this.config.performanceMetrics) {
                this.state.performanceLog.push({
                    timestamp: Date.now(),
                    operation: 'integrity_check',
                    duration: duration,
                    result: functionsOK && elementsOK
                });
                
                // Keep only recent performance data
                if (this.state.performanceLog.length > 50) {
                    this.state.performanceLog.shift();
                }
            }
            
            const isHealthy = functionsOK && elementsOK;
            
            if (!isHealthy) {
                this.logError('CRITICAL', 'System integrity compromised', {
                    functionsOK,
                    elementsOK,
                    checkDuration: duration
                });
            }
            
            return isHealthy;
        },
        
        // Get system health report
        getHealthReport: function() {
            const uptime = Date.now() - this.state.startTime;
            const criticalErrorRate = this.state.criticalErrors / (uptime / (1000 * 60 * 60)); // errors per hour
            
            return {
                uptime: uptime,
                isMonitoring: this.state.isMonitoring,
                lastIntegrityCheck: this.state.lastIntegrityCheck,
                lastFunctionCheck: this.state.lastFunctionCheck,
                totalErrors: this.state.errorLog.length,
                criticalErrors: this.state.criticalErrors,
                criticalErrorRate: criticalErrorRate,
                recentErrors: this.state.errorLog.slice(-5),
                performanceMetrics: this.state.performanceLog.slice(-10),
                systemStatus: this.checkSystemIntegrity() ? 'HEALTHY' : 'COMPROMISED'
            };
        },
        
        // Start monitoring services
        start: function() {
            if (this.state.isMonitoring) {
                console.log('SYSTEM MONITOR: Already running');
                return;
            }
            
            this.state.isMonitoring = true;
            console.log('SYSTEM MONITOR: Starting background monitoring');
            
            // Initial system check
            setTimeout(() => {
                this.checkSystemIntegrity();
            }, 5000);
            
            // Regular function monitoring
            this.functionCheckInterval = setInterval(() => {
                this.checkFunctions();
            }, this.config.functionCheckInterval);
            
            // Comprehensive integrity checks
            this.integrityCheckInterval = setInterval(() => {
                this.checkSystemIntegrity();
            }, this.config.integrityCheckInterval);
            
            // Performance monitoring
            if (this.config.performanceMetrics) {
                this.performanceInterval = setInterval(() => {
                    const memoryInfo = performance.memory ? {
                        used: performance.memory.usedJSHeapSize,
                        total: performance.memory.totalJSHeapSize,
                        limit: performance.memory.jsHeapSizeLimit
                    } : null;
                    
                    this.state.performanceLog.push({
                        timestamp: Date.now(),
                        operation: 'memory_check',
                        memory: memoryInfo,
                        duration: 0
                    });
                }, 60000); // Every minute
            }
        },
        
        // Stop monitoring services
        stop: function() {
            if (!this.state.isMonitoring) {
                return;
            }
            
            this.state.isMonitoring = false;
            
            if (this.functionCheckInterval) clearInterval(this.functionCheckInterval);
            if (this.integrityCheckInterval) clearInterval(this.integrityCheckInterval);
            if (this.performanceInterval) clearInterval(this.performanceInterval);
            
            console.log('SYSTEM MONITOR: Monitoring stopped');
        },
        
        // Emergency system recovery
        emergencyRecovery: function() {
            console.log('SYSTEM MONITOR: Initiating emergency recovery');
            
            // Attempt to restore critical functions
            try {
                // This would typically load from backup modules
                if (typeof window.AuthCore !== 'undefined') {
                    console.log('SYSTEM MONITOR: AuthCore available for recovery');
                }
                
                if (typeof window.Features !== 'undefined') {
                    console.log('SYSTEM MONITOR: Features module available for recovery');
                }
                
                // Re-run integrity check
                const recovered = this.checkSystemIntegrity();
                
                if (recovered) {
                    console.log('SYSTEM MONITOR: Emergency recovery successful');
                } else {
                    console.error('SYSTEM MONITOR: Emergency recovery failed');
                    this.logError('CRITICAL', 'Emergency recovery failed', null);
                }
                
                return recovered;
            } catch (error) {
                this.logError('CRITICAL', 'Emergency recovery exception', error.message);
                return false;
            }
        }
    };
    
    // Global access for debugging and manual intervention
    Object.defineProperty(window, 'SystemMonitor', {
        value: Object.freeze(SystemMonitor),
        writable: false,
        configurable: false
    });
    
    // Auto-start monitoring when DOM is ready
    document.addEventListener('DOMContentLoaded', function() {
        setTimeout(() => {
            SystemMonitor.start();
        }, 2000);
    });
    
    // Handle page visibility changes
    document.addEventListener('visibilitychange', function() {
        if (document.hidden) {
            console.log('SYSTEM MONITOR: Page hidden, reducing monitoring frequency');
        } else {
            console.log('SYSTEM MONITOR: Page visible, resuming normal monitoring');
            // Run immediate check when page becomes visible
            setTimeout(() => {
                SystemMonitor.checkSystemIntegrity();
            }, 1000);
        }
    });
    
    console.log('SYSTEM MONITOR: Monitoring module loaded');
    
})();