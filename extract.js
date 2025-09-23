const fs = require('fs');
const s = fs.readFileSync('temp_app_content.txt','utf8');
// find FIRST opening backtick and the NEXT closing backtick
const start = s.indexOf('`');
if (start === -1) throw new Error('No opening backtick found');
const end = s.indexOf('`', start + 1);
if (end === -1) throw new Error('No closing backtick found');
const html = s.slice(start + 1, end);
fs.writeFileSync('client-dist/index.html', html);
console.log('Wrote client-dist/index.html with', html.length, 'bytes');
