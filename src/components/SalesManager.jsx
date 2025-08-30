// src/components/SalesManager.jsx
import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import salesService from '../api/salesService';

const SalesManager = () => {
  const { user } = useAuth();
  const [sales, setSales] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showCreateSale, setShowCreateSale] = useState(false);
  const [selectedSale, setSelectedSale] = useState(null);
  const [showSaleDetails, setShowSaleDetails] = useState(false);

  // Load sales from your backend API
  useEffect(() => {
    const loadSales = async () => {
      setLoading(true);
      try {
        const result = await salesService.getAll();
        if (result.success) {
          setSales(result.data);
          setError('');
        } else {
          setError(result.error || 'Failed to load sales');
        }
      } catch (err) {
        setError('Failed to load sales');
        console.error('Sales loading error:', err);
      } finally {
        setLoading(false);
      }
    };

    loadSales();
  }, []);

  const handleCreateSale = (newSale) => {
    setSales(prev => [newSale, ...prev]);
    setShowCreateSale(false);
  };

  const handleViewSale = async (sale) => {
    try {
      const result = await salesService.getById(sale.id);
      if (result.success) {
        setSelectedSale(result.data);
        setShowSaleDetails(true);
      } else {
        alert('Failed to load sale details: ' + result.error);
      }
    } catch (err) {
      alert('Failed to load sale details');
    }
  };

  const handleRefundSale = async (saleId) => {
    if (!window.confirm('Are you sure you want to refund this sale? This will restore stock levels.')) {
      return;
    }

    try {
      const result = await salesService.refund(saleId);
      if (result.success) {
        // Refresh sales list
        const salesResult = await salesService.getAll();
        if (salesResult.success) {
          setSales(salesResult.data);
        }
        alert('Sale refunded successfully');
      } else {
        alert('Failed to refund sale: ' + result.error);
      }
    } catch (err) {
      alert('Failed to refund sale');
    }
  };

  const handlePrintReceipt = async (saleId) => {
    try {
      const result = await salesService.getReceipt(saleId);
      if (result.success) {
        // TODO: Implement receipt printing
        console.log('Receipt data:', result.data);
        alert('Receipt functionality coming soon!');
      } else {
        alert('Failed to get receipt: ' + result.error);
      }
    } catch (err) {
      alert('Failed to get receipt');
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Completed': return 'bg-green-100 text-green-800';
      case 'Pending': return 'bg-yellow-100 text-yellow-800';
      case 'Cancelled': return 'bg-red-100 text-red-800';
      case 'Refunded': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  // Calculate stats from real sales data
  const todaysSales = sales.filter(s => 
    new Date(s.saleDate).toDateString() === new Date().toDateString()
  );
  const totalRevenue = sales.reduce((sum, s) => sum + s.totalAmount, 0);
  const totalTransactions = sales.length;
  const totalItemsSold = sales.reduce((sum, s) => sum + s.itemCount, 0);

  if (loading) {
    return (
      <div className="flex justify-center items-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span className="ml-2">Loading sales...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Sales Management</h2>
          <p className="text-sm text-gray-600 mt-1">Process new sales and view transaction history</p>
        </div>
        <button
          onClick={() => setShowCreateSale(true)}
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          New Sale
        </button>
      </div>

      {/* Sales Summary Cards - Real Data */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg shadow p-4">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-8 h-8 bg-blue-500 rounded-md flex items-center justify-center">
                <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Today's Sales</p>
              <p className="text-lg font-semibold text-gray-900">
                ${todaysSales.reduce((sum, s) => sum + s.totalAmount, 0).toFixed(2)}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-4">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-8 h-8 bg-green-500 rounded-md flex items-center justify-center">
                <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                </svg>
              </div>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Total Revenue</p>
              <p className="text-lg font-semibold text-gray-900">
                ${totalRevenue.toFixed(2)}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-4">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-8 h-8 bg-purple-500 rounded-md flex items-center justify-center">
                <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v6a2 2 0 002 2h2m0 0h2m-6 2h6a2 2 0 002-2V7a2 2 0 00-2-2H9m8 0V5a2 2 0 00-2-2H9a2 2 0 00-2 2v0" />
                </svg>
              </div>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Transactions</p>
              <p className="text-lg font-semibold text-gray-900">{totalTransactions}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-4">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-8 h-8 bg-orange-500 rounded-md flex items-center justify-center">
                <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                </svg>
              </div>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Items Sold</p>
              <p className="text-lg font-semibold text-gray-900">{totalItemsSold}</p>
            </div>
          </div>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded">
          {error}
        </div>
      )}

      {/* Sales Table - Real Data */}
      <div className="bg-white shadow overflow-hidden sm:rounded-md">
        <div className="px-4 py-3 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">Recent Sales</h3>
        </div>
        
        {sales.length === 0 ? (
          <div className="text-center py-8">
            <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
            <h3 className="mt-2 text-sm font-medium text-gray-900">No sales yet</h3>
            <p className="mt-1 text-sm text-gray-500">Get started by processing your first sale.</p>
            <div className="mt-6">
              <button
                onClick={() => setShowCreateSale(true)}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
              >
                Create New Sale
              </button>
            </div>
          </div>
        ) : (
          <ul className="divide-y divide-gray-200">
            {sales.map((sale) => (
              <li key={sale.id}>
                <div className="px-4 py-4 flex items-center justify-between hover:bg-gray-50">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-900 truncate">
                          {sale.saleNumber}
                        </p>
                        <p className="text-sm text-gray-500">
                          Customer: {sale.customerName} • 
                          Processed by: {sale.processedByName}
                        </p>
                      </div>
                      <div className="ml-2 flex-shrink-0 flex items-center space-x-4">
                        <div className="text-right">
                          <p className="text-sm font-medium text-gray-900">
                            ${sale.totalAmount.toFixed(2)}
                          </p>
                          <p className="text-xs text-gray-500">{sale.paymentMethod}</p>
                        </div>
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(sale.status)}`}>
                          {sale.status}
                        </span>
                        <div className="text-right">
                          <p className="text-xs text-gray-500">
                            {new Date(sale.saleDate).toLocaleDateString()}
                          </p>
                          <p className="text-xs text-gray-500">
                            {sale.itemCount} item{sale.itemCount !== 1 ? 's' : ''}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="ml-6 flex items-center space-x-2">
                    <button
                      onClick={() => handleViewSale(sale)}
                      className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                    >
                      View
                    </button>
                    <button 
                      onClick={() => handlePrintReceipt(sale.id)}
                      className="text-gray-400 hover:text-gray-600 text-sm font-medium"
                    >
                      Receipt
                    </button>
                    {user?.role === 'Admin' && sale.status === 'Completed' && (
                      <button 
                        onClick={() => handleRefundSale(sale.id)}
                        className="text-orange-600 hover:text-orange-800 text-sm font-medium"
                      >
                        Refund
                      </button>
                    )}
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Create Sale Modal Placeholder */}
      {showCreateSale && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Create New Sale</h3>
              <p className="text-sm text-gray-600 mb-4">
                Full sales creation modal would go here. This would integrate with your sales API endpoints.
              </p>
              <div className="flex justify-end space-x-3">
                <button
                  onClick={() => setShowCreateSale(false)}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-200 hover:bg-gray-300 rounded-md"
                >
                  Cancel
                </button>
                <button
                  onClick={() => setShowCreateSale(false)}
                  className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-md"
                >
                  Create Sale
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Sale Details Modal Placeholder */}
      {showSaleDetails && selectedSale && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-full max-w-2xl shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-medium text-gray-900">Sale Details</h3>
                <button
                  onClick={() => setShowSaleDetails(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <h4 className="text-sm font-medium text-gray-500">Sale Number</h4>
                    <p className="mt-1 text-sm text-gray-900">{selectedSale.saleNumber}</p>
                  </div>
                  <div>
                    <h4 className="text-sm font-medium text-gray-500">Customer</h4>
                    <p className="mt-1 text-sm text-gray-900">{selectedSale.customerName}</p>
                  </div>
                  <div>
                    <h4 className="text-sm font-medium text-gray-500">Total Amount</h4>
                    <p className="mt-1 text-lg font-semibold text-gray-900">${selectedSale.totalAmount.toFixed(2)}</p>
                  </div>
                  <div>
                    <h4 className="text-sm font-medium text-gray-500">Status</h4>
                    <span className={`mt-1 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(selectedSale.status)}`}>
                      {selectedSale.status}
                    </span>
                  </div>
                </div>
                
                <div className="flex justify-end">
                  <button
                    onClick={() => setShowSaleDetails(false)}
                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-200 hover:bg-gray-300 rounded-md"
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SalesManager;