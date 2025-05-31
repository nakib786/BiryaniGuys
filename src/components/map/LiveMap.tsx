import React, { useEffect, useRef, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import { Icon, DivIcon } from 'leaflet';
import 'leaflet/dist/leaflet.css';
import type { Map as LeafletMap } from 'leaflet';
import { ref, onValue } from 'firebase/database';
import { db } from '../../utils/firebase';

// Fix the default marker icon issue in React Leaflet
const defaultIcon = new Icon({
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

// Emoji car icon for delivery
const deliveryCarIcon = new DivIcon({
  html: `<div style="font-size: 30px; margin-top: -15px; margin-left: -12px;">🚗</div>`,
  className: '',
  iconSize: [30, 30],
  iconAnchor: [15, 15],
  popupAnchor: [0, -15]
});

// Component to auto-center map on driver location updates
const AutoCenter = ({ position }: { position: [number, number] }) => {
  const map = useMap();
  
  useEffect(() => {
    if (position) {
      map.setView(position, map.getZoom());
    }
  }, [map, position]);
  
  return null;
};

// Component to render a delivery marker with smooth transitions
const DeliveryMarker = ({ 
  position, 
  driverName, 
  timestamp 
}: { 
  position: [number, number], 
  driverName: string, 
  timestamp?: number 
}) => {
  return (
    <Marker position={position} icon={deliveryCarIcon}>
      <Popup>
        {driverName} is on the way!
        <br />
        <span className="text-xs text-gray-500">
          Last updated: {timestamp ? new Date(timestamp).toLocaleTimeString() : 'Unknown'}
        </span>
      </Popup>
    </Marker>
  );
};

interface LocationData {
  latitude: number;
  longitude: number;
  timestamp: number;
  isTracking?: boolean;
  driverName?: string;
}

interface LiveMapProps {
  customerLocation: [number, number]; // [latitude, longitude]
  deliveryLocation?: [number, number]; // [latitude, longitude]
  orderId: string;
  driverName?: string;
  autoCenterOnDriver?: boolean;
  timestamp?: number; // Add timestamp prop
}

const LiveMap: React.FC<LiveMapProps> = ({
  customerLocation,
  deliveryLocation: initialDeliveryLocation,
  orderId,
  driverName = 'Delivery Driver',
  autoCenterOnDriver = true,
  timestamp: initialTimestamp
}) => {
  const mapRef = useRef<LeafletMap | null>(null);
  const [liveDeliveryLocation, setLiveDeliveryLocation] = useState<[number, number] | undefined>(
    initialDeliveryLocation
  );
  const [liveTimestamp, setLiveTimestamp] = useState<number | undefined>(initialTimestamp);
  const [liveName, setLiveName] = useState<string>(driverName);
  
  // Subscribe directly to Firebase for real-time location updates
  useEffect(() => {
    // Always check the public location first
    const publicLocationRef = ref(db, 'public_location');
    
    // Set up real-time listener for public location
    const publicUnsubscribe = onValue(publicLocationRef, (snapshot) => {
      const data = snapshot.val() as LocationData | null;
      
      if (data && data.isTracking) {
        // Update state with new public location data
        setLiveDeliveryLocation([data.latitude, data.longitude]);
        setLiveTimestamp(data.timestamp);
        if (data.driverName) {
          setLiveName(data.driverName);
        }
      }
    }, {
      onlyOnce: false
    });
    
    // Only check order-specific location if not using 'public'
    let orderUnsubscribe = () => {};
    if (orderId && orderId !== 'public') {
      const orderLocationRef = ref(db, `locations/${orderId}`);
      
      // Only use order-specific location if public isn't tracking
      orderUnsubscribe = onValue(orderLocationRef, (snapshot) => {
        const data = snapshot.val() as LocationData | null;
        
        // Only use order-specific location if we don't have a public location yet
        if (data && data.isTracking && !liveDeliveryLocation) {
          setLiveDeliveryLocation([data.latitude, data.longitude]);
          setLiveTimestamp(data.timestamp);
          if (data.driverName) {
            setLiveName(data.driverName);
          }
        }
      }, {
        onlyOnce: false
      });
    }
    
    // Clean up listeners on unmount
    return () => {
      publicUnsubscribe();
      orderUnsubscribe();
    };
  }, [orderId]);
  
  // Calculate the best center for the map
  const getMapCenter = () => {
    if (autoCenterOnDriver && liveDeliveryLocation) {
      return liveDeliveryLocation;
    }
    return customerLocation;
  };
  
  return (
    <div className="h-[400px] w-full rounded-lg overflow-hidden shadow-md">
      <MapContainer 
        center={getMapCenter()}
        zoom={13} 
        style={{ height: '100%', width: '100%' }}
        ref={mapRef}
        preferCanvas={true}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        
        {/* Only show customer marker if no delivery location is available */}
        {!liveDeliveryLocation && (
          <Marker position={customerLocation} icon={defaultIcon}>
            <Popup>
              Delivery location for order #{orderId}
            </Popup>
          </Marker>
        )}
        
        {/* Delivery person marker - using the custom component for better rendering */}
        {liveDeliveryLocation && (
          <DeliveryMarker 
            position={liveDeliveryLocation} 
            driverName={liveName} 
            timestamp={liveTimestamp}
          />
        )}
        
        {/* Auto-center if enabled and delivery location exists */}
        {autoCenterOnDriver && liveDeliveryLocation && (
          <AutoCenter position={liveDeliveryLocation} />
        )}
      </MapContainer>
    </div>
  );
};

export default LiveMap; 