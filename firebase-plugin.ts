// Vite plugin to handle Firebase module resolution
import type { Plugin } from 'vite';

export default function firebaseModuleResolver(): Plugin {
  return {
    name: 'firebase-module-resolver',
    resolveId(source: string) {
      // Map Firebase module imports to their actual paths
      const firebaseModules: Record<string, string> = {
        'firebase/app': 'firebase/app',
        'firebase/auth': 'firebase/auth',
        'firebase/database': 'firebase/database',
        'firebase/analytics': 'firebase/analytics',
        'firebase/firestore': 'firebase/firestore',
        'firebase/storage': 'firebase/storage',
        'firebase/functions': 'firebase/functions',
      };
      
      if (source in firebaseModules) {
        return { id: firebaseModules[source], external: true };
      }
      
      return null;
    }
  };
} 