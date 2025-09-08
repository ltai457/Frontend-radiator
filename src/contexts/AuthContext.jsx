// src/contexts/AuthContext.jsx
import React, { createContext, useContext, useState, useEffect } from 'react';
import authService from '../api/authService';

// TESTING MODE CONFIGURATION
const TESTING_MODE = true; // Set to false to re-enable authentication

// Mock test user for testing mode
const TEST_USER = {
  id: 'test-user-001',
  username: 'testuser',
  email: 'test@example.com',
  role: 'Admin', // You can change this to 'User' or other roles for testing
  isActive: true,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString()
};

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  // Initialize with test user in testing mode
  const [user, setUser] = useState(TESTING_MODE ? TEST_USER : null);
  const [loading, setLoading] = useState(!TESTING_MODE); // Skip loading in testing mode
  const [sessionWarning, setSessionWarning] = useState(false);

  // Check authentication status on app start (skip in testing mode)
  useEffect(() => {
    if (TESTING_MODE) {
      console.log('🧪 TESTING MODE: Authentication bypassed');
      console.log('🧪 Test User:', TEST_USER);
      return;
    }

    const currentUser = authService.getCurrentUser();
    if (currentUser && authService.isAuthenticated()) {
      setUser(currentUser);
    } else {
      // Clear any invalid/expired sessions
      authService.logout();
      setUser(null);
    }
    setLoading(false);
  }, []);

  // Session timeout checking (disabled in testing mode)
  useEffect(() => {
    if (TESTING_MODE || !user) return;

    const checkSession = () => {
      if (!authService.isSessionValid()) {
        // Session expired
        handleSessionExpired();
        return;
      }

      const remainingTime = authService.getRemainingSessionTime();
      
      // Show warning when 5 minutes left
      if (remainingTime <= 5 && remainingTime > 0) {
        setSessionWarning(true);
      } else {
        setSessionWarning(false);
      }
    };

    // Check session every minute
    const sessionInterval = setInterval(checkSession, 60000);
    
    // Check immediately
    checkSession();

    return () => clearInterval(sessionInterval);
  }, [user]);

  // Auto-logout on session expiry
  const handleSessionExpired = () => {
    if (TESTING_MODE) return;
    
    authService.logout();
    setUser(null);
    setSessionWarning(false);
    
    // Show notification
    if (window.confirm('Your session has expired for security reasons. Please login again.')) {
      window.location.reload();
    }
  };

  // Activity tracking to extend session (disabled in testing mode)
  useEffect(() => {
    if (TESTING_MODE || !user) return;

    const activities = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart', 'click'];
    
    const extendSessionOnActivity = () => {
      if (authService.isAuthenticated()) {
        authService.extendSession();
        setSessionWarning(false); // Hide warning on activity
      }
    };

    // Add event listeners
    activities.forEach(activity => {
      document.addEventListener(activity, extendSessionOnActivity, { passive: true });
    });

    return () => {
      // Clean up event listeners
      activities.forEach(activity => {
        document.removeEventListener(activity, extendSessionOnActivity);
      });
    };
  }, [user]);

  const login = async (username, password) => {
    if (TESTING_MODE) {
      // In testing mode, always succeed with test user
      console.log('🧪 TESTING MODE: Mock login successful');
      setUser(TEST_USER);
      return { success: true, user: TEST_USER };
    }

    setLoading(true);
    const result = await authService.login(username, password);
    if (result.success) {
      setUser(result.user);
      setSessionWarning(false);
    }
    setLoading(false);
    return result;
  };

  const logout = () => {
    if (TESTING_MODE) {
      console.log('🧪 TESTING MODE: Mock logout (user stays logged in for testing)');
      // In testing mode, optionally allow logout or keep user logged in
      // Uncomment the next line if you want logout to work in testing mode:
      // setUser(null);
      return;
    }

    authService.logout();
    setUser(null);
    setSessionWarning(false);
  };

  const isAuthenticated = () => {
    if (TESTING_MODE) return true; // Always authenticated in testing mode
    return !!user && authService.isAuthenticated();
  };

  const extendSession = () => {
    if (TESTING_MODE) return; // No session management in testing mode
    
    if (user && authService.isAuthenticated()) {
      authService.extendSession();
      setSessionWarning(false);
    }
  };

  const value = {
    user,
    loading,
    login,
    logout,
    isAuthenticated,
    sessionWarning,
    extendSession,
    remainingTime: TESTING_MODE ? 999 : (user ? authService.getRemainingSessionTime() : 0)
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
      
      {/* Session Warning Modal (disabled in testing mode) */}
      {!TESTING_MODE && sessionWarning && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md mx-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Session Expiring Soon
            </h3>
            <p className="text-gray-600 mb-4">
              Your session will expire in {authService.getRemainingSessionTime()} minutes due to inactivity. 
              Would you like to continue working?
            </p>
            <div className="flex gap-2 justify-end">
              <button
                onClick={logout}
                className="px-4 py-2 text-gray-600 hover:text-gray-800"
              >
                Logout
              </button>
              <button
                onClick={extendSession}
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
              >
                Continue Session
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Testing Mode Banner */}
      {TESTING_MODE && (
        <div className="fixed top-0 left-0 right-0 bg-yellow-500 text-black text-center py-1 px-2 text-sm font-medium z-50">
          🧪 TESTING MODE: Authentication Disabled | User: {TEST_USER.username} ({TEST_USER.role})
        </div>
      )}
    </AuthContext.Provider>
  );
};