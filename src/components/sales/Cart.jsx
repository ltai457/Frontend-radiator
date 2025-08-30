// components/sales/Cart.jsx
const Cart = ({ items, customer, onCheckout }) => {
  const [showPriceOverride, setShowPriceOverride] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);

  const handlePriceOverride = (item, newPrice) => {
    const discount = ((item.originalPrice - newPrice) / item.originalPrice) * 100;
    
    // Check if discount is within allowed range
    if (discount > item.radiator.maxDiscountPercent) {
      alert(`Maximum discount is ${item.radiator.maxDiscountPercent}%`);
      return false;
    }
    
    // Update item price
    item.unitPrice = newPrice;
    item.discount = discount;
    return true;
  };

  const subtotal = items.reduce((sum, item) => 
    sum + (item.quantity * item.unitPrice), 0
  );
  const gst = subtotal * 0.15;
  const total = subtotal + gst;

  return (
    <div className="h-full flex flex-col">
      {/* Customer Selection */}
      <div className="mb-4">
        <CustomerQuickSelect 
          selected={customer}
          onChange={setCustomer}
        />
      </div>

      {/* Cart Items */}
      <div className="flex-1 overflow-y-auto">
        {items.map((item, index) => (
          <div key={index} className="border-b p-2">
            <div className="flex justify-between">
              <div>
                <p className="font-medium">{item.radiator.name}</p>
                <p className="text-sm text-gray-600">
                  {item.warehouse} × {item.quantity}
                </p>
              </div>
              <div className="text-right">
                <p className="font-medium">${item.unitPrice}</p>
                {item.discount > 0 && (
                  <p className="text-xs text-red-600">
                    -{item.discount.toFixed(0)}% off
                  </p>
                )}
                <button
                  onClick={() => {
                    setSelectedItem(item);
                    setShowPriceOverride(true);
                  }}
                  className="text-xs text-blue-600 hover:underline"
                >
                  Change Price
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Totals */}
      <div className="border-t pt-4">
        <div className="space-y-2">
          <div className="flex justify-between">
            <span>Subtotal:</span>
            <span>${subtotal.toFixed(2)}</span>
          </div>
          <div className="flex justify-between">
            <span>GST (15%):</span>
            <span>${gst.toFixed(2)}</span>
          </div>
          <div className="flex justify-between font-bold text-lg">
            <span>Total:</span>
            <span>${total.toFixed(2)}</span>
          </div>
        </div>

        {/* Checkout Button */}
        <button
          onClick={() => onCheckout(items, customer)}
          className="w-full mt-4 bg-green-600 text-white py-3 rounded-lg font-medium"
          disabled={!customer || items.length === 0}
        >
          Checkout ${total.toFixed(2)}
        </button>
      </div>

      {/* Price Override Modal */}
      {showPriceOverride && (
        <PriceOverrideModal
          item={selectedItem}
          onConfirm={handlePriceOverride}
          onClose={() => setShowPriceOverride(false)}
        />
      )}
    </div>
  );
};