// src/utils/toast.js
// Simple toast notification utility
// You can replace this with a proper toast library like react-hot-toast or react-toastify if needed

export const toast = {
  success: (message) => {
    console.log('✅ Success:', message);
    // For now, using browser alert. Replace with proper toast UI component
    if (typeof window !== 'undefined') {
      // You can integrate with a toast library here
      alert(`✅ ${message}`);
    }
  },

  error: (message) => {
    console.error('❌ Error:', message);
    if (typeof window !== 'undefined') {
      alert(`❌ ${message}`);
    }
  },

  info: (message) => {
    console.log('ℹ️ Info:', message);
    if (typeof window !== 'undefined') {
      alert(`ℹ️ ${message}`);
    }
  },

  warning: (message) => {
    console.warn('⚠️ Warning:', message);
    if (typeof window !== 'undefined') {
      alert(`⚠️ ${message}`);
    }
  },
};

// For better UX, consider installing react-hot-toast:
// npm install react-hot-toast
// 
// Then replace this file with:
// import { toast as hotToast } from 'react-hot-toast';
// export const toast = hotToast;