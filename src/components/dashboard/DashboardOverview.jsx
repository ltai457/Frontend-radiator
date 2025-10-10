import React, { useState, useEffect } from 'react';
import { Users, ShoppingCart, Package, PackageX, TrendingUp, DollarSign } from 'lucide-react';
import { PageHeader } from '../common/layout/PageHeader';
import { StatsGrid } from '../common/layout/StatsGrid';
import { LoadingSpinner } from '../common/ui/LoadingSpinner';

import QuickActions from './QuickActions';
import RecentActivity from './RecentActivity';
import salesService from '../../api/salesService';
import customerService from '../../api/customerService';
import radiatorService from '../../api/radiatorService';
import stockService from '../../api/stockService';
import { formatCurrency } from '../../utils/formatters';

const DashboardOverview = ({ onNavigate }) => {
  const [dashboardData, setDashboardData] = useState({
    sales: [],
    customers: [],
    radiators: [],
    stockMovements: [],
    loading: true,
    error: null
  });

  // Fetch all dashboard data
  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const toDate = new Date();
        const fromDate = new Date();
        fromDate.setDate(fromDate.getDate() - 30);

        const [salesResult, customersResult, radiatorsResult, stockMovementsResult] = await Promise.all([
          salesService.getAll(),
          customerService.getAll(),
          radiatorService.getAll(),
          stockService.getStockMovements({
            fromDate,
            toDate,
            limit: 20
          })
        ]);

        setDashboardData({
          sales: salesResult.success ? salesResult.data : [],
          customers: customersResult.success ? customersResult.data : [],
          radiators: radiatorsResult.success ? radiatorsResult.data : [],
          stockMovements: stockMovementsResult.success ? stockMovementsResult.data : [],
          loading: false,
          error: null
        });
      } catch (error) {
        setDashboardData(prev => ({
          ...prev,
          loading: false,
          error: 'Failed to load dashboard data'
        }));
      }
    };

    fetchDashboardData();
  }, []);

  // Calculate metrics using live data
  const calculateStats = () => {
    const { sales, customers, radiators } = dashboardData;

    const normalizeStatus = (status) =>
      (status ? status.toString().trim().toLowerCase() : '');

    const isCountableSale = (sale) => {
      const status =
        normalizeStatus(sale?.status) ||
        normalizeStatus(sale?.saleStatus) ||
        normalizeStatus(sale?.paymentStatus);

      if (!status) return true;

      const excludedStatuses = new Set([
        'cancelled',
        'canceled',
        'refunded',
        'void',
        'failed',
        'draft'
      ]);

      if (excludedStatuses.has(status)) {
        return false;
      }

      const includedStatuses = new Set([
        'completed',
        'complete',
        'paid',
        'success',
        'fulfilled',
        'finalized',
        'processed'
      ]);

      if (includedStatuses.has(status)) {
        return true;
      }

      return true;
    };

    const toLocalDateKey = (date) => {
      if (!date || Number.isNaN(date.getTime())) return null;
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      return `${year}-${month}-${day}`;
    };

    const extractDateKey = (value) => {
      if (!value) return null;

      if (typeof value === 'string') {
        const match = value.match(/\d{4}-\d{2}-\d{2}/);
        if (match) {
          return match[0];
        }
      }

      const parsed = new Date(value);
      return Number.isNaN(parsed.getTime()) ? null : toLocalDateKey(parsed);
    };

    const getSaleDateKey = (sale) => {
      const dateSources = [
        sale?.saleDate,
        sale?.completedAt,
        sale?.processedAt,
        sale?.transactionDate,
        sale?.createdAt,
        sale?.updatedAt
      ];

      for (const source of dateSources) {
        const key = extractDateKey(source);
        if (key) return key;
      }

      return null;
    };

    const getNumericAmount = (amount) => {
      if (amount === null || amount === undefined) return 0;
      const parsed =
        typeof amount === 'string' ? parseFloat(amount) : Number(amount);
      return Number.isFinite(parsed) ? parsed : 0;
    };

    const calculatePercentageChange = (current, previous) => {
      if (!Number.isFinite(current) || !Number.isFinite(previous)) return undefined;
      if (previous <= 0) {
        return current <= 0 ? 0 : 100;
      }
      return Math.round(((current - previous) / previous) * 1000) / 10;
    };

    const today = new Date();
    const todayKey = toLocalDateKey(today);

    const yesterday = new Date(today);
    yesterday.setDate(today.getDate() - 1);
    const yesterdayKey = toLocalDateKey(yesterday);

    const countableSales = sales.filter(isCountableSale);

    const todaysCountableSales = countableSales.filter(
      (sale) => getSaleDateKey(sale) === todayKey
    );

    const yesterdaysCountableSales = countableSales.filter(
      (sale) => getSaleDateKey(sale) === yesterdayKey
    );

    const todaysSalesCount = todaysCountableSales.length;
    const yesterdaysSalesCount = yesterdaysCountableSales.length;

    const todaysRevenue = todaysCountableSales.reduce(
      (sum, sale) => sum + getNumericAmount(sale.totalAmount),
      0
    );
    const yesterdaysRevenue = yesterdaysCountableSales.reduce(
      (sum, sale) => sum + getNumericAmount(sale.totalAmount),
      0
    );

    const monthKey = todayKey ? todayKey.slice(0, 7) : null;
    const monthlyCountableSales = monthKey
      ? countableSales.filter((sale) => {
          const dateKey = getSaleDateKey(sale);
          return dateKey ? dateKey.startsWith(monthKey) : false;
        })
      : countableSales;

    const monthlyRevenue = monthlyCountableSales.reduce(
      (sum, sale) => sum + getNumericAmount(sale.totalAmount),
      0
    );

    const activeCustomers = customers.filter(
      (customer) => customer?.isActive !== false
    ).length;

    const LOW_STOCK_THRESHOLD = 5;

    const extractWarehouseStocks = (radiator) => {
      const candidates = [
        radiator?.stock,
        radiator?.stockLevels,
        radiator?.stockByWarehouse,
        radiator?.warehouseStock,
        radiator?.warehouses,
        radiator?.inventory
      ];

      for (const candidate of candidates) {
        if (!candidate) continue;

        if (Array.isArray(candidate)) {
          const entries = candidate
            .map((item) => {
              if (item == null) return null;
              if (typeof item === 'number') return item;
              if (typeof item === 'string') return Number(item);
              if (typeof item === 'object') {
                const quantity =
                  item.quantity ??
                  item.qty ??
                  item.stock ??
                  item.available ??
                  item.onHand ??
                  item.level;
                if (quantity == null) return null;
                return Number(quantity);
              }
              return null;
            })
            .filter((qty) => qty != null && Number.isFinite(qty));

          if (entries.length) return entries;
        } else if (typeof candidate === 'object') {
          const entries = Object.values(candidate)
            .map((value) => {
              if (value == null) return null;
              if (typeof value === 'number') return value;
              if (typeof value === 'string') return Number(value);
              if (typeof value === 'object') {
                const quantity =
                  value.quantity ??
                  value.qty ??
                  value.stock ??
                  value.available ??
                  value.onHand ??
                  value.level;
                if (quantity == null) return null;
                return Number(quantity);
              }
              return null;
            })
            .filter((qty) => qty != null && Number.isFinite(qty));

          if (entries.length) return entries;
        }
      }

      return [];
    };

    const stockEvaluations = radiators.map((radiator) => {
      const stocks = extractWarehouseStocks(radiator).map((qty) =>
        Number.isFinite(qty) ? qty : 0
      );

      if (!stocks.length) {
        return {
          isOutOfStock: true,
          isLowStock: false
        };
      }

      const totalStock = stocks.reduce((sum, qty) => sum + qty, 0);
      const anyPositive = stocks.some((qty) => qty > 0);
      const anyLowWarehouse = stocks.some(
        (qty) => qty > 0 && qty <= LOW_STOCK_THRESHOLD
      );

      return {
        isOutOfStock: !anyPositive,
        isLowStock:
          anyLowWarehouse ||
          (anyPositive && totalStock > 0 && totalStock <= LOW_STOCK_THRESHOLD)
      };
    });

    const lowStockItems = stockEvaluations.filter(
      (evaluation) => evaluation.isLowStock && !evaluation.isOutOfStock
    ).length;

    const outOfStockItems = stockEvaluations.filter(
      (evaluation) => evaluation.isOutOfStock
    ).length;

    /* const salesChange = calculatePercentageChange(
      todaysSalesCount,
      yesterdaysSalesCount
    );

    const revenueChange = calculatePercentageChange(
      todaysRevenue,
      yesterdaysRevenue
    ); */

    return [
      {
        title: "Today's Sales",
        value: todaysSalesCount.toString(),
        /* change: salesChange, */
        color: 'blue',
        icon: ShoppingCart
      },
      {
        title: "Today's Revenue",
        value: formatCurrency(todaysRevenue),
        /* change: revenueChange, */
        color: 'green',
        icon: TrendingUp
      },
      {
        title: 'This Month\'s Revenue',
        value: formatCurrency(monthlyRevenue),
        color: 'indigo',
        icon: DollarSign
      },
      {
        title: 'Low Stock Radiators',
        value: lowStockItems.toString(),
        color: 'orange',
        icon: Package
      },
      {
        title: 'Out of Stock',
        value: outOfStockItems.toString(),
        color: 'red',
        icon: PackageX
      },
      {
        title: 'Active Customers',
        value: activeCustomers.toString(),
        color: 'purple',
        icon: Users
      }
    ];
  };

  if (dashboardData.loading) {
    return <LoadingSpinner size="lg" text="Loading dashboard..." />;
  }

  if (dashboardData.error) {
    return (
      <div className="space-y-8">
        <PageHeader
          title="Chan Mary 333 "
          subtitle="Your complete radiator inventory and sales management system"
        />
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
          {dashboardData.error}
        </div>
      </div>
    );
  }

  const stats = calculateStats();

  return (
    <div className="space-y-8">
      <PageHeader
        title="Chan Mary 333 "
        /* subtitle="Your complete radiator inventory and sales management system" */
      />

      <StatsGrid stats={stats} columns={4} />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1">
          <QuickActions onNavigate={onNavigate} />
        </div>
        <div className="lg:col-span-2">
          <RecentActivity
            sales={dashboardData.sales}
            stockMovements={dashboardData.stockMovements}
          />
        </div>
      </div>

      
    </div>
  );
};

export default DashboardOverview;
