// src/components/inventory/RadiatorImage.jsx
import React from 'react';
import { Package } from 'lucide-react';

const RadiatorImage = ({ 
  imageUrl, 
  alt, 
  className = "w-12 h-12", 
  showPlaceholder = true,
  rounded = "rounded-lg" 
}) => {
  if (!imageUrl && !showPlaceholder) {
    return null;
  }

  if (!imageUrl) {
    // Placeholder when no image
    return (
      <div className={`${className} ${rounded} bg-gray-100 border border-gray-200 flex items-center justify-center`}>
        <Package className="w-1/2 h-1/2 text-gray-400" />
      </div>
    );
  }

  return (
    <img
      src={imageUrl}
      alt={alt}
      className={`${className} ${rounded} object-cover border border-gray-200`}
      onError={(e) => {
        // If image fails to load, show placeholder
        e.target.style.display = 'none';
        e.target.nextSibling.style.display = 'flex';
      }}
      onLoad={(e) => {
        // Hide placeholder when image loads successfully
        if (e.target.nextSibling) {
          e.target.nextSibling.style.display = 'none';
        }
      }}
    />
  );
};

export default RadiatorImage;