// AUTHENTICATION SAFETY BACKUP - DO NOT MODIFY
// This file contains only the critical authentication functions
// Use this for emergency restoration if auth system breaks

// Global authentication functions - must remain accessible
window.showAuthTab = function(tab) {
    // Hide all auth tabs
    document.querySelectorAll('.auth-tab-content').forEach(function(content) {
        content.style.display = 'none';
    });
    
    // Remove active class from all tab buttons
    document.querySelectorAll('.auth-tab-btn').forEach(function(btn) {
        btn.classList.remove('active');
    });
    
    // Show selected tab
    if (tab === 'login') {
        const loginTab = document.getElementById('loginTab');
        if (loginTab) {
            loginTab.style.display = 'block';
            const firstTabBtn = document.querySelector('.auth-tab-btn');
            if (firstTabBtn) firstTabBtn.classList.add('active');
        }
        // Hide forgot password tab if showing
        const forgotTab = document.getElementById('forgotPasswordTab');
        if (forgotTab) forgotTab.style.display = 'none';
    } else if (tab === 'register') {
        const registerTab = document.getElementById('registerTab');
        if (registerTab) {
            registerTab.style.display = 'block';
            const secondTabBtn = document.querySelectorAll('.auth-tab-btn')[1];
            if (secondTabBtn) secondTabBtn.classList.add('active');
        }
    }
};

window.showForgotPassword = function() {
    const loginTab = document.getElementById('loginTab');
    const forgotTab = document.getElementById('forgotPasswordTab');
    
    if (loginTab) loginTab.style.display = 'none';
    if (forgotTab) forgotTab.style.display = 'block';
    
    document.querySelectorAll('.auth-tab-btn').forEach(btn => btn.classList.remove('active'));
};

window.logout = function() {
    currentUser = null;
    localStorage.removeItem('fc-koln-auth');
    document.getElementById('loginPage').style.display = 'block';
    document.getElementById('mainApp').style.display = 'none';
    
    // Reset form
    document.getElementById('email').value = 'max.bisinger@warubi-sports.com';
    document.getElementById('password').value = 'ITP2024';
    document.getElementById('loginMessage').innerHTML = '';
};

// Critical HTML structure reference:
/*
<div id="loginTab" class="auth-tab-content" style="display: block;">
<div id="registerTab" class="auth-tab-content" style="display: none;">
<div id="forgotPasswordTab" class="auth-tab-content" style="display: none;">
<button onclick="showAuthTab('login')">Sign In</button>
<button onclick="showAuthTab('register')">Join Program</button>
<button onclick="showForgotPassword()">Forgot Password?</button>
<button onclick="showAuthTab('login')">← Back to Sign In</button>
*/