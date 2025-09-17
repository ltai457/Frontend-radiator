// src/components/warehouse/WarehouseManagement.jsx
import React, { useMemo, useState } from "react";
import { AlertCircle, Warehouse as WarehouseIcon } from "lucide-react";
import { useAuth } from "../../contexts/AuthContext";
import { useWarehouses } from "../../hooks/useWarehouses";
import { useModal } from "../../hooks/useModal";
import { LoadingSpinner } from "../common/ui/LoadingSpinner";
import { EmptyState } from "../common/layout/EmptyState";

import WarehouseHeader from "./sections/WarehouseHeader";
import WarehouseStats from "./sections/WarehouseStats";
import WarehouseToolbar from "./sections/WarehouseToolbar";
import WarehouseTable from "./views/WarehouseTable";
import WarehouseCards from "./views/WarehouseCards";

import CreateWarehouseModal from "./modals/CreateWarehouseModal";
import EditWarehouseModal from "./modals/EditWarehouseModal";
import ConfirmDeleteModal from "../common/modals/ConfirmDeleteModal";

const WarehouseManagement = () => {
  const { user } = useAuth();
  const {
    warehouses,
    loading,
    error,
    createWarehouse,
    updateWarehouse,
    deleteWarehouse,
    refetch,
  } = useWarehouses();

  // ---- UI state (no helper hook needed)
  const [searchTerm, setSearchTerm] = useState("");
  const [viewMode, setViewMode] = useState("table"); // 'table' | 'cards'
  const [sortBy, setSortBy] = useState("name");      // 'name' | 'code' | 'location' | 'updatedAt'
  const [sortOrder, setSortOrder] = useState("asc"); // 'asc' | 'desc'
  const [actionLoading, setActionLoading] = useState(false);

  const createModal = useModal();
  const editModal = useModal();
  const deleteModal = useModal();
  const viewModal = useModal();

  // ✅ FIXED: Use the same comprehensive admin role check as RadiatorList.jsx
  const isAdmin =
    user?.role === 1 ||
    user?.role === '1' ||
    user?.role === 'Admin' ||
    user?.role === 'admin' ||
    (Array.isArray(user?.role) && user.role.map(String).some(r => r.toLowerCase() === 'admin' || r === '1'));

  // 🔍 DEBUG: Add logging to help diagnose role issues
  console.log('=== WAREHOUSE MANAGEMENT DEBUG ===');
  console.log('User object:', user);
  console.log('User role:', user?.role);
  console.log('Role type:', typeof user?.role);
  console.log('isAdmin result:', isAdmin);
  console.log('================================');

  // ---- defensive base list
  const list = Array.isArray(warehouses) ? warehouses : [];

  // ---- derived: processed list
  const processedWarehouses = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();

    let filtered = term
      ? list.filter((w) =>
          [w?.name, w?.code, w?.location, w?.address, w?.phone, w?.email]
            .filter(Boolean)
            .some((v) => String(v).toLowerCase().includes(term))
        )
      : list;

    const sorted = [...filtered].sort((a, b) => {
      let aVal = a?.[sortBy];
      let bVal = b?.[sortBy];

      if (sortBy === "updatedAt") {
        aVal = a?.updatedAt || a?.createdAt;
        bVal = b?.updatedAt || b?.createdAt;
      }

      if (!aVal && !bVal) return 0;
      if (!aVal) return sortOrder === "asc" ? 1 : -1;
      if (!bVal) return sortOrder === "asc" ? -1 : 1;

      if (sortBy === "updatedAt") {
        aVal = new Date(aVal).getTime();
        bVal = new Date(bVal).getTime();
      } else {
        if (typeof aVal === "string") aVal = aVal.toLowerCase();
        if (typeof bVal === "string") bVal = bVal.toLowerCase();
      }

      if (aVal < bVal) return sortOrder === "asc" ? -1 : 1;
      if (aVal > bVal) return sortOrder === "asc" ? 1 : -1;
      return 0;
    });

    return sorted;
  }, [list, searchTerm, sortBy, sortOrder]);

  // ---- computed values for components
  const items = processedWarehouses;
  const stats = useMemo(() => {
    return {
      total: list.length,
      active: list.filter(w => w?.status !== 'inactive').length, 
      locations: new Set(list.map(w => w?.location).filter(Boolean)).size,
    };
  }, [list]);

  // ---- handlers
  const handleSort = (column) => {
    if (sortBy === column) {
      setSortOrder(prev => prev === "asc" ? "desc" : "asc");
    } else {
      setSortBy(column);
      setSortOrder("asc");
    }
  };

  const handleExport = () => {
    // TODO: Implement export functionality
    console.log("Export warehouses:", items);
    alert("Export functionality not yet implemented");
  };

  const handleCreateWarehouse = async (warehouseData) => {
    try {
      setActionLoading(true);
      const result = await createWarehouse(warehouseData);
      if (result?.success) {
        createModal.closeModal();
        await refetch();
        return true;
      }
      throw new Error(result?.error || "Failed to create warehouse");
    } catch (e) {
      console.error("Create warehouse failed:", e);
      alert(`Failed to create warehouse: ${e.message}`);
      throw e;
    } finally {
      setActionLoading(false);
    }
  };

  const handleUpdateWarehouse = async (warehouseData) => {
    try {
      setActionLoading(true);
      const payload = {
        name: warehouseData.name?.trim(),
        code: warehouseData.code?.trim(),
        location: warehouseData.location?.trim() || null,
        address: warehouseData.address?.trim() || null,
        phone: warehouseData.phone?.trim() || null,
        email: warehouseData.email?.trim() || null,
      };
      
      const id = editModal?.data?.id;
      const result = await updateWarehouse(id, payload);
      if (result?.success) {
        editModal.closeModal();
        await refetch();
        return true;
      }
      throw new Error(result?.error || "Failed to update warehouse");
    } catch (e) {
      console.error("Update warehouse failed:", e);
      alert(`Failed to update warehouse: ${e.message}`);
      throw e;
    } finally {
      setActionLoading(false);
    }
  };

  const handleDeleteWarehouse = async () => {
    try {
      setActionLoading(true);
      const id = deleteModal?.data?.id;
      const result = await deleteWarehouse(id);
      if (result?.success) {
        deleteModal.closeModal();
        await refetch();
      } else {
        throw new Error(result?.error || "Failed to delete warehouse");
      }
    } catch (e) {
      console.error("Delete warehouse failed:", e);
      alert(`Failed to delete warehouse: ${e.message}`);
    } finally {
      setActionLoading(false);
    }
  };

  // ---- loading / error
  if (loading) return <LoadingSpinner size="lg" text="Loading warehouses..." />;

  if (error) {
    return (
      <div className="space-y-6">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-center gap-3">
            <AlertCircle className="w-5 h-5 text-red-600" />
            <div>
              <h3 className="font-medium text-red-800">
                Error loading warehouses
              </h3>
              <p className="text-sm text-red-700 mt-1">{error}</p>
            </div>
          </div>
          <div className="mt-4">
            <button
              onClick={refetch}
              className="px-3 py-1 text-sm border rounded-md"
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ---- render
  return (
    <div className="space-y-6">
      <WarehouseHeader
        isAdmin={isAdmin}
        onCreate={createModal.openModal}
        onExport={handleExport}
      />

      <WarehouseStats stats={stats} />

      <WarehouseToolbar
        searchTerm={searchTerm}
        onSearch={setSearchTerm}
        viewMode={viewMode}
        onViewChange={setViewMode}
        resultCount={searchTerm ? items.length : undefined}
      />

      {items.length === 0 ? (
        <EmptyState
          icon={WarehouseIcon}
          title={searchTerm ? "No warehouses found" : "No Warehouses Yet"}
          description={
            searchTerm
              ? "Try adjusting your search terms"
              : "Get started by creating your first warehouse location"
          }
          action={isAdmin && !searchTerm}
          actionLabel="Create Warehouse"
          onAction={createModal.openModal}
        />
      ) : viewMode === "table" ? (
        <WarehouseTable
          items={items}
          sortBy={sortBy}
          sortOrder={sortOrder}
          onSort={handleSort}
          isAdmin={isAdmin}
          onView={viewModal.openModal}
          onEdit={editModal.openModal}
          onDelete={deleteModal.openModal}
        />
      ) : (
        <WarehouseCards
          items={items}
          isAdmin={isAdmin}
          onView={viewModal.openModal}
          onEdit={editModal.openModal}
          onDelete={deleteModal.openModal}
        />
      )}

      <CreateWarehouseModal
        isOpen={createModal.isOpen}
        onClose={createModal.closeModal}
        onSuccess={handleCreateWarehouse}
      />

      <EditWarehouseModal
        isOpen={editModal.isOpen}
        onClose={editModal.closeModal}
        onSuccess={handleUpdateWarehouse}
        warehouse={editModal.data}
      />

      <ConfirmDeleteModal
        isOpen={deleteModal.isOpen}
        onClose={deleteModal.closeModal}
        onConfirm={handleDeleteWarehouse}
        title="Delete Warehouse"
        description={`Are you sure you want to delete "${deleteModal.data?.name}"? This action cannot be undone and may affect stock tracking.`}
        confirmText="Delete Warehouse"
        loading={actionLoading}
      />
    </div>
  );
};

export default WarehouseManagement;