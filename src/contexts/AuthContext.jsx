// src/contexts/AuthContext.jsx
import React, { createContext, useContext, useState, useEffect } from 'react';
import authService from '../api/authService';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [sessionWarning, setSessionWarning] = useState(false);

  // Check authentication status on app start
  useEffect(() => {
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

  // Session timeout checking
  useEffect(() => {
    if (!user) return;

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
    authService.logout();
    setUser(null);
    setSessionWarning(false);
    
    // Show notification
    if (window.confirm('Your session has expired for security reasons. Please login again.')) {
      window.location.reload();
    }
  };

  // Activity tracking to extend session
  useEffect(() => {
    if (!user) return;

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
    authService.logout();
    setUser(null);
    setSessionWarning(false);
  };

  const isAuthenticated = () => {
    return !!user && authService.isAuthenticated();
  };

  const extendSession = () => {
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
    remainingTime: user ? authService.getRemainingSessionTime() : 0
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
      
      {/* Session Warning Modal */}
      {sessionWarning && (
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
    </AuthContext.Provider>
  );
};