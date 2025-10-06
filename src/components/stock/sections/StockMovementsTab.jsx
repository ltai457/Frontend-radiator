// src/components/stock/sections/StockMovementsTab.jsx
import React, { useState, useEffect } from 'react';
import { Package, Calendar, MapPin, TrendingDown, TrendingUp, AlertCircle, ArrowUp, ArrowDown } from 'lucide-react';
import { LoadingSpinner } from '../../common/ui/LoadingSpinner';
import stockService from '../../../api/stockService';

const StockMovementsTab = () => {
  const [movements, setMovements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dateRange, setDateRange] = useState('30');
  const [warehouseFilter, setWarehouseFilter] = useState('all');
  const [productFilter, setProductFilter] = useState('');
  const [movementTypeFilter, setMovementTypeFilter] = useState('all');

  useEffect(() => {
    loadMovements();
  }, [dateRange, warehouseFilter, movementTypeFilter]);

  const loadMovements = async () => {
    setLoading(true);
    try {
      const toDate = new Date();
      const fromDate = new Date();
      fromDate.setDate(fromDate.getDate() - parseInt(dateRange));

      const params = {
        fromDate,
        toDate,
        limit: 500
      };

      if (warehouseFilter !== 'all') {
        params.warehouseCode = warehouseFilter;
      }

      if (movementTypeFilter !== 'all') {
        params.movementType = movementTypeFilter;
      }

      const result = await stockService.getStockMovements(params);
      
      if (result.success) {
        setMovements(result.data || []);
      } else {
        console.error('Failed to load movements:', result.error);
        setMovements([]);
      }
    } catch (error) {
      console.error('Error loading movements:', error);
      setMovements([]);
    } finally {
      setLoading(false);
    }
  };

  // Get unique warehouses for filter
  const uniqueWarehouses = [...new Set(movements.map(m => m.warehouseCode))].filter(Boolean);

  // Filter movements
  const filteredMovements = movements.filter(movement => {
    const matchesProduct = !productFilter || 
      movement.productName.toLowerCase().includes(productFilter.toLowerCase()) ||
      movement.productCode.toLowerCase().includes(productFilter.toLowerCase());
    
    return matchesProduct;
  });

  // Calculate statistics
  const incomingCount = filteredMovements.filter(m => m.movementType === 'INCOMING').length;
  const outgoingCount = filteredMovements.filter(m => m.movementType === 'OUTGOING').length;
  const incomingQty = filteredMovements.filter(m => m.movementType === 'INCOMING').reduce((sum, m) => sum + m.quantity, 0);
  const outgoingQty = filteredMovements.filter(m => m.movementType === 'OUTGOING').reduce((sum, m) => sum + m.quantity, 0);

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
            Track all incoming and outgoing stock changes
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

          {/* Movement Type Filter */}
          <select
            value={movementTypeFilter}
            onChange={(e) => setMovementTypeFilter(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="all">All Types</option>
            <option value="INCOMING">Incoming Only</option>
            <option value="OUTGOING">Outgoing Only</option>
          </select>

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
              Stock movements are tracked when you create sales or edit stock levels.
            </p>
          </div>
        </div>
      )}

      {/* Summary Cards */}
      {movements.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
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
                <ArrowUp className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Incoming</p>
                <p className="text-xl font-bold text-gray-900">{incomingQty} units</p>
                <p className="text-xs text-gray-500">{incomingCount} movements</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-4 border border-gray-200">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
                <ArrowDown className="w-5 h-5 text-red-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Outgoing</p>
                <p className="text-xl font-bold text-gray-900">{outgoingQty} units</p>
                <p className="text-xs text-gray-500">{outgoingCount} movements</p>
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
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date & Time</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Product</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Warehouse</th>
                  <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">Type</th>
                  <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">Quantity</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Change Type</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Reference</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredMovements.length === 0 ? (
                  <tr>
                    <td colSpan="7" className="px-6 py-12 text-center text-gray-500">
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
                          <div className="font-medium text-gray-900">{movement.productName}</div>
                          <div className="text-sm text-gray-500">{movement.brand} - {movement.productCode}</div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <MapPin className="w-4 h-4 text-blue-500" />
                          <div>
                            <div className="font-medium text-gray-900">{movement.warehouseName}</div>
                            <div className="text-xs text-gray-500">{movement.warehouseCode}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-center">
                        {movement.movementType === 'INCOMING' ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                            <ArrowUp className="w-3 h-3" />
                            Incoming
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                            <ArrowDown className="w-3 h-3" />
                            Outgoing
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-center">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          movement.movementType === 'INCOMING' 
                            ? 'bg-green-50 text-green-700' 
                            : 'bg-red-50 text-red-700'
                        }`}>
                          {movement.movementType === 'INCOMING' ? '+' : '-'}{movement.quantity}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-900">{movement.changeType}</div>
                      </td>
                      <td className="px-6 py-4">
                        {movement.saleNumber ? (
                          <div>
                            <div className="text-sm font-mono text-gray-900">#{movement.saleNumber}</div>
                            <div className="text-xs text-gray-500">{movement.customerName}</div>
                          </div>
                        ) : (
                          <span className="text-sm text-gray-500">Manual Edit</span>
                        )}
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
              const csv = [
                ['Date', 'Product', 'Code', 'Warehouse', 'Type', 'Quantity', 'Change Type', 'Reference'],
                ...filteredMovements.map(m => [
                  formatDate(m.date),
                  m.productName,
                  m.productCode,
                  m.warehouseName,
                  m.movementType,
                  m.movementType === 'INCOMING' ? `+${m.quantity}` : `-${m.quantity}`,
                  m.changeType,
                  m.saleNumber ? `#${m.saleNumber} - ${m.customerName}` : 'Manual Edit'
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