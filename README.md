# React + TypeScript + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Babel](https://babeljs.io/) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh

## Expanding the ESLint configuration

If you are developing a production application, we recommend updating the configuration to enable type-aware lint rules:

```js
export default tseslint.config({
  extends: [
    // Remove ...tseslint.configs.recommended and replace with this
    ...tseslint.configs.recommendedTypeChecked,
    // Alternatively, use this for stricter rules
    ...tseslint.configs.strictTypeChecked,
    // Optionally, add this for stylistic rules
    ...tseslint.configs.stylisticTypeChecked,
  ],
  languageOptions: {
    // other options...
    parserOptions: {
      project: ['./tsconfig.node.json', './tsconfig.app.json'],
      tsconfigRootDir: import.meta.dirname,
    },
  },
})
```

You can also install [eslint-plugin-react-x](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-x) and [eslint-plugin-react-dom](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-dom) for React-specific lint rules:

```js
// eslint.config.js
import reactX from 'eslint-plugin-react-x'
import reactDom from 'eslint-plugin-react-dom'

export default tseslint.config({
  plugins: {
    // Add the react-x and react-dom plugins
    'react-x': reactX,
    'react-dom': reactDom,
  },
  rules: {
    // other rules...
    // Enable its recommended typescript rules
    ...reactX.configs['recommended-typescript'].rules,
    ...reactDom.configs.recommended.rules,
  },
})
```

# BiryaniGuys

This project is a React + TypeScript + Vite application optimized for deployment on Vercel.

## Features

- React with TypeScript
- Vite for fast development and optimized builds
- Firebase integration
- Tailwind CSS for styling
- React Router for navigation
- Leaflet for maps

## Deployment on Vercel

### Environment Variables

When deploying to Vercel, you need to set up the following environment variables in the Vercel dashboard:

1. Go to your project in the Vercel dashboard
2. Navigate to Settings > Environment Variables
3. Add the following variables:

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

### Deployment Process

1. Push your code to GitHub, GitLab, or Bitbucket
2. Connect your repository to Vercel
3. Configure the project:
   - Framework Preset: Vite
   - Build Command: npm run build
   - Output Directory: dist
4. Deploy

## Development

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

## Project Structure

- `src/` - Source code
- `public/` - Static assets
- `dist/` - Build output (generated)

## Optimization for Vercel

This project includes:

- A `vercel.json` configuration file for optimal deployment settings
- Route configurations for SPA navigation
- Cache headers for static assets
- Optimized build settings in vite.config.ts

## Notes

- Environment variables used in the client code must be prefixed with `VITE_` to be accessible in the browser
- The project uses Vercel's serverless functions capabilities for backend operations
