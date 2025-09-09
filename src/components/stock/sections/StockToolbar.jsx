import React from "react";
import { Search, Filter, Edit3, Save, X } from "lucide-react";

export default function StockToolbar({
  searchTerm,
  setSearchTerm,
  filterLowStock,
  setFilterLowStock,
  editMode,
  updating,
  editingCount = 0,
  onEdit,
  onCancel,
  onSave,
  selectedWarehouse, // controls visibility of Edit Stock
}) {
  return (
    <div className="bg-white rounded-lg shadow p-4 mb-6">
      <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between">
        {/* Search + Filter */}
        <div className="flex flex-col sm:flex-row gap-4 flex-1">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search radiators by name, code, or brand..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          <button
            onClick={() => setFilterLowStock(!filterLowStock)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg border transition-colors ${
              filterLowStock
                ? "bg-yellow-100 border-yellow-300 text-yellow-700"
                : "bg-white border-gray-300 text-gray-600 hover:bg-gray-50"
            }`}
          >
            <Filter className="w-4 h-4" />
            <span>Low Stock Only</span>
          </button>
        </div>

        {/* Edit / Save Controls */}
        <div className="flex items-center gap-3">
          {editMode ? (
            <>
              <button
                onClick={onCancel}
                disabled={updating}
                className="px-4 py-2 border border-gray-300 rounded-lg text-gray-600 hover:bg-gray-50 disabled:opacity-50"
              >
                <span className="inline-flex items-center gap-2">
                  <X className="w-4 h-4" /> Cancel
                </span>
              </button>
              <button
                onClick={onSave}
                disabled={updating || editingCount === 0}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50"
              >
                <span className="inline-flex items-center gap-2">
                  {updating ? (
                    <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <Save className="w-4 h-4" />
                  )}
                  Save Changes{editingCount ? ` (${editingCount})` : ""}
                </span>
              </button>
            </>
          ) : (
            // Hide the "Edit Stock" button when on "all"
            selectedWarehouse !== "all" && (
              <button
                onClick={onEdit}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                <span className="inline-flex items-center gap-2">
                  <Edit3 className="w-4 h-4" /> Edit Stock
                </span>
              </button>
            )
          )}
        </div>
      </div>
    </div>
  );
}
