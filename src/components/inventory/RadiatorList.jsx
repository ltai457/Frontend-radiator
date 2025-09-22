// src/components/radiators/RadiatorList.jsx
import React, { useEffect, useState } from "react";
import {
  Package,
  Plus,
  List as ListIcon,
  Grid as GridIcon,
} from "lucide-react";
import { useAuth } from "../../contexts/AuthContext";
import { useRadiators } from "../../hooks/useRadiators";
import { useWarehouses } from "../../hooks/useWarehouses";
import { useModal } from "../../hooks/useModal";
import { useFilters } from "../../hooks/useFilters";
import { LoadingSpinner } from "../common/ui/LoadingSpinner";
import { Button } from "../common/ui/Button";
import { EmptyState } from "../common/layout/EmptyState";
import RadiatorFilters from "./RadiatorFilters";
import RadiatorTable from "./RadiatorTable";
import RadiatorCards from "./RadiatorCards";
import RadiatorStats from "./RadiatorStats";
import AddRadiatorModal from "./modals/AddRadiatorModal";
import EditRadiatorModal from "./modals/EditRadiatorModal";

// ⬇️ Import the service so we can call createWithImage when needed
import radiatorService from "../../api/radiatorService";

const RadiatorList = () => {
  const { user } = useAuth();
  const {
    radiators,
    loading,
    error,
    createRadiator,
    updateRadiator,
    deleteRadiator,
    refetch,
  } = useRadiators();

  const { warehouses } = useWarehouses();

  const addModal = useModal();
  const editModal = useModal();
  const stockModal = useModal();

  const {
    filteredData: filteredRadiators,
    filters,
    setFilter,
    clearFilters,
    hasActiveFilters,
  } = useFilters(radiators, {
    search: "",
    brand: "all",
    year: "all",
  });

  // remember last chosen view
  const [viewMode, setViewMode] = useState(
    () => localStorage.getItem("radiatorViewMode") || "list"
  );
  useEffect(() => {
    localStorage.setItem("radiatorViewMode", viewMode);
  }, [viewMode]);

  // Normalize admin across number/string/array cases
  const isAdmin =
    user?.role === 1 ||
    user?.role === "1" ||
    user?.role === "Admin" ||
    user?.role === "admin" ||
    (Array.isArray(user?.role) &&
      user.role
        .map(String)
        .some((r) => r.toLowerCase() === "admin" || r === "1"));

  // 🔁 Add handler that supports optional image
  const handleAddRadiator = async (radiatorData, selectedImage) => {
    try {
      let result;

      if (selectedImage) {
        // Use direct service call for multipart create-with-image
        result = await radiatorService.createWithImage(
          radiatorData,
          selectedImage
        );
      } else {
        // Use existing hook JSON create
        result = await createRadiator(radiatorData);
      }

      if (result?.success) {
        addModal.closeModal();
        if (refetch) await refetch();
        return true;
      } else {
        throw new Error(result?.error || "Failed to create radiator");
      }
    } catch (e) {
      console.error("Error adding radiator:", e);
      alert("Failed to add radiator: " + (e.message || "Unknown error"));
      return false;
    }
  };

  const handleEditRadiator = async (radiatorData, selectedImage) => {
    try {
      console.log("🔄 Updating radiator:", radiatorData);
      console.log("🖼️ Selected image:", selectedImage?.name || "none");

      // Step 1: Update radiator data (without image)
      const updateResult = await updateRadiator(
        editModal.data.id,
        radiatorData
      );
      if (!updateResult.success) {
        throw new Error(updateResult.error || "Failed to update radiator");
      }

      // Step 2: Handle image if provided
      if (selectedImage) {
        console.log("📤 Uploading new image...");
        const imageResult = await radiatorService.uploadImage(
          editModal.data.id,
          selectedImage,
          true // Set as primary image
        );

        if (!imageResult.success) {
          console.warn(
            "⚠️ Radiator updated but image upload failed:",
            imageResult.error
          );
          alert(
            "Radiator updated successfully, but image upload failed: " +
              imageResult.error
          );
        } else {
          console.log("✅ Image uploaded successfully");
        }
      }

      editModal.closeModal();
      if (refetch) await refetch();
      return true;
    } catch (e) {
      console.error("Error updating radiator:", e);
      alert("Failed to update radiator: " + (e.message || "Unknown error"));
      return false;
    }
  };

  const handleDeleteRadiator = async (radiator) => {
    const confirmMessage = `Are you sure you want to delete "${radiator.name}"?\n\nThis will also remove all stock levels for this product across all warehouses.\n\nThis action cannot be undone.`;
    if (!window.confirm(confirmMessage)) return;

    try {
      const result = await deleteRadiator(radiator.id);
      if (!result.success) {
        throw new Error(result.error || "Failed to delete radiator");
      }
      if (refetch) {
        await refetch();
      } else {
        window.location.reload();
      }
    } catch (error) {
      console.error("Error deleting radiator:", error);
      alert("Failed to delete radiator: " + error.message);
    }
  };

  const handleStockUpdate = async () => {
    if (refetch) {
      await refetch();
    } else {
      window.location.reload();
    }
  };

  if (loading) {
    return <LoadingSpinner size="lg" text="Loading radiators..." />;
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h3 className="text-xl font-semibold text-gray-900">
            Product Catalog
          </h3>
          <p className="text-sm text-gray-600">
            Manage your radiator inventory
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* view toggle */}
          <Button
            variant={viewMode === "list" ? "default" : "outline"}
            size="sm"
            onClick={() => setViewMode("list")}
            icon={ListIcon}
          >
            List
          </Button>
          <Button
            variant={viewMode === "card" ? "default" : "outline"}
            size="sm"
            onClick={() => setViewMode("card")}
            icon={GridIcon}
          >
            Card
          </Button>

          {/* add button for admin */}
          {isAdmin && (
            <Button onClick={() => addModal.openModal()} icon={Plus}>
              Add Radiator
            </Button>
          )}
        </div>
      </div>

      <RadiatorStats radiators={radiators} />

      <RadiatorFilters
        filters={filters}
        onFilterChange={setFilter}
        onClearFilters={clearFilters}
        hasActiveFilters={hasActiveFilters}
        radiators={radiators}
      />

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-lg">
          {error}
        </div>
      )}

      {filteredRadiators.length === 0 ? (
        <EmptyState
          icon={Package}
          title={hasActiveFilters ? "No radiators found" : "No radiators yet"}
          description={
            hasActiveFilters
              ? "No radiators match your current filters"
              : "Start by adding your first radiator"
          }
          action={hasActiveFilters}
          actionLabel="Clear filters"
          onAction={clearFilters}
        />
      ) : viewMode === "list" ? (
        <RadiatorTable
          radiators={filteredRadiators}
          onEdit={editModal.openModal}
          onDelete={handleDeleteRadiator}
          onEditStock={stockModal.openModal}
          isAdmin={isAdmin}
        />
      ) : (
        <RadiatorCards
          radiators={filteredRadiators}
          onEdit={editModal.openModal}
          onDelete={handleDeleteRadiator}
          onEditStock={stockModal.openModal}
          isAdmin={isAdmin}
        />
      )}

      {/* Modals */}
      <AddRadiatorModal
        isOpen={addModal.isOpen}
        onClose={addModal.closeModal}
        onSuccess={handleAddRadiator}
        warehouses={warehouses || []}
      />

      <EditRadiatorModal
        isOpen={editModal.isOpen}
        onClose={editModal.closeModal}
        onSuccess={handleEditRadiator}
        radiator={editModal.data}
      />
    </div>
  );
};

export default RadiatorList;
