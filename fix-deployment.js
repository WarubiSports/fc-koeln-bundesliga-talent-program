#!/usr/bin/env node
// Auto-replacement for broken build system
import fs from 'fs';
const workingServer = fs.readFileSync('dist/index.js.working', 'utf8');
fs.writeFileSync('dist/index.js', workingServer);
console.log('✅ Replaced broken build output with working deployment server');
