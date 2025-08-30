// components/sales/ProductSelector.jsx
const ProductSelector = ({ onAddToCart }) => {
  const { radiators } = useRadiators();
  const [search, setSearch] = useState('');
  const [selectedWarehouse, setSelectedWarehouse] = useState('');

  const handleAddProduct = (radiator) => {
    const item = {
      radiator,
      warehouse: selectedWarehouse,
      quantity: 1,
      unitPrice: radiator.retailPrice,  // Use default price
      originalPrice: radiator.retailPrice,  // Track original
      discount: 0
    };
    onAddToCart(item);
  };

  return (
    <div>
      {/* Search bar */}
      <input 
        type="text"
        placeholder="Search by code, name, or scan barcode..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="w-full px-4 py-2 border rounded-lg"
      />

      {/* Product Grid */}
      <div className="grid grid-cols-3 gap-4 mt-4">
        {filteredRadiators.map(radiator => (
          <div 
            key={radiator.id}
            className="border rounded-lg p-4 hover:shadow-lg cursor-pointer"
            onClick={() => handleAddProduct(radiator)}
          >
            <h4 className="font-medium">{radiator.name}</h4>
            <p className="text-sm text-gray-600">{radiator.code}</p>
            <p className="text-lg font-bold text-green-600">
              ${radiator.retailPrice}
            </p>
            <p className="text-xs text-gray-500">
              Stock: {getTotalStock(radiator.stock)}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
};