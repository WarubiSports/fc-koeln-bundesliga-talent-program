import fs from 'node:fs';
const s = fs.readFileSync('temp_app_content.txt','utf8');
const first = s.indexOf('`');
if (first === -1) { console.error('No backtick found'); process.exit(1); }
let html = s.slice(first + 1);

// If file *did* end with a backtick in some cases, strip it
if (html.endsWith('`')) html = html.slice(0, -1);

fs.writeFileSync('client-dist/index.html', html);
console.log('Wrote client-dist/index.html with', html.length, 'bytes');
