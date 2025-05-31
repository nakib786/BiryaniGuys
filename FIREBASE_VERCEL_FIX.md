# Steps to Fix Firebase Build Error on Vercel

This guide addresses the common Firebase resolution error during Vercel deployment:

```
Failed to resolve entry for package "firebase". The package may have incorrect main/module/exports specified in its package.json: Missing "." specifier in "firebase" package
```

## 1. Update Firebase Version

Update your Firebase dependency to version 10.9.0 or later in package.json:

```json
"dependencies": {
  "firebase": "^10.9.0"
}
```

## 2. Create or Update .npmrc File

Create a `.npmrc` file in your project root with the following content:

```
legacy-peer-deps=true
node-linker=hoisted
public-hoist-pattern[]=*firebase*
public-hoist-pattern[]=*react*
shamefully-hoist=true
```

## 3. Update Vite Configuration

Modify your `vite.config.ts` to properly resolve Firebase modules:

```typescript
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'
import { resolve } from 'path'

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
      // Add other Firebase modules you use
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
```

## 4. Update vercel.json

Ensure your `vercel.json` includes increased memory allocation for the build process:

```json
{
  "framework": "vite",
  "buildCommand": "npm run build",
  "devCommand": "npm run dev",
  "installCommand": "npm install",
  "outputDirectory": "dist",
  "routes": [
    {
      "src": "/assets/(.*)",
      "headers": { "cache-control": "public, max-age=31536000, immutable" }
    },
    {
      "handle": "filesystem"
    },
    {
      "src": "/(.*)",
      "dest": "/index.html"
    }
  ],
  "github": {
    "silent": true
  },
  "build": {
    "env": {
      "NODE_OPTIONS": "--max_old_space_size=4096"
    }
  }
}
```

## 5. Firebase Import Best Practices

In your code, make sure to import Firebase modules individually:

```typescript
// Good practice
import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';

// Avoid this
// import firebase from 'firebase';
```

## 6. Clear Vercel Cache

If you still encounter issues after making these changes:

1. Go to your project in the Vercel dashboard
2. Navigate to Settings > General
3. Scroll to the "Build & Development Settings" section
4. Click "Clear Cache and Redeploy"

## 7. Environment Variables

Ensure all your Firebase environment variables are properly set in Vercel:

```
VITE_API_KEY=your-firebase-api-key
VITE_AUTH_DOMAIN=your-firebase-auth-domain
VITE_PROJECT_ID=your-firebase-project-id
VITE_STORAGE_BUCKET=your-firebase-storage-bucket
VITE_MESSAGING_SENDER_ID=your-firebase-messaging-sender-id
VITE_APP_ID=your-firebase-app-id
```

These changes will help resolve the Firebase build error on Vercel by ensuring proper module resolution and compatibility between Firebase, Vite, and Vercel's build environment.
