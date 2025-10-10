// src/api/stockService.js
import httpClient from "./httpClient";
import { handleRequest } from "./apiHelpers";

function buildStockMovementParams(params = {}) {
  const query = {};

  if (params.radiatorId) {
    query.radiatorId = params.radiatorId;
  }
  if (params.warehouseCode) {
    query.warehouseCode = params.warehouseCode;
  }
  if (params.fromDate instanceof Date) {
    query.fromDate = params.fromDate.toISOString();
  }
  if (params.toDate instanceof Date) {
    query.toDate = params.toDate.toISOString();
  }
  if (params.movementType) {
    query.movementType = params.movementType;
  }
  if (params.limit) {
    query.limit = params.limit;
  }

  return query;
}

const stockService = {
  async getRadiatorStock(radiatorId) {
    console.log("📦 Fetching stock for radiator:", radiatorId);
    const result = await handleRequest(
      () => httpClient.get(`/radiators/${radiatorId}/stock`),
      {
        fallbackMessage: "Failed to fetch stock levels",
      }
    );

    if (result.success) {
      console.log("✅ Stock data loaded:", result.data);
    } else {
      console.error("❌ Get radiator stock error:", result.error);
    }

    return result;
  },

  async updateStock(radiatorId, warehouseCode, quantity) {
    console.log("📝 Updating stock:", {
      radiatorId,
      warehouseCode,
      quantity,
    });

    const payload = {
      warehouseCode: warehouseCode.toUpperCase(),
      quantity: parseInt(quantity, 10),
    };

    console.log("📤 Sending stock update payload:", payload);

    const result = await handleRequest(
      () => httpClient.post(`/radiators/${radiatorId}/stock`, payload),
      {
        fallbackMessage: "Failed to update stock",
      }
    );

    if (result.success) {
      console.log("✅ Stock updated successfully:", result.data);
    } else {
      console.error("❌ Update stock error:", result.error);
    }

    return result;
  },

  async getStockMovements(params = {}) {
    const query = buildStockMovementParams(params);

    const result = await handleRequest(
      () => httpClient.get("/stock/movements", { params: query }),
      {
        fallbackMessage: "Failed to fetch stock movements",
      }
    );

    if (result.success) {
      console.log("✅ Stock movements loaded:", result.data.length);
    } else {
      console.error("❌ Get stock movements error:", result.error);
    }

    return result;
  },

  async getAllRadiatorsWithStock(
    search = null,
    lowStockOnly = false,
    warehouseCode = null
  ) {
    console.log("📊 Fetching all radiators with stock...");

    const params = {};
    if (search) params.search = search;
    if (lowStockOnly) params.lowStockOnly = "true";
    if (warehouseCode) params.warehouseCode = warehouseCode;

    try {
      const response = await httpClient.get("/stock/all-radiators", {
        params,
      });
      console.log(
        "✅ Radiators with stock loaded (enhanced):",
        response.data.length,
        "items"
      );
      return { success: true, data: response.data };
    } catch (enhancedError) {
      console.log(
        "ℹ️ Enhanced endpoint not available, using fallback method..."
      );
    }

    const radiatorsResponse = await handleRequest(
      () => httpClient.get("/radiators"),
      {
        fallbackMessage: "Failed to fetch radiators - check API connection",
      }
    );

    if (!radiatorsResponse.success || !radiatorsResponse.data) {
      return radiatorsResponse;
    }

    const radiatorsWithStock = [];

    for (const radiator of radiatorsResponse.data) {
      try {
        const stockResponse = await this.getRadiatorStock(radiator.id);
        const radiatorData = {
          ...radiator,
          stock: stockResponse.success ? stockResponse.data.stock : {},
        };

        let shouldInclude = true;

        if (search) {
          const searchLower = search.toLowerCase();
          shouldInclude =
            radiator.name.toLowerCase().includes(searchLower) ||
            radiator.code.toLowerCase().includes(searchLower) ||
            radiator.brand.toLowerCase().includes(searchLower);
        }

        if (shouldInclude && lowStockOnly) {
          const stockValues = Object.values(radiatorData.stock || {});
          const hasLowStock = stockValues.some(
            (qty) => qty > 0 && qty <= 5
          );
          const hasOutOfStock = stockValues.some((qty) => qty === 0);
          shouldInclude = hasLowStock || hasOutOfStock;
        }

        if (shouldInclude && warehouseCode) {
          shouldInclude = Object.prototype.hasOwnProperty.call(
            radiatorData.stock,
            warehouseCode.toUpperCase()
          );
        }

        if (shouldInclude) {
          radiatorsWithStock.push(radiatorData);
        }
      } catch (error) {
        console.warn(
          `Failed to fetch stock for radiator ${radiator.id}:`,
          error
        );
        radiatorsWithStock.push({
          ...radiator,
          stock: {},
        });
      }
    }

    console.log(
      "✅ Radiators with stock loaded (fallback):",
      radiatorsWithStock.length,
      "items"
    );
    return { success: true, data: radiatorsWithStock };
  },

  async getStockSummary() {
    console.log("📊 Fetching stock summary...");
    const result = await handleRequest(
      () => httpClient.get("/stock/summary"),
      {
        fallbackMessage: "Failed to fetch stock summary",
      }
    );

    if (result.success) {
      console.log("✅ Stock summary loaded:", result.data);
    } else {
      console.error("❌ Get stock summary error:", result.error);
    }

    return result;
  },
};

export default stockService;
