import { build, context  } from 'esbuild';
import { nodeModulesPolyfillPlugin } from 'esbuild-plugins-node-modules-polyfill';
import copy from 'esbuild-plugin-copy';

build({
  entryPoints: ['src/background.js', 'src/content.js', 'src/popup.js'],
  bundle: true,
  platform: 'browser',
  define: { global: 'globalThis' },
  outdir: 'dist',
  entryNames: '[name]',

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
    copy({                                           // ← configure it here
      assets: [
        // Copy all files from src/ to dist/, preserving subfolders
        { from: ['src/**/*.html', 'src/**/*.css', 'src/**/*.json'], to: ['./'] },
        { from: ['src/icons/*'], to: ['./icons'] },
        // // Copy CSS into dist/styles/
        // { from: ['src/**/*.css'], to: ['./styles'] },

        // // Copy JSON into dist/data/
        // { from: ['src/**/*.json'], to: ['./'] },
      ],

      // Optional settings:
      copyOnStart: true,    // run copy on first build (default is onEnd)
      // verbose: true,        // log every file copied
      // watch: true,       // if you also use esbuild.build({ watch: true }), this limits copy to changed files
    }),
  ],
}).catch(() => process.exit(1));
