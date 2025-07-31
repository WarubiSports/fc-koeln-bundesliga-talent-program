// Quick syntax test
console.log('Testing JS execution...');

// Test basic template literal
const test = `Hello world`;
console.log(test);

// Test the actual file
try {
    const fs = require('fs');
    const content = fs.readFileSync('./fc-koln-7300-working.js', 'utf8');
    
    // Find potential issues
    const openBackticks = (content.match(/`/g) || []).length;
    console.log('Backtick count:', openBackticks);
    
    if (openBackticks % 2 !== 0) {
        console.log('❌ Uneven backtick count - template literal not closed properly');
    } else {
        console.log('✅ Backticks balanced');
    }
    
} catch (error) {
    console.error('Error reading file:', error.message);
}