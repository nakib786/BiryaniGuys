import { useState, useEffect } from 'react';
import { ref, onValue, push, update, remove } from 'firebase/database';
import { db } from '../utils/firebase';

// Define the menu item type
export interface MenuItem {
  id: string;
  name: string;
  description: string;
  price: number;
  image?: string;
  available: boolean;
  vegetarian: boolean;
  dailyInventory?: number; // How many servings available for the day
  soldCount?: number; // How many have been sold today
}

export const useMenu = () => {
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch menu items from Firebase
  useEffect(() => {
    const menuRef = ref(db, 'menu');
    
    const unsubscribe = onValue(menuRef, (snapshot) => {
      try {
        const data = snapshot.val();
        if (data) {
          const itemsArray = Object.entries(data).map(([id, item]) => ({
            id,
            ...(item as Omit<MenuItem, 'id'>)
          }));
          
          setMenuItems(itemsArray);
        } else {
          setMenuItems([]);
        }
        setLoading(false);
      } catch (err) {
        setError('Failed to load menu items');
        setLoading(false);
        console.error(err);
      }
    }, (err) => {
      setError('Failed to load menu items');
      setLoading(false);
      console.error(err);
    });
    
    return () => unsubscribe();
  }, []);

  // Add a new menu item
  const addMenuItem = async (item: Omit<MenuItem, 'id'>) => {
    try {
      const menuRef = ref(db, 'menu');
      await push(menuRef, item);
      return true;
    } catch (err) {
      console.error('Error adding menu item:', err);
      return false;
    }
  };

  // Update an existing menu item
  const updateMenuItem = async (id: string, updates: Partial<Omit<MenuItem, 'id'>>) => {
    try {
      const itemRef = ref(db, `menu/${id}`);
      await update(itemRef, updates);
      return true;
    } catch (err) {
      console.error('Error updating menu item:', err);
      return false;
    }
  };

  // Delete a menu item
  const deleteMenuItem = async (id: string) => {
    try {
      const itemRef = ref(db, `menu/${id}`);
      await remove(itemRef);
      return true;
    } catch (err) {
      console.error('Error deleting menu item:', err);
      return false;
    }
  };

  // Toggle the availability of a menu item
  const toggleAvailability = async (id: string, available: boolean) => {
    return updateMenuItem(id, { available });
  };

  // Set daily inventory for a menu item
  const setDailyInventory = async (id: string, quantity: number) => {
    try {
      const itemRef = ref(db, `menu/${id}`);
      await update(itemRef, { 
        dailyInventory: quantity,
        soldCount: 0 // Reset sold count when setting new inventory
      });
      return true;
    } catch (err) {
      console.error('Error setting daily inventory:', err);
      return false;
    }
  };

  // Mark an item as sold (increment sold count)
  const markItemSold = async (id: string, quantity: number = 1) => {
    try {
      // Get current item data
      const item = menuItems.find(item => item.id === id);
      if (!item) return false;
      
      // Calculate new sold count
      const currentSoldCount = item.soldCount || 0;
      const newSoldCount = currentSoldCount + quantity;
      
      // Calculate if the item is now sold out
      const dailyInventory = item.dailyInventory || 0;
      const available = dailyInventory === 0 ? item.available : newSoldCount < dailyInventory;
      
      // Update the item
      const itemRef = ref(db, `menu/${id}`);
      await update(itemRef, { 
        soldCount: newSoldCount,
        available: available
      });
      
      return true;
    } catch (err) {
      console.error('Error marking item as sold:', err);
      return false;
    }
  };

  // Reset all inventory counts (e.g., at the start of a new day)
  const resetInventoryCounts = async () => {
    try {
      const updates: Record<string, unknown> = {};
      
      menuItems.forEach(item => {
        updates[`menu/${item.id}/soldCount`] = 0;
        // Don't reset dailyInventory, just soldCount
      });
      
      await update(ref(db), updates);
      return true;
    } catch (err) {
      console.error('Error resetting inventory counts:', err);
      return false;
    }
  };

  return {
    menuItems,
    loading,
    error,
    addMenuItem,
    updateMenuItem,
    deleteMenuItem,
    toggleAvailability,
    setDailyInventory,
    markItemSold,
    resetInventoryCounts
  };
}; 