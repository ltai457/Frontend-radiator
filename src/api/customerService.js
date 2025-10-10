// src/api/customerService.js
import httpClient from "./httpClient";
import { createCrudService, handleRequest } from "./apiHelpers";

const customerCrud = createCrudService("/customers", {
  resourceName: "customer",
  resourceNamePlural: "customers",
  messages: {
    list: "Failed to fetch customers",
    get: "Failed to fetch customer",
    create: "Failed to create customer",
    update: "Failed to update customer",
    remove: "Failed to delete customer",
  },
});

const customerService = {
  getAll(params) {
    return customerCrud.list(params);
  },

  getById(id) {
    return customerCrud.get(id);
  },

  create(customerData) {
    return customerCrud.create(customerData);
  },

  update(id, customerData) {
    return customerCrud.update(id, customerData);
  },

  delete(id) {
    return customerCrud.remove(id);
  },

  async getSalesHistory(customerId) {
    return handleRequest(
      () => httpClient.get(`/customers/${customerId}/sales`),
      {
        fallbackMessage: "Failed to fetch sales history",
      }
    );
  },
};

export default customerService;
