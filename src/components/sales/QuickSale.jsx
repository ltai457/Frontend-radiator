// components/sales/QuickSale.jsx
const QuickSale = () => {
  // Frequently sold items for quick access
  const quickItems = [
    { id: 1, name: 'Toyota Corolla Radiator', code: 'TC-2020', price: 250 },
    { id: 2, name: 'Honda Civic Radiator', code: 'HC-2018', price: 280 },
    // ... more common items
  ];

  return (
    <div className="grid grid-cols-4 gap-2">
      {quickItems.map(item => (
        <button
          key={item.id}
          className="p-4 border rounded-lg hover:bg-blue-50"
          onClick={() => addToCart(item)}
        >
          <p className="font-medium">{item.name}</p>
          <p className="text-lg text-green-600">${item.price}</p>
        </button>
      ))}
    </div>
  );
};