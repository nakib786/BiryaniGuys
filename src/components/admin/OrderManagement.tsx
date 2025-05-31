import React from 'react';
import { useOrders } from '../../hooks/useOrders';

const OrderManagement: React.FC = () => {
  const { orders, loading, error } = useOrders();

  // Format date for display
  const formatDate = (timestamp: number) => {
    const date = new Date(timestamp);
    return date.toLocaleString();
  };

  if (loading) {
    return <div className="text-center py-8">Loading orders...</div>;
  }

  if (error) {
    return <div className="text-center py-8 text-red-600">{error}</div>;
  }

  return (
    <div>
      {orders.length === 0 ? (
        <div className="bg-gray-100 p-4 rounded text-center">
          <p className="text-gray-500">No orders found</p>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map(order => (
            <div key={order.id} className="border rounded p-4">
              <div className="flex justify-between mb-2">
                <span className="font-bold">Order ID: {order.id.substring(0, 8)}...</span>
                <span className="text-sm text-gray-500">{formatDate(order.createdAt)}</span>
              </div>

              <div className="mb-2">
                <span className="text-sm font-medium">Customer: </span>
                <span>{order.customer.name} ({order.customer.phone})</span>
              </div>

              <div className="mb-2">
                <span className="text-sm font-medium">Address: </span>
                <span>{order.customer.address}</span>
              </div>

              <div className="mb-4">
                <span className="text-sm font-medium">Total: </span>
                <span className="font-bold">${order.totalAmount.toFixed(2)}</span>
              </div>

              <div className="border-t pt-2">
                <h4 className="text-sm font-medium mb-1">Items:</h4>
                <ul className="text-sm">
                  {order.items.map((item, index) => (
                    <li key={index} className="flex justify-between">
                      <span>{item.name} x{item.quantity}</span>
                      <span>${(item.price * item.quantity).toFixed(2)}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {order.notes && (
                <div className="border-t mt-2 pt-2">
                  <h4 className="text-sm font-medium mb-1">Notes:</h4>
                  <p className="text-sm">{order.notes}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default OrderManagement; 