// AUTHENTICATION BACKUP - Created before stability fixes
// This is a backup of fc-koln-7300-working.js before authentication stability improvements
// Root cause identified: Element ID mismatches causing authentication breakage
// Issue: showAuthTab() was using 'login-auth-tab' and 'register-auth-tab' but HTML uses 'loginTab' and 'registerTab'
// Date: 2025-07-30 23:30

// Authentication functions before fix:
/*
window.showAuthTab = function(tabType) {
    const loginTab = document.getElementById('login-auth-tab');  // WRONG ID
    const registerTab = document.getElementById('register-auth-tab');  // WRONG ID
    const tabButtons = document.querySelectorAll('.auth-tab-btn');
    
    // Remove active from all tabs and buttons
    loginTab.classList.remove('active');
    registerTab.classList.remove('active');
    tabButtons.forEach(btn => btn.classList.remove('active'));
    
    // Show selected tab
    if (tabType === 'login') {
        loginTab.classList.add('active');
        event.target.classList.add('active');
    } else if (tabType === 'register') {
        registerTab.classList.add('active');
        event.target.classList.add('active');
    }
}
*/

// Correct HTML element IDs that should be used:
// - loginTab
// - registerTab  
// - forgotPasswordTab

console.log("Authentication backup created - Element ID mismatch issue documented");