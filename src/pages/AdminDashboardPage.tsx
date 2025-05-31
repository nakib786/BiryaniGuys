import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import MenuEditor from '../components/admin/MenuEditor';
import OrderManagement from '../components/admin/OrderManagement';
import LiveLocationControl from '../components/admin/LiveLocationControl';

const AdminDashboardPage: React.FC = () => {
  const { logout } = useAuth();
  const [activeTab, setActiveTab] = useState<'orders' | 'menu' | 'tracking'>('orders');
  const [locationPermission, setLocationPermission] = useState<boolean>(false);

  // Check location permission on component mount
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.permissions.query({ name: 'geolocation' }).then(result => {
        if (result.state === 'granted') {
          setLocationPermission(true);
        }
      });
    }
  }, []);

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error('Failed to log out', error);
    }
  };

  const requestLocationPermission = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        () => {
          setLocationPermission(true);
        },
        (error) => {
          console.error('Location permission denied:', error);
        }
      );
    }
  };

  const handleCloseTracking = () => {
    setActiveTab('orders');
  };

  return (
    <div className="container-custom py-10">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-primary font-display text-2xl font-bold">Admin Dashboard</h1>
        <button 
          onClick={handleLogout}
          className="btn btn-outline"
        >
          Logout
        </button>
      </div>
      
      <div className="mb-6">
        <div className="tabs tabs-boxed bg-white shadow-sm p-1 rounded-lg">
          <button 
            className={`tab tab-lg ${activeTab === 'orders' ? 'tab-active bg-primary text-white' : 'text-gray-700 hover:text-primary'}`}
            onClick={() => setActiveTab('orders')}
          >
            <span className="flex items-center">
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
              Orders
            </span>
          </button>
          <button 
            className={`tab tab-lg ${activeTab === 'menu' ? 'tab-active bg-primary text-white' : 'text-gray-700 hover:text-primary'}`}
            onClick={() => setActiveTab('menu')}
          >
            <span className="flex items-center">
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              Menu
            </span>
          </button>
          <button 
            className={`tab tab-lg ${activeTab === 'tracking' ? 'tab-active bg-primary text-white' : 'text-gray-700 hover:text-primary'}`}
            onClick={() => setActiveTab('tracking')}
          >
            <span className="flex items-center">
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              Live Tracking
            </span>
          </button>
        </div>
      </div>
      
      <div className="content">
        {activeTab === 'orders' && (
          <div className="card">
            <h2 className="text-xl font-semibold mb-4">Orders</h2>
            <OrderManagement />
          </div>
        )}
        
        {activeTab === 'menu' && (
          <div className="card">
            <h2 className="text-xl font-semibold mb-4">Menu Management</h2>
            <MenuEditor />
          </div>
        )}
        
        {activeTab === 'tracking' && (
          <div className="card">
            <h2 className="text-xl font-semibold mb-4">Live Location Tracking</h2>
            {!locationPermission ? (
              <div className="bg-yellow-50 p-4 rounded-lg mb-4">
                <p className="text-yellow-700 mb-2">
                  Location permission is required for tracking deliveries.
                </p>
                <button 
                  onClick={requestLocationPermission}
                  className="btn btn-primary"
                >
                  Grant Location Access
                </button>
              </div>
            ) : (
              <LiveLocationControl onClose={handleCloseTracking} />
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminDashboardPage; 