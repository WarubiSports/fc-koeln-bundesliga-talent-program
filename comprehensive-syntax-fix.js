const fs = require('fs');

console.log('Starting comprehensive syntax fix for fc-koln-fixed.js...');

// Read the comprehensive file
let content = fs.readFileSync('fc-koln-fixed.js', 'utf8');
console.log('Original file size:', content.length, 'characters');

// Track all fixes
let fixCount = 0;

// Fix 1: Double-escaped newlines
console.log('Fixing double-escaped newlines...');
const before1 = content.length;
content = content.replace(/\\\\n/g, '\\n');
const after1 = content.length;
if (before1 !== after1) {
    fixCount++;
    console.log('  Fixed double-escaped newlines');
}

// Fix 2: Double-escaped tabs
console.log('Fixing double-escaped tabs...');
content = content.replace(/\\\\t/g, '\\t');
fixCount++;

// Fix 3: Malformed string literals in alerts
console.log('Fixing malformed alert strings...');
content = content.replace(/alert\('([^']*?)\\\\n/g, "alert('$1\\n");
fixCount++;

// Fix 4: Ensure all onclick functions are globally accessible
console.log('Making functions globally accessible...');
const globalFunctions = [
    'showAuthTab', 'showPage', 'logout', 'showAdminTab', 'editPlayer', 
    'viewPlayer', 'deletePlayer', 'showRegistrationType', 'orderGroceries',
    'sendMessage', 'sendAlert', 'systemMonitoring', 'userManagement',
    'dataBackup', 'viewHouseDetails', 'createChore'
];

globalFunctions.forEach(funcName => {
    const regex = new RegExp(`function ${funcName}\\(`, 'g');
    const matches = content.match(regex);
    if (matches) {
        content = content.replace(regex, `window.${funcName} = function(`);
        console.log(`  Made ${funcName} globally accessible`);
        fixCount++;
    }
});

// Fix 5: Fix any remaining unterminated strings
console.log('Checking for unterminated strings...');
const lines = content.split('\n');
let inString = false;
let stringChar = null;
let fixedLines = [];

for (let i = 0; i < lines.length; i++) {
    let line = lines[i];
    let fixedLine = '';
    
    for (let j = 0; j < line.length; j++) {
        const char = line[j];
        const prevChar = j > 0 ? line[j-1] : '';
        
        if (!inString && (char === '"' || char === "'")) {
            inString = true;
            stringChar = char;
        } else if (inString && char === stringChar && prevChar !== '\\') {
            inString = false;
            stringChar = null;
        }
        
        fixedLine += char;
    }
    
    // If we're still in a string at end of line, that's likely an error
    if (inString && line.includes('alert(')) {
        console.log(`  Fixed unterminated string on line ${i + 1}`);
        fixedLine = fixedLine.replace(/\\n'$/, "\\n')");
        inString = false;
        stringChar = null;
        fixCount++;
    }
    
    fixedLines.push(fixedLine);
}

content = fixedLines.join('\n');

// Fix 6: Ensure proper HTML structure
console.log('Verifying HTML structure...');
if (!content.includes('</script>')) {
    console.log('ERROR: Missing closing script tag');
} else if (!content.includes('</body>')) {
    console.log('ERROR: Missing closing body tag');
} else if (!content.includes('</html>`')) {
    console.log('ERROR: Missing closing html tag');
} else {
    console.log('  HTML structure appears correct');
}

// Write the fixed content
fs.writeFileSync('fc-koln-comprehensive-fixed.js', content);

console.log(`\nSyntax fix completed!`);
console.log(`Applied ${fixCount} fixes`);
console.log(`Final file size: ${content.length} characters`);
console.log('Created: fc-koln-comprehensive-fixed.js');