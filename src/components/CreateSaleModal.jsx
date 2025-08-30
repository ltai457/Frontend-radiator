// src/components/CreateSaleModal.jsx
import React, { useState, useEffect } from 'react';
import radiatorService from '../api/radiatorService';
import warehouseService from '../api/warehouseService';

const CreateSaleModal = ({ isOpen, onClose, onSuccess }) => {
  const [step, setStep] = useState(1); // 1: Customer, 2: Items, 3: Review
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  // Data
  const [radiators, setRadiators] = useState([]);
  const [warehouses, setWarehouses] = useState([]);
  
  // Sale data
  const [saleData, setSaleData] = useState({
    customer: {
      firstName: '',
      lastName: '', 
      email: '',
      phone: '',
      company: ''
    },
    items: [],
    paymentMethod: 'Cash',
    notes: ''
  });

  const [newItem, setNewItem] = useState({
    radiatorId: '',
    warehouseId: '',
    quantity: 1,
    unitPrice: 0
  });

  // Load initial data
  useEffect(() => {
    const loadData = async () => {
      if (isOpen) {
        const [radiatorsResult, warehousesResult] = await Promise.all([
          radiatorService.getAll(),
          warehouseService.getAll()
        ]);
        
        if (radiatorsResult.success) {
          setRadiators(radiatorsResult.data);
        }
        if (warehousesResult.success) {
          setWarehouses(warehousesResult.data);
        }
      }
    };
    
    loadData();
  }, [isOpen]);

  const handleCustomerChange = (field, value) => {
    setSaleData(prev => ({
      ...prev,
      customer: {
        ...prev.customer,
        [field]: value
      }
    }));
  };

  const handleNewItemChange = (field, value) => {
    setNewItem(prev => ({
      ...prev,
      [field]: field === 'quantity' || field === 'unitPrice' 
        ? (parseFloat(value) || 0) 
        : value
    }));
  };

  const getSelectedRadiator = () => {
    return radiators.find(r => r.id === newItem.radiatorId);
  };

  const getSelectedWarehouse = () => {
    return warehouses.find(w => w.id === newItem.warehouseId);
  };

  const getAvailableStock = () => {
    const radiator = getSelectedRadiator();
    const warehouse = getSelectedWarehouse();
    if (!radiator || !warehouse) return 0;
    return radiator.stock[warehouse.code] || 0;
  };

  const addItemToSale = () => {
    const radiator = getSelectedRadiator();
    const warehouse = getSelectedWarehouse();
    const availableStock = getAvailableStock();
    
    if (!radiator || !warehouse) {
      setError('Please select both radiator and warehouse');
      return;
    }
    
    if (newItem.quantity > availableStock) {
      setError(`Only ${availableStock} units available in stock`);
      return;
    }
    
    if (newItem.unitPrice <= 0) {
      setError('Unit price must be greater than 0');
      return;
    }

    const item = {
      id: Date.now(), // Temporary ID
      radiatorId: newItem.radiatorId,
      warehouseId: newItem.warehouseId,
      radiator: radiator,
      warehouse: warehouse,
      quantity: newItem.quantity,
      unitPrice: newItem.unitPrice,
      totalPrice: newItem.quantity * newItem.unitPrice
    };

    setSaleData(prev => ({
      ...prev,
      items: [...prev.items, item]
    }));

    // Reset new item form
    setNewItem({
      radiatorId: '',
      warehouseId: '',
      quantity: 1,
      unitPrice: 0
    });
    setError('');
  };

  const removeItem = (itemId) => {
    setSaleData(prev => ({
      ...prev,
      items: prev.items.filter(item => item.id !== itemId)
    }));
  };

  const calculateTotals = () => {
    const subTotal = saleData.items.reduce((sum, item) => sum + item.totalPrice, 0);
    const taxAmount = subTotal * 0.15; // 15% GST
    const totalAmount = subTotal + taxAmount;
    
    return { subTotal, taxAmount, totalAmount };
  };

  const handleSubmit = async () => {
    if (step < 3) return;
    
    setLoading(true);
    setError('');

    try {
      // Create mock sale response - replace with actual API call
      const { totalAmount } = calculateTotals();
      const newSale = {
        id: Date.now().toString(),
        saleNumber: `RS${Date.now()}`,
        customerName: `${saleData.customer.firstName} ${saleData.customer.lastName}`,
        processedByName: 'current_user',
        totalAmount: totalAmount,
        paymentMethod: saleData.paymentMethod,
        status: 'Completed',
        saleDate: new Date().toISOString(),
        itemCount: saleData.items.length
      };

      onSuccess(newSale);
      handleClose();
    } catch (err) {
      setError('Failed to process sale: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    if (!loading) {
      setStep(1);
      setSaleData({
        customer: { firstName: '', lastName: '', email: '', phone: '', company: '' },
        items: [],
        paymentMethod: 'Cash',
        notes: ''
      });
      setNewItem({ radiatorId: '', warehouseId: '', quantity: 1, unitPrice: 0 });
      setError('');
      onClose();
    }
  };

  const nextStep = () => {
    if (step === 1) {
      if (!saleData.customer.firstName || !saleData.customer.lastName) {
        setError('Customer first and last name are required');
        return;
      }
    } else if (step === 2) {
      if (saleData.items.length === 0) {
        setError('At least one item must be added to the sale');
        return;
      }
    }
    setError('');
    setStep(step + 1);
  };

  const prevStep = () => {
    setError('');
    setStep(step - 1);
  };

  if (!isOpen) return null;

  const { subTotal, taxAmount, totalAmount } = calculateTotals();

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
      <div className="relative top-10 mx-auto p-5 border w-full max-w-4xl shadow-lg rounded-md bg-white">
        <div className="mt-3">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-lg font-medium text-gray-900">Create New Sale</h3>
              <div className="flex items-center mt-2">
                {[1, 2, 3].map((stepNum) => (
                  <div key={stepNum} className="flex items-center">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                      stepNum <= step ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-600'
                    }`}>
                      {stepNum}
                    </div>
                    {stepNum < 3 && <div className="w-12 h-px bg-gray-200 mx-2" />}
                  </div>
                ))}
              </div>
            </div>
            <button onClick={handleClose} disabled={loading} className="text-gray-400 hover:text-gray-600">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-800 px-3 py-2 rounded text-sm mb-4">
              {error}
            </div>
          )}

          {/* Step 1: Customer Information */}
          {step === 1 && (
            <div className="space-y-4">
              <h4 className="text-md font-medium text-gray-900">Customer Information</h4>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">First Name *</label>
                  <input
                    type="text"
                    value={saleData.customer.firstName}
                    onChange={(e) => handleCustomerChange('firstName', e.target.value)}
                    className="input-field w-full"
                    placeholder="Enter first name"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Last Name *</label>
                  <input
                    type="text"
                    value={saleData.customer.lastName}
                    onChange={(e) => handleCustomerChange('lastName', e.target.value)}
                    className="input-field w-full"
                    placeholder="Enter last name"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                  <input
                    type="email"
                    value={saleData.customer.email}
                    onChange={(e) => handleCustomerChange('email', e.target.value)}
                    className="input-field w-full"
                    placeholder="customer@example.com"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                  <input
                    type="tel"
                    value={saleData.customer.phone}
                    onChange={(e) => handleCustomerChange('phone', e.target.value)}
                    className="input-field w-full"
                    placeholder="+64 21 123 4567"
                  />
                </div>
                <div className="col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Company (Optional)</label>
                  <input
                    type="text"
                    value={saleData.customer.company}
                    onChange={(e) => handleCustomerChange('company', e.target.value)}
                    className="input-field w-full"
                    placeholder="Company name"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Step 2: Add Items */}
          {step === 2 && (
            <div className="space-y-6">
              <h4 className="text-md font-medium text-gray-900">Add Items to Sale</h4>
              
              {/* Add New Item Form */}
              <div className="border border-gray-200 rounded-lg p-4">
                <h5 className="text-sm font-medium text-gray-900 mb-3">Add Item</h5>
                <div className="grid grid-cols-4 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Radiator</label>
                    <select
                      value={newItem.radiatorId}
                      onChange={(e) => handleNewItemChange('radiatorId', e.target.value)}
                      className="input-field w-full"
                    >
                      <option value="">Select radiator</option>
                      {radiators.map(radiator => (
                        <option key={radiator.id} value={radiator.id}>
                          {radiator.brand} - {radiator.name} ({radiator.code})
                        </option>
                      ))}
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Warehouse</label>
                    <select
                      value={newItem.warehouseId}
                      onChange={(e) => handleNewItemChange('warehouseId', e.target.value)}
                      className="input-field w-full"
                      disabled={!newItem.radiatorId}
                    >
                      <option value="">Select warehouse</option>
                      {warehouses.map(warehouse => {
                        const radiator = getSelectedRadiator();
                        const stock = radiator?.stock[warehouse.code] || 0;
                        return (
                          <option key={warehouse.id} value={warehouse.id} disabled={stock === 0}>
                            {warehouse.name} (Stock: {stock})
                          </option>
                        );
                      })}
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Quantity (Max: {getAvailableStock()})
                    </label>
                    <input
                      type="number"
                      min="1"
                      max={getAvailableStock()}
                      value={newItem.quantity}
                      onChange={(e) => handleNewItemChange('quantity', e.target.value)}
                      className="input-field w-full"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Unit Price ($)</label>
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      value={newItem.unitPrice}
                      onChange={(e) => handleNewItemChange('unitPrice', e.target.value)}
                      className="input-field w-full"
                      placeholder="0.00"
                    />
                  </div>
                </div>
                
                <div className="flex justify-end mt-4">
                  <button
                    onClick={addItemToSale}
                    disabled={!newItem.radiatorId || !newItem.warehouseId || newItem.quantity <= 0 || newItem.unitPrice <= 0}
                    className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Add Item
                  </button>
                </div>
              </div>

              {/* Items List */}
              {saleData.items.length > 0 && (
                <div>
                  <h5 className="text-sm font-medium text-gray-900 mb-3">Items in Sale</h5>
                  <div className="bg-gray-50 rounded-lg overflow-hidden">
                    <table className="min-w-full">
                      <thead className="bg-gray-100">
                        <tr>
                          <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Item</th>
                          <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Warehouse</th>
                          <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Qty</th>
                          <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Price</th>
                          <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Total</th>
                          <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Action</th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {saleData.items.map(item => (
                          <tr key={item.id}>
                            <td className="px-4 py-2">
                              <div>
                                <div className="font-medium text-gray-900">{item.radiator.brand}</div>
                                <div className="text-sm text-gray-500">{item.radiator.name}</div>
                              </div>
                            </td>
                            <td className="px-4 py-2 text-sm text-gray-900">{item.warehouse.name}</td>
                            <td className="px-4 py-2 text-sm text-gray-900">{item.quantity}</td>
                            <td className="px-4 py-2 text-sm text-gray-900">${item.unitPrice.toFixed(2)}</td>
                            <td className="px-4 py-2 text-sm font-medium text-gray-900">${item.totalPrice.toFixed(2)}</td>
                            <td className="px-4 py-2">
                              <button
                                onClick={() => removeItem(item.id)}
                                className="text-red-600 hover:text-red-800 text-sm font-medium"
                              >
                                Remove
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  
                  {/* Totals */}
                  <div className="mt-4 bg-gray-50 rounded-lg p-4">
                    <div className="flex justify-between text-sm">
                      <span>Subtotal:</span>
                      <span>${subTotal.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-sm text-gray-600">
                      <span>Tax (15% GST):</span>
                      <span>${taxAmount.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-lg font-semibold border-t border-gray-200 pt-2 mt-2">
                      <span>Total:</span>
                      <span>${totalAmount.toFixed(2)}</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Step 3: Review and Payment */}
          {step === 3 && (
            <div className="space-y-6">
              <h4 className="text-md font-medium text-gray-900">Review and Payment</h4>
              
              {/* Customer Summary */}
              <div className="bg-gray-50 rounded-lg p-4">
                <h5 className="font-medium text-gray-900 mb-2">Customer</h5>
                <p className="text-sm text-gray-600">
                  {saleData.customer.firstName} {saleData.customer.lastName}
                  {saleData.customer.email && ` • ${saleData.customer.email}`}
                  {saleData.customer.phone && ` • ${saleData.customer.phone}`}
                  {saleData.customer.company && ` • ${saleData.customer.company}`}
                </p>
              </div>

              {/* Items Summary */}
              <div className="bg-gray-50 rounded-lg p-4">
                <h5 className="font-medium text-gray-900 mb-3">Items ({saleData.items.length})</h5>
                <div className="space-y-2">
                  {saleData.items.map(item => (
                    <div key={item.id} className="flex justify-between text-sm">
                      <span>{item.quantity}x {item.radiator.brand} {item.radiator.name}</span>
                      <span>${item.totalPrice.toFixed(2)}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Payment Method */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Payment Method</label>
                <select
                  value={saleData.paymentMethod}
                  onChange={(e) => setSaleData(prev => ({ ...prev, paymentMethod: e.target.value }))}
                  className="input-field w-full max-w-xs"
                >
                  <option value="Cash">Cash</option>
                  <option value="Card">Credit/Debit Card</option>
                  <option value="Bank Transfer">Bank Transfer</option>
                  <option value="Cheque">Cheque</option>
                </select>
              </div>

              {/* Notes */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Notes (Optional)</label>
                <textarea
                  value={saleData.notes}
                  onChange={(e) => setSaleData(prev => ({ ...prev, notes: e.target.value }))}
                  className="input-field w-full"
                  rows="3"
                  placeholder="Additional notes about this sale..."
                />
              </div>

              {/* Final Total */}
              <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
                <div className="flex justify-between text-lg font-semibold text-blue-900">
                  <span>Total Amount:</span>
                  <span>${totalAmount.toFixed(2)} NZD</span>
                </div>
                <p className="text-sm text-blue-700 mt-1">Including 15% GST</p>
              </div>
            </div>
          )}

          {/* Navigation Buttons */}
          <div className="flex justify-between pt-6 border-t border-gray-200">
            <div>
              {step > 1 && (
                <button
                  onClick={prevStep}
                  disabled={loading}
                  className="bg-gray-200 hover:bg-gray-300 text-gray-700 px-4 py-2 rounded text-sm font-medium"
                >
                  Previous
                </button>
              )}
            </div>
            
            <div className="flex space-x-3">
              <button
                onClick={handleClose}
                disabled={loading}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-200 hover:bg-gray-300 rounded-md"
              >
                Cancel
              </button>
              
              {step < 3 ? (
                <button
                  onClick={nextStep}
                  className="btn-primary"
                >
                  Next
                </button>
              ) : (
                <button
                  onClick={handleSubmit}
                  disabled={loading}
                  className="btn-primary"
                >
                  {loading ? 'Processing...' : 'Complete Sale'}
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreateSaleModal;