// src/api/warehouseService.js
import httpClient from "./httpClient";
import { createCrudService, handleRequest } from "./apiHelpers";

function buildWarehousePayload(warehouseData) {
  const payload = {
    name: warehouseData.name?.trim() || "",
    code: warehouseData.code?.trim()?.toUpperCase() || "",
  };

  if (warehouseData.location?.trim()) {
    payload.location = warehouseData.location.trim();
  }

  if (warehouseData.address?.trim()) {
    payload.address = warehouseData.address.trim();
  }

  if (warehouseData.phone?.trim()) {
    payload.phone = warehouseData.phone.trim();
  }

  if (warehouseData.email?.trim()) {
    payload.email = warehouseData.email.trim();
  }

  return payload;
}

const warehouseCrud = createCrudService("/warehouses", {
  resourceName: "warehouse",
  resourceNamePlural: "warehouses",
  messages: {
    list: "Failed to fetch warehouses - check API connection",
    get: "Failed to fetch warehouse - check API connection",
    create: "Failed to create warehouse",
    update: "Failed to update warehouse",
    remove: "Failed to delete warehouse",
  },
});

const warehouseService = {
  async getAll(params) {
    console.log("📊 Fetching all warehouses...");
    const result = await warehouseCrud.list(params);
    if (result.success) {
      console.log("✅ Warehouses loaded:", result.data.length, "items");
    }
    return result;
  },

  async getById(id) {
    console.log("📊 Fetching warehouse by ID:", id);
    const result = await warehouseCrud.get(id);
    if (result.success) {
      console.log("✅ Warehouse loaded:", result.data);
    }
    return result;
  },

  async getByCode(code) {
    console.log("📊 Fetching warehouse by code:", code);
    const result = await handleRequest(
      () => httpClient.get(`/warehouses/code/${code}`),
      {
        fallbackMessage: "Failed to fetch warehouse by code",
      }
    );
    if (result.success) {
      console.log("✅ Warehouse loaded:", result.data);
    }
    return result;
  },

  async create(warehouseData) {
    console.log("🚀 Creating warehouse with data:", warehouseData);
    const payload = buildWarehousePayload(warehouseData);
    console.log("📤 Sending warehouse payload:", payload);

    const result = await handleRequest(
      () => httpClient.post("/warehouses", payload),
      {
        fallbackMessage: "Failed to create warehouse",
      }
    );

    if (result.success) {
      console.log("✅ Create warehouse response:", result.data);
      return result;
    }

    const errors = result.error;
    if (errors && typeof errors === "object") {
      const errorMessages = Object.entries(errors).map(
        ([field, messages]) =>
          `${field}: ${Array.isArray(messages) ? messages.join(", ") : messages}`
      );
      return { success: false, error: errorMessages.join("; ") };
    }

    return result;
  },

  async update(id, warehouseData) {
    console.log("📝 Updating warehouse:", id, warehouseData);
    const payload = buildWarehousePayload(warehouseData);
    console.log("📤 Sending update payload:", payload);

    const result = await handleRequest(
      () => httpClient.put(`/warehouses/${id}`, payload),
      {
        fallbackMessage: "Failed to update warehouse",
      }
    );

    if (result.success) {
      console.log("✅ Warehouse updated:", result.data);
      return result;
    }

    const errors = result.error;
    if (errors && typeof errors === "object") {
      const errorMessages = Object.entries(errors).map(
        ([field, messages]) =>
          `${field}: ${Array.isArray(messages) ? messages.join(", ") : messages}`
      );
      return { success: false, error: errorMessages.join("; ") };
    }

    return result;
  },

  delete(id) {
    return warehouseCrud.remove(id);
  },
};

export default warehouseService;
