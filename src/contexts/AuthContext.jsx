// src/contexts/AuthContext.jsx
import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
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
        console.log('📊 Session info:', authService.getSessionInfo());
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

  // Session timeout checking with better intervals
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

    // Check session every 30 seconds instead of every minute for better responsiveness
    const sessionInterval = setInterval(checkSession, 30000);
    
    // Check immediately
    checkSession();

    return () => clearInterval(sessionInterval);
  }, [user]);

  // Auto-logout on session expiry
  const handleSessionExpired = useCallback(() => {
    console.log('🚨 Session expired, logging out...');
    authService.logout();
    setUser(null);
    setSessionWarning(false);
    
    // Show notification and redirect
    setTimeout(() => {
      if (window.confirm('Your session has expired for security reasons. Please login again.')) {
        window.location.href = '/login';
      } else {
        window.location.href = '/login';
      }
    }, 100);
  }, []);

  // Activity tracking to extend session - IMPROVED VERSION
  useEffect(() => {
    if (!user) return;

    // More comprehensive activity tracking
    const activities = [
      'mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart', 
      'click', 'focus', 'blur', 'resize', 'visibilitychange'
    ];
    
    let activityTimeout;
    
    const extendSessionOnActivity = () => {
      // Debounce activity tracking to prevent excessive calls
      clearTimeout(activityTimeout);
      activityTimeout = setTimeout(() => {
        if (authService.isAuthenticated()) {
          const extended = authService.extendSession();
          if (extended) {
            console.log('🔄 Session extended due to user activity');
            setSessionWarning(false); // Hide warning on activity
          }
        }
      }, 1000); // Wait 1 second after activity stops
    };

    // Add event listeners
    activities.forEach(activity => {
      document.addEventListener(activity, extendSessionOnActivity, { passive: true });
    });

    return () => {
      clearTimeout(activityTimeout);
      // Clean up event listeners
      activities.forEach(activity => {
        document.removeEventListener(activity, extendSessionOnActivity);
      });
    };
  }, [user]);

  // Page visibility change handler - extend session when page becomes visible
  useEffect(() => {
    if (!user) return;

    const handleVisibilityChange = () => {
      if (!document.hidden && authService.isAuthenticated()) {
        console.log('👁️ Page became visible, checking session...');
        const sessionInfo = authService.getSessionInfo();
        console.log('📊 Current session info:', sessionInfo);
        
        if (!sessionInfo.isValid) {
          handleSessionExpired();
        } else {
          // Extend session when returning to the page
          authService.extendSession();
        }
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [user, handleSessionExpired]);

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
    return !!(user && authService.isAuthenticated());
  };

  const extendSession = () => {
    if (user && authService.isAuthenticated()) {
      const extended = authService.extendSession();
      if (extended) {
        setSessionWarning(false);
        console.log('✅ Session manually extended');
      }
      return extended;
    }
    return false;
  };

  const refreshUserSession = async () => {
    console.log('🔄 Attempting to refresh user session...');
    
    try {
      const result = await authService.refreshToken();
      if (result.success) {
        console.log('✅ Session refreshed successfully');
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