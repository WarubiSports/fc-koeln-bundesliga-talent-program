import { build } from 'esbuild';

async function buildCJS() {
  try {
    await build({
      entryPoints: ['server/index.ts'],
      outfile: 'dist/index.cjs',
      bundle: true,
      platform: 'node',
      format: 'cjs',
      target: 'node18',
      minify: true,
      external: [
        'bufferutil',
        'utf-8-validate'
      ],
      define: {
        'process.env.NODE_ENV': '"production"',
        'import.meta.dirname': '__dirname',
        'import.meta.filename': '__filename'
      },
      logLevel: 'warning'
    });
    
    console.log('✅ CommonJS production build completed');
    
  } catch (error) {
    console.error('❌ CJS Build failed:', error);
    process.exit(1);
  }
}

buildCJS();
