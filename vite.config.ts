import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import {defineConfig, loadEnv} from 'vite';

export default defineConfig(({mode}) => {
  const env = loadEnv(mode, '.', '');
  const isProd = mode === 'production';

  return {
    plugins: [react(), tailwindcss()],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, './'),
      },
    },
    server: {
      middlewareMode: true,
      fs: {
        allow: [".", "src"]
      }
    },
    // ============================================================
    // ESBUILD: Aggressive tree-shaking & minification
    // ============================================================
    esbuild: {
      drop: isProd ? ['console', 'debugger'] : [],
      // Tree-shake aggressively in production
      pure: ['console.log', 'console.info', 'console.debug', 'console.warn'],
      minifyIdentifiers: isProd,
      minifySyntax: isProd,
      minifyWhitespace: isProd,
    },

    // ============================================================
    // BUILD: Advanced code splitting & chunking strategy
    // ============================================================
    build: {
      target: 'esnext',
      minify: 'terser',
      terserOptions: {
        compress: {
          drop_console: true,
          drop_debugger: true,
          pure_funcs: ['console.log', 'console.info', 'console.debug', 'console.warn'],
          passes: 2,
          hoist_funs: true,
          reduce_vars: true,
          // Disable some aggressive optimizations that can break certain libraries
          inline: 2,
        },
        mangle: {
          properties: false,
          // Ensure function names are preserved if needed for certain libraries
          keep_fnames: false,
        },
        format: {
          comments: false,
          beautify: false,
        },
      },

      rollupOptions: {
        output: {
          manualChunks(id) {
            // ✅ Heavy charting library
            if (id.includes('plotly.js') || id.includes('react-plotly')) {
              return 'plotly-chart';
            }

            // ✅ Icons (Grouped together for consistency)
            if (id.includes('lucide-react')) {
              return 'lucide-icons';
            }

            // ✅ Data parsing
            if (id.includes('xlsx')) return 'file-parser-xlsx';
            if (id.includes('papaparse')) return 'file-parser-csv';

            // ✅ Firebase
            if (id.includes('firebase')) return 'firebase-auth';

            // ✅ React Core (Group React, React-DOM and critical related libs)
            // Using a more specific check to avoid matching random packages with "react" in the name
            if (
              id.includes('node_modules/react/') || 
              id.includes('node_modules/react-dom/') ||
              id.includes('node_modules/scheduler/') ||
              id.includes('node_modules/object-assign/')
            ) {
              return 'react-core';
            }

            // ✅ Framer Motion / Motion
            if (id.includes('motion') || id.includes('framer-motion')) {
              return 'animation-core';
            }

            // ✅ Remaining vendor dependencies
            if (id.includes('node_modules')) {
              return 'vendor-other';
            }
          },

          entryFileNames: 'js/[name]-[hash].js',
          chunkFileNames: 'js/[name]-[hash].js',
          assetFileNames: 'assets/[name]-[hash][extname]',
        },
        onwarn(warning, warn) {
          // Ignore intentional large chunks from code splitting
          if (warning.code === 'BUNDLE_SIZE') {
            return;
          }
          // Use default for everything else
          warn(warning);
        },
      },

      // Increase warning threshold since we're doing intentional chunking
      chunkSizeWarningLimit: 1500,
      sourcemap: false,
      cssCodeSplit: true,
      reportCompressedSize: false,
    },

    // ============================================================
    // OPTIMIZE DEPS: Pre-bundle critical dependencies
    // ============================================================
    optimizeDeps: {
      include: [
        'react',
        'react-dom',
        // Motion used in many components - worth pre-bundling
        'motion/react',
        '@motionone/dom',
        // Icons used widely
        'lucide-react',
      ],
      // Exclude heavy libs from pre-bundling (let them load as needed)
      exclude: [
        'plotly.js',
        'xlsx',
        'papaparse',
        'firebase',
        'lenis',
        '@google/genai',
      ],
    },
  };
});
