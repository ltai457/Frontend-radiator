import React, { useState, useEffect } from 'react';
import { Button } from '../../common/ui/Button';
import { validateCustomerForm } from '../../../utils/validators';

const CustomerForm = ({ 
  initialData = {}, 
  onSubmit, 
  onCancel, 
  loading = false,
  submitLabel = "Submit",
  showActiveToggle = false 
}) => {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    company: '',
    address: '',
    isActive: true,
    ...initialData
  });
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});

  // Update form when initialData changes
  useEffect(() => {
    if (initialData && Object.keys(initialData).length > 0) {
      setFormData(prev => ({ ...prev, ...initialData }));
    }
  }, [JSON.stringify(initialData)]);

  // Real-time validation for contact fields
  const validateField = (name, value) => {
    const newErrors = { ...errors };
    
    switch (name) {
      case 'email':
        if (value && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
          newErrors.email = 'Please enter a valid email address';
        } else {
          delete newErrors.email;
        }
        break;
        
      case 'phone':
        if (value) {
          // More flexible NZ phone validation
          const phoneRegex = /^(\+?64|0)?[\s-]?[2-9]\d{1,2}[\s-]?\d{3}[\s-]?\d{3,4}$/;
          if (!phoneRegex.test(value.replace(/\s+/g, ''))) {
            newErrors.phone = 'Please enter a valid NZ phone number';
          } else {
            delete newErrors.phone;
          }
        } else {
          delete newErrors.phone;
        }
        break;
    }
    
    setErrors(newErrors);
  };

  // Auto-format phone numbers
  const formatPhoneNumber = (value) => {
    // Remove all non-digits
    const cleaned = value.replace(/\D/g, '');
    
    if (cleaned.startsWith('64')) {
      // International format: +64 21 123 4567
      const formatted = cleaned.slice(2);
      if (formatted.length >= 8) {
        return `+64 ${formatted.slice(0, 2)} ${formatted.slice(2, 5)} ${formatted.slice(5)}`.trim();
      } else if (formatted.length >= 5) {
        return `+64 ${formatted.slice(0, 2)} ${formatted.slice(2)}`;
      } else if (formatted.length >= 2) {
        return `+64 ${formatted}`;
      }
    } else if (cleaned.startsWith('0')) {
      // National format: 021 123 4567
      if (cleaned.length >= 8) {
        return `${cleaned.slice(0, 3)} ${cleaned.slice(3, 6)} ${cleaned.slice(6)}`.trim();
      } else if (cleaned.length >= 6) {
        return `${cleaned.slice(0, 3)} ${cleaned.slice(3)}`;
      }
    }
    
    return value; // Return original if doesn't match patterns
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    let newValue = type === 'checkbox' ? checked : value;
    
    // Auto-format phone number
    if (name === 'phone' && type !== 'checkbox') {
      newValue = formatPhoneNumber(value);
    }
    
    setFormData(prev => ({
      ...prev,
      [name]: newValue
    }));
    
    // Mark field as touched
    setTouched(prev => ({ ...prev, [name]: true }));
    
    // Real-time validation for contact fields
    if (name === 'email' || name === 'phone') {
      validateField(name, newValue);
    }
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleBlur = (e) => {
    const { name, value } = e.target;
    setTouched(prev => ({ ...prev, [name]: true }));
    
    // Validate on blur for contact fields
    if (name === 'email' || name === 'phone') {
      validateField(name, value);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Mark all fields as touched
    const allTouched = Object.keys(formData).reduce((acc, key) => {
      acc[key] = true;
      return acc;
    }, {});
    setTouched(allTouched);
    
    const validation = validateCustomerForm(formData);
    if (!validation.isValid) {
      setErrors(validation.errors);
      return;
    }

    // Clean up data before submitting
    const cleanedData = {
      ...formData,
      firstName: formData.firstName.trim(),
      lastName: formData.lastName.trim(),
      email: formData.email.trim() || null,
      phone: formData.phone.trim() || null,
      company: formData.company.trim() || null,
      address: formData.address.trim() || null,
    };

    await onSubmit(cleanedData);
  };

  // Helper to get field validation status
  const getFieldClass = (fieldName) => {
    const hasError = errors[fieldName] && touched[fieldName];
    const isValid = touched[fieldName] && !errors[fieldName] && formData[fieldName];
    
    if (hasError) return 'border-red-500 bg-red-50';
    if (isValid && (fieldName === 'email' || fieldName === 'phone')) return 'border-green-500 bg-green-50';
    return 'border-gray-300 hover:border-gray-400';
  };

  return (
    <div className="space-y-6">
      {/* Personal Information */}
      <div className="space-y-4">
        <h4 className="font-medium text-gray-900 border-b pb-2">Personal Information</h4>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              First Name *
            </label>
            <input
              type="text"
              name="firstName"
              value={formData.firstName}
              onChange={handleChange}
              onBlur={handleBlur}
              className={`w-full px-3 py-2 border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${getFieldClass('firstName')}`}
              placeholder="John"
              disabled={loading}
            />
            {errors.firstName && touched.firstName && (
              <p className="text-red-500 text-xs mt-1">{errors.firstName}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Last Name *
            </label>
            <input
              type="text"
              name="lastName"
              value={formData.lastName}
              onChange={handleChange}
              onBlur={handleBlur}
              className={`w-full px-3 py-2 border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${getFieldClass('lastName')}`}
              placeholder="Smith"
              disabled={loading}
            />
            {errors.lastName && touched.lastName && (
              <p className="text-red-500 text-xs mt-1">{errors.lastName}</p>
            )}
          </div>
        </div>
      </div>

      {/* Contact Information - Enhanced Section */}
      <div className="bg-blue-50 rounded-lg p-4 space-y-4">
        <h4 className="font-medium text-gray-900 flex items-center gap-2">
          📞 Contact Information
          <span className="text-xs font-normal text-gray-600">(Optional but recommended)</span>
        </h4>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Email Address
          </label>
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            onBlur={handleBlur}
            className={`w-full px-3 py-2 border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${getFieldClass('email')}`}
            placeholder="john.smith@example.com"
            disabled={loading}
          />
          {errors.email && touched.email && (
            <p className="text-red-500 text-xs mt-1">{errors.email}</p>
          )}
          {touched.email && !errors.email && formData.email && (
            <p className="text-green-600 text-xs mt-1">✓ Valid email address</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Phone Number
          </label>
          <input
            type="tel"
            name="phone"
            value={formData.phone}
            onChange={handleChange}
            onBlur={handleBlur}
            className={`w-full px-3 py-2 border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${getFieldClass('phone')}`}
            placeholder="+64 21 123 4567"
            disabled={loading}
          />
          {errors.phone && touched.phone && (
            <p className="text-red-500 text-xs mt-1">{errors.phone}</p>
          )}
          {touched.phone && !errors.phone && formData.phone && (
            <p className="text-green-600 text-xs mt-1">✓ Valid phone number</p>
          )}
          <p className="text-xs text-gray-500 mt-1">
            Supports NZ formats: +64 21 123 4567 or 021 123 4567
          </p>
        </div>
      </div>

      {/* Business Information */}
      <div className="space-y-4">
        <h4 className="font-medium text-gray-900 border-b pb-2">Business Information</h4>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Company
          </label>
          <input
            type="text"
            name="company"
            value={formData.company}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 hover:border-gray-400 transition-colors"
            placeholder="Company Name (Optional)"
            disabled={loading}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Address
          </label>
          <textarea
            name="address"
            value={formData.address}
            onChange={handleChange}
            rows={3}
            className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 hover:border-gray-400 transition-colors"
            placeholder="123 Main Street, Auckland 1010, New Zealand"
            disabled={loading}
          />
        </div>
      </div>

      {/* Active Status */}
      {showActiveToggle && (
        <div className="bg-gray-50 rounded-lg p-4">
          <div className="flex items-center">
            <input
              type="checkbox"
              name="isActive"
              id="isActive"
              checked={formData.isActive}
              onChange={handleChange}
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              disabled={loading}
            />
            <label htmlFor="isActive" className="ml-2 block text-sm text-gray-900">
              Customer is active
            </label>
          </div>
          {!formData.isActive && (
            <p className="text-xs text-gray-500 mt-1">
              Inactive customers won't appear in sales dropdowns
            </p>
          )}
        </div>
      )}

      {/* General Errors */}
      {errors.general && (
        <div className="bg-red-50 border border-red-200 text-red-800 px-3 py-2 rounded text-sm">
          {errors.general}
        </div>
      )}

      {/* Form Actions */}
      <div className="flex justify-end space-x-3 pt-4 border-t">
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          disabled={loading}
        >
          Cancel
        </Button>
        <Button
          onClick={handleSubmit}
          loading={loading}
          disabled={loading}
        >
          {submitLabel}
        </Button>
      </div>

      {/* Contact Tips */}
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 text-sm">
        <p className="font-medium text-yellow-800 mb-1">💡 Contact Information Tips:</p>
        <ul className="text-yellow-700 space-y-1">
          <li>• Email and phone are optional but help with customer communication</li>
          <li>• Phone numbers are auto-formatted for New Zealand</li>
          <li>• All contact information can be updated anytime</li>
        </ul>
      </div>
    </div>
  );
};

export default CustomerForm;