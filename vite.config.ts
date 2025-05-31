import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'
import { resolve } from 'path'
import firebaseModuleResolver from './firebase-plugin'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), firebaseModuleResolver()],
  resolve: {
    alias: {
      '@': resolve(__dirname, './src'),
    },
  },
  build: {
    outDir: 'dist',
    minify: true,
    sourcemap: false,
    rollupOptions: {
      external: [
        'firebase/app',
        'firebase/auth',
        'firebase/database',
        'firebase/analytics',
        'firebase/firestore',
        'firebase/storage',
        'firebase/functions',
      ],
      output: {
        manualChunks: (id) => {
          if (id.includes('node_modules')) {
            if (id.includes('firebase')) return 'firebase';
            if (id.includes('react')) return 'vendor';
            return 'vendor'; // all other node_modules
          }
        }
      },
    },
    commonjsOptions: {
      include: [/node_modules/],
    },
  },
  optimizeDeps: {
    esbuildOptions: {
      target: 'es2020',
    },
    include: ['firebase/app', 'firebase/auth', 'firebase/database', 'firebase/analytics'],
  },
})
