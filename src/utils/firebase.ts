// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
// Only import analytics in browser environment
import { getAnalytics, type Analytics } from "firebase/analytics";
import { getDatabase } from "firebase/database";
import { getAuth } from "firebase/auth";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyBOYwkYywzv834O4rIPj7R0oXv_IsZO9rc",
  authDomain: "biryaniguys-9a6cb.firebaseapp.com",
  databaseURL: "https://biryaniguys-9a6cb-default-rtdb.firebaseio.com",
  projectId: "biryaniguys-9a6cb",
  storageBucket: "biryaniguys-9a6cb.firebasestorage.app",
  messagingSenderId: "492595947342",
  appId: "1:492595947342:web:90b13b8a7673c77cfbe01f",
  measurementId: "G-EXMYLXFJ3F"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Only initialize analytics in browser environment
let analytics: Analytics | null = null;
if (typeof window !== 'undefined') {
  analytics = getAnalytics(app);
}
export { analytics };

// Get Firebase services
export const db = getDatabase(app);
export const auth = getAuth(app); 