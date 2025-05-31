import React, { useState } from 'react';
import { useMenu } from '../../hooks/useMenu';
import type { MenuItem } from '../../hooks/useMenu';

const MenuEditor: React.FC = () => {
  const { menuItems, loading, error, addMenuItem, updateMenuItem, deleteMenuItem, toggleAvailability, setDailyInventory, markItemSold, resetInventoryCounts } = useMenu();
  const [isAddingItem, setIsAddingItem] = useState(false);
  const [editingItem, setEditingItem] = useState<MenuItem | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: 0,
    image: '',
    available: true,
    vegetarian: false,
    dailyInventory: 0,
    soldCount: 0
  });

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      price: 0,
      image: '',
      available: true,
      vegetarian: false,
      dailyInventory: 0,
      soldCount: 0
    });
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    
    if (type === 'checkbox') {
      const target = e.target as HTMLInputElement;
      setFormData({
        ...formData,
        [name]: target.checked
      });
    } else if (name === 'price' || name === 'dailyInventory' || name === 'soldCount') {
      setFormData({
        ...formData,
        [name]: parseFloat(value) || 0
      });
    } else {
      setFormData({
        ...formData,
        [name]: value
      });
    }
  };

  const handleAddItem = async (e: React.FormEvent) => {
    e.preventDefault();
    const success = await addMenuItem(formData);
    if (success) {
      resetForm();
      setIsAddingItem(false);
    }
  };

  const handleUpdateItem = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingItem) return;
    
    const success = await updateMenuItem(editingItem.id, formData);
    if (success) {
      resetForm();
      setEditingItem(null);
    }
  };

  const startEditingItem = (item: MenuItem) => {
    setEditingItem(item);
    setFormData({
      name: item.name,
      description: item.description,
      price: item.price,
      image: item.image || '',
      available: item.available,
      vegetarian: item.vegetarian,
      dailyInventory: item.dailyInventory || 0,
      soldCount: item.soldCount || 0
    });
    setIsAddingItem(false);
  };

  const startAddingItem = () => {
    resetForm();
    setEditingItem(null);
    setIsAddingItem(true);
  };

  const handleDeleteItem = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this menu item?')) {
      await deleteMenuItem(id);
    }
  };

  const handleToggleAvailability = async (id: string, currentStatus: boolean) => {
    await toggleAvailability(id, !currentStatus);
  };

  const handleSetInventory = async (id: string, quantity: number) => {
    await setDailyInventory(id, quantity);
  };

  const handleMarkSold = async (id: string) => {
    await markItemSold(id);
  };

  const handleResetAllInventory = async () => {
    if (window.confirm('Are you sure you want to reset all sold counts? This is typically done at the start of a new day.')) {
      await resetInventoryCounts();
    }
  };

  if (loading) {
    return <div className="p-4 text-center">Loading menu items...</div>;
  }

  if (error) {
    return <div className="p-4 text-center text-red-600">{error}</div>;
  }

  return (
    <div className="p-4">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold">Menu Items</h2>
        <div className="flex gap-2">
          {!isAddingItem && !editingItem && (
            <>
              <button
                onClick={startAddingItem}
                className="btn btn-primary"
              >
                Add New Item
              </button>
              <button
                onClick={handleResetAllInventory}
                className="btn btn-outline"
              >
                Reset All Sold Counts
              </button>
            </>
          )}
        </div>
      </div>

      {/* Add/Edit Form */}
      {(isAddingItem || editingItem) && (
        <div className="bg-gray-50 p-4 rounded-lg mb-6">
          <h3 className="text-lg font-medium mb-4">
            {isAddingItem ? 'Add New Menu Item' : 'Edit Menu Item'}
          </h3>
          <form onSubmit={isAddingItem ? handleAddItem : handleUpdateItem}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block mb-1">Name</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  className="w-full p-2 border rounded"
                  required
                />
              </div>
              <div>
                <label className="block mb-1">Price ($)</label>
                <input
                  type="number"
                  name="price"
                  value={formData.price}
                  onChange={handleInputChange}
                  step="0.01"
                  min="0"
                  className="w-full p-2 border rounded"
                  required
                />
              </div>
            </div>
            
            <div className="mb-4">
              <label className="block mb-1">Description</label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                className="w-full p-2 border rounded"
                rows={3}
                required
              />
            </div>
            
            <div className="mb-4">
              <label className="block mb-1">Image URL (optional)</label>
              <input
                type="text"
                name="image"
                value={formData.image}
                onChange={handleInputChange}
                className="w-full p-2 border rounded"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block mb-1">Daily Inventory (0 = unlimited)</label>
                <input
                  type="number"
                  name="dailyInventory"
                  value={formData.dailyInventory}
                  onChange={handleInputChange}
                  min="0"
                  className="w-full p-2 border rounded"
                />
              </div>
              {editingItem && (
                <div>
                  <label className="block mb-1">Sold Count</label>
                  <input
                    type="number"
                    name="soldCount"
                    value={formData.soldCount}
                    onChange={handleInputChange}
                    min="0"
                    className="w-full p-2 border rounded"
                    readOnly={!editingItem}
                  />
                </div>
              )}
            </div>
            
            <div className="flex flex-wrap gap-4 mb-4">
              <div className="flex items-center">
                <input
                  type="checkbox"
                  name="available"
                  id="available"
                  checked={formData.available}
                  onChange={handleInputChange}
                  className="mr-2"
                />
                <label htmlFor="available">Available</label>
              </div>
              <div className="flex items-center">
                <input
                  type="checkbox"
                  name="vegetarian"
                  id="vegetarian"
                  checked={formData.vegetarian}
                  onChange={handleInputChange}
                  className="mr-2"
                />
                <label htmlFor="vegetarian">Vegetarian</label>
              </div>
            </div>
            
            <div className="flex gap-2">
              <button
                type="submit"
                className="btn btn-primary"
              >
                {isAddingItem ? 'Add Item' : 'Update Item'}
              </button>
              <button
                type="button"
                onClick={() => {
                  setIsAddingItem(false);
                  setEditingItem(null);
                  resetForm();
                }}
                className="btn btn-outline"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Menu Items List */}
      <div className="space-y-4">
        {menuItems.length === 0 ? (
          <div className="text-center p-8 bg-gray-50 rounded-lg">
            <p>No menu items yet. Add your first item!</p>
          </div>
        ) : (
          menuItems.map(item => (
            <div 
              key={item.id} 
              className={`border rounded-lg p-4 ${!item.available ? 'bg-gray-50' : 'bg-white'}`}
            >
              <div className="flex flex-wrap justify-between items-start gap-4">
                <div>
                  <h3 className="text-lg font-medium">
                    {item.name}
                    {item.vegetarian && (
                      <span className="ml-2 bg-green-100 text-green-800 text-xs px-2 py-1 rounded">Veg</span>
                    )}
                    {!item.available && (
                      <span className="ml-2 bg-gray-100 text-gray-800 text-xs px-2 py-1 rounded">Unavailable</span>
                    )}
                  </h3>
                  <p className="text-gray-600 mt-1">{item.description}</p>
                  <p className="text-primary font-medium mt-2">${item.price.toFixed(2)}</p>
                  
                  {/* Inventory Information */}
                  <div className="mt-2 text-sm">
                    {(item.dailyInventory || 0) > 0 ? (
                      <div className="flex items-center gap-1">
                        <span>Inventory: </span>
                        <span className="font-medium">
                          {Math.max(0, (item.dailyInventory || 0) - (item.soldCount || 0))} / {item.dailyInventory || 0}
                        </span>
                        {(item.soldCount || 0) >= (item.dailyInventory || 0) && (item.dailyInventory || 0) > 0 && (
                          <span className="text-red-500 font-medium ml-1">SOLD OUT</span>
                        )}
                      </div>
                    ) : (
                      <div>Unlimited inventory</div>
                    )}
                  </div>
                </div>
                
                <div className="flex flex-col gap-2">
                  <div className="flex flex-wrap gap-2">
                    <button 
                      onClick={() => startEditingItem(item)}
                      className="btn btn-sm btn-outline"
                    >
                      Edit
                    </button>
                    <button 
                      onClick={() => handleDeleteItem(item.id)}
                      className="btn btn-sm btn-outline btn-error"
                    >
                      Delete
                    </button>
                  </div>
                  
                  <div className="flex flex-wrap gap-2 mt-2">
                    <button 
                      onClick={() => handleToggleAvailability(item.id, item.available)}
                      className={`btn btn-sm ${item.available ? 'btn-outline btn-warning' : 'btn-outline btn-success'}`}
                    >
                      {item.available ? 'Mark Unavailable' : 'Mark Available'}
                    </button>
                  </div>
                  
                  {/* Inventory Management Buttons */}
                  <div className="flex flex-wrap gap-2 mt-2">
                    <div className="flex items-center gap-2 border rounded p-2 w-full">
                      <input 
                        type="number" 
                        min="0"
                        value={item.dailyInventory || 0}
                        onChange={(e) => handleSetInventory(item.id, parseInt(e.target.value) || 0)}
                        className="w-16 p-1 border rounded text-center"
                      />
                      <button 
                        onClick={() => handleSetInventory(item.id, (item.dailyInventory || 0))}
                        className="btn btn-sm btn-outline"
                      >
                        Set Inventory
                      </button>
                    </div>
                    
                    {(item.dailyInventory || 0) > 0 && (
                      <button 
                        onClick={() => handleMarkSold(item.id)}
                        className="btn btn-sm btn-outline w-full"
                        disabled={(item.soldCount || 0) >= (item.dailyInventory || 0)}
                      >
                        Mark One Sold
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default MenuEditor; 