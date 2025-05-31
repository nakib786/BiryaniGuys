import { useState, useEffect, useRef } from 'react';
import { ref, onValue, update, get } from 'firebase/database';
import { db } from '../utils/firebase';

interface LocationData {
  latitude: number;
  longitude: number;
  timestamp: number;
  isTracking?: boolean;
  driverName?: string;
}

export const useLocation = (orderId?: string) => {
  const [deliveryLocation, setDeliveryLocation] = useState<LocationData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isTracking, setIsTracking] = useState(false);
  const [watchId, setWatchId] = useState<number | null>(null);
  const locationUpdateInterval = useRef<number | null>(null);

  // Subscribe to location updates for a specific order or public location
  useEffect(() => {
    // Always subscribe to public location
    const publicLocationRef = ref(db, 'public_location');
    
    const publicUnsubscribe = onValue(publicLocationRef, (snapshot) => {
      try {
        const data = snapshot.val();
        if (data && data.isTracking) {
          setDeliveryLocation(data);
          setIsTracking(data.isTracking);
          setLoading(false);
        }
      } catch (err) {
        console.error('Error with public location data:', err);
      }
    });
    
    // If orderId is provided, also subscribe to order-specific location as backup
    let orderUnsubscribe = () => {};
    if (orderId) {
      const orderLocationRef = ref(db, `locations/${orderId}`);
      
      orderUnsubscribe = onValue(orderLocationRef, (snapshot) => {
        try {
          const data = snapshot.val();
          // Only use order-specific data if no public tracking is active
          if (data && (!deliveryLocation || !deliveryLocation.isTracking)) {
            setDeliveryLocation(data);
            setIsTracking(data.isTracking || false);
          }
          setLoading(false);
        } catch (err) {
          setError('Failed to get location data');
          setLoading(false);
          console.error(err);
        }
      });
    } else {
      // If no orderId, we're done loading after public location check
      setLoading(false);
    }
    
    return () => {
      publicUnsubscribe();
      orderUnsubscribe();
    };
  }, [orderId, deliveryLocation]);

  // Clean up watch position and interval when component unmounts
  useEffect(() => {
    return () => {
      if (watchId !== null) {
        navigator.geolocation.clearWatch(watchId);
      }
      if (locationUpdateInterval.current !== null) {
        clearInterval(locationUpdateInterval.current);
        locationUpdateInterval.current = null;
      }
    };
  }, [watchId]);

  // Update the delivery location (for delivery personnel)
  const updateLocation = async (location: { latitude: number; longitude: number }, driverName?: string) => {
    try {
      // If orderId is provided, update that order's location, otherwise update public location
      const locationPath = orderId ? `locations/${orderId}` : 'public_location';
      const locationRef = ref(db, locationPath);
      
      await update(locationRef, {
        ...location,
        timestamp: Date.now(),
        driverName: driverName || deliveryLocation?.driverName || 'Delivery Driver'
      });
      
      return true;
    } catch (err) {
      console.error('Error updating location:', err);
      return false;
    }
  };

  // Get location coordinates as [latitude, longitude] for Leaflet
  const getCoordinates = (): [number, number] | null => {
    if (!deliveryLocation) return null;
    return [deliveryLocation.latitude, deliveryLocation.longitude];
  };

  // Start public location tracking (for admin/delivery personnel)
  const startPublicTracking = async (driverName?: string) => {
    if (!navigator.geolocation) return false;
    
    try {
      // Get initial position
      let initialPosition = { 
        latitude: 50.6745, 
        longitude: -120.3273,  // Default to downtown Kamloops
        timestamp: Date.now()
      };
      
      try {
        // Try to get actual position
        const position = await new Promise<GeolocationPosition>((resolve, reject) => {
          navigator.geolocation.getCurrentPosition(resolve, reject, {
            enableHighAccuracy: true,
            timeout: 5000,
            maximumAge: 0
          });
        });
        
        initialPosition = {
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          timestamp: Date.now()
        };
      } catch (posError) {
        console.warn('Using default position for Kamloops:', posError);
      }
      
      // Set initial tracking state in public location
      const locationRef = ref(db, 'public_location');
      await update(locationRef, { 
        ...initialPosition,
        isTracking: true,
        driverName: driverName || 'Delivery Driver'
      });
      
      setIsTracking(true);
      
      // Use watchPosition for continuous updates
      const id = navigator.geolocation.watchPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          // Update location without orderId to use public location
          updateLocation({ latitude, longitude }, driverName);
        },
        (err) => {
          console.error('Geolocation error:', err);
          setError('Failed to track location. Please check location permissions.');
        },
        { 
          enableHighAccuracy: true,
          maximumAge: 0, // Don't use cached positions
          timeout: 5000 // 5 second timeout
        }
      );
      
      setWatchId(id);
      
      // Start frequent updates every 1 second
      // This ensures we get location updates even if the device's location doesn't change
      if (locationUpdateInterval.current !== null) {
        clearInterval(locationUpdateInterval.current);
      }
      
      locationUpdateInterval.current = window.setInterval(() => {
        navigator.geolocation.getCurrentPosition(
          (position) => {
            const { latitude, longitude } = position.coords;
            updateLocation({ latitude, longitude }, driverName);
          },
          (err) => {
            console.error('Periodic update geolocation error:', err);
          },
          { 
            enableHighAccuracy: true,
            maximumAge: 0,
            timeout: 1000
          }
        );
      }, 1000); // Update every 1 second
      
      return true;
    } catch (err) {
      console.error('Error starting location tracking:', err);
      return false;
    }
  };

  // Start live location tracking for a specific order (for admin/delivery personnel)
  const startLiveTracking = async (driverName?: string) => {
    if (!orderId || !navigator.geolocation) return false;
    
    try {
      // Get initial position
      let initialPosition = { 
        latitude: 50.6745, 
        longitude: -120.3273,  // Default to downtown Kamloops
        timestamp: Date.now()
      };
      
      try {
        // Try to get actual position
        const position = await new Promise<GeolocationPosition>((resolve, reject) => {
          navigator.geolocation.getCurrentPosition(resolve, reject, {
            enableHighAccuracy: true,
            timeout: 5000,
            maximumAge: 0
          });
        });
        
        initialPosition = {
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          timestamp: Date.now()
        };
      } catch (posError) {
        console.warn('Using default position for Kamloops:', posError);
      }
      
      // Set initial tracking state
      const locationRef = ref(db, `locations/${orderId}`);
      await update(locationRef, { 
        ...initialPosition,
        isTracking: true,
        driverName: driverName || 'Delivery Driver'
      });
      
      setIsTracking(true);
      
      // Use watchPosition for continuous updates
      const id = navigator.geolocation.watchPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          updateLocation({ latitude, longitude }, driverName);
        },
        (err) => {
          console.error('Geolocation error:', err);
          setError('Failed to track location. Please check location permissions.');
        },
        { 
          enableHighAccuracy: true,
          maximumAge: 0, // Don't use cached positions
          timeout: 5000 // 5 second timeout
        }
      );
      
      setWatchId(id);
      
      // Start frequent updates every 1 second
      // This ensures we get location updates even if the device's location doesn't change
      if (locationUpdateInterval.current !== null) {
        clearInterval(locationUpdateInterval.current);
      }
      
      locationUpdateInterval.current = window.setInterval(() => {
        navigator.geolocation.getCurrentPosition(
          (position) => {
            const { latitude, longitude } = position.coords;
            updateLocation({ latitude, longitude }, driverName);
          },
          (err) => {
            console.error('Periodic update geolocation error:', err);
          },
          { 
            enableHighAccuracy: true,
            maximumAge: 0,
            timeout: 1000
          }
        );
      }, 1000); // Update every 1 second
      
      return true;
    } catch (err) {
      console.error('Error starting location tracking:', err);
      return false;
    }
  };

  // Stop live location tracking
  const stopLiveTracking = async () => {
    try {
      // Clear the watch position if it exists
      if (watchId !== null) {
        navigator.geolocation.clearWatch(watchId);
        setWatchId(null);
      }
      
      // Clear the interval timer if it exists
      if (locationUpdateInterval.current !== null) {
        clearInterval(locationUpdateInterval.current);
        locationUpdateInterval.current = null;
      }
      
      // Update tracking state in the database
      const locationPath = orderId ? `locations/${orderId}` : 'public_location';
      const locationRef = ref(db, locationPath);
      
      // Check if the location reference exists
      const snapshot = await get(locationRef);
      if (snapshot.exists()) {
        await update(locationRef, { isTracking: false });
      }
      
      // Update local tracking state
      setIsTracking(false);
      
      return true;
    } catch (err) {
      console.error('Error stopping location tracking:', err);
      return false;
    }
  };

  // Get public location data
  const getPublicLocation = async () => {
    try {
      const locationRef = ref(db, 'public_location');
      const snapshot = await get(locationRef);
      
      if (snapshot.exists()) {
        return snapshot.val() as LocationData;
      }
      
      return null;
    } catch (err) {
      console.error('Error fetching public location:', err);
      return null;
    }
  };

  // Get all active tracking orders (for admin panel)
  const getActiveTrackingOrders = async () => {
    try {
      const locationsRef = ref(db, 'locations');
      const snapshot = await get(locationsRef);
      
      if (snapshot.exists()) {
        const data = snapshot.val();
        const activeOrders = Object.entries(data)
          .filter(([, locationData]) => (locationData as LocationData).isTracking)
          .map(([orderId, locationData]) => ({
            orderId,
            ...locationData as LocationData
          }));
        
        return activeOrders;
      }
      
      return [];
    } catch (err) {
      console.error('Error fetching active tracking orders:', err);
      return [];
    }
  };

  return {
    deliveryLocation,
    loading,
    error,
    isTracking,
    updateLocation,
    getCoordinates,
    startLiveTracking,
    startPublicTracking,
    stopLiveTracking,
    getPublicLocation,
    getActiveTrackingOrders
  };
}; 