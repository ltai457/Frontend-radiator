// src/api/radiatorService.js
import httpClient from "./httpClient";
import { handleRequest } from "./apiHelpers";

function buildRadiatorFormData(radiatorData, imageFile) {
  const formData = new FormData();

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
  if (radiatorData.productType) {
    formData.append("ProductType", radiatorData.productType);
  }
  if (radiatorData.dimensions) {
    formData.append("Dimensions", radiatorData.dimensions);
  }
  if (radiatorData.notes) {
    formData.append("Notes", radiatorData.notes);
  }

  formData.append(
    "IsPriceOverridable",
    String(!!radiatorData.isPriceOverridable)
  );

  if (radiatorData.maxDiscountPercent != null) {
    formData.append(
      "MaxDiscountPercent",
      String(Number(radiatorData.maxDiscountPercent))
    );
  }

  const stockObj = radiatorData.initialStock || radiatorData.stock;
  if (stockObj && Object.keys(stockObj).length) {
    Object.entries(stockObj).forEach(([whCode, qty]) => {
      formData.append(`InitialStock[${whCode}]`, String(Number(qty)));
    });
  }

  if (imageFile) {
    formData.append("Image", imageFile, imageFile.name);
  }

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

  return formData;
}

const radiatorService = {
  async create(radiatorData, imageFile = null) {
    console.log("📤 Creating radiator:", { hasImage: !!imageFile });
    const formData = buildRadiatorFormData(radiatorData, imageFile);

    const result = await handleRequest(
      () => httpClient.post("/radiators/create-with-image", formData),
      {
        fallbackMessage: "Failed to create radiator",
      }
    );

    if (result.success) {
      console.log("✅ Radiator created successfully");
    } else {
      console.error("❌ Create radiator error:", result.error);
    }

    return result;
  },

  getAll(sortBy = "createdAt", sortOrder = "asc") {
    const params = {};
    if (sortBy) params.sortBy = sortBy;
    if (sortOrder) params.sortOrder = sortOrder;

    return handleRequest(
      () => httpClient.get("/radiators", { params }),
      {
        fallbackMessage:
          "Failed to fetch radiators - check API connection",
      }
    );
  },

  getById(id) {
    return handleRequest(
      () => httpClient.get(`/radiators/${id}`),
      {
        fallbackMessage:
          "Failed to fetch radiator - check API connection",
      }
    );
  },

  update(id, radiatorData) {
    return handleRequest(
      () => httpClient.put(`/radiators/${id}`, radiatorData),
      {
        fallbackMessage: "Failed to update radiator",
      }
    );
  },

  delete(id) {
    return handleRequest(
      () => httpClient.delete(`/radiators/${id}`),
      {
        fallbackMessage: "Failed to delete radiator",
      }
    );
  },

  getRadiatorImages(radiatorId) {
    return handleRequest(
      () => httpClient.get(`/radiators/${radiatorId}/images`),
      {
        fallbackMessage: "Failed to fetch images",
      }
    );
  },

  uploadImage(radiatorId, imageFile, isPrimary = false) {
    const formData = new FormData();
    formData.append("Image", imageFile, imageFile.name);
    formData.append("IsPrimary", String(!!isPrimary));

    return handleRequest(
      () => httpClient.post(`/radiators/${radiatorId}/images`, formData),
      {
        fallbackMessage: "Failed to upload image",
      }
    );
  },

  testS3(imageFile) {
    const formData = new FormData();
    formData.append("file", imageFile, imageFile.name);

    return handleRequest(
      () => httpClient.post("/radiators/test-s3", formData),
      {
        fallbackMessage: "S3 test failed",
      }
    );
  },
};

export default radiatorService;
