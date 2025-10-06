import React, { useState } from "react";
import { Package, TrendingDown } from "lucide-react";
import { useStockManagement } from "../../hooks/useStockManagement";
import StockHeader from "./sections/StockHeader";
import StockToolbar from "./sections/StockToolbar";
import StockOverviewGrid from "./sections/StockOverviewGrid";
import StockTable from "./views/StockTable";
import StockMovementsTab from "./sections/StockMovementsTab";
import warehouseService from "../../api/warehouseService";
import radiatorService from "../../api/radiatorService";

export default function StockManagement() {
  const sm = useStockManagement();
  const [activeTab, setActiveTab] = useState("inventory"); // "inventory" or "movements"

  if (sm.loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Package className="w-12 h-12 text-blue-500 animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Loading stock data...</p>
        </div>
      </div>
    );
  }

  if (sm.error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
          {sm.error}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6 bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto space-y-6">
        <StockHeader />

        {/* Tab Navigation */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-1 flex gap-1">
          <button
            onClick={() => setActiveTab("inventory")}
            className={`flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-md font-medium transition-colors ${
              activeTab === "inventory"
                ? "bg-blue-600 text-white"
                : "text-gray-600 hover:bg-gray-50"
            }`}
          >
            <Package className="w-4 h-4" />
            Current Inventory
          </button>
          <button
            onClick={() => setActiveTab("movements")}
            className={`flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-md font-medium transition-colors ${
              activeTab === "movements"
                ? "bg-blue-600 text-white"
                : "text-gray-600 hover:bg-gray-50"
            }`}
          >
            <TrendingDown className="w-4 h-4" />
            Stock Movements
          </button>
        </div>

        {/* Tab Content */}
        {activeTab === "inventory" ? (
          <>
            <StockOverviewGrid
              warehouses={sm.warehouses}
              radiators={sm.radiators}
              selectedWarehouse={sm.selectedWarehouse}
              setSelectedWarehouse={sm.setSelectedWarehouse}
              getTotalStock={sm.getTotalStock}
            />

            <StockToolbar
              searchTerm={sm.searchTerm}
              setSearchTerm={sm.setSearchTerm}
              filterLowStock={sm.filterLowStock}
              setFilterLowStock={sm.setFilterLowStock}
              editMode={sm.editMode}
              updating={sm.updating}
              editingCount={Object.keys(sm.editingStocks || {}).length}
              onEdit={sm.handleEditMode}
              onCancel={sm.handleCancelEdit}
              onSave={sm.handleSaveChanges}
              selectedWarehouse={sm.selectedWarehouse}
            />

            <div className="mb-1">
              <p className="text-sm text-gray-600">
                {sm.selectedWarehouse === "all"
                  ? "Viewing stock across all warehouses"
                  : `Viewing stock for ${
                      sm.warehouses.find((w) => w.code === sm.selectedWarehouse)?.name ||
                      sm.selectedWarehouse
                    }`}
                {sm.editMode && sm.selectedWarehouse !== "all" && (
                  <span className="ml-2 text-blue-600 font-medium">• Edit Mode Active</span>
                )}
              </p>
            </div>

            <StockTable
              warehouses={sm.warehouses}
              items={sm.filteredRadiators}
              selectedWarehouse={sm.selectedWarehouse}
              editMode={sm.editMode}
              getTotalStock={sm.getTotalStock}
              getStockStatus={sm.getStockStatus}
              getDisplayStock={sm.getDisplayStock}
              onChangeStock={sm.handleStockChange}
            />
          </>
        ) : (
          <StockMovementsTab />
        )}
      </div>
    </div>
  );
}