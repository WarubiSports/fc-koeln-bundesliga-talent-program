const fs = require('fs');

console.log('Starting comprehensive JavaScript syntax fix...');

// Read the original comprehensive file
let content = fs.readFileSync('fc-koln-clean.js', 'utf8');

console.log('Original file size:', content.length, 'characters');

// Fix all known syntax issues systematically
console.log('Fixing escape sequences...');
content = content.replace(/\\\\n/g, '\\n');
content = content.replace(/\\\\t/g, '\\t');

console.log('Ensuring proper script structure...');

// Find the showAuthTab function and make it globally accessible
console.log('Making showAuthTab globally accessible...');
content = content.replace(
    /function showAuthTab\(tabType\) \{/g, 
    'window.showAuthTab = function(tabType) {'
);

// Ensure all functions that might be called from HTML are globally accessible
const globalFunctions = [
    'showPage', 'logout', 'showAdminTab', 'showRegistrationType', 
    'editPlayer', 'viewPlayer', 'deletePlayer'
];

globalFunctions.forEach(funcName => {
    const regex = new RegExp(`function ${funcName}\\(`, 'g');
    content = content.replace(regex, `window.${funcName} = function(`);
});

// Fix any malformed string literals
console.log('Fixing string literals...');
content = content.replace(/alert\('([^']*?)\\n'/g, "alert('$1\\n'");

// Ensure proper HTML structure termination
console.log('Verifying HTML structure...');
if (!content.includes('</html>`;')) {
    console.log('ERROR: HTML structure not properly terminated');
}

// Write the fixed content
fs.writeFileSync('fc-koln-clean.js', content);

console.log('Final file size:', content.length, 'characters');
console.log('Comprehensive fix completed!');