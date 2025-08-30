// pages/PointOfSale.jsx
import React, { useState } from 'react';
import Cart from '../components/sales/Cart';
import ProductSelector from '../components/sales/ProductSelector';
import QuickSale from '../components/sales/QuickSale';

const PointOfSale = () => {
  const [cart, setCart] = useState([]);
  const [customer, setCustomer] = useState(null);

  return (
    <div className="h-screen flex">
      {/* Left: Product Selection */}
      <div className="flex-1 p-4">
        <ProductSelector 
          onAddToCart={(item) => setCart([...cart, item])}
        />
      </div>
      
      {/* Right: Cart & Checkout */}
      <div className="w-96 bg-gray-50 p-4">
        <Cart 
          items={cart}
          customer={customer}
          onCheckout={handleCheckout}
        />
      </div>
    </div>
  );
};