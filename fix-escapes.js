const fs = require('fs');
const content = fs.readFileSync('fc-koln-final.js', 'utf8');

// Fix all escape sequence issues
let fixed = content.replace(/\\\\n/g, '\\n');

fs.writeFileSync('fc-koln-final.js', fixed);

console.log('All JavaScript escape sequences fixed');
console.log('File size after fixes:', fs.statSync('fc-koln-final.js').size, 'bytes');