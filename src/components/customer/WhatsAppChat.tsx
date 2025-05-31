import React, { useState } from 'react';
import { useMenu } from '../../hooks/useMenu';

interface WhatsAppChatProps {
  phoneNumber: string;
}

interface SelectedItem {
  checked: boolean;
  quantity: number;
}

const WhatsAppChat: React.FC<WhatsAppChatProps> = ({ phoneNumber }) => {
  const { menuItems, loading } = useMenu();
  const [selectedItems, setSelectedItems] = useState<{ [key: string]: SelectedItem }>({});
  const [isOpen, setIsOpen] = useState(false);
  const [userNote, setUserNote] = useState('');

  const toggleChat = () => {
    setIsOpen(!isOpen);
  };

  const toggleItem = (itemId: string) => {
    setSelectedItems(prev => {
      const current = prev[itemId] || { checked: false, quantity: 1 };
      return {
        ...prev,
        [itemId]: { 
          ...current,
          checked: !current.checked 
        }
      };
    });
  };

  const updateQuantity = (itemId: string, quantity: number) => {
    if (quantity < 1) return;
    
    setSelectedItems(prev => {
      const current = prev[itemId] || { checked: true, quantity: 1 };
      return {
        ...prev,
        [itemId]: {
          ...current,
          quantity,
          checked: true
        }
      };
    });
  };

  const handleSendToWhatsApp = () => {
    const selectedMenuItems = menuItems.filter(item => selectedItems[item.id]?.checked);
    
    if (selectedMenuItems.length === 0) {
      alert('Please select at least one menu item.');
      return;
    }

    const message = `Hi, I'd like to order:\n${selectedMenuItems.map(item => {
      const quantity = selectedItems[item.id]?.quantity || 1;
      return `- ${quantity}x ${item.name} ($${(item.price * quantity).toFixed(2)})`;
    }).join('\n')}${userNote ? `\n\nNote: ${userNote}` : ''}`;
    
    const encodedMessage = encodeURIComponent(message);
    const whatsappUrl = `https://wa.me/${phoneNumber.replace(/\+/g, '')}?text=${encodedMessage}`;
    
    window.open(whatsappUrl, '_blank');
  };

  const getTotalPrice = () => {
    if (!menuItems) return 0;
    
    return menuItems.reduce((total, item) => {
      const selected = selectedItems[item.id];
      if (selected?.checked) {
        return total + (item.price * (selected.quantity || 1));
      }
      return total;
    }, 0);
  };

  return (
    <div className="fixed bottom-6 right-6 z-50">
      {/* Chat toggle button */}
      <button 
        onClick={toggleChat}
        className="bg-green-500 hover:bg-green-600 text-white rounded-full w-16 h-16 flex items-center justify-center shadow-lg transition-all duration-300"
        aria-label="Open WhatsApp order menu"
      >
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 448 512" className="w-8 h-8 fill-current">
          <path d="M380.9 97.1C339 55.1 283.2 32 223.9 32c-122.4 0-222 99.6-222 222 0 39.1 10.2 77.3 29.6 111L0 480l117.7-30.9c32.4 17.7 68.9 27 106.1 27h.1c122.3 0 224.1-99.6 224.1-222 0-59.3-25.2-115-67.1-157zm-157 341.6c-33.2 0-65.7-8.9-94-25.7l-6.7-4-69.8 18.3L72 359.2l-4.4-7c-18.5-29.4-28.2-63.3-28.2-98.2 0-101.7 82.8-184.5 184.6-184.5 49.3 0 95.6 19.2 130.4 54.1 34.8 34.9 56.2 81.2 56.1 130.5 0 101.8-84.9 184.6-186.6 184.6zm101.2-138.2c-5.5-2.8-32.8-16.2-37.9-18-5.1-1.9-8.8-2.8-12.5 2.8-3.7 5.6-14.3 18-17.6 21.8-3.2 3.7-6.5 4.2-12 1.4-32.6-16.3-54-29.1-75.5-66-5.7-9.8 5.7-9.1 16.3-30.3 1.8-3.7.9-6.9-.5-9.7-1.4-2.8-12.5-30.1-17.1-41.2-4.5-10.8-9.1-9.3-12.5-9.5-3.2-.2-6.9-.2-10.6-.2-3.7 0-9.7 1.4-14.8 6.9-5.1 5.6-19.4 19-19.4 46.3 0 27.3 19.9 53.7 22.6 57.4 2.8 3.7 39.1 59.7 94.8 83.8 35.2 15.2 49 16.5 66.6 13.9 10.7-1.6 32.8-13.4 37.4-26.4 4.6-13 4.6-24.1 3.2-26.4-1.3-2.5-5-3.9-10.5-6.6z"/>
        </svg>
      </button>

      {/* Chat bubble */}
      {isOpen && (
        <div className="absolute bottom-20 right-0 w-96 bg-white rounded-lg shadow-xl overflow-hidden transition-all duration-300 border border-gray-200">
          <div className="bg-green-500 text-white p-4 flex justify-between items-center">
            <div>
              <h3 className="font-bold text-lg">WhatsApp Order</h3>
              <p className="text-sm">Select items to order via WhatsApp</p>
            </div>
            <button 
              onClick={toggleChat}
              className="text-white hover:text-gray-200 transition-colors"
              aria-label="Close menu"
            >
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" className="w-6 h-6">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <div className="p-4 max-h-96 overflow-y-auto">
            {loading ? (
              <p className="text-center py-4">Loading menu items...</p>
            ) : (
              <div className="space-y-3">
                {menuItems.map(item => (
                  <div 
                    key={item.id} 
                    className={`flex items-start space-x-3 p-3 rounded-lg transition-colors ${selectedItems[item.id]?.checked ? 'bg-green-50 border border-green-200' : 'hover:bg-gray-50 border border-transparent'}`}
                  >
                    <input 
                      type="checkbox" 
                      id={`item-${item.id}`}
                      checked={!!selectedItems[item.id]?.checked}
                      onChange={() => toggleItem(item.id)}
                      className="h-5 w-5 text-green-500 mt-1"
                    />
                    <div className="flex-1">
                      <label htmlFor={`item-${item.id}`} className="flex justify-between cursor-pointer">
                        <div className="font-medium">{item.name}</div>
                        <div className="text-sm text-gray-600">${item.price.toFixed(2)}</div>
                      </label>
                      {item.description && (
                        <p className="text-sm text-gray-500 mt-1">{item.description}</p>
                      )}
                      
                      {selectedItems[item.id]?.checked && (
                        <div className="flex items-center mt-2">
                          <button 
                            onClick={() => updateQuantity(item.id, (selectedItems[item.id]?.quantity || 1) - 1)}
                            className="bg-gray-200 hover:bg-gray-300 text-gray-700 h-8 w-8 rounded-l flex items-center justify-center"
                            aria-label="Decrease quantity"
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" className="w-4 h-4">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
                            </svg>
                          </button>
                          <div className="bg-gray-100 text-center h-8 px-3 flex items-center justify-center">
                            {selectedItems[item.id]?.quantity || 1}
                          </div>
                          <button 
                            onClick={() => updateQuantity(item.id, (selectedItems[item.id]?.quantity || 1) + 1)}
                            className="bg-gray-200 hover:bg-gray-300 text-gray-700 h-8 w-8 rounded-r flex items-center justify-center"
                            aria-label="Increase quantity"
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" className="w-4 h-4">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                            </svg>
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
            
            <div className="mt-4">
              <label htmlFor="user-note" className="block text-sm font-medium text-gray-700 mb-1">Add a note (optional)</label>
              <textarea 
                id="user-note" 
                rows={2} 
                className="w-full p-2 border border-gray-300 rounded-md text-sm"
                placeholder="Special instructions, delivery details, etc."
                value={userNote}
                onChange={(e) => setUserNote(e.target.value)}
              ></textarea>
            </div>
          </div>

          <div className="p-4 border-t">
            <div className="flex justify-between items-center mb-3">
              <span className="font-medium">Total:</span>
              <span className="font-bold text-lg">${getTotalPrice().toFixed(2)}</span>
            </div>
            <button
              onClick={handleSendToWhatsApp}
              className="w-full bg-green-500 hover:bg-green-600 text-white py-3 px-4 rounded-lg font-medium transition-colors flex items-center justify-center"
            >
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 448 512" className="w-5 h-5 fill-current mr-2">
                <path d="M380.9 97.1C339 55.1 283.2 32 223.9 32c-122.4 0-222 99.6-222 222 0 39.1 10.2 77.3 29.6 111L0 480l117.7-30.9c32.4 17.7 68.9 27 106.1 27h.1c122.3 0 224.1-99.6 224.1-222 0-59.3-25.2-115-67.1-157z"/>
              </svg>
              Send to WhatsApp
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default WhatsAppChat; 