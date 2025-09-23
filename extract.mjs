import fs from 'node:fs';

const s = fs.readFileSync('temp_app_content.txt','utf8');
const first = s.indexOf('`');
if (first === -1) { console.error('No opening backtick found'); process.exit(1); }
const second = s.indexOf('`', first + 1);
if (second === -1) { console.error('No closing backtick found'); process.exit(1); }
const html = s.slice(first + 1, second);
fs.writeFileSync('client-dist/index.html', html);
console.log('Wrote client-dist/index.html with', html.length, 'bytes');
