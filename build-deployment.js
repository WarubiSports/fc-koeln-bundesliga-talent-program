import { build } from 'esbuild';
import { writeFileSync, mkdirSync, existsSync } from 'fs';
import { join } from 'path';

async function buildDeployment() {
  console.log('Building deployment-ready server...');
  
  // Ensure dist directory exists
  if (!existsSync('dist')) {
    mkdirSync('dist', { recursive: true });
  }
  
  try {
    // Build the server with CommonJS format for deployment
    await build({
      entryPoints: ['server/index.ts'],
      outfile: 'dist/index.js',
      bundle: true,
      platform: 'node',
      format: 'cjs', // Changed from esm to cjs
      target: 'node20', // Updated target
      minify: true,
      external: [
        'bufferutil',
        'utf-8-validate',
        'lightningcss',
        '@babel/preset-typescript',
        '@babel/core',
        'esbuild'
      ],
      define: {
        'process.env.NODE_ENV': '"production"',
        'import.meta.dirname': '__dirname',
        'import.meta.filename': '__filename'
      },
      logLevel: 'info'
    });
    
    console.log('✅ Server built successfully in CommonJS format');
    
    // Create a deployment-ready package.json without "type": "module"
    const deploymentPackageJson = {
      name: 'fc-koln-management',
      version: '1.0.0',
      main: 'index.js',
      scripts: {
        start: 'node index.js'
      },
      engines: {
        node: '>=20.0.0'
      }
    };
    
    writeFileSync('dist/package.json', JSON.stringify(deploymentPackageJson, null, 2));
    console.log('✅ Created deployment package.json (CommonJS)');
    
    console.log('🚀 Deployment ready!');
    console.log('- Server: dist/index.js (CommonJS format)');
    console.log('- Package: dist/package.json (no ES modules)');
    console.log('- Target: Node.js 20');
    
  } catch (error) {
    console.error('❌ Build failed:', error);
    process.exit(1);
  }
}

buildDeployment();