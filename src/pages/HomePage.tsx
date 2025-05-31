import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../components/ui/Header';
import Footer from '../components/ui/Footer';
import MenuList from '../components/customer/MenuList';
import WhatsAppChat from '../components/customer/WhatsAppChat';
import { useMenu } from '../hooks/useMenu';
import type { MenuItem } from '../hooks/useMenu';

const HomePage: React.FC = () => {
  const { menuItems, loading, error } = useMenu();
  const [cart, setCart] = useState<(MenuItem & { quantity: number })[]>([]);
  const navigate = useNavigate();
  
  const handleAddToOrder = (item: MenuItem) => {
    const existingItem = cart.find(cartItem => cartItem.id === item.id);
    
    if (existingItem) {
      // Increase quantity if already in cart
      const updatedCart = cart.map(cartItem => 
        cartItem.id === item.id 
          ? { ...cartItem, quantity: cartItem.quantity + 1 } 
          : cartItem
      );
      setCart(updatedCart);
    } else {
      // Add new item to cart
      setCart([...cart, { ...item, quantity: 1 }]);
    }
  };
  
  const handleIncreaseQuantity = (itemId: string) => {
    const updatedCart = cart.map(item => 
      item.id === itemId 
        ? { ...item, quantity: item.quantity + 1 } 
        : item
    );
    setCart(updatedCart);
  };

  const handleDecreaseQuantity = (itemId: string) => {
    const updatedCart = cart.map(item => 
      item.id === itemId && item.quantity > 1
        ? { ...item, quantity: item.quantity - 1 } 
        : item
    ).filter(item => !(item.id === itemId && item.quantity === 1));
    
    setCart(updatedCart);
  };

  const handleRemoveItem = (itemId: string) => {
    const updatedCart = cart.filter(item => item.id !== itemId);
    setCart(updatedCart);
  };
  
  const calculateTotal = () => {
    return cart.reduce((total, item) => total + (item.price * item.quantity), 0);
  };
  
  const handleProceedToCheckout = () => {
    // Save cart to session storage to retrieve it on the checkout page
    sessionStorage.setItem('cart', JSON.stringify(cart));
    navigate('/checkout');
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Header />
      
      <main className="container-custom py-8 md:py-12 flex-grow">
        <div className="text-center mb-10">
          <h1 className="text-3xl md:text-4xl font-bold mb-2 bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">Welcome to Biryani Guys</h1>
          <p className="text-gray-600 max-w-xl mx-auto">Authentic Indian biryani delivered to your doorstep. Made with premium ingredients and traditional recipes.</p>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-800">Our Menu</h2>
              <div className="bg-white px-3 py-1 rounded-full shadow-sm">
                <span className="text-sm text-gray-600">{menuItems.length} Items</span>
              </div>
            </div>
            
            {loading ? (
              <div className="bg-white rounded-xl shadow-sm p-8 text-center">
                <div className="animate-pulse flex flex-col items-center">
                  <div className="w-12 h-12 bg-gray-200 rounded-full mb-4"></div>
                  <div className="h-4 bg-gray-200 rounded w-1/2 mb-2.5"></div>
                  <div className="h-2 bg-gray-200 rounded w-1/4"></div>
                </div>
                <p className="text-gray-500 mt-4">Loading menu items...</p>
              </div>
            ) : error ? (
              <div className="bg-red-50 text-red-600 rounded-xl p-8 text-center">
                <svg className="w-12 h-12 mx-auto mb-4 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <p className="font-medium">{error}</p>
              </div>
            ) : menuItems.length === 0 ? (
              <div className="bg-white rounded-xl p-8 text-center">
                <p className="text-gray-500">No menu items available</p>
              </div>
            ) : (
              <div className="fade-in">
                <MenuList items={menuItems} onAddToOrder={handleAddToOrder} />
              </div>
            )}
          </div>
          
          <div className="lg:col-span-1">
            <div className="sticky top-4">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-800">Your Order</h2>
                {cart.length > 0 && (
                  <span className="bg-primary text-white px-3 py-1 rounded-full text-sm font-medium shadow-sm">
                    {cart.reduce((total, item) => total + item.quantity, 0)} items
                  </span>
                )}
              </div>
              
              <div className="bg-white rounded-xl shadow-sm overflow-hidden">
                {cart.length === 0 ? (
                  <div className="text-center py-10 px-4">
                    <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                      </svg>
                    </div>
                    <h3 className="text-lg font-medium text-gray-800 mb-1">Your cart is empty</h3>
                    <p className="text-sm text-gray-500 mb-6">Add items from the menu to get started</p>
                    <div className="px-4">
                      <button 
                        onClick={() => document.getElementById('menu-section')?.scrollIntoView({ behavior: 'smooth' })}
                        className="text-primary hover:text-primary-dark transition-colors font-medium"
                      >
                        Browse Menu
                      </button>
                    </div>
                  </div>
                ) : (
                  <>
                    <div className="divide-y max-h-[calc(100vh-300px)] overflow-y-auto p-4">
                      {cart.map(item => (
                        <div key={item.id} className="py-4 first:pt-0 last:pb-0">
                          <div className="flex justify-between items-start mb-2">
                            <div>
                              <h4 className="font-medium text-gray-800">{item.name}</h4>
                              <p className="text-sm text-gray-500">${item.price.toFixed(2)} each</p>
                            </div>
                            <div className="font-medium text-gray-800">
                              ${(item.price * item.quantity).toFixed(2)}
                            </div>
                          </div>
                          
                          <div className="flex justify-between items-center">
                            <button 
                              onClick={() => handleRemoveItem(item.id)}
                              className="text-red-500 text-sm hover:text-red-700 transition-colors flex items-center"
                            >
                              <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                              </svg>
                              Remove
                            </button>
                            
                            <div className="flex items-center">
                              <button 
                                onClick={() => handleDecreaseQuantity(item.id)}
                                className="w-8 h-8 flex items-center justify-center border border-gray-300 rounded-l-lg bg-gray-50 hover:bg-gray-100 transition-colors"
                              >
                                <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
                                </svg>
                              </button>
                              <span className="w-10 h-8 flex items-center justify-center border-t border-b border-gray-300 bg-white text-gray-800">
                                {item.quantity}
                              </span>
                              <button 
                                onClick={() => handleIncreaseQuantity(item.id)}
                                className="w-8 h-8 flex items-center justify-center border border-gray-300 rounded-r-lg bg-gray-50 hover:bg-gray-100 transition-colors"
                              >
                                <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                                </svg>
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                    
                    <div className="border-t border-gray-100 p-4 bg-gray-50">
                      <div className="flex justify-between items-center mb-4">
                        <span className="text-gray-600">Subtotal</span>
                        <span className="text-gray-800">${calculateTotal().toFixed(2)}</span>
                      </div>
                      
                      <div className="flex justify-between font-bold text-lg mb-6">
                        <span>Total</span>
                        <span className="text-primary">${calculateTotal().toFixed(2)}</span>
                      </div>
                      
                      <button 
                        className="w-full py-3 px-4 bg-gradient-to-r from-primary to-accent text-white font-medium rounded-lg hover:shadow-md transition-all hover:from-accent hover:to-primary"
                        onClick={handleProceedToCheckout}
                        disabled={cart.length === 0}
                      >
                        Proceed to Checkout
                      </button>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </main>
      
      <Footer />
      <WhatsAppChat phoneNumber="+17785383555" />
    </div>
  );
};

export default HomePage; 