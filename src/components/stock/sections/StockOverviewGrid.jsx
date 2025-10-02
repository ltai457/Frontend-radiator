import React from "react";
import { Package, Warehouse } from "lucide-react";

export default function StockOverviewGrid({
  warehouses,
  radiators,
  selectedWarehouse,
  setSelectedWarehouse,
  getTotalStock,
}) {
  // Always calculate total across ALL warehouses (fixed number)
  const totalAcrossAll = (radiators || []).reduce((t, r) => {
    if (!r.stock) return t;
    return t + Object.values(r.stock).reduce((sum, qty) => sum + (qty || 0), 0);
  }, 0);

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
      <OverviewCard
        active={selectedWarehouse === "all"}
        onClick={() => setSelectedWarehouse("all")}
        icon={<Package className="w-6 h-6 text-purple-600" />}
        badgeBg="bg-purple-100"
        title="All Warehouses"
        subtitle="Combined View"
        stats={[{ label: "Total Stock", value: totalAcrossAll }]}
      />

      {(warehouses || []).map((w) => {
        const warehouseStock = (radiators || []).reduce(
          (t, r) => t + (r.stock?.[w.code] || 0),
          0
        );
        const lowStockItems = (radiators || []).filter((r) => {
          const s = r.stock?.[w.code] || 0;
          return s > 0 && s <= 5;
        }).length;
        const outOfStockItems = (radiators || []).filter(
          (r) => (r.stock?.[w.code] || 0) === 0
        ).length;

        return (
          <OverviewCard
            key={w.id}
            active={selectedWarehouse === w.code}
            onClick={() => setSelectedWarehouse(w.code)}
            icon={<Warehouse className="w-6 h-6 text-blue-600" />}
            badgeBg="bg-blue-100"
            title={w.name}
            subtitle={w.code}
            location={w.location}
            stats={[
              { label: "Total Stock", value: warehouseStock },
              {
                label: "Low Stock",
                value: lowStockItems,
                emphasize: lowStockItems > 0,
                emphasizeClass: "text-yellow-600",
              },
              {
                label: "Out of Stock",
                value: outOfStockItems,
                emphasize: outOfStockItems > 0,
                emphasizeClass: "text-red-600",
              },
            ]}
          />
        );
      })}
    </div>
  );
}

function OverviewCard({
  active,
  onClick,
  icon,
  badgeBg,
  title,
  subtitle,
  location,
  stats,
}) {
  return (
    <div
      onClick={onClick}
      className={`bg-white rounded-lg shadow p-5 hover:shadow-lg transition-shadow cursor-pointer border-2 ${
        active ? "border-blue-500 bg-blue-50" : "border-transparent"
      }`}
    >
      <div className="flex items-center gap-3 mb-3">
        <div
          className={`w-12 h-12 ${badgeBg} rounded-lg flex items-center justify-center`}
        >
          {icon}
        </div>
        <div>
          <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
          {subtitle && <p className="text-sm text-gray-500">{subtitle}</p>}
        </div>
      </div>

      <div className="space-y-2">
        {stats.map(({ label, value, emphasize, emphasizeClass }) => (
          <div key={label} className="flex justify-between items-center">
            <span className="text-sm text-gray-600">{label}</span>
            <span
              className={`text-sm font-medium ${
                emphasize ? emphasizeClass : "text-gray-900"
              }`}
            >
              {value}
            </span>
          </div>
        ))}
      </div>

      {location && (
        <div className="mt-3 pt-3 border-t border-gray-200">
          <p className="text-xs text-gray-500">{location}</p>
        </div>
      )}
    </div>
  );
}