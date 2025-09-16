// src/api/radiatorService.js
import axios from "axios";
import authService from "./authService";

const API_BASE_URL =
  import.meta.env.VITE_API_BASE || "http://localhost:5128/api/v1";

// Create axios instance WITHOUT forcing Content-Type globally
const api = axios.create({
  baseURL: API_BASE_URL,
});

// Add token + smart Content-Type handling
api.interceptors.request.use((config) => {
  const token = authService?.getValidToken?.();
  if (token) {
    config.headers = config.headers || {};
    config.headers.Authorization = `Bearer ${token}`;
  }

  // If sending FormData → let browser set multipart boundary
  if (config.data instanceof FormData) {
    if (config.headers && config.headers["Content-Type"]) {
      delete config.headers["Content-Type"];
    }
  } else {
    // JSON requests
    config.headers = config.headers || {};
    if (!config.headers["Content-Type"]) {
      config.headers["Content-Type"] = "application/json";
    }
  }

  return config;
});

// Debug responses
api.interceptors.response.use(
  (response) => {
    if (import.meta.env.VITE_DEBUG === "true") {
      console.log(
        "✅ Radiator API Success:",
        response.config.method?.toUpperCase(),
        response.config.url,
        response.status
      );
    }
    return response;
  },
  (error) => {
    console.error(
      "❌ Radiator API Error:",
      error.config?.method?.toUpperCase(),
      error.config?.url,
      error.response?.status,
      error.response?.data
    );
    return Promise.reject(error);
  }
);

const radiatorService = {
  // Create WITHOUT image (JSON)
  async create(radiatorData) {
    try {
      const response = await api.post("/radiators", radiatorData);
      return { success: true, data: response.data };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || error.message || "Failed to create radiator",
      };
    }
  },

  // Create WITH image (multipart/form-data)
  async createWithImage(radiatorData, imageFile) {
    try {
      if (!imageFile) return { success: false, error: "No image file provided" };

      const formData = new FormData();

      // Match backend DTO (CreateRadiatorWithImageDto) — exact casing!
      formData.append("Brand", radiatorData.brand);
      formData.append("Code", radiatorData.code);
      formData.append("Name", radiatorData.name);
      formData.append("Year", String(Number(radiatorData.year)));
      formData.append("RetailPrice", String(Number(radiatorData.retailPrice)));

      if (radiatorData.tradePrice != null) {
        formData.append("TradePrice", String(Number(radiatorData.tradePrice)));
      }
      if (radiatorData.costPrice != null) {
        formData.append("CostPrice", String(Number(radiatorData.costPrice)));
      }
      formData.append("IsPriceOverridable", String(!!radiatorData.isPriceOverridable));
      if (radiatorData.maxDiscountPercent != null) {
        formData.append(
          "MaxDiscountPercent",
          String(Number(radiatorData.maxDiscountPercent))
        );
      }

      // Initial stock dictionary binding: InitialStock[CODE]=QTY
      const stockObj = radiatorData.initialStock || radiatorData.stock;
      if (stockObj && Object.keys(stockObj).length) {
        Object.entries(stockObj).forEach(([whCode, qty]) => {
          formData.append(`InitialStock[${whCode}]`, String(Number(qty)));
        });
      }

      // File must be named exactly like DTO property
      formData.append("Image", imageFile, imageFile.name);

      // Optional debug
      if (import.meta.env.VITE_DEBUG === "true") {
        console.log("📦 FormData contents:");
        for (const [k, v] of formData.entries()) {
          if (v instanceof File) {
            console.log(`${k}: [File] ${v.name} (${v.size} bytes, ${v.type})`);
          } else {
            console.log(`${k}: ${v}`);
          }
        }
      }

      const response = await api.post("/radiators/create-with-image", formData);
      return { success: true, data: response.data };
    } catch (error) {
      return {
        success: false,
        error:
          error.response?.data?.message ||
          error.message ||
          "Failed to create radiator with image",
      };
    }
  },

  // Get all
  async getAll() {
    try {
      const response = await api.get("/radiators");
      return { success: true, data: response.data };
    } catch (error) {
      return {
        success: false,
        error:
          error.response?.data?.message ||
          "Failed to fetch radiators - check API connection",
      };
    }
  },

  // Get by ID
  async getById(id) {
    try {
      const response = await api.get(`/radiators/${id}`);
      return { success: true, data: response.data };
    } catch (error) {
      return {
        success: false,
        error:
          error.response?.data?.message ||
          "Failed to fetch radiator - check API connection",
      };
    }
  },

  // Update
  async update(id, radiatorData) {
    try {
      const response = await api.put(`/radiators/${id}`, radiatorData);
      return { success: true, data: response.data };
    } catch (error) {
      return {
        success: false,
        error:
          error.response?.data?.message || error.message || "Failed to update radiator",
      };
    }
  },

  // Delete
  async delete(id) {
    try {
      await api.delete(`/radiators/${id}`);
      return { success: true };
    } catch (error) {
      return {
        success: false,
        error:
          error.response?.data?.message || error.message || "Failed to delete radiator",
      };
    }
  },

  // Images
  async getRadiatorImages(radiatorId) {
    try {
      const response = await api.get(`/radiators/${radiatorId}/images`);
      return { success: true, data: response.data };
    } catch (error) {
      return {
        success: false,
        error:
          error.response?.data?.message || error.message || "Failed to fetch images",
      };
    }
  },

  async uploadImage(radiatorId, imageFile, isPrimary = false) {
    try {
      const formData = new FormData();
      // NOTE: backend UploadRadiatorImageDto expects "Image" and "IsPrimary"
      formData.append("Image", imageFile, imageFile.name);
      formData.append("IsPrimary", String(!!isPrimary));

      const response = await api.post(`/radiators/${radiatorId}/images`, formData);
      return { success: true, data: response.data };
    } catch (error) {
      return {
        success: false,
        error:
          error.response?.data?.message || error.message || "Failed to upload image",
      };
    }
  },

  async testS3(imageFile) {
    try {
      const formData = new FormData();
      formData.append("file", imageFile, imageFile.name);
      const response = await api.post("/radiators/test-s3", formData);
      return { success: true, data: response.data };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || error.message || "S3 test failed",
      };
    }
  },
};

export default radiatorService;
