// components/inventory/PriceManagement.jsx
const PriceManagement = () => {
  const { radiators, updatePrices } = useRadiators();
  const [bulkUpdate, setBulkUpdate] = useState({
    type: 'percentage',  // or 'fixed'
    value: 0,
    applyTo: 'all'  // or 'selected'
  });

  const handleBulkPriceUpdate = async () => {
    const updates = radiators.map(r => ({
      id: r.id,
      retailPrice: calculateNewPrice(r.retailPrice, bulkUpdate)
    }));
    
    await updatePrices(updates);
  };

  return (
    <div>
      {/* Bulk Update Controls */}
      <div className="bg-white rounded-lg shadow p-4 mb-6">
        <h3 className="font-medium mb-4">Bulk Price Update</h3>
        <div className="flex gap-4">
          <select 
            value={bulkUpdate.type}
            onChange={(e) => setBulkUpdate({...bulkUpdate, type: e.target.value})}
          >
            <option value="percentage">Percentage Change</option>
            <option value="fixed">Fixed Amount</option>
          </select>
          <input 
            type="number"
            value={bulkUpdate.value}
            onChange={(e) => setBulkUpdate({...bulkUpdate, value: e.target.value})}
            placeholder="Enter value"
          />
          <button 
            onClick={handleBulkPriceUpdate}
            className="px-4 py-2 bg-blue-600 text-white rounded"
          >
            Apply to All
          </button>
        </div>
      </div>

      {/* Price List Table */}
      <div className="bg-white rounded-lg shadow">
        <table className="w-full">
          <thead>
            <tr>
              <th>Product</th>
              <th>Code</th>
              <th>Cost Price</th>
              <th>Retail Price</th>
              <th>Trade Price</th>
              <th>Margin %</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {radiators.map(radiator => (
              <PriceRow 
                key={radiator.id}
                radiator={radiator}
                onUpdate={handlePriceUpdate}
              />
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};