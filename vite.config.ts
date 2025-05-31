import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'
import { resolve } from 'path'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': resolve(__dirname, './src'),
      'firebase/app': 'firebase/app/dist/index.mjs',
      'firebase/auth': 'firebase/auth/dist/index.mjs',
      'firebase/firestore': 'firebase/firestore/dist/index.mjs',
      'firebase/storage': 'firebase/storage/dist/index.mjs',
      'firebase/functions': 'firebase/functions/dist/index.mjs',
      'firebase/database': 'firebase/database/dist/index.mjs',
    },
  },
  build: {
    outDir: 'dist',
    minify: true,
    sourcemap: false,
    rollupOptions: {
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
  },
})
