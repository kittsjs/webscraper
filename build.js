import esbuild from 'esbuild';

const isProduction = process.env.NODE_ENV === 'production';
const isWatch = process.argv.includes('--watch');

const buildOptions = {
  entryPoints: ['index.js'],
  bundle: true,
  platform: 'node',
  target: 'node18',
  format: 'esm',
  outdir: 'dist',
  minify: isProduction,
  sourcemap: !isProduction,
  banner: {
    js: '#!/usr/bin/env node',
  },
  external: [
    // Don't bundle these - they should be installed as dependencies
    'puppeteer',
    'express',
  ],
  define: {
    'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV || 'production'),
  },
};

async function build() {
  try {
    if (isWatch) {
      console.log('Building application in watch mode...');
      const ctx = await esbuild.context({
        ...buildOptions,
        minify: false,
        sourcemap: true,
      });
      
      await ctx.watch();
      console.log('✓ Watching for changes...');
    } else {
      console.log(`Building application (${isProduction ? 'production' : 'development'})...`);
      
      await esbuild.build({
        ...buildOptions,
        minify: isProduction,
        sourcemap: !isProduction,
      });
      
      console.log('✓ Build completed successfully');
    }
  } catch (error) {
    console.error('Build failed:', error);
    process.exit(1);
  }
}

build();

