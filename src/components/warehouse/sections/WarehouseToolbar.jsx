import React from "react";
import { Search } from "lucide-react";

export default function WarehouseToolbar({
  searchTerm,
  onSearch,
  viewMode,
  onViewChange,
  resultCount,
}) {
  return (
    <div className="bg-white rounded-lg shadow p-4">
      <div className="flex flex-col lg:flex-row gap-4 items-center justify-between">
        <div className="relative flex-1 max-w-md w-full">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            placeholder="Search warehouses by name, code, location..."
            value={searchTerm}
            onChange={(e) => onSearch(e.target.value)}
            className="w-full pl-10 pr-10 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
          {searchTerm && (
            <button
              onClick={() => onSearch("")}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              ×
            </button>
          )}
        </div>

        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-600">View:</span>
          <div className="flex bg-gray-100 rounded-lg p-1">
            <button
              onClick={() => onViewChange("table")}
              className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
                viewMode === "table"
                  ? "bg-white text-blue-600 shadow-sm"
                  : "text-gray-600 hover:text-gray-900"
              }`}
            >
              Table
            </button>
            <button
              onClick={() => onViewChange("cards")}
              className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
                viewMode === "cards"
                  ? "bg-white text-blue-600 shadow-sm"
                  : "text-gray-600 hover:text-gray-900"
              }`}
            >
              Cards
            </button>
          </div>
        </div>
      </div>

      {typeof resultCount === "number" && (
        <div className="mt-3 text-sm text-gray-600">
          Found {resultCount} result{resultCount !== 1 ? "s" : ""}
        </div>
      )}
    </div>
  );
}
