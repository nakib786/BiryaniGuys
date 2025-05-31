import React, { useEffect, useState } from 'react';
import { useLocation } from '../../hooks/useLocation';
import LiveMap from '../map/LiveMap';

interface LiveLocationControlProps {
  onClose?: () => void;
}

const LiveLocationControl: React.FC<LiveLocationControlProps> = ({ onClose }) => {
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [customerLocation] = useState<[number, number]>([51.505, -0.09]); // Default location (London)
  const [lastUpdateTime, setLastUpdateTime] = useState<number>(Date.now());
  const [isStoppingTracking, setIsStoppingTracking] = useState<boolean>(false);
  
  // Use the location hook for public tracking
  const { 
    startPublicTracking,
    stopLiveTracking, 
    isTracking, 
    deliveryLocation,
    getPublicLocation,
    updateLocation
  } = useLocation();
  
  // Check if public location is active on mount
  useEffect(() => {
    const checkPublicLocation = async () => {
      await getPublicLocation();
    };
    
    checkPublicLocation();
  }, [getPublicLocation]);

  // Update the last update time whenever delivery location changes
  useEffect(() => {
    if (deliveryLocation) {
      setLastUpdateTime(deliveryLocation.timestamp);
    }
  }, [deliveryLocation]);

  // Calculate time since last update
  const getTimeSinceUpdate = () => {
    const now = Date.now();
    const diffMs = now - lastUpdateTime;
    const diffSecs = Math.floor(diffMs / 1000);
    
    if (diffSecs < 5) {
      return 'just now';
    } else if (diffSecs < 60) {
      return `${diffSecs} seconds ago`;
    } else {
      return `${Math.floor(diffSecs / 60)} minutes ago`;
    }
  };

  // Start live tracking
  const handleStartTracking = async () => {
    // Get the initial location immediately for instant feedback
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const { latitude, longitude } = position.coords;
          // Update location first to avoid delay
          await updateLocation({ latitude, longitude }, 'Delivery Driver');
          
          // Then start continuous tracking
          const success = await startPublicTracking('Delivery Driver');
          if (!success) {
            setError('Failed to start location tracking. Please check location permissions.');
          }
        },
        (err) => {
          console.error('Initial location error:', err);
          setError('Failed to get initial location. Please check location permissions.');
        },
        { 
          enableHighAccuracy: true,
          timeout: 5000
        }
      );
    }
  };

  // Stop live tracking
  const handleStopTracking = async () => {
    try {
      setIsStoppingTracking(true);
      setError(null); // Clear any previous errors
      setSuccessMessage(null); // Clear any previous success messages
      
      // Clear the tracking
      const success = await stopLiveTracking();
      
      if (success) {
        // Set success message
        setSuccessMessage('Location sharing stopped successfully!');
        
        // Clear success message after 5 seconds
        setTimeout(() => {
          setSuccessMessage(null);
        }, 5000);
      } else {
        setError('Failed to stop location tracking. Please try again.');
      }
    } catch (err) {
      console.error('Error in stop tracking:', err);
      setError('An error occurred while stopping tracking.');
    } finally {
      setIsStoppingTracking(false);
    }
  };

  return (
    <div className="p-4 bg-white rounded-lg shadow-md">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold">Live Location Control</h2>
        {onClose && (
          <button onClick={onClose} className="btn btn-sm btn-circle">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        )}
      </div>
      
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          <span className="font-bold">Error:</span> {error}
        </div>
      )}
      
      {successMessage && (
        <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">
          <span className="font-bold">Success:</span> {successMessage}
        </div>
      )}
      
      <div className="mb-4">
        <div className="flex justify-center mb-6">
          {isTracking ? (
            <button
              onClick={handleStopTracking}
              className="btn btn-danger btn-lg w-full max-w-md flex justify-center items-center gap-2"
              disabled={isStoppingTracking}
            >
              {isStoppingTracking ? (
                <>
                  <div className="animate-spin h-5 w-5 border-2 border-white rounded-full border-t-transparent"></div>
                  <span>Stopping...</span>
                </>
              ) : (
                <>
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                  Stop Live Tracking
                </>
              )}
            </button>
          ) : (
            <button
              onClick={handleStartTracking}
              className="btn btn-primary btn-lg w-full max-w-md"
            >
              <svg className="w-6 h-6 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
              Start Live Tracking
            </button>
          )}
        </div>
        
        <div>
          <h3 className="text-lg font-medium mb-2">Live Map</h3>
          
          {isTracking && (
            <div className="flex items-center mb-2 bg-green-50 p-2 rounded">
              <div className="animate-pulse w-3 h-3 bg-green-500 rounded-full mr-2"></div>
              <span className="text-sm text-green-700">
                Location broadcasting live - Updated {getTimeSinceUpdate()}
              </span>
            </div>
          )}
          
          <LiveMap
            customerLocation={customerLocation}
            deliveryLocation={deliveryLocation ? [deliveryLocation.latitude, deliveryLocation.longitude] : undefined}
            orderId="public"
            driverName="Delivery Driver"
            autoCenterOnDriver={true}
            timestamp={deliveryLocation?.timestamp}
          />
          
          {isTracking && deliveryLocation && (
            <div className="mt-2 text-sm">
              <p>
                <strong>Last update:</strong> {new Date(deliveryLocation.timestamp).toLocaleTimeString()}
              </p>
              <p>
                <strong>Coordinates:</strong> {deliveryLocation.latitude.toFixed(6)}, {deliveryLocation.longitude.toFixed(6)}
              </p>
              <p className="text-xs text-green-600 mt-1">
                <strong>Update frequency:</strong> Every 1 second
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default LiveLocationControl; 