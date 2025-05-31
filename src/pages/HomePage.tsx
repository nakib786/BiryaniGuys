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
  
  const calculateTotal = () => {
    return cart.reduce((total, item) => total + (item.price * item.quantity), 0);
  };
  
  const handleProceedToCheckout = () => {
    // Save cart to session storage to retrieve it on the checkout page
    sessionStorage.setItem('cart', JSON.stringify(cart));
    navigate('/checkout');
  };

  return (
    <>
      <Header />
      
      <main className="container-custom py-10">
        <h1 className="text-center text-primary mb-8">Welcome to Biryani Guys</h1>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <h2 className="text-2xl mb-6">Our Menu</h2>
            
            {loading ? (
              <div className="card text-center py-8">
                <p>Loading menu items...</p>
              </div>
            ) : error ? (
              <div className="card bg-red-50 text-red-600 text-center py-8">
                <p>{error}</p>
              </div>
            ) : menuItems.length === 0 ? (
              <div className="card text-center py-8">
                <p>No menu items available</p>
              </div>
            ) : (
              <MenuList items={menuItems} onAddToOrder={handleAddToOrder} />
            )}
          </div>
          
          <div className="lg:col-span-1">
            <div className="sticky top-4">
              <h2 className="text-2xl mb-6">Your Order</h2>
              
              <div className="card">
                {cart.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <p>Your cart is empty</p>
                    <p className="text-sm mt-2">Add items from the menu to get started</p>
                  </div>
                ) : (
                  <>
                    <div className="divide-y">
                      {cart.map(item => (
                        <div key={item.id} className="py-3 flex justify-between items-center">
                          <div>
                            <h4 className="font-medium">{item.name}</h4>
                            <p className="text-sm text-gray-600">Qty: {item.quantity}</p>
                          </div>
                          <div className="font-medium">
                            ${(item.price * item.quantity).toFixed(2)}
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
                        className="btn btn-primary w-full"
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
    </>
  );
};

export default HomePage; 