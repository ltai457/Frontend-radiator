// src/components/CustomersManager.jsx
import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import customerService from '../api/customerService';

const CustomersManager = () => {
  const { user } = useAuth();
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddCustomer, setShowAddCustomer] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [showCustomerDetails, setShowCustomerDetails] = useState(false);
  const [customerSales, setCustomerSales] = useState([]);

  // Load customers from your backend API
  useEffect(() => {
    const loadCustomers = async () => {
      setLoading(true);
      try {
        const result = await customerService.getAll();
        if (result.success) {
          setCustomers(result.data);
          setError('');
        } else {
          setError(result.error || 'Failed to load customers');
        }
      } catch (err) {
        setError('Failed to load customers');
        console.error('Customers loading error:', err);
      } finally {
        setLoading(false);
      }
    };

    loadCustomers();
  }, []);

  const filteredCustomers = customers.filter(customer => {
    const fullName = `${customer.firstName} ${customer.lastName}`.toLowerCase();
    const searchLower = searchTerm.toLowerCase();
    return (
      fullName.includes(searchLower) ||
      customer.email?.toLowerCase().includes(searchLower) ||
      customer.company?.toLowerCase().includes(searchLower)
    );
  });

  const handleAddCustomer = async (customerData) => {
    try {
      const result = await customerService.create(customerData);
      if (result.success) {
        setCustomers(prev => [result.data, ...prev]);
        setShowAddCustomer(false);
        alert('Customer created successfully!');
      } else {
        alert('Failed to create customer: ' + result.error);
      }
    } catch (err) {
      alert('Failed to create customer');
    }
  };

  const handleViewCustomer = async (customer) => {
    try {
      // Get full customer details
      const customerResult = await customerService.getById(customer.id);
      if (customerResult.success) {
        setSelectedCustomer(customerResult.data);
        
        // Get customer's sales history
        const salesResult = await customerService.getSalesHistory(customer.id);
        if (salesResult.success) {
          setCustomerSales(salesResult.data);
        } else {
          setCustomerSales([]);
        }
        
        setShowCustomerDetails(true);
      } else {
        alert('Failed to load customer details: ' + customerResult.error);
      }
    } catch (err) {
      alert('Failed to load customer details');
    }
  };

  const handleDeleteCustomer = async (customerId) => {
    if (!window.confirm('Are you sure you want to deactivate this customer?')) {
      return;
    }

    try {
      const result = await customerService.delete(customerId);
      if (result.success) {
        // Refresh customers list
        const customersResult = await customerService.getAll();
        if (customersResult.success) {
          setCustomers(customersResult.data);
        }
        alert('Customer deactivated successfully');
      } else {
        alert('Failed to deactivate customer: ' + result.error);
      }
    } catch (err) {
      alert('Failed to deactivate customer');
    }
  };

  // Calculate stats from real customer data
  const totalCustomers = customers.length;
  const activeCustomers = customers.filter(c => c.isActive).length;
  const totalRevenue = customers.reduce((sum, c) => sum + (c.totalSpent || 0), 0);

  if (loading) {
    return (
      <div className="flex justify-center items-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span className="ml-2">Loading customers...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Customer Management</h2>
          <p className="text-sm text-gray-600 mt-1">Manage your customer database and view purchase history</p>
        </div>
        {user?.role === 'Admin' && (
          <button
            onClick={() => setShowAddCustomer(true)}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 mt-4 sm:mt-0"
          >
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Add Customer
          </button>
        )}
      </div>

      {/* Stats Cards - Real Data */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white rounded-lg shadow p-4">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-8 h-8 bg-blue-500 rounded-md flex items-center justify-center">
                <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
                </svg>
              </div>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Total Customers</p>
              <p className="text-lg font-semibold text-gray-900">{totalCustomers}</p>
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
              <p className="text-sm font-medium text-gray-500">Active Customers</p>
              <p className="text-lg font-semibold text-gray-900">{activeCustomers}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-4">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-8 h-8 bg-purple-500 rounded-md flex items-center justify-center">
                <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
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
      </div>

      {/* Search */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <input
              type="text"
              placeholder="Search customers by name, email, or company..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="border border-gray-300 rounded-md px-3 py-2 pl-10 w-full focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded">
          {error}
        </div>
      )}

      {/* Customers Table - Real Data */}
      <div className="bg-white shadow overflow-hidden sm:rounded-md">
        <div className="px-4 py-3 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">
            Customer List ({filteredCustomers.length})
          </h3>
        </div>
        
        {filteredCustomers.length === 0 ? (
          <div className="text-center py-8">
            <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
            </svg>
            <h3 className="mt-2 text-sm font-medium text-gray-900">No customers found</h3>
            <p className="mt-1 text-sm text-gray-500">
              {searchTerm ? 'Try adjusting your search terms.' : 'Get started by adding your first customer.'}
            </p>
            {!searchTerm && user?.role === 'Admin' && (
              <div className="mt-6">
                <button
                  onClick={() => setShowAddCustomer(true)}
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
                >
                  Add Customer
                </button>
              </div>
            )}
          </div>
        ) : (
          <ul className="divide-y divide-gray-200">
            {filteredCustomers.map((customer) => (
              <li key={customer.id}>
                <div className="px-4 py-4 hover:bg-gray-50">
                  <div className="flex items-center justify-between">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between">
                        <div>
                          <p className="text-sm font-medium text-gray-900">
                            {customer.firstName} {customer.lastName}
                          </p>
                          <div className="mt-1 space-y-1">
                            {customer.email && (
                              <p className="text-sm text-gray-500 flex items-center">
                                <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                </svg>
                                {customer.email}
                              </p>
                            )}
                            {customer.phone && (
                              <p className="text-sm text-gray-500 flex items-center">
                                <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                                </svg>
                                {customer.phone}
                              </p>
                            )}
                            {customer.company && (
                              <p className="text-sm text-gray-500 flex items-center">
                                <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                                </svg>
                                {customer.company}
                              </p>
                            )}
                          </div>
                        </div>
                        
                        <div className="ml-4 text-right">
                          <div className="text-sm font-medium text-gray-900">
                            ${(customer.totalSpent || 0).toFixed(2)}
                          </div>
                          <div className="text-xs text-gray-500">
                            {customer.totalPurchases || 0} purchase{(customer.totalPurchases || 0) !== 1 ? 's' : ''}
                          </div>
                          {customer.lastPurchaseDate && (
                            <div className="text-xs text-gray-500 mt-1">
                              Last: {new Date(customer.lastPurchaseDate).toLocaleDateString()}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                    
                    <div className="ml-6 flex items-center space-x-2">
                      <button
                        onClick={() => handleViewCustomer(customer)}
                        className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                      >
                        View
                      </button>
                      {user?.role === 'Admin' && (
                        <>
                          <button 
                            onClick={() => alert(`Edit customer ${customer.firstName} ${customer.lastName} - Coming soon!`)}
                            className="text-yellow-600 hover:text-yellow-800 text-sm font-medium"
                          >
                            Edit
                          </button>
                          <button 
                            onClick={() => handleDeleteCustomer(customer.id)}
                            className="text-red-600 hover:text-red-800 text-sm font-medium"
                          >
                            Deactivate
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Add Customer Modal Placeholder */}
      {showAddCustomer && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-medium text-gray-900">Add New Customer</h3>
                <button
                  onClick={() => setShowAddCustomer(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              <div className="space-y-4">
                <p className="text-sm text-gray-600">
                  Full customer creation form would go here. This would integrate with your customer API endpoints.
                </p>
                <div className="flex justify-end space-x-3">
                  <button
                    onClick={() => setShowAddCustomer(false)}
                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-200 hover:bg-gray-300 rounded-md"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => {
                      // Mock adding a customer - replace with real form data
                      const mockCustomer = {
                        firstName: 'New',
                        lastName: 'Customer',
                        email: 'new@example.com',
                        phone: '+64 21 000 0000',
                        company: 'Test Company'
                      };
                      handleAddCustomer(mockCustomer);
                    }}
                    className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-md"
                  >
                    Add Customer
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Customer Details Modal */}
      {showCustomerDetails && selectedCustomer && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-10 mx-auto p-5 border w-full max-w-4xl shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-medium text-gray-900">
                  {selectedCustomer.firstName} {selectedCustomer.lastName}
                </h3>
                <button
                  onClick={() => setShowCustomerDetails(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Customer Info */}
                <div className="space-y-4">
                  <h4 className="text-md font-medium text-gray-900">Customer Information</h4>
                  <div className="bg-gray-50 rounded-lg p-4 space-y-3">
                    <div>
                      <h5 className="text-sm font-medium text-gray-500">Email</h5>
                      <p className="text-sm text-gray-900">{selectedCustomer.email || 'N/A'}</p>
                    </div>
                    <div>
                      <h5 className="text-sm font-medium text-gray-500">Phone</h5>
                      <p className="text-sm text-gray-900">{selectedCustomer.phone || 'N/A'}</p>
                    </div>
                    <div>
                      <h5 className="text-sm font-medium text-gray-500">Company</h5>
                      <p className="text-sm text-gray-900">{selectedCustomer.company || 'N/A'}</p>
                    </div>
                    <div>
                      <h5 className="text-sm font-medium text-gray-500">Address</h5>
                      <p className="text-sm text-gray-900">{selectedCustomer.address || 'N/A'}</p>
                    </div>
                  </div>
                  
                  <div className="bg-blue-50 rounded-lg p-4">
                    <h5 className="text-sm font-medium text-blue-900">Purchase Summary</h5>
                    <div className="mt-2 grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm text-blue-700">Total Spent</p>
                        <p className="text-lg font-semibold text-blue-900">${(selectedCustomer.totalSpent || 0).toFixed(2)}</p>
                      </div>
                      <div>
                        <p className="text-sm text-blue-700">Total Orders</p>
                        <p className="text-lg font-semibold text-blue-900">{selectedCustomer.totalPurchases || 0}</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Sales History */}
                <div className="space-y-4">
                  <h4 className="text-md font-medium text-gray-900">Recent Purchases</h4>
                  <div className="bg-gray-50 rounded-lg p-4">
                    {customerSales.length === 0 ? (
                      <p className="text-sm text-gray-500">No purchases yet</p>
                    ) : (
                      <div className="space-y-3 max-h-64 overflow-y-auto">
                        {customerSales.map((sale) => (
                          <div key={sale.id} className="bg-white rounded p-3">
                            <div className="flex justify-between items-start">
                              <div>
                                <p className="text-sm font-medium text-gray-900">{sale.saleNumber}</p>
                                <p className="text-xs text-gray-500">
                                  {new Date(sale.saleDate).toLocaleDateString()}
                                </p>
                              </div>
                              <div className="text-right">
                                <p className="text-sm font-medium text-gray-900">${sale.totalAmount.toFixed(2)}</p>
                                <p className="text-xs text-gray-500">{sale.itemCount} items</p>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
              
              <div className="flex justify-end mt-6">
                <button
                  onClick={() => setShowCustomerDetails(false)}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-200 hover:bg-gray-300 rounded-md"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CustomersManager;