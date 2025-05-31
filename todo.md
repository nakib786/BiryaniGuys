# 🍽️ Biryani Guys - Cloud Kitchen App To-Do List

This is a comprehensive step-by-step guide to build the Biryani Guys cloud kitchen app.

## 🔧 1. Project Setup

- [ ] Create a new React app using Vite:
  ```bash
  npm create vite@latest biryani-guys --template react-ts
  cd biryani-guys
  npm install
  ```

- [ ] Install latest dependencies:
  ```bash
  # Core dependencies
  npm install firebase@10.8.0 leaflet@1.9.4 react-leaflet@5.0.0 
  
  # UI dependencies
  npm install tailwindcss@3.4.1 postcss@8.4.35 autoprefixer@10.4.17
  npm install react-router-dom@6.22.2
  
  # Type definitions
  npm install -D @types/leaflet@1.9.8
  
  # Optional UI enhancements
  npm install react-icons@5.0.1 @headlessui/react@1.7.18
  ```

- [ ] Configure Tailwind CSS:
  ```bash
  npx tailwindcss init -p
  ```

- [ ] Update `tailwind.config.js`:
  ```js
  /** @type {import('tailwindcss').Config} */
  export default {
    content: [
      "./index.html",
      "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
      extend: {
        colors: {
          primary: "#E67E22",   // Orange for Biryani theme
          secondary: "#2E8B57", // Forest green accent
        },
      },
    },
    plugins: [],
  }
  ```

- [ ] Update `src/index.css` for Tailwind:
  ```css
  @tailwind base;
  @tailwind components;
  @tailwind utilities;
  
  body {
    @apply bg-gray-50;
  }
  ```

## 🔥 2. Firebase Setup

- [ ] Create Firebase Project at [https://console.firebase.google.com](https://console.firebase.google.com)
- [ ] Enable **Authentication → Email/Password**
- [ ] Enable **Realtime Database → Start in test mode**
- [ ] Add a web app to Firebase and copy config
- [ ] Create `/src/utils/firebase.ts`:
  ```typescript
  import { initializeApp } from "firebase/app";
  import { getDatabase } from "firebase/database";
  import { getAuth } from "firebase/auth";

  const firebaseConfig = {
    apiKey: "YOUR_API_KEY",
    authDomain: "YOUR_AUTH_DOMAIN",
    databaseURL: "YOUR_DATABASE_URL",
    projectId: "YOUR_PROJECT_ID",
    storageBucket: "YOUR_STORAGE_BUCKET",
    messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
    appId: "YOUR_APP_ID"
  };

  // Initialize Firebase
  const app = initializeApp(firebaseConfig);

  // Get Firebase services
  export const db = getDatabase(app);
  export const auth = getAuth(app);
  ```

## 🧾 3. Project Structure

- [ ] Create folder structure:
  ```
  /src
    /assets
    /components
      /ui
      /admin
      /customer
      /map
    /context
    /hooks
    /pages
    /utils
  ```

- [ ] Create routing setup (`/src/App.tsx`):
  ```tsx
  import { BrowserRouter, Routes, Route } from "react-router-dom";
  import HomePage from "./pages/HomePage";
  import TrackOrderPage from "./pages/TrackOrderPage";
  import AdminLoginPage from "./pages/AdminLoginPage";
  import AdminDashboardPage from "./pages/AdminDashboardPage";
  import NotFoundPage from "./pages/NotFoundPage";
  import AuthProvider from "./context/AuthContext";

  function App() {
    return (
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/track/:orderId" element={<TrackOrderPage />} />
            <Route path="/admin" element={<AdminLoginPage />} />
            <Route path="/admin/dashboard" element={<AdminDashboardPage />} />
            <Route path="*" element={<NotFoundPage />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    );
  }

  export default App;
  ```

## 🏗️ 4. Create Context and Hooks

- [ ] Create Auth Context (`/src/context/AuthContext.tsx`):
  ```tsx
  import { createContext, useContext, useEffect, useState } from "react";
  import { 
    User, 
    onAuthStateChanged,
    signInWithEmailAndPassword,
    signOut
  } from "firebase/auth";
  import { auth } from "../utils/firebase";

  type AuthContextType = {
    currentUser: User | null;
    loading: boolean;
    login: (email: string, password: string) => Promise<void>;
    logout: () => Promise<void>;
  };

  const AuthContext = createContext<AuthContextType | null>(null);

  export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
      throw new Error("useAuth must be used within an AuthProvider");
    }
    return context;
  };

  export default function AuthProvider({ children }: { children: React.ReactNode }) {
    const [currentUser, setCurrentUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
      const unsubscribe = onAuthStateChanged(auth, (user) => {
        setCurrentUser(user);
        setLoading(false);
      });

      return unsubscribe;
    }, []);

    const login = async (email: string, password: string) => {
      await signInWithEmailAndPassword(auth, email, password);
    };

    const logout = async () => {
      await signOut(auth);
    };

    const value = {
      currentUser,
      loading,
      login,
      logout,
    };

    return (
      <AuthContext.Provider value={value}>
        {!loading && children}
      </AuthContext.Provider>
    );
  }
  ```

- [ ] Create Firebase hooks:
  - [ ] `/src/hooks/useMenu.ts` - For menu management
  - [ ] `/src/hooks/useOrders.ts` - For order management
  - [ ] `/src/hooks/useLocation.ts` - For location tracking

## 📱 5. Component Development

### Customer-Facing Components:

- [ ] Create `src/components/ui/Header.tsx` - App header with logo
- [ ] Create `src/components/ui/Footer.tsx` - Footer with contact info
- [ ] Create `src/components/customer/MenuList.tsx` - Display food items
- [ ] Create `src/components/customer/OrderForm.tsx` - Order submission form
- [ ] Create `src/components/customer/PaymentInstructions.tsx` - E-transfer details
- [ ] Create `src/components/map/LiveMap.tsx` - Leaflet map for tracking

### Admin Components:

- [ ] Create `src/components/admin/LoginForm.tsx` - Admin authentication
- [ ] Create `src/components/admin/MenuEditor.tsx` - Edit menu items
- [ ] Create `src/components/admin/OrdersList.tsx` - Manage incoming orders
- [ ] Create `src/components/admin/LocationSharing.tsx` - Share delivery location

## 📄 6. Page Development

- [ ] Create `src/pages/HomePage.tsx` - Menu and order form
- [ ] Create `src/pages/TrackOrderPage.tsx` - Order tracking page
- [ ] Create `src/pages/AdminLoginPage.tsx` - Admin login
- [ ] Create `src/pages/AdminDashboardPage.tsx` - Admin control panel
- [ ] Create `src/pages/NotFoundPage.tsx` - 404 page

## 🚀 7. Firebase Implementation

### Menu Management

- [ ] Set up Realtime Database structure for menu items
- [ ] Implement CRUD operations for menu items
- [ ] Add availability toggle for daily menu

### Order Management

- [ ] Create order submission functionality
- [ ] Implement order status updates
- [ ] Add notification system for new orders

### Location Tracking

- [ ] Set up location sharing for delivery personnel
- [ ] Implement real-time location updates with Leaflet

## 💅 8. UI/UX Enhancement

- [ ] Design Biryani Guys logo and branding
- [ ] Add responsive design for mobile and desktop
- [ ] Implement loading states and error handling
- [ ] Add animations and transitions for better UX

## 🔐 9. Security & Testing

- [ ] Secure Firebase Realtime Database with rules
- [ ] Add protected routes for admin dashboard
- [ ] Test all features on different devices
- [ ] Perform basic security audit

## 🚢 10. Deployment

- [ ] Build the app:
  ```bash
  npm run build
  ```

- [ ] Deploy to Firebase Hosting:
  ```bash
  npm install -g firebase-tools
  firebase login
  firebase init
  firebase deploy
  ```

- [ ] Alternative: Deploy to Vercel
  ```bash
  npm install -g vercel
  vercel
  ```

## 📝 Notes

- For the Biryani Guys branding, consider using warm colors (orange, red) in the UI
- Ensure the app is mobile-friendly as most customers will order from phones
- Keep the order form simple and minimize required fields
- Make payment instructions very clear to avoid confusion
- Consider adding a customer phone number verification step

## ✅ Optional Enhancements

- [ ] Add order history for returning customers
- [ ] Implement estimated delivery time calculation
- [ ] Add push notifications for order status changes
- [ ] Create a simple CMS for changing business info (hours, contact details)
- [ ] Add analytics to track popular menu items and busy times 