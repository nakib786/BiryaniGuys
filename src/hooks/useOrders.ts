import { useState, useEffect } from 'react';
import { ref, onValue, push, update, get } from 'firebase/database';
import { db } from '../utils/firebase';
import { useMenu } from './useMenu';

// Order item interface
export interface OrderItem {
  menuItemId: string;
  name: string;
  price: number;
  quantity: number;
}

// Customer info interface
export interface CustomerInfo {
  name: string;
  phone: string;
  email: string;
  address: string;
  coordinates?: [number, number]; // [latitude, longitude]
}

// Order interface
export interface Order {
  id: string;
  items: OrderItem[];
  totalAmount: number;
  status: string; // Kept for backward compatibility
  customer: CustomerInfo;
  notes?: string;
  createdAt: number;
  updatedAt: number;
  estimatedDeliveryTime?: number;
}

// New order input interface
export interface NewOrderInput {
  items: OrderItem[];
  customer: CustomerInfo;
  notes?: string;
}

export const useOrders = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { markItemSold } = useMenu();

  // Fetch all orders
  useEffect(() => {
    const ordersRef = ref(db, 'orders');
    
    const unsubscribe = onValue(ordersRef, (snapshot) => {
      try {
        const data = snapshot.val();
        if (data) {
          const ordersArray = Object.entries(data).map(([id, order]) => ({
            id,
            ...(order as Omit<Order, 'id'>)
          }));
          
          // Sort by created date (newest first)
          ordersArray.sort((a, b) => b.createdAt - a.createdAt);
          
          setOrders(ordersArray);
        } else {
          setOrders([]);
        }
        setLoading(false);
      } catch (err) {
        setError('Failed to load orders');
        setLoading(false);
        console.error(err);
      }
    }, (err) => {
      setError('Failed to load orders');
      setLoading(false);
      console.error(err);
    });
    
    return () => unsubscribe();
  }, []);

  // Create a new order
  const createOrder = async (orderInput: NewOrderInput) => {
    try {
      const ordersRef = ref(db, 'orders');
      const timestamp = Date.now();
      
      // Ensure no undefined values by cleaning the input
      const cleanedOrderInput = {
        ...orderInput,
        notes: orderInput.notes || '' // Ensure notes is never undefined
      };
      
      const newOrder = {
        ...cleanedOrderInput,
        status: 'new', // Simple status string
        totalAmount: calculateTotal(orderInput.items),
        createdAt: timestamp,
        updatedAt: timestamp
      };
      
      const newOrderRef = await push(ordersRef, newOrder);
      
      // Mark items as sold for inventory tracking
      if (newOrderRef.key) {
        // Update inventory for each item
        for (const item of orderInput.items) {
          await markItemSold(item.menuItemId, item.quantity);
        }
      }
      
      return newOrderRef.key;
    } catch (err) {
      console.error('Error creating order:', err);
      return null;
    }
  };

  // Get a single order by ID
  const getOrderById = async (orderId: string) => {
    try {
      const orderRef = ref(db, `orders/${orderId}`);
      const snapshot = await get(orderRef);
      
      if (snapshot.exists()) {
        return {
          id: orderId,
          ...snapshot.val()
        } as Order;
      }
      
      return null;
    } catch (err) {
      console.error('Error fetching order:', err);
      return null;
    }
  };

  // Calculate total amount for an order
  const calculateTotal = (items: OrderItem[]) => {
    return items.reduce((total, item) => total + (item.price * item.quantity), 0);
  };

  // Update estimated delivery time
  const updateEstimatedDeliveryTime = async (orderId: string, estimatedTime: number) => {
    try {
      const orderRef = ref(db, `orders/${orderId}`);
      await update(orderRef, {
        estimatedDeliveryTime: estimatedTime,
        updatedAt: Date.now()
      });
      return true;
    } catch (err) {
      console.error('Error updating delivery time:', err);
      return false;
    }
  };

  return {
    orders,
    loading,
    error,
    createOrder,
    getOrderById,
    calculateTotal,
    updateEstimatedDeliveryTime
  };
}; 