import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import './App.css'
import App from './App.tsx'
import { seedDatabase } from './utils/seedDatabase'

// Try to seed the database but don't block app rendering if it fails
seedDatabase().catch(error => {
  console.error("Failed to seed database, but continuing app initialization:", error);
});

// Find the root element - add error handling
const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error('Root element not found');
}

createRoot(rootElement).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
