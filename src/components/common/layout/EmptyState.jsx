import React from 'react';
import { Button } from '../ui/Button';

export const EmptyState = ({ 
  icon: Icon,
  title,
  description,
  action,
  actionLabel,
  onAction 
}) => {
  return (
    <div className="text-center py-12">
      {Icon && <Icon className="w-16 h-16 text-gray-300 mx-auto mb-4" />}
      <h3 className="text-lg font-medium text-gray-900 mb-2">{title}</h3>
      <p className="text-gray-500 mb-4">{description}</p>
      {action && onAction && (
        <Button onClick={onAction}>
          {actionLabel}
        </Button>
      )}
    </div>
  );
};