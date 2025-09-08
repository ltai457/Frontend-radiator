// src/components/inventory/StockStats.jsx
import React from "react";
import { Package, AlertTriangle, CheckCircle } from "lucide-react";
import { Card, CardContent } from "../common/ui/Card";

const StockStats = ({ items = [], warehouse, className = "" }) => {
  if (!items.length) return null;

  const totalItems = items.length;
  const totalQty = items.reduce((sum, r) => sum + (r.qty || 0), 0);
  const outOfStock = items.filter((r) => r.qty === 0).length;
  const lowStock = items.filter((r) => r.qty > 0 && r.qty <= 5).length;
  const goodStock = totalItems - outOfStock - lowStock;

  const stats = [
    {
      label: "Total Items",
      value: totalItems,
      icon: Package,
      color: "text-blue-600",
      bg: "bg-blue-50",
    },
    {
      label: "Total Quantity",
      value: totalQty,
      icon: CheckCircle,
      color: "text-green-600",
      bg: "bg-green-50",
    },
    {
      label: "Low Stock",
      value: lowStock,
      icon: AlertTriangle,
      color: "text-yellow-600",
      bg: "bg-yellow-50",
    },
    {
      label: "Out of Stock",
      value: outOfStock,
      icon: Package,
      color: "text-red-600",
      bg: "bg-red-50",
    },
  ];

  return (
    <div className={`grid grid-cols-2 gap-3 ${className}`}>
      {stats.map((s) => (
        <Card key={s.label} className="p-3">
          <CardContent className="flex items-center gap-3">
            <div
              className={`flex items-center justify-center w-10 h-10 rounded-full ${s.bg}`}
            >
              <s.icon className={`w-5 h-5 ${s.color}`} />
            </div>
            <div>
              <p className="text-xs text-gray-500">{s.label}</p>
              <p className="text-lg font-semibold text-gray-900">{s.value}</p>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default StockStats;
