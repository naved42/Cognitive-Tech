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
      minify: 'esbuild',
      rollupOptions: {
        output: {
          manualChunks(id) {
            // 1. Heavy Visualization - Dedicated async chunk
            if (id.includes('plotly.js')) return 'plotly';
            
            // 2. Heavy Data Processing - Isolated
            if (id.includes('xlsx')) return 'xlsx';
            
            // 3. Firebase Splitting - Essential for FCP
            // Auth is critical, Firestore is heavy and deferred
            if (id.includes('firebase/app') || id.includes('firebase/auth')) return 'firebase-auth';
            if (id.includes('firebase/firestore')) return 'firebase-db';
            
            // 4. UI Framework Core - Stable & Cacheable
            if (id.includes('node_modules')) {
              if (id.includes('react') || id.includes('react-dom') || id.includes('react-router')) {
                return 'vendor-core';
              }
              // 5. Interaction & Animation - Non-blocking
              if (id.includes('motion/react') || id.includes('framer-motion')) return 'animations';
              if (id.includes('lucide-react')) return 'icons';
              if (id.includes('lenis')) return 'scroll-engine';
              
              // 6. Rest of Node Modules
              return 'vendor-libs';
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
