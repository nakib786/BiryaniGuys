import React, { useState, useEffect } from 'react';
import Header from '../components/ui/Header';
import Footer from '../components/ui/Footer';
import LiveMap from '../components/map/LiveMap';
import { useLocation } from '../hooks/useLocation';
import { Link } from 'react-router-dom';
import { Alert, Snackbar, Typography } from '@mui/material';
import InfoIcon from '@mui/icons-material/Info';

const PublicTrackingPage: React.FC = () => {
  const { deliveryLocation, loading } = useLocation(); // Use without orderId for public tracking
  const [defaultLocation] = useState<[number, number]>([40.7128, -74.0060]); // Default to NYC
  const [showTrackingInfo, setShowTrackingInfo] = useState<boolean>(false);

  // Check if there's an active public delivery tracking
  const isTrackingActive = !!deliveryLocation?.isTracking;

  // Show tracking info when active tracking is detected
  useEffect(() => {
    if (isTrackingActive) {
      setShowTrackingInfo(true);
      // Auto-hide after 15 seconds
      const timer = setTimeout(() => {
        setShowTrackingInfo(false);
      }, 15000);
      
      return () => clearTimeout(timer);
    }
  }, [isTrackingActive]);

  // Get delivery coordinates if available
  const getDeliveryCoordinates = (): [number, number] | undefined => {
    if (deliveryLocation && deliveryLocation.isTracking) {
      return [deliveryLocation.latitude, deliveryLocation.longitude];
    }
    return undefined;
  };

  // Format time as seconds ago if recent, otherwise as time
  const formatUpdateTime = (timestamp: number): string => {
    const now = new Date();
    const updateTime = new Date(timestamp);
    const diffSeconds = Math.floor((now.getTime() - updateTime.getTime()) / 1000);
    
    if (diffSeconds < 60) {
      return `${diffSeconds} seconds ago`;
    } else {
      return updateTime.toLocaleTimeString();
    }
  };

  return (
    <>
      <Header />
      
      <main className="container-custom py-10">
        <h1 className="text-center text-primary mb-8">Live Delivery Tracking</h1>
        
        <Snackbar 
          open={showTrackingInfo && isTrackingActive} 
          anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
          onClose={() => setShowTrackingInfo(false)}
        >
          <Alert 
            severity="info" 
            icon={<InfoIcon />}
            onClose={() => setShowTrackingInfo(false)}
            sx={{ width: '100%' }}
          >
            <Typography variant="subtitle1" fontWeight="bold">
              For best tracking experience
            </Typography>
            <Typography variant="body2">
              To ensure reliable location tracking, please keep this window open and your device unlocked.
            </Typography>
          </Alert>
        </Snackbar>
        
        <div className="card mb-8">
          <div className="bg-primary text-white p-4 rounded-t-lg flex justify-between items-center">
            <h2 className="text-xl font-semibold">Current Delivery Status</h2>
            {isTrackingActive && (
              <div className="flex items-center">
                <div className="animate-pulse w-3 h-3 bg-green-300 rounded-full mr-2"></div>
                <span className="text-sm">Live</span>
              </div>
            )}
          </div>
          
          {loading ? (
            <div className="p-8 text-center">
              <p>Loading tracking information...</p>
            </div>
          ) : !isTrackingActive ? (
            <div className="p-8 text-center">
              <div className="bg-yellow-50 p-4 rounded mb-4">
                <p className="text-yellow-700">No active deliveries at the moment.</p>
                <p className="text-yellow-600 text-sm mt-2">Please check back later or place an order now!</p>
              </div>
              <Link to="/menu" className="btn btn-primary mt-4">View Menu</Link>
            </div>
          ) : (
            <div className="p-4">
              <div className="bg-green-50 p-4 rounded mb-4">
                <p className="text-green-700 font-semibold">
                  A delivery is currently active!
                </p>
                <p className="text-green-600 text-sm mt-1">
                  Driver: {deliveryLocation?.driverName || 'Delivery Driver'}
                </p>
                {deliveryLocation && (
                  <p className="text-green-600 text-sm mt-1">
                    Last update: {formatUpdateTime(deliveryLocation.timestamp)}
                  </p>
                )}
                <p className="text-blue-600 text-sm mt-3 border-t border-green-200 pt-2">
                  <InfoIcon style={{ fontSize: '1rem', verticalAlign: 'middle', marginRight: '4px' }} />
                  For reliable tracking, keep this browser window open and your device unlocked.
                </p>
              </div>
              
              <div className="h-[500px] rounded-lg overflow-hidden shadow-md">
                <LiveMap
                  customerLocation={defaultLocation}
                  deliveryLocation={getDeliveryCoordinates()}
                  orderId="public"
                  driverName={deliveryLocation?.driverName || 'Delivery Driver'}
                  autoCenterOnDriver={true}
                  timestamp={deliveryLocation?.timestamp}
                />
              </div>
              
              <div className="text-center mt-6">
                <p className="text-gray-600 mb-4">Want to enjoy our delicious biryani?</p>
                <div className="flex justify-center gap-4">
                  <Link to="/menu" className="btn btn-primary">
                    Order Now
                  </Link>
                  <Link to="/" className="btn btn-outline">
                    Back to Home
                  </Link>
                </div>
              </div>
            </div>
          )}
        </div>
        
        <div className="card">
          <div className="p-6">
            <h2 className="text-xl font-semibold mb-4">About Our Tracking</h2>
            <p className="mb-4">
              At BiryaniGuys, we believe in transparency. Our public tracking system allows you to see
              our delivery drivers in real-time as they bring delicious food to our customers.
            </p>
            <p className="mb-4">
              Whether you've placed an order or are just curious about our delivery range,
              you can use this page to track our current deliveries in your area.
            </p>
            <p>
              When you place an order, you'll receive a direct link to track your specific delivery
              with more detailed information about your order status.
            </p>
          </div>
        </div>
      </main>
      
      <Footer />
    </>
  );
};

export default PublicTrackingPage; 