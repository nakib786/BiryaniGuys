# Vercel Deployment Guide for BiryaniGuys

This guide will help you deploy your BiryaniGuys application to Vercel with proper environment configuration.

## Prerequisites

1. A [Vercel account](https://vercel.com/signup)
2. Your project pushed to a Git repository (GitHub, GitLab, or Bitbucket)
3. Your Firebase project credentials and other API keys

## Deployment Steps

### 1. Connect Your Repository

1. Log in to your [Vercel dashboard](https://vercel.com/dashboard)
2. Click "Add New" > "Project"
3. Import your Git repository
4. Select the BiryaniGuys repository

### 2. Configure Project Settings

In the project configuration screen:

- **Framework Preset**: Select "Vite"
- **Build Command**: `npm run build` (should be auto-detected)
- **Output Directory**: `dist` (should be auto-detected)
- **Install Command**: `npm install` (should be auto-detected)

### 3. Set Up Environment Variables

In the "Environment Variables" section, add the following variables:

```
# Firebase Environment Variables - USE THESE EXACT VALUES
VITE_FIREBASE_API_KEY=AIzaSyBOYwkYywzv834O4rIPj7R0oXv_IsZO9rc
VITE_FIREBASE_AUTH_DOMAIN=biryaniguys-9a6cb.firebaseapp.com
VITE_FIREBASE_DATABASE_URL=https://biryaniguys-9a6cb-default-rtdb.firebaseio.com
VITE_FIREBASE_PROJECT_ID=biryaniguys-9a6cb
VITE_FIREBASE_STORAGE_BUCKET=biryaniguys-9a6cb.firebasestorage.app
VITE_FIREBASE_MESSAGING_SENDER_ID=492595947342
VITE_FIREBASE_APP_ID=1:492595947342:web:90b13b8a7673c77cfbe01f
VITE_FIREBASE_MEASUREMENT_ID=G-EXMYLXFJ3F

# If using Twilio (add your own values)
# VITE_TWILIO_SID=your-twilio-sid
# VITE_TWILIO_AUTH_TOKEN=your-twilio-auth-token
```

> **Note**: All client-side environment variables must be prefixed with `VITE_` to be accessible in your React code.

### 4. Deploy Your Project

Click "Deploy" and wait for the deployment to complete.

## Environment Setup for Local Development

To use environment variables locally, create a `.env.local` file in the project root with the same variables:

```
# Firebase Environment Variables - USE THESE EXACT VALUES
VITE_FIREBASE_API_KEY=AIzaSyBOYwkYywzv834O4rIPj7R0oXv_IsZO9rc
VITE_FIREBASE_AUTH_DOMAIN=biryaniguys-9a6cb.firebaseapp.com
VITE_FIREBASE_DATABASE_URL=https://biryaniguys-9a6cb-default-rtdb.firebaseio.com
VITE_FIREBASE_PROJECT_ID=biryaniguys-9a6cb
VITE_FIREBASE_STORAGE_BUCKET=biryaniguys-9a6cb.firebasestorage.app
VITE_FIREBASE_MESSAGING_SENDER_ID=492595947342
VITE_FIREBASE_APP_ID=1:492595947342:web:90b13b8a7673c77cfbe01f
VITE_FIREBASE_MEASUREMENT_ID=G-EXMYLXFJ3F

# If using Twilio (add your own values)
# VITE_TWILIO_SID=your-twilio-sid
# VITE_TWILIO_AUTH_TOKEN=your-twilio-auth-token
```

This file is automatically ignored by Git (via `.gitignore`).

## Using Environment Variables in Your Code

Now you'll need to update your Firebase configuration to use environment variables. Modify `src/utils/firebase.ts`:

```typescript
// Import the functions you need from the SDKs you need
import { initializeApp } from 'firebase/app';
import { getAnalytics } from 'firebase/analytics';
import { getDatabase } from 'firebase/database';
import { getAuth } from 'firebase/auth';
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  databaseURL: import.meta.env.VITE_FIREBASE_DATABASE_URL,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const analytics = getAnalytics(app);

// Get Firebase services
export const db = getDatabase(app);
export const auth = getAuth(app);
```

## Vercel CLI for Advanced Users

For advanced deployment options, you can use the Vercel CLI:

1. Install Vercel CLI: `npm i -g vercel`
2. Login to Vercel: `vercel login`
3. Deploy from local directory: `vercel`
4. Set environment variables: `vercel env add`

## Troubleshooting

### Environment Variables Not Working

- Verify that all environment variables are prefixed with `VITE_`
- Check that your code references them using `import.meta.env.VITE_FIREBASE_VARIABLE_NAME`
- Try redeploying after updating environment variables

### Build Failures

- Check your Vercel build logs
- Ensure your code doesn't have any TypeScript errors
- Verify that all dependencies are installed correctly

## Additional Resources

- [Vercel Documentation](https://vercel.com/docs)
- [Vite Environment Variables Guide](https://vitejs.dev/guide/env-and-mode.html)
- [Firebase with Vercel](https://vercel.com/guides/using-firebase-with-vercel) 