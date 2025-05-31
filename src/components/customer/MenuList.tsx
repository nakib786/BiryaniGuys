import React from 'react';

// Define the menu item type
interface MenuItem {
  id: string;
  name: string;
  description: string;
  price: number;
  image?: string;
  available: boolean;
  vegetarian: boolean;
  dailyInventory?: number;
  soldCount?: number;
}

interface MenuListProps {
  items: MenuItem[];
  onAddToOrder: (item: MenuItem) => void;
}

const MenuList: React.FC<MenuListProps> = ({ items, onAddToOrder }) => {
  // Function to determine inventory status colors
  const getInventoryColor = (item: MenuItem) => {
    if (!item.dailyInventory || item.dailyInventory === 0) return '';
    
    const remaining = (item.dailyInventory || 0) - (item.soldCount || 0);
    const percentRemaining = remaining / item.dailyInventory;
    
    if (percentRemaining <= 0.2) {
      // Critical low - red gradient
      return 'font-bold text-transparent bg-clip-text bg-gradient-to-r from-red-600 to-red-400';
    }
    if (percentRemaining <= 0.5) {
      // Low - orange gradient
      return 'font-bold text-transparent bg-clip-text bg-gradient-to-r from-orange-600 to-yellow-500';
    }
    // Plenty - green gradient
    return 'font-bold text-transparent bg-clip-text bg-gradient-to-r from-green-600 to-emerald-400';
  };
  
  // Function to get text for inventory display
  const getInventoryText = (item: MenuItem) => {
    if (!item.dailyInventory || item.dailyInventory === 0) return null;
    
    const remaining = Math.max(0, (item.dailyInventory || 0) - (item.soldCount || 0));
    
    if (remaining === 0) return 'Sold Out';
    if (remaining === 1) return '1 left';
    return `${remaining} left`;
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {items.map((item) => (
        <div 
          key={item.id} 
          className={`card relative ${!item.available ? 'opacity-60' : ''}`}
        >
          {item.vegetarian && (
            <span className="absolute top-4 right-4 bg-green-500 text-white px-2 py-1 rounded-full text-xs">
              Veg
            </span>
          )}
          
          <div className="flex flex-col md:flex-row md:items-center gap-4">
            {item.image && (
              <div className="w-full md:w-1/3">
                <img 
                  src={item.image} 
                  alt={item.name} 
                  className="w-full h-32 object-cover rounded-md"
                />
              </div>
            )}
            
            <div className={`flex-1 ${!item.image ? 'w-full' : ''}`}>
              <h3 className="text-xl font-semibold mb-2">{item.name}</h3>
              <p className="text-gray-600 mb-3">{item.description}</p>
              
              <div className="flex justify-between items-center">
                <div>
                  <span className="text-lg font-bold text-primary">
                    ${item.price.toFixed(2)}
                  </span>
                  
                  {/* Inventory indicator */}
                  {getInventoryText(item) && (
                    <span className={`ml-3 text-sm ${getInventoryColor(item)} flex items-center`}>
                      {/* Inventory level icon */}
                      {(() => {
                        if (!item.dailyInventory || item.dailyInventory === 0) return null;
                        
                        const remaining = (item.dailyInventory || 0) - (item.soldCount || 0);
                        const percentRemaining = remaining / item.dailyInventory;
                        
                        if (percentRemaining <= 0.2) {
                          return (
                            <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                              <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                            </svg>
                          );
                        }
                        if (percentRemaining <= 0.5) {
                          return (
                            <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                            </svg>
                          );
                        }
                        return (
                          <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                          </svg>
                        );
                      })()}
                      {getInventoryText(item)}
                    </span>
                  )}
                </div>
                
                <button 
                  onClick={() => item.available && onAddToOrder(item)} 
                  className={`btn ${item.available ? 'btn-primary' : 'btn-outline opacity-50 cursor-not-allowed'}`}
                  disabled={!item.available}
                >
                  {item.available ? 'Add to Order' : 'Sold Out'}
                </button>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default MenuList; 