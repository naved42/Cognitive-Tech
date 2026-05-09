import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import {defineConfig, loadEnv} from 'vite';

export default defineConfig(({mode}) => {
  const env = loadEnv(mode, '.', '');
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
    esbuild: {
      drop: mode === 'production' ? ['console', 'debugger'] : [],
    },
    build: {
      target: 'esnext',
      minify: 'terser',
      terserOptions: {
        compress: {
          drop_console: true,
          drop_debugger: true,
          pure_funcs: ['console.log', 'console.info', 'console.debug', 'console.warn'],
        },
        format: {
          comments: false,
        },
      },
      rollupOptions: {
        output: {
          manualChunks(id) {
            if (id.includes('node_modules')) {
              // Truly standalone heavy libs — safe to isolate
              if (id.includes('plotly.js')) return 'plotly';
              if (id.includes('xlsx')) return 'xlsx';
              if (id.includes('firebase')) return 'firebase';
              // Everything else in one vendor chunk
              return 'vendor';
            }
          }
        }
      },
      chunkSizeWarningLimit: 1000,
      sourcemap: false,
      cssCodeSplit: true,
      reportCompressedSize: false,
    },
    optimizeDeps: {
      include: [
        'react', 
        'react-dom', 
        'motion/react', 
        'lenis/react',
        'lucide-react'
      ],
    },
  };
});
