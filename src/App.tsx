import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import AuthProvider, { useAuth } from "./context/AuthContext";
import HomePage from "./pages/HomePage";
import CheckoutPage from "./pages/CheckoutPage";
import TrackOrderPage from "./pages/TrackOrderPage";
import PublicTrackingPage from "./pages/PublicTrackingPage";
import AdminLoginPage from "./pages/AdminLoginPage";
import AdminDashboardPage from "./pages/AdminDashboardPage";
import NotFoundPage from "./pages/NotFoundPage";
import './App.css';

// Protected route component
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { currentUser, loading } = useAuth();
  
  // Show loading indicator while auth state is being determined
  if (loading) {
    return <div className="loading">Loading...</div>;
  }
  
  if (!currentUser) {
    return <Navigate to="/admin" />;
  }
  
  return <>{children}</>;
};

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/checkout" element={<CheckoutPage />} />
          <Route path="/track" element={<PublicTrackingPage />} />
          <Route path="/track/:orderId" element={<TrackOrderPage />} />
          <Route path="/admin" element={<AdminLoginPage />} />
          <Route 
            path="/admin/dashboard" 
            element={
              <ProtectedRoute>
                <AdminDashboardPage />
              </ProtectedRoute>
            } 
          />
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
