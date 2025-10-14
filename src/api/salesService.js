// src/api/salesService.js
import httpClient from "./httpClient";
import { createCrudService, handleRequest } from "./apiHelpers";

const salesCrud = createCrudService("/sales", {
  resourceName: "sale",
  resourceNamePlural: "sales",
  messages: {
    list: "Failed to fetch sales",
    get: "Failed to fetch sale",
    create: "Failed to create sale",
    update: "Failed to update sale",
    remove: "Failed to delete sale",
  },
});

const salesService = {
  create(saleData) {
    return salesCrud.create(saleData);
  },

  getAll(params) {
    return salesCrud.list(params);
  },

  getById(id) {
    return salesCrud.get(id);
  },

  async getByDateRange(fromDate, toDate) {
    const params = {
      fromDate: fromDate.toISOString(),
      toDate: toDate.toISOString(),
    };

    return handleRequest(
      () => httpClient.get("/sales/by-date", { params }),
      {
        fallbackMessage: "Failed to fetch sales by date range",
      }
    );
  },

  getReceipt(saleId) {
    return handleRequest(
      () => httpClient.get(`/sales/${saleId}/receipt`),
      {
        fallbackMessage: "Failed to fetch receipt",
      }
    );
  },

  cancel(saleId) {
    return handleRequest(
      () => httpClient.post(`/sales/${saleId}/cancel`),
      {
        fallbackMessage: "Failed to cancel sale",
      }
    );
  },

  refund(saleId) {
    return handleRequest(
      () => httpClient.post(`/sales/${saleId}/refund`),
      {
        fallbackMessage: "Failed to refund sale",
      }
    );
  },

  // Create invoice with custom items support (for one-off customers)
  createInvoice(invoiceData) {
    return handleRequest(
      () => httpClient.post("/sales/invoice", invoiceData),
      {
        fallbackMessage: "Failed to create invoice",
      }
    );
  },

  // Invoice retrieval methods
  getAllInvoices(params) {
    return handleRequest(
      () => httpClient.get("/sales/invoices", { params }),
      {
        fallbackMessage: "Failed to fetch invoices",
      }
    );
  },

  getInvoiceById(id) {
    return handleRequest(
      () => httpClient.get(`/sales/invoices/${id}`),
      {
        fallbackMessage: "Failed to fetch invoice",
      }
    );
  },

  getInvoiceByNumber(invoiceNumber) {
    return handleRequest(
      () => httpClient.get(`/sales/invoices/number/${invoiceNumber}`),
      {
        fallbackMessage: "Failed to fetch invoice",
      }
    );
  },
};

export default salesService;
