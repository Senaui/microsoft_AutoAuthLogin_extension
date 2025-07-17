import { build } from 'esbuild';
import { nodeModulesPolyfillPlugin } from 'esbuild-plugins-node-modules-polyfill';

build({
  entryPoints: ['src/background.js', 'src/content.js'],
  bundle: true,
  platform: 'browser',
  define: { global: 'globalThis' },
  outdir: 'dist',
  entryNames: '[name].bundle',

  plugins: [
    nodeModulesPolyfillPlugin({
      globals: { process: true, Buffer: true },
      modules: {           // Use an object so you can mix true/false/'empty'
        crypto: true,
        path: true,
        buffer: true,  
        process: true   // ← Polyfill Buffer and node:buffer
      },
    }),
  ],
}).catch(() => process.exit(1));
