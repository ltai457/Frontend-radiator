// ============================================
// FILE: src/components/stock/sections/StockMovementsTab.jsx
// Simplified - tracks ALL sales automatically, no status needed
// ============================================

import React, { useState, useEffect } from 'react';
import { Package, Calendar, MapPin, TrendingDown, AlertCircle } from 'lucide-react';
import { LoadingSpinner } from '../../common/ui/LoadingSpinner';
import salesService from '../../../api/salesService';
import warehouseService from '../../../api/warehouseService';
import radiatorService from '../../../api/radiatorService';
import { formatCurrency } from '../../../utils/formatters';

const StockMovementsTab = () => {
  const [movements, setMovements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dateRange, setDateRange] = useState('30');
  const [warehouseFilter, setWarehouseFilter] = useState('all');
  const [productFilter, setProductFilter] = useState('');
  const [warehouses, setWarehouses] = useState([]);
  const [radiators, setRadiators] = useState([]);

  useEffect(() => {
    loadReferenceData();
  }, []);

  useEffect(() => {
    if (warehouses.length > 0 && radiators.length > 0) {
      loadMovements();
    }
  }, [dateRange, warehouses, radiators]);

  // Load warehouses and radiators for reference
  const loadReferenceData = async () => {
    try {
      const [warehousesResult, radiatorsResult] = await Promise.all([
        warehouseService.getAll(),
        radiatorService.getAll()
      ]);

      if (warehousesResult.success) {
        setWarehouses(warehousesResult.data);
      }
      if (radiatorsResult.success) {
        setRadiators(radiatorsResult.data);
      }
    } catch (error) {
      console.error('Error loading reference data:', error);
    }
  };

  const loadMovements = async () => {
    setLoading(true);
    try {
      const toDate = new Date();
      const fromDate = new Date();
      fromDate.setDate(fromDate.getDate() - parseInt(dateRange));

      // Get list of sales first
      let result = await salesService.getByDateRange(fromDate, toDate);
      
      if (!result.success || !result.data || result.data.length === 0) {
        console.log('⚠️ Date range query failed or empty, trying getAll...');
        result = await salesService.getAll();
      }
      
      console.log('📦 Sales list received:', result.data?.length, 'sales');
      
      if (result.success && result.data.length > 0) {
        // Fetch full details for each sale to get items
        console.log('🔄 Fetching full details for each sale...');
        const salesWithDetails = await Promise.all(
          result.data.map(async (sale) => {
            try {
              const detailResult = await salesService.getById(sale.id);
              if (detailResult.success) {
                return detailResult.data;
              }
            } catch (error) {
              console.error('Failed to fetch sale details:', sale.id, error);
            }
            return null;
          })
        );

        // Filter out failed fetches
        const validSales = salesWithDetails.filter(sale => sale !== null);
        console.log('📦 Full sales data loaded:', validSales.length);
        
        // Extract all items from ALL sales (ignore status completely)
        const allMovements = [];
        validSales.forEach(sale => {
          const itemCount = sale.items?.length || 0;
          console.log('Processing sale:', sale.saleNumber, 'Items:', itemCount);
          
          if (!sale.items || sale.items.length === 0) {
            console.warn('⚠️ Sale has no items:', sale.saleNumber);
            return;
          }
          
          sale.items.forEach(item => {
            console.log('Raw item data:', item);

            allMovements.push({
              id: `${sale.id}-${item.id || Math.random()}`,
              date: sale.saleDate,
              saleNumber: sale.saleNumber,
              // Use nested objects directly - they're already populated!
              productName: item.radiator?.name || 'Unknown Product',
              productCode: item.radiator?.code || 'N/A',
              brand: item.radiator?.brand || 'N/A',
              quantity: item.quantity,
              warehouseCode: item.warehouse?.code || 'Unknown',
              warehouseName: item.warehouse?.name || 'Unknown',
              customerName: sale.customerName || `${sale.customer?.firstName || ''} ${sale.customer?.lastName || ''}`.trim() || 'Walk-in',
              unitPrice: item.unitPrice,
              totalPrice: item.totalPrice || (item.quantity * item.unitPrice)
            });
          });
        });

        console.log('✅ Total movements found:', allMovements.length);

        // Sort by date (newest first)
        allMovements.sort((a, b) => new Date(b.date) - new Date(a.date));
        setMovements(allMovements);
      } else {
        console.warn('❌ No sales data available');
        setMovements([]);
      }
    } catch (error) {
      console.error('Error loading movements:', error);
    } finally {
      setLoading(false);
    }
  };

  // Get unique warehouses for filter
  const uniqueWarehouses = [...new Set(movements.map(m => m.warehouseCode))].filter(Boolean);

  // Filter movements
  const filteredMovements = movements.filter(movement => {
    const matchesWarehouse = warehouseFilter === 'all' || movement.warehouseCode === warehouseFilter;
    const matchesProduct = !productFilter || 
      movement.productName.toLowerCase().includes(productFilter.toLowerCase()) ||
      movement.productCode.toLowerCase().includes(productFilter.toLowerCase());
    
    return matchesWarehouse && matchesProduct;
  });

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  if (loading) {
    return <LoadingSpinner size="lg" text="Loading stock movements..." />;
  }

  return (
    <div className="space-y-6">
      {/* Header with Filters */}
      <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
        <div>
          <h2 className="text-xl font-bold text-gray-900">Stock Movements</h2>
          <p className="text-sm text-gray-600 mt-1">
            Automatic log of products sold from each warehouse
          </p>
        </div>

        <div className="flex flex-wrap gap-3">
          {/* Product Search */}
          <input
            type="text"
            placeholder="Search product..."
            value={productFilter}
            onChange={(e) => setProductFilter(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />

          {/* Warehouse Filter */}
          <select
            value={warehouseFilter}
            onChange={(e) => setWarehouseFilter(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="all">All Warehouses</option>
            {uniqueWarehouses.map(code => (
              <option key={code} value={code}>{code}</option>
            ))}
          </select>

          {/* Date Range */}
          <select
            value={dateRange}
            onChange={(e) => setDateRange(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="7">Last 7 days</option>
            <option value="30">Last 30 days</option>
            <option value="90">Last 90 days</option>
            <option value="180">Last 6 months</option>
          </select>
        </div>
      </div>

      {/* Info Banner if no movements */}
      {movements.length === 0 && !loading && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-blue-600 mt-0.5" />
          <div>
            <p className="font-medium text-blue-900">No stock movements yet</p>
            <p className="text-sm text-blue-700 mt-1">
              Stock movements are tracked automatically when you create a sale. 
              Create your first sale to see movements here!
            </p>
          </div>
        </div>
      )}

      {/* Summary Cards */}
      {movements.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white rounded-lg shadow p-4 border border-gray-200">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <TrendingDown className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Total Movements</p>
                <p className="text-xl font-bold text-gray-900">{filteredMovements.length}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-4 border border-gray-200">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                <Package className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Units Sold</p>
                <p className="text-xl font-bold text-gray-900">
                  {filteredMovements.reduce((sum, m) => sum + m.quantity, 0)}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-4 border border-gray-200">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                <MapPin className="w-5 h-5 text-purple-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Warehouses</p>
                <p className="text-xl font-bold text-gray-900">{uniqueWarehouses.length}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Movements Table */}
      {movements.length > 0 && (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Date & Time
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Product
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Warehouse
                  </th>
                  <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">
                    Quantity
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Customer
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Sale #
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredMovements.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="px-6 py-12 text-center text-gray-500">
                      No stock movements found for selected filters
                    </td>
                  </tr>
                ) : (
                  filteredMovements.map(movement => (
                    <tr key={movement.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-2 text-sm text-gray-900">
                          <Calendar className="w-4 h-4 text-gray-400" />
                          {formatDate(movement.date)}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div>
                          <div className="font-medium text-gray-900">
                            {movement.productName}
                          </div>
                          <div className="text-sm text-gray-500">
                            {movement.brand} - {movement.productCode}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <MapPin className="w-4 h-4 text-blue-500" />
                          <div>
                            <div className="font-medium text-gray-900">
                              {movement.warehouseName}
                            </div>
                            <div className="text-xs text-gray-500">
                              {movement.warehouseCode}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                          -{movement.quantity}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-900">
                          {movement.customerName || 'N/A'}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm font-mono text-gray-900">
                          #{movement.saleNumber}
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Export Button */}
      {filteredMovements.length > 0 && (
        <div className="flex justify-end">
          <button
            onClick={() => {
              // Create CSV export
              const csv = [
                ['Date', 'Product', 'Code', 'Warehouse', 'Quantity', 'Customer', 'Sale #'],
                ...filteredMovements.map(m => [
                  formatDate(m.date),
                  m.productName,
                  m.productCode,
                  m.warehouseName,
                  m.quantity,
                  m.customerName,
                  m.saleNumber
                ])
              ].map(row => row.join(',')).join('\n');

              const blob = new Blob([csv], { type: 'text/csv' });
              const url = window.URL.createObjectURL(blob);
              const a = document.createElement('a');
              a.href = url;
              a.download = `stock-movements-${new Date().toISOString().split('T')[0]}.csv`;
              a.click();
            }}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Export to CSV
          </button>
        </div>
      )}
    </div>
  );
};

export default StockMovementsTab;