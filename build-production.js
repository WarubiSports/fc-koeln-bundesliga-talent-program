import { build } from 'esbuild';

async function buildProduction() {
  try {
    await build({
      entryPoints: ['server/index.ts'],
      outfile: 'dist/index.js',
      bundle: true,
      platform: 'node',
      format: 'esm',
      target: 'node18',
      minify: true,
      // Only external the truly problematic native dependencies
      external: [
        'bufferutil',
        'utf-8-validate',
        'lightningcss',
        '@babel/preset-typescript',
        '@babel/core'
      ],
      define: {
        'process.env.NODE_ENV': '"production"'
      },
      logLevel: 'warning'
    });
    
    console.log('✅ Production build completed successfully');
    console.log('✅ All dependencies including drizzle-orm are now bundled');
    
  } catch (error) {
    console.error('❌ Build failed:', error);
    process.exit(1);
  }
}

buildProduction();
