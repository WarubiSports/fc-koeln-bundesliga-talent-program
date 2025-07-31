// CRITICAL AUTHENTICATION BACKUP - PERMANENT STABLE VERSION
// This file contains the core authentication functions that MUST remain functional
// Created: July 31, 2025 - Authentication Stabilization Protocol
// DO NOT MODIFY without extensive testing

// Global authentication functions - MUST remain accessible
window.showAuthTab = function(tab) {
    const loginTab = document.getElementById('loginTab');
    const forgotTab = document.getElementById('forgotPasswordTab');
    const loginBtn = document.querySelector('.auth-tab[onclick="showAuthTab(\'login\')"]');
    const forgotBtn = document.querySelector('.auth-tab[onclick="showAuthTab(\'forgot\')"]');
    
    if (tab === 'login') {
        if (loginTab) loginTab.style.display = 'block';
        if (forgotTab) forgotTab.style.display = 'none';
        if (loginBtn) loginBtn.classList.add('active');
        if (forgotBtn) forgotBtn.classList.remove('active');
    } else if (tab === 'forgot') {
        if (loginTab) loginTab.style.display = 'none';
        if (forgotTab) forgotTab.style.display = 'block';
        if (loginBtn) loginBtn.classList.remove('active');
        if (forgotBtn) forgotBtn.classList.add('active');
    }
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
    if (targetPage) {
        targetPage.classList.add('active');
    }
    
    const targetNav = document.querySelector(`[onclick="showPage('${pageId}')"]`);
    if (targetNav) {
        targetNav.classList.add('active');
    }
};

window.logout = function() {
    document.getElementById('authScreen').style.display = 'flex';
    document.getElementById('mainApp').style.display = 'none';
    // Clear any stored auth data
    sessionStorage.clear();
    localStorage.removeItem('userRole');
    console.log('User logged out successfully');
};

// Core login functionality
window.login = function() {
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    
    if (!email || !password) {
        alert('Please enter both email and password');
        return;
    }

    // Valid credentials check
    const validCredentials = [
        { email: 'max.bisinger@warubi-sports.com', password: 'ITP2024', role: 'admin' },
        { email: 'thomas.ellinger@warubi-sports.com', password: 'ITP2024', role: 'staff' }
    ];

    const user = validCredentials.find(cred => 
        cred.email.toLowerCase() === email.toLowerCase() && cred.password === password
    );

    if (user) {
        // Store user role
        localStorage.setItem('userRole', user.role);
        
        // Show main app
        document.getElementById('authScreen').style.display = 'none';
        document.getElementById('mainApp').style.display = 'block';
        
        // Show appropriate navigation based on role
        updateNavigationForRole(user.role);
        
        // Show dashboard by default
        window.showPage('dashboard');
        
        console.log(`Login successful: ${user.email} (${user.role})`);
    } else {
        alert('Invalid email or password. Please try again.');
    }
};

// Navigation role management
function updateNavigationForRole(role) {
    const adminNav = document.querySelector('[onclick="showPage(\'admin\')"]');
    
    if (role === 'admin') {
        if (adminNav) adminNav.style.display = 'block';
    } else {
        if (adminNav) adminNav.style.display = 'none';
    }
}

// Forgot password functionality
window.sendPasswordReset = function() {
    const email = document.getElementById('resetEmail').value;
    if (!email) {
        alert('Please enter your email address');
        return;
    }
    
    // Simulate password reset
    alert(`Password reset instructions have been sent to ${email}`);
    window.showAuthTab('login');
};

// CRITICAL: Ensure functions are globally accessible on page load
document.addEventListener('DOMContentLoaded', function() {
    // Verify all critical functions are accessible
    const criticalFunctions = ['showAuthTab', 'showForgotPassword', 'showPage', 'logout', 'login'];
    
    criticalFunctions.forEach(funcName => {
        if (typeof window[funcName] !== 'function') {
            console.error(`CRITICAL: ${funcName} is not globally accessible!`);
        } else {
            console.log(`✓ ${funcName} is properly accessible`);
        }
    });
    
    console.log('Authentication system initialized and verified');
});