import { ref, set, get } from 'firebase/database';
import { db } from './firebase';
import type { MenuItem } from '../hooks/useMenu';

// Initial menu items data
const initialMenuItems: Omit<MenuItem, 'id'>[] = [
  {
    name: 'Chicken Biryani',
    description: 'Fragrant basmati rice cooked with tender chicken, aromatic spices, and herbs.',
    price: 14.99,
    image: 'https://images.unsplash.com/photo-1589302168068-964664d93dc0?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60',
    available: true,
    vegetarian: false,
  },
  {
    name: 'Vegetable Biryani',
    description: 'Basmati rice cooked with mixed vegetables, aromatic spices, and herbs.',
    price: 12.99,
    image: 'https://images.unsplash.com/photo-1604152135912-04a022e23696?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60',
    available: true,
    vegetarian: true,
  },
  {
    name: 'Butter Chicken',
    description: 'Tender chicken pieces in a rich, creamy tomato sauce with butter and spices.',
    price: 15.99,
    image: 'https://images.unsplash.com/photo-1588166524941-3bf61a9c41db?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60',
    available: true,
    vegetarian: false,
  },
  {
    name: 'Paneer Tikka Masala',
    description: 'Cubes of paneer cheese in a spiced tomato-based sauce with bell peppers and onions.',
    price: 13.99,
    image: 'https://images.unsplash.com/photo-1565557623262-b51c2513a641?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60',
    available: true,
    vegetarian: true,
  }
];

// Function to seed the database with initial data if it doesn't exist
export const seedDatabase = async (): Promise<void> => {
  try {
    // Check if menu items already exist
    const menuRef = ref(db, 'menu');
    const snapshot = await get(menuRef);
    
    // Only seed if no data exists
    if (!snapshot.exists()) {
      console.log('Seeding database with initial menu items...');
      
      // Add each menu item with a specific key
      for (let i = 0; i < initialMenuItems.length; i++) {
        const itemRef = ref(db, `menu/item${i + 1}`);
        await set(itemRef, initialMenuItems[i]);
      }
      
      console.log('Database seeded successfully!');
    } else {
      console.log('Database already contains menu items. Skipping seed operation.');
    }
  } catch (error) {
    console.error('Error seeding database:', error);
  }
}; 