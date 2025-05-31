import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import Header from '../components/ui/Header';
import Footer from '../components/ui/Footer';
import LiveMap from '../components/map/LiveMap';
import { useLocation } from '../hooks/useLocation';
import { useOrders } from '../hooks/useOrders';
import type { Order } from '../hooks/useOrders';

const TrackOrderPage: React.FC = () => {
  const { orderId = '' } = useParams<{ orderId: string }>();
  const { getOrderById } = useOrders();
  // Use both order-specific location and public location
  const { deliveryLocation: orderLocation, loading: orderLocationLoading } = useLocation(orderId);
  const { deliveryLocation: publicLocation, loading: publicLocationLoading } = useLocation();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  useEffect(() => {
    const fetchOrder = async () => {
      try {
        if (!orderId) {
          setError('No order ID provided');
          setLoading(false);
          return;
        }

        const orderData = await getOrderById(orderId);
        if (orderData) {
          setOrder(orderData);
        } else {
          setError('Order not found');
        }
        setLoading(false);
      } catch (err) {
        console.error('Error fetching order:', err);
        setError('Failed to load order details');
        setLoading(false);
      }
    };

    fetchOrder();
  }, [orderId, getOrderById]);

  // Get delivery person coordinates for the map, prioritizing public location
  const getDeliveryCoordinates = (): [number, number] | undefined => {
    // First check if public location is available
    if (publicLocation && publicLocation.isTracking) {
      return [publicLocation.latitude, publicLocation.longitude];
    }
    
    // Fall back to order-specific location if available
    if (orderLocation) {
      return [orderLocation.latitude, orderLocation.longitude];
    }
    
    return undefined;
  };

  // Get the active delivery location (either public or order-specific)
  const getActiveLocation = () => {
    if (publicLocation && publicLocation.isTracking) {
      return publicLocation;
    }
    return orderLocation;
  };

  // Get customer location or default to central location
  const getCustomerLocation = (): [number, number] => {
    if (order?.customer?.coordinates) {
      return order.customer.coordinates;
    }
    // Default to downtown Kamloops location if no customer coordinates
    return [50.6745, -120.3273];
  };

  // Get active driver name
  const getDriverName = (): string => {
    const activeLocation = getActiveLocation();
    return activeLocation?.driverName || 'Your Delivery Driver';
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

  // Determine if any location tracking is active
  const isLocationTrackingActive = (): boolean => {
    return !!(publicLocation?.isTracking || orderLocation);
  };

  return (
    <>
      <Header />
      
      <main className="container-custom py-10">
        <h1 className="text-center text-primary mb-8">Track Your Order</h1>
        
        {loading ? (
          <div className="card text-center py-8">
            <p>Loading order details...</p>
          </div>
        ) : error ? (
          <div className="card bg-red-50 text-red-600 text-center py-8">
            <p>{error}</p>
          </div>
        ) : !order ? (
          <div className="card text-center py-8">
            <p>Order not found</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2">
              <div className="card">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-xl font-semibold">Delivery Tracking</h2>
                  {isLocationTrackingActive() && (
                    <div className="flex items-center">
                      <div className="animate-pulse w-3 h-3 bg-green-500 rounded-full mr-2"></div>
                      <span className="text-sm text-green-600">Live</span>
                    </div>
                  )}
                </div>
                
                {orderLocationLoading && publicLocationLoading ? (
                  <div className="bg-gray-100 p-4 rounded text-center">
                    <p>Loading map...</p>
                  </div>
                ) : !isLocationTrackingActive() ? (
                  <div className="bg-yellow-50 p-4 rounded text-center">
                    <p>No active delivery tracking at the moment. Please check back later.</p>
                  </div>
                ) : !getDeliveryCoordinates() ? (
                  <div className="bg-yellow-50 p-4 rounded text-center">
                    <p>No delivery driver location is currently available. Please check back later.</p>
                  </div>
                ) : (
                  <>
                    {publicLocation?.isTracking && (
                      <div className="bg-green-50 p-2 rounded mb-2 text-center text-green-700">
                        <p>Live delivery tracking is available!</p>
                      </div>
                    )}
                    <LiveMap
                      customerLocation={getCustomerLocation()}
                      deliveryLocation={getDeliveryCoordinates()}
                      orderId={orderId}
                      driverName={getDriverName()}
                      autoCenterOnDriver={true}
                      timestamp={getActiveLocation()?.timestamp}
                    />
                  </>
                )}
                
                <div className="mt-4 text-sm text-gray-500">
                  <p>Watch as your delivery person brings your delicious biryani to your doorstep!</p>
                  {getActiveLocation() && (
                    <p className="mt-2 text-xs">
                      Last updated: {formatUpdateTime(getActiveLocation()?.timestamp || Date.now())}
                    </p>
                  )}
                </div>
              </div>
            </div>
            
            <div className="lg:col-span-1">
              <div className="card">
                <h2 className="text-xl font-semibold mb-4">Order Details</h2>
                
                <div className="mb-4">
                  <h3 className="font-medium text-gray-700">Items</h3>
                  <div className="divide-y">
                    {order.items.map((item, index) => (
                      <div key={index} className="py-2 flex justify-between">
                        <div>
                          <span>{item.name}</span>
                          <span className="text-gray-500 ml-2">x{item.quantity}</span>
                        </div>
                        <span>${(item.price * item.quantity).toFixed(2)}</span>
                      </div>
                    ))}
                  </div>
                </div>
                
                <div className="border-t border-gray-200 pt-4 mb-4">
                  <div className="flex justify-between font-bold">
                    <span>Total:</span>
                    <span>${order.totalAmount.toFixed(2)}</span>
                  </div>
                </div>
                
                <div className="border-t border-gray-200 pt-4">
                  <h3 className="font-medium text-gray-700 mb-2">Delivery Address</h3>
                  <p>{order.customer.address}</p>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
      
      <Footer />
    </>
  );
};

export default TrackOrderPage; 