import React from "react";
import { Plus, BarChart3 } from "lucide-react";
import { Button } from "../../common/ui/Button";

export default function WarehouseHeader({ isAdmin, onCreate, onExport }) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">
          Warehouse Management
        </h1>
        <p className="text-sm text-gray-600 mt-1">
          Manage your warehouse locations and distribution centers
        </p>
      </div>
      <div className="flex items-center gap-3">
        <Button
          onClick={onExport}
          variant="outline"
          size="sm"
          className="flex items-center gap-2"
        >
          <BarChart3 className="w-4 h-4" />
          Export
        </Button>
        {isAdmin && (
          <Button onClick={onCreate} className="flex items-center gap-2">
            <Plus className="w-4 h-4" />
            Add Warehouse
          </Button>
        )}
      </div>
    </div>
  );
}
