import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../components/ui/Header';
import Footer from '../components/ui/Footer';
import { useOrders } from '../hooks/useOrders';
import type { OrderItem, CustomerInfo, NewOrderInput } from '../hooks/useOrders';
import type { MenuItem } from '../hooks/useMenu';

const CheckoutPage: React.FC = () => {
  const [cart, setCart] = useState<(MenuItem & { quantity: number })[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [orderPlaced, setOrderPlaced] = useState(false);
  const [orderId, setOrderId] = useState<string | null>(null);
  const [customerInfo, setCustomerInfo] = useState<CustomerInfo>({
    name: '',
    phone: '',
    email: '',
    address: '',
    coordinates: undefined
  });
  const [notes, setNotes] = useState('');
  const [isLocating, setIsLocating] = useState(false);
  const navigate = useNavigate();
  const { createOrder } = useOrders();

  // Get user's location when component mounts
  useEffect(() => {
    if (navigator.geolocation) {
      setIsLocating(true);
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          setCustomerInfo(prev => ({
            ...prev,
            coordinates: [latitude, longitude]
          }));
          setIsLocating(false);
        },
        (error) => {
          console.error('Geolocation error:', error);
          setIsLocating(false);
        }
      );
    }
  }, []);

  useEffect(() => {
    // Retrieve cart from session storage
    const savedCart = sessionStorage.getItem('cart');
    if (savedCart) {
      try {
        const parsedCart = JSON.parse(savedCart);
        setCart(parsedCart);
      } catch (err) {
        console.error('Error parsing cart data:', err);
        setError('Failed to load your cart. Please try again.');
      }
    } else {
      // Redirect to home if cart is empty
      navigate('/');
    }
  }, [navigate]);

  const calculateTotal = () => {
    return cart.reduce((total, item) => total + (item.price * item.quantity), 0);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setCustomerInfo(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleNotesChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setNotes(e.target.value);
  };

  const handleIncreaseQuantity = (itemId: string) => {
    const updatedCart = cart.map(item => 
      item.id === itemId 
        ? { ...item, quantity: item.quantity + 1 } 
        : item
    );
    setCart(updatedCart);
    // Update session storage
    sessionStorage.setItem('cart', JSON.stringify(updatedCart));
  };

  const handleDecreaseQuantity = (itemId: string) => {
    const updatedCart = cart.map(item => 
      item.id === itemId && item.quantity > 1
        ? { ...item, quantity: item.quantity - 1 } 
        : item
    ).filter(item => !(item.id === itemId && item.quantity === 1));
    
    setCart(updatedCart);
    // Update session storage
    sessionStorage.setItem('cart', JSON.stringify(updatedCart));
  };

  const handleRemoveItem = (itemId: string) => {
    const updatedCart = cart.filter(item => item.id !== itemId);
    setCart(updatedCart);
    // Update session storage
    sessionStorage.setItem('cart', JSON.stringify(updatedCart));
    
    // If cart is now empty, redirect to home
    if (updatedCart.length === 0) {
      navigate('/');
    }
  };

  const handleAddMoreItems = () => {
    // Update session storage before navigating away
    sessionStorage.setItem('cart', JSON.stringify(cart));
    navigate('/');
  };

  const handleSubmitOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      // Check for any out of stock items before proceeding
      const unavailableItems = cart.filter(item => !item.available);
      if (unavailableItems.length > 0) {
        setError(`Some items are no longer available: ${unavailableItems.map(i => i.name).join(', ')}`);
        setIsSubmitting(false);
        return;
      }

      // Prepare order items
      const orderItems: OrderItem[] = cart.map(item => ({
        menuItemId: item.id,
        name: item.name,
        price: item.price,
        quantity: item.quantity
      }));

      // Add payment information to notes
      const paymentNotes = `${notes.trim() ? notes + "\n\n" : ""}PAYMENT: Waiting for Interac e-Transfer to info@biryaniguys.ca`;
      
      // Create new order input
      const newOrder: NewOrderInput = {
        items: orderItems,
        customer: customerInfo,
        notes: paymentNotes
      };

      // Submit order
      const newOrderId = await createOrder(newOrder);
      
      if (newOrderId) {
        // Set order ID for reference
        setOrderId(newOrderId);
        
        // Show Interac transfer information
        setOrderPlaced(true);
        
        // Clear cart from session storage
        sessionStorage.removeItem('cart');
      } else {
        setError('Failed to place your order. Please try again.');
      }
    } catch (err) {
      console.error('Error processing order:', err);
      setError('An error occurred while processing your order.');
    }

    setIsSubmitting(false);
  };

  return (
    <>
      <Header />
      
      <main className="container-custom py-10">
        <h1 className="text-center text-primary mb-8">Checkout</h1>
        
        {error && (
          <div className="alert bg-red-50 text-red-600 p-4 rounded-lg mb-6">
            {error}
          </div>
        )}
        
        {orderPlaced ? (
          <div className="card max-w-3xl mx-auto">
            <div className="text-center">
              <h2 className="text-2xl font-bold text-primary mb-4">Thank You for Your Order!</h2>
              {orderId && (
                <p className="mb-2">Order ID: <span className="font-mono">{orderId}</span></p>
              )}
              <p className="mb-6">Your order total is: <span className="font-bold">${calculateTotal().toFixed(2)}</span></p>
              
              <div className="bg-yellow-50 p-6 rounded-lg mb-6 text-left">
                <h3 className="text-xl font-semibold mb-3">Payment Instructions:</h3>
                <p className="mb-3">Please send an Interac e-Transfer to:</p>
                <p className="text-primary font-bold text-lg mb-4">info@biryaniguys.ca</p>
                
                <div className="border-t border-yellow-200 pt-4 mt-4">
                  <p className="font-medium mb-2">Important Notes:</p>
                  <ul className="list-disc pl-5 mb-4">
                    <li>No security questions are needed</li>
                    <li>Auto-deposit is turned ON</li>
                    <li>Please include your name in the message</li>
                    {orderId && <li>Include your Order ID: {orderId}</li>}
                  </ul>
                </div>
                
                <p className="mt-4">Once we receive your payment, we will prepare and deliver your order.</p>
              </div>
              
              <div className="flex flex-col sm:flex-row justify-center gap-4">
                <button 
                  onClick={() => navigate('/')} 
                  className="btn btn-primary"
                >
                  Return to Home
                </button>
                {orderId && (
                  <button 
                    onClick={() => navigate(`/track/${orderId}`)} 
                    className="btn btn-outline"
                  >
                    Track Your Order
                  </button>
                )}
              </div>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div>
              <h2 className="text-xl font-semibold mb-4">Your Information</h2>
              
              <form onSubmit={handleSubmitOrder} className="card">
                <div className="mb-4">
                  <label htmlFor="name" className="block mb-1">Name</label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={customerInfo.name}
                    onChange={handleInputChange}
                    className="w-full p-2 border rounded"
                    required
                  />
                </div>
                
                <div className="mb-4">
                  <label htmlFor="phone" className="block mb-1">Phone</label>
                  <input
                    type="tel"
                    id="phone"
                    name="phone"
                    value={customerInfo.phone}
                    onChange={handleInputChange}
                    className="w-full p-2 border rounded"
                    required
                  />
                </div>
                
                <div className="mb-4">
                  <label htmlFor="email" className="block mb-1">Email</label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={customerInfo.email}
                    onChange={handleInputChange}
                    className="w-full p-2 border rounded"
                    required
                  />
                </div>
                
                <div className="mb-4">
                  <label htmlFor="address" className="block mb-1">Delivery Address</label>
                  <input
                    type="text"
                    id="address"
                    name="address"
                    value={customerInfo.address}
                    onChange={handleInputChange}
                    className="w-full p-2 border rounded"
                    required
                  />
                  {isLocating ? (
                    <p className="text-xs text-gray-500 mt-1">
                      <span className="inline-block w-3 h-3 bg-gray-300 rounded-full animate-pulse mr-1"></span>
                      Getting your location for delivery tracking...
                    </p>
                  ) : customerInfo.coordinates ? (
                    <p className="text-xs text-green-600 mt-1">
                      <span className="inline-block w-3 h-3 bg-green-500 rounded-full mr-1"></span>
                      Location found for delivery tracking
                    </p>
                  ) : (
                    <p className="text-xs text-yellow-600 mt-1">
                      <span className="inline-block w-3 h-3 bg-yellow-500 rounded-full mr-1"></span>
                      Please enable location for order tracking
                    </p>
                  )}
                </div>
                
                <div className="mb-4">
                  <label htmlFor="notes" className="block mb-1">Order Notes (Optional)</label>
                  <textarea
                    id="notes"
                    value={notes}
                    onChange={handleNotesChange}
                    className="w-full p-2 border rounded"
                    rows={3}
                  />
                </div>
                
                <button
                  type="submit"
                  className="btn btn-primary w-full"
                  disabled={isSubmitting || cart.length === 0}
                >
                  {isSubmitting ? 'Processing...' : 'Complete Order'}
                </button>
              </form>
            </div>
            
            <div>
              <h2 className="text-xl font-semibold mb-4">Order Summary</h2>
              
              <div className="card">
                {cart.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <p>Your cart is empty</p>
                  </div>
                ) : (
                  <>
                    <div className="divide-y">
                      {cart.map(item => (
                        <div key={item.id} className="py-3">
                          <div className="flex justify-between items-start mb-2">
                            <div>
                              <h4 className="font-medium">{item.name}</h4>
                              <p className="text-sm text-gray-600">${item.price.toFixed(2)} each</p>
                              {!item.available && (
                                <p className="text-sm text-red-600">Out of stock</p>
                              )}
                              {item.dailyInventory && item.dailyInventory > 0 && (
                                <p className="text-sm text-gray-600">
                                  {Math.max(0, (item.dailyInventory || 0) - (item.soldCount || 0))} remaining
                                </p>
                              )}
                            </div>
                            <div className="font-medium">
                              ${(item.price * item.quantity).toFixed(2)}
                            </div>
                          </div>
                          
                          <div className="flex justify-between items-center">
                            <button 
                              onClick={() => handleRemoveItem(item.id)}
                              className="text-red-500 text-sm hover:text-red-700"
                            >
                              Remove
                            </button>
                            
                            <div className="flex items-center">
                              <button 
                                onClick={() => handleDecreaseQuantity(item.id)}
                                className="w-8 h-8 flex items-center justify-center border rounded-l-md bg-gray-100 hover:bg-gray-200"
                              >
                                -
                              </button>
                              <span className="w-10 h-8 flex items-center justify-center border-t border-b">
                                {item.quantity}
                              </span>
                              <button 
                                onClick={() => handleIncreaseQuantity(item.id)}
                                className="w-8 h-8 flex items-center justify-center border rounded-r-md bg-gray-100 hover:bg-gray-200"
                              >
                                +
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                    
                    <div className="border-t border-gray-200 mt-4 pt-4">
                      <div className="flex justify-between font-bold text-lg mb-6">
                        <span>Total:</span>
                        <span>${calculateTotal().toFixed(2)}</span>
                      </div>
                      
                      <button 
                        onClick={handleAddMoreItems}
                        className="btn btn-outline w-full mb-3"
                      >
                        Add More Items
                      </button>

                      <button
                        type="submit"
                        className="btn btn-primary w-full"
                        disabled={isSubmitting || cart.length === 0}
                        onClick={handleSubmitOrder}
                      >
                        {isSubmitting ? 'Processing...' : 'Complete Order'}
                      </button>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        )}
      </main>
      
      <Footer />
    </>
  );
};

export default CheckoutPage; 