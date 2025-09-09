import React from "react";
import { Warehouse, MapPin, Package, Clock } from "lucide-react";

export default function WarehouseStats({ stats }) {
  const cards = [
    {
      label: "Total Warehouses",
      value: stats.total,
      Icon: Warehouse,
      color: "bg-blue-100 text-blue-600",
      bgColor: "bg-blue-50",
    },
    {
      label: "Active Locations",
      value: stats.uniqueLocations,
      Icon: MapPin,
      color: "bg-green-100 text-green-600",
      bgColor: "bg-green-50",
    },
    {
      label: "Active Warehouses",
      value: stats.activeWarehouses,
      Icon: Package,
      color: "bg-purple-100 text-purple-600",
      bgColor: "bg-purple-50",
    },
    {
      label: "Last Updated",
      value: stats.lastUpdate ? stats.lastUpdate.toLocaleDateString() : "N/A",
      Icon: Clock,
      color: "bg-yellow-100 text-yellow-600",
      bgColor: "bg-yellow-50",
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {cards.map(({ label, value, Icon, color, bgColor }) => (
        <div key={label} className={`${bgColor} rounded-lg p-6`}>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">{label}</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">{value}</p>
            </div>
            <div className={`p-3 rounded-lg ${color}`}>
              <Icon className="w-6 h-6" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
