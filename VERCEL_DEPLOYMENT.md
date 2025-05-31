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
VITE_API_KEY=your-firebase-api-key
VITE_AUTH_DOMAIN=your-firebase-auth-domain
VITE_PROJECT_ID=your-firebase-project-id
VITE_STORAGE_BUCKET=your-firebase-storage-bucket
VITE_MESSAGING_SENDER_ID=your-firebase-messaging-sender-id
VITE_APP_ID=your-firebase-app-id

# If using Twilio
VITE_TWILIO_SID=your-twilio-sid
VITE_TWILIO_AUTH_TOKEN=your-twilio-auth-token
```

> **Note**: All client-side environment variables must be prefixed with `VITE_` to be accessible in your React code.

### 4. Deploy Your Project

Click "Deploy" and wait for the deployment to complete.

## Environment Setup for Local Development

To use environment variables locally, create a `.env.local` file in the project root with the same variables:

```
VITE_API_KEY=your-firebase-api-key
VITE_AUTH_DOMAIN=your-firebase-auth-domain
VITE_PROJECT_ID=your-firebase-project-id
VITE_STORAGE_BUCKET=your-firebase-storage-bucket
VITE_MESSAGING_SENDER_ID=your-firebase-messaging-sender-id
VITE_APP_ID=your-firebase-app-id

# If using Twilio
VITE_TWILIO_SID=your-twilio-sid
VITE_TWILIO_AUTH_TOKEN=your-twilio-auth-token
```

This file is automatically ignored by Git (via `.gitignore`).

## Using Environment Variables in Your Code

In your React components, access environment variables like this:

```typescript
// Example Firebase initialization
import { initializeApp } from 'firebase/app';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_API_KEY,
  authDomain: import.meta.env.VITE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_APP_ID
};

const app = initializeApp(firebaseConfig);
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
- Check that your code references them using `import.meta.env.VITE_VARIABLE_NAME`
- Try redeploying after updating environment variables

### Build Failures

- Check your Vercel build logs
- Ensure your code doesn't have any TypeScript errors
- Verify that all dependencies are installed correctly

## Additional Resources

- [Vercel Documentation](https://vercel.com/docs)
- [Vite Environment Variables Guide](https://vitejs.dev/guide/env-and-mode.html)
- [Firebase with Vercel](https://vercel.com/guides/using-firebase-with-vercel) 