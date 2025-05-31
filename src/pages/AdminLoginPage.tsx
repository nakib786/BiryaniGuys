import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const AdminLoginPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  // Request location permission
  const requestLocationPermission = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        () => {
          console.log('Location permission granted');
          navigate('/admin/dashboard');
        },
        (error) => {
          console.error('Location permission denied:', error);
          // Still navigate to dashboard even if permission denied
          navigate('/admin/dashboard');
        },
        { enableHighAccuracy: true }
      );
    } else {
      console.error('Geolocation not supported by this browser');
      navigate('/admin/dashboard');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      setError('');
      setLoading(true);
      await login(email, password);
      
      // After successful login, request location permission
      requestLocationPermission();
    } catch (err) {
      setError('Failed to sign in. Please check your credentials.');
      console.error(err);
      setLoading(false);
    }
  };

  return (
    <div className="container-custom py-10 max-w-md mx-auto">
      <h1 className="text-center text-primary mb-8">Admin Login</h1>
      <div className="card">
        {error && <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">{error}</div>}
        
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label htmlFor="email" className="block text-gray-700 mb-2">Email</label>
            <input 
              type="email" 
              id="email"
              className="input" 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          
          <div className="mb-6">
            <label htmlFor="password" className="block text-gray-700 mb-2">Password</label>
            <input 
              type="password" 
              id="password"
              className="input" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          
          <div className="text-center">
            <button 
              type="submit" 
              className="btn btn-primary w-full"
              disabled={loading}
            >
              {loading ? 'Signing in...' : 'Sign In'}
            </button>
          </div>
        </form>
        
        <div className="mt-4 text-center">
          <a href="/" className="text-primary hover:underline">Back to Home</a>
        </div>
        
        <div className="mt-4 text-center text-sm text-gray-500">
          <p>Location access will be requested after login for delivery tracking.</p>
        </div>
      </div>
    </div>
  );
};

export default AdminLoginPage; 