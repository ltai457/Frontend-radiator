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
    const initializeAuth = async () => {
      console.log('🔐 Initializing authentication...');
      
      const currentUser = authService.getCurrentUser();
      if (currentUser && authService.isAuthenticated()) {
        console.log('✅ Found valid session for user:', currentUser.username);
        setUser(currentUser);
      } else {
        console.log('❌ No valid session found');
        // Clear any invalid/expired sessions
        authService.logout();
        setUser(null);
      }
      setLoading(false);
    };

    initializeAuth();
  }, []);

  // Session timeout checking
  useEffect(() => {
    if (!user) return;

    const checkSession = () => {
      if (!authService.isSessionValid()) {
        console.log('⏰ Session expired');
        handleSessionExpired();
        return;
      }

      const remainingTime = authService.getRemainingSessionTime();
      console.log(`⏱️ Session time remaining: ${remainingTime} minutes`);
      
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
    console.log('🚀 Attempting login for user:', username);
    setLoading(true);
    
    try {
      const result = await authService.login(username, password);
      if (result.success) {
        console.log('✅ Login successful');
        setUser(result.user);
        setSessionWarning(false);
      } else {
        console.error('❌ Login failed:', result.error);
      }
      setLoading(false);
      return result;
    } catch (error) {
      console.error('❌ Login error:', error);
      setLoading(false);
      return { success: false, error: 'An unexpected error occurred during login' };
    }
  };

  const logout = async () => {
    console.log('🔓 Logging out user');
    
    try {
      // Attempt server-side logout if we have a refresh token
      const refreshToken = sessionStorage.getItem('refreshToken');
      if (refreshToken) {
        await authService.logout(refreshToken);
      }
    } catch (error) {
      console.warn('⚠️ Server-side logout failed, proceeding with client-side logout:', error);
    }

    // Always clear client-side session
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

  const refreshUserSession = async () => {
    console.log('🔄 Attempting to refresh user session...');
    
    try {
      const result = await authService.refreshToken();
      if (result.success) {
        console.log('✅ Session refreshed successfully');
        // Update session warning state
        setSessionWarning(false);
        return true;
      } else {
        console.error('❌ Session refresh failed:', result.error);
        handleSessionExpired();
        return false;
      }
    } catch (error) {
      console.error('❌ Session refresh error:', error);
      handleSessionExpired();
      return false;
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
    refreshUserSession,
    remainingTime: user ? authService.getRemainingSessionTime() : 0,
    sessionInfo: user ? authService.getSessionInfo() : null
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};