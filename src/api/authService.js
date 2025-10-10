// src/api/authService.js
import axios from "axios";
import { setAuthTokenProvider } from "./httpClient";

const API_BASE_URL =
  import.meta.env.VITE_API_BASE || "http://localhost:5128/api/v1";

// Session timeout in milliseconds (30 minutes)
const SESSION_TIMEOUT = 30 * 60 * 1000;

// Activity tracking timeout (extend session on activity)
const ACTIVITY_EXTEND_INTERVAL = 5 * 60 * 1000; // 5 minutes

// Create axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Track last activity time to prevent too frequent session extensions
let lastActivityExtension = 0;
let tokenRefreshTimer = null;

// Add response interceptor for debugging and error handling
function setupAutoTokenRefresh(expiresAt) {
  if (tokenRefreshTimer) {
    clearTimeout(tokenRefreshTimer);
  }

  const expirationTime = new Date(expiresAt).getTime();
  const now = Date.now();
  const timeUntilExpiry = expirationTime - now;

  // Refresh 2 minutes before expiration
  const refreshTime = timeUntilExpiry - 2 * 60 * 1000;

  if (refreshTime > 0) {
    console.log(
      "Auto-refresh scheduled in",
      Math.floor(refreshTime / 1000 / 60),
      "minutes"
    );
    tokenRefreshTimer = setTimeout(async () => {
      console.log("Auto-refreshing token...");
      const result = await authService.refreshToken();
      if (result.success) {
        console.log("Token auto-refreshed successfully");
      } else {
        console.log("Auto-refresh failed, user needs to login");
      }
    }, refreshTime);
  }
}

api.interceptors.response.use(
  (response) => {
    if (import.meta.env.VITE_DEBUG === "true") {
      console.log(
        "✅ Auth API Success:",
        response.config.method.toUpperCase(),
        response.config.url,
        response.status
      );
    }
    return response;
  },
  (error) => {
    console.error(
      "❌ Auth API Error:",
      error.config?.method?.toUpperCase(),
      error.config?.url,
      error.response?.status,
      error.response?.data
    );

    // Handle 401 errors by clearing the session
    if (error.response?.status === 401) {
      console.log("🔓 Received 401, clearing session");
      authService.logout();
    }

    return Promise.reject(error);
  }
);

const authService = {
  // Login function - FIXED VERSION
  async login(username, password) {
    try {
      console.log("🔐 Attempting login to:", `${API_BASE_URL}/auth/login`);

      const response = await api.post("/auth/login", {
        username: username.trim(),
        password,
      });

      const { accessToken, refreshToken, user, expiresAt } = response.data;

      // Validate response structure
      if (!accessToken || !refreshToken || !user) {
        throw new Error("Invalid response structure from server");
      }

      const now = Date.now();

      // ✅ FIX: Calculate expirationTime FIRST before using it
      let expirationTime;
      if (expiresAt) {
        expirationTime = new Date(expiresAt).getTime();
      } else {
        // Default to 30 minutes from now if no expiresAt provided
        expirationTime = now + SESSION_TIMEOUT;
      }

      // ✅ NOW store everything (expirationTime is already declared)
      sessionStorage.setItem("accessToken", accessToken);
      sessionStorage.setItem("refreshToken", refreshToken);
      sessionStorage.setItem("tokenExpiresAt", expirationTime.toString());
      sessionStorage.setItem("user", JSON.stringify(user));
      sessionStorage.setItem("loginTime", now.toString());
      sessionStorage.setItem("lastActivity", now.toString());

      // Setup auto-refresh after storing
      setupAutoTokenRefresh(expirationTime);

      console.log("✅ Login successful for user:", user.username);
      console.log("🔐 Token expires at:", new Date(expirationTime));
      console.log(
        "⏰ Session timeout:",
        SESSION_TIMEOUT / (1000 * 60),
        "minutes"
      );

      return { success: true, user };
    } catch (error) {
      console.error("❌ Login failed:", error.response?.data || error.message);

      // Clean up any partial session data
      this.logout();

      let errorMessage = "Login failed - please check your credentials";

      if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (
        error.code === "NETWORK_ERROR" ||
        error.message.includes("Network Error")
      ) {
        errorMessage =
          "Unable to connect to server. Please check if the API server is running.";
      }

      return { success: false, error: errorMessage };
    }
  },

  // Logout function
  async logout(refreshToken) {
    if (tokenRefreshTimer) {
      clearTimeout(tokenRefreshTimer);
      tokenRefreshTimer = null;
    }

    // Always clear client-side storage
    sessionStorage.removeItem("accessToken");
    sessionStorage.removeItem("refreshToken");
    sessionStorage.removeItem("user");
    sessionStorage.removeItem("loginTime");
    sessionStorage.removeItem("tokenExpiresAt");
    sessionStorage.removeItem("lastActivity");

    console.log("🔓 Logged out and cleared session");
  },

  // Get current user
  getCurrentUser() {
    try {
      const userStr = sessionStorage.getItem("user");
      return userStr ? JSON.parse(userStr) : null;
    } catch (error) {
      console.error("Error parsing user data:", error);
      return null;
    }
  },

  // Get valid token
  getValidToken() {
    const token = sessionStorage.getItem("accessToken");
    return this.isAuthenticated() ? token : null;
  },

  // Check if authenticated
  isAuthenticated() {
    const token = sessionStorage.getItem("accessToken");
    const user = this.getCurrentUser();
    return !!(token && user && this.isSessionValid());
  },

  // Check if session is still valid
  isSessionValid() {
    const tokenExpiresAt = sessionStorage.getItem("tokenExpiresAt");
    const loginTime = sessionStorage.getItem("loginTime");

    if (!loginTime || !tokenExpiresAt) {
      console.log("❌ Missing session timestamps");
      return false;
    }

    const now = Date.now();
    const expirationTime = parseInt(tokenExpiresAt);

    // Check if token has expired
    if (now >= expirationTime) {
      console.log(
        "❌ Session expired - token expired at:",
        new Date(expirationTime)
      );
      return false;
    }

    // Additional safety check - max 8 hour session regardless of token
    const loginTimestamp = parseInt(loginTime);
    const maxSessionTime = 8 * 60 * 60 * 1000; // 8 hours
    const sessionAge = now - loginTimestamp;

    if (sessionAge > maxSessionTime) {
      console.log("❌ Session expired - exceeded maximum session time");
      return false;
    }

    return true;
  },

  // Get remaining session time in minutes
  getRemainingSessionTime() {
    const tokenExpiresAt = sessionStorage.getItem("tokenExpiresAt");

    if (!tokenExpiresAt) {
      return 0;
    }

    const now = Date.now();
    const expirationTime = parseInt(tokenExpiresAt);
    const remainingTime = expirationTime - now;

    if (remainingTime <= 0) {
      return 0;
    }

    return Math.floor(remainingTime / (1000 * 60));
  },

  // Extend session by updating activity time
  extendSession() {
    if (!this.isAuthenticated()) {
      return false;
    }

    const now = Date.now();
    const lastExtension = lastActivityExtension;

    // Only extend if it's been more than 5 minutes since last extension
    if (now - lastExtension < ACTIVITY_EXTEND_INTERVAL) {
      return false;
    }

    // Update last activity time
    sessionStorage.setItem("lastActivity", now.toString());
    lastActivityExtension = now;

    // Extend the token expiration by 30 minutes
    const currentExpiration = parseInt(
      sessionStorage.getItem("tokenExpiresAt") || "0"
    );
    const newExpiration = Math.max(currentExpiration, now + SESSION_TIMEOUT);

    sessionStorage.setItem("tokenExpiresAt", newExpiration.toString());

    console.log("🕐 Session extended to:", new Date(newExpiration));
    return true;
  },

  // Get session information
  getSessionInfo() {
    const loginTime = sessionStorage.getItem("loginTime");
    const tokenExpiresAt = sessionStorage.getItem("tokenExpiresAt");
    const lastActivity = sessionStorage.getItem("lastActivity");
    const token = sessionStorage.getItem("accessToken");

    return {
      isValid: this.isSessionValid(),
      hasToken: !!token,
      loginTime: loginTime ? new Date(parseInt(loginTime)) : null,
      expiresAt: tokenExpiresAt ? new Date(parseInt(tokenExpiresAt)) : null,
      lastActivity: lastActivity ? new Date(parseInt(lastActivity)) : null,
      remainingMinutes: this.getRemainingSessionTime(),
    };
  },

  // Test API connection
  async testConnection() {
    try {
      console.log("🔌 Testing API connection...");
      const healthUrl = API_BASE_URL.replace("/api/v1", "/health");
      const response = await axios.get(healthUrl, { timeout: 5000 });
      console.log("✅ API connection successful");
      return { success: true, data: response.data };
    } catch (error) {
      console.error("❌ API connection failed:", error.message);
      return {
        success: false,
        error:
          error.code === "NETWORK_ERROR"
            ? "Unable to connect to API server"
            : error.message || "API server is not responding",
      };
    }
  },

  // Refresh token - FIXED VERSION
  async refreshToken() {
    try {
      const refreshToken = sessionStorage.getItem("refreshToken");
      if (!refreshToken) {
        throw new Error("No refresh token available");
      }

      console.log("🔄 Refreshing authentication token...");
      const response = await api.post("/auth/refresh", { refreshToken });
      const {
        accessToken,
        refreshToken: newRefreshToken,
        expiresAt,
      } = response.data;

      const now = Date.now();

      // ✅ FIX: Calculate expirationTime FIRST
      let expirationTime;
      if (expiresAt) {
        expirationTime = new Date(expiresAt).getTime();
      } else {
        expirationTime = now + SESSION_TIMEOUT;
      }

      // ✅ NOW update tokens and session
      sessionStorage.setItem("accessToken", accessToken);
      if (newRefreshToken) {
        sessionStorage.setItem("refreshToken", newRefreshToken);
      }
      sessionStorage.setItem("lastActivity", now.toString());
      sessionStorage.setItem("tokenExpiresAt", expirationTime.toString());

      // Setup auto-refresh after storing
      setupAutoTokenRefresh(expirationTime);

      console.log(
        "✅ Token refreshed successfully, expires at:",
        new Date(expirationTime)
      );
      return { success: true };
    } catch (error) {
      console.error(
        "❌ Token refresh failed:",
        error.response?.data || error.message
      );

      // Clear invalid session
      this.logout();

      return {
        success: false,
        error:
          error.response?.data?.message ||
          "Session refresh failed. Please login again.",
      };
    }
  },

  // Register new user
  async register(userData) {
    try {
      console.log("👤 Attempting user registration...");
      const response = await api.post("/auth/register", userData);
      console.log("✅ Registration successful");
      return { success: true, data: response.data };
    } catch (error) {
      console.error(
        "❌ Registration failed:",
        error.response?.data || error.message
      );

      let errorMessage = "Registration failed";
      if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.response?.status === 409) {
        errorMessage = "Username or email already exists";
      }

      return {
        success: false,
        error: errorMessage,
      };
    }
  },

  // Change password
  async changePassword(currentPassword, newPassword) {
    try {
      console.log("🔐 Attempting password change...");
      await api.post("/auth/change-password", {
        currentPassword,
        newPassword,
      });
      console.log("✅ Password changed successfully");
      return { success: true };
    } catch (error) {
      console.error(
        "❌ Password change failed:",
        error.response?.data || error.message
      );

      let errorMessage = "Password change failed";
      if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.response?.status === 400) {
        errorMessage = "Current password is incorrect";
      }

      return {
        success: false,
        error: errorMessage,
      };
    }
  },
};

setAuthTokenProvider(() => authService.getValidToken());

// Add token to requests if available
api.interceptors.request.use((config) => {
  const token = authService.getValidToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default authService;
