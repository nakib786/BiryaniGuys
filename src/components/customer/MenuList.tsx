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

  // Generate placeholder background based on item name for consistent colors
  const getPlaceholderColor = (name: string) => {
    // Get a consistent hash code from the item name
    const hashCode = name.split('').reduce((hash, char) => {
      return char.charCodeAt(0) + ((hash << 5) - hash);
    }, 0);
    
    // Generate colors from the hash (ensuring they're not too dark or light)
    const hue = Math.abs(hashCode) % 360;
    return `hsla(${hue}, 70%, 80%, 0.8)`;
  };

  // Generate first letter or icon for the placeholder
  const getPlaceholderText = (name: string) => {
    return name.charAt(0).toUpperCase();
  };

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
      {items.map((item) => (
        <div 
          key={item.id} 
          className={`relative rounded-xl overflow-hidden transition-all duration-300 hover:shadow-xl bg-white ${!item.available ? 'opacity-70 grayscale' : 'hover:translate-y-[-4px]'}`}
        >
          {item.vegetarian && (
            <div className="absolute top-4 right-4 z-10">
              <span className="bg-gradient-to-r from-green-500 to-emerald-500 text-white px-3 py-1 rounded-full text-xs font-semibold shadow-md">
                Vegetarian
              </span>
            </div>
          )}
          
          <div className="w-full h-48 sm:h-56 overflow-hidden">
            {item.image ? (
              <img 
                src={item.image} 
                alt={item.name} 
                className="w-full h-full object-cover transition-transform duration-700 hover:scale-105"
              />
            ) : (
              <div 
                className="w-full h-full flex items-center justify-center"
                style={{ 
                  background: `linear-gradient(135deg, ${getPlaceholderColor(item.name)}, ${getPlaceholderColor(item.name + 'alt')})` 
                }}
              >
                <div className="relative w-full h-full flex items-center justify-center">
                  {/* Food pattern background */}
                  <div className="absolute inset-0 opacity-10">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <React.Fragment key={i}>
                        <svg className="absolute" style={{ 
                          top: `${Math.random() * 100}%`, 
                          left: `${Math.random() * 100}%`, 
                          width: '24px', 
                          height: '24px',
                          transform: `rotate(${Math.random() * 360}deg)`
                        }} viewBox="0 0 24 24" fill="currentColor">
                          <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8z" />
                        </svg>
                        <svg className="absolute" style={{ 
                          top: `${Math.random() * 100}%`, 
                          left: `${Math.random() * 100}%`, 
                          width: '20px', 
                          height: '20px',
                          transform: `rotate(${Math.random() * 360}deg)`
                        }} viewBox="0 0 24 24" fill="currentColor">
                          <path d="M16 6v6c0 1.1.9 2 2 2h1v7c0 .55.45 1 1 1s1-.45 1-1V3.13c0-.65-.47-1.2-1.12-1.22-1.2-.05-2.23.45-2.79 1.44L16 6zm-5-3c-1.1 0-2 .9-2 2v16c0 1.1.9 2 2 2h1.5c.83 0 1.5-.67 1.5-1.5s-.67-1.5-1.5-1.5H12V5h1.5c.83 0 1.5-.67 1.5-1.5S14.33 2 13.5 2H11zm-6 2C3.9 5 3 5.9 3 7v14c0 1.1.9 2 2 2h3c.55 0 1-.45 1-1s-.45-1-1-1H5V7h3c.55 0 1-.45 1-1s-.45-1-1-1H5z" />
                        </svg>
                      </React.Fragment>
                    ))}
                  </div>
                  
                  {/* Center item letter */}
                  <div className="relative z-10 w-16 h-16 rounded-full bg-white bg-opacity-30 backdrop-blur-sm flex items-center justify-center shadow-lg border border-white border-opacity-20">
                    <span className="text-white text-3xl font-bold">{getPlaceholderText(item.name)}</span>
                  </div>
                  
                  {/* Item name as subtle watermark */}
                  <div className="absolute bottom-3 left-0 right-0 text-center">
                    <span className="px-3 py-1 bg-black bg-opacity-20 text-white text-sm rounded-full backdrop-blur-sm">
                      {item.name}
                    </span>
                  </div>
                </div>
              </div>
            )}
          </div>
          
          <div className="p-5">
            <div className="flex justify-between items-start mb-2">
              <h3 className="text-xl font-bold text-gray-800">{item.name}</h3>
              <span className="text-lg font-bold text-primary">
                ${item.price.toFixed(2)}
              </span>
            </div>
            
            <p className="text-gray-600 mb-4 text-sm">{item.description}</p>
            
            <div className="flex flex-col sm:flex-row justify-between items-center gap-3">
              {/* Inventory indicator */}
              {getInventoryText(item) && (
                <div className={`text-sm ${getInventoryColor(item)} flex items-center`}>
                  {/* Inventory level icon */}
                  {(() => {
                    if (!item.dailyInventory || item.dailyInventory === 0) return null;
                    
                    const remaining = (item.dailyInventory || 0) - (item.soldCount || 0);
                    const percentRemaining = remaining / item.dailyInventory;
                    
                    if (percentRemaining <= 0.2) {
                      return (
                        <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                          <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                        </svg>
                      );
                    }
                    if (percentRemaining <= 0.5) {
                      return (
                        <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                        </svg>
                      );
                    }
                    return (
                      <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                    );
                  })()}
                  {getInventoryText(item)}
                </div>
              )}
              
              <button 
                onClick={() => item.available && onAddToOrder(item)} 
                className={`px-4 py-2 rounded-lg w-full sm:w-auto transition-all duration-300 font-medium 
                  ${item.available 
                    ? 'bg-gradient-to-r from-primary to-accent text-white hover:shadow-md hover:from-accent hover:to-primary' 
                    : 'bg-gray-200 text-gray-500 cursor-not-allowed'}`}
                disabled={!item.available}
              >
                {item.available ? 'Add to Order' : 'Sold Out'}
              </button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default MenuList; 