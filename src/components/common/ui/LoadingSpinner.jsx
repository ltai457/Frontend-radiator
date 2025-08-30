// src/components/common/ui/LoadingSpinner.jsx
import React from "react";

export const LoadingSpinner = ({ size = "md", text }) => {
  const sizeClasses = {
    sm: "w-4 h-4 border-2",
    md: "w-6 h-6 border-2",
    lg: "w-10 h-10 border-4",
  };

  return (
    <div className="flex items-center justify-center gap-2 p-4">
      <div
        className={`animate-spin rounded-full border-t-transparent border-blue-600 ${sizeClasses[size]}`}
        role="status"
      />
      {text && <span className="text-gray-600 text-sm">{text}</span>}
    </div>
  );
};
