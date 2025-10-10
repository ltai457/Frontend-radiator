// src/api/userService.js
import httpClient from "./httpClient";
import { createCrudService, handleRequest } from "./apiHelpers";

const userCrud = createCrudService("/users", {
  resourceName: "user",
  resourceNamePlural: "users",
  messages: {
    list: "Failed to fetch users",
    get: "Failed to fetch user",
    create: "Failed to create user",
    update: "Failed to update user",
    remove: "Failed to delete user",
  },
});

const userService = {
  getAllUsers(params) {
    return userCrud.list(params);
  },

  getUserById(id) {
    return userCrud.get(id);
  },

  createUser(userData) {
    return userCrud.create(userData);
  },

  updateUser(userId, userData) {
    return userCrud.update(userId, userData);
  },

  deleteUser(userId) {
    return userCrud.remove(userId);
  },

  async checkUsernameExists(username) {
    const result = await handleRequest(
      () => httpClient.get(`/users/check-username/${username}`),
      {
        fallbackMessage: "Failed to check username",
        mapData: (data) => data.exists,
      }
    );

    if (result.success) {
      return { success: true, exists: result.data };
    }

    return result;
  },

  async checkEmailExists(email) {
    const result = await handleRequest(
      () => httpClient.get(`/users/check-email/${email}`),
      {
        fallbackMessage: "Failed to check email",
        mapData: (data) => data.exists,
      }
    );

    if (result.success) {
      return { success: true, exists: result.data };
    }

    return result;
  },
};

export default userService;
