// src/api/apiHelpers.js
import httpClient from "./httpClient";

function resolveErrorMessage(error, fallbackMessage) {
  const responseData = error.response?.data;

  if (responseData?.message) {
    return responseData.message;
  }

  if (responseData?.errors) {
    const { errors } = responseData;

    if (typeof errors === "string") {
      return errors;
    }

    if (Array.isArray(errors)) {
      return errors.join(", ");
    }

    if (typeof errors === "object") {
      const formatted = Object.entries(errors).map(([field, messages]) => {
        if (Array.isArray(messages)) {
          return `${field}: ${messages.join(", ")}`;
        }
        return `${field}: ${messages}`;
      });

      if (formatted.length) {
        return formatted.join("; ");
      }
    }
  }

  if (typeof responseData === "string") {
    return responseData;
  }

  if (error.message) {
    return error.message;
  }

  return fallbackMessage;
}

export async function handleRequest(factory, options = {}) {
  const { fallbackMessage = "Request failed", mapData } = options;

  try {
    const response = await factory();
    const data = mapData ? mapData(response.data, response) : response.data;
    return { success: true, data };
  } catch (error) {
    const errorMessage = resolveErrorMessage(error, fallbackMessage);
    return { success: false, error: errorMessage };
  }
}

export function createCrudService(basePath, options = {}) {
  const {
    client = httpClient,
    resourceName = "resource",
    resourceNamePlural,
    messages = {},
    mapList,
    mapItem,
  } = options;

  const plural =
    resourceNamePlural ||
    (resourceName.endsWith("s") ? `${resourceName}es` : `${resourceName}s`);

  return {
    list(params) {
      return handleRequest(
        () => client.get(basePath, { params }),
        {
          fallbackMessage: messages.list || `Failed to fetch ${plural}`,
          mapData: mapList,
        }
      );
    },
    get(id, params) {
      return handleRequest(
        () => client.get(`${basePath}/${id}`, { params }),
        {
          fallbackMessage: messages.get || `Failed to fetch ${resourceName}`,
          mapData: mapItem,
        }
      );
    },
    create(payload, config) {
      return handleRequest(
        () => client.post(basePath, payload, config),
        {
          fallbackMessage:
            messages.create || `Failed to create ${resourceName}`,
          mapData: mapItem,
        }
      );
    },
    update(id, payload, config) {
      return handleRequest(
        () => client.put(`${basePath}/${id}`, payload, config),
        {
          fallbackMessage:
            messages.update || `Failed to update ${resourceName}`,
          mapData: mapItem,
        }
      );
    },
    remove(id, config) {
      return handleRequest(
        () => client.delete(`${basePath}/${id}`, config),
        {
          fallbackMessage:
            messages.remove || `Failed to delete ${resourceName}`,
        }
      );
    },
  };
}
