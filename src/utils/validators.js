export const validateEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

export const validatePhone = (phone) => {
  if (!phone) return true; // Optional field
  const phoneRegex = /^[\+]?[0-9\s\-\(\)]+$/;
  return phoneRegex.test(phone);
};

export const validateRequired = (value) => {
  return value && value.toString().trim().length > 0;
};

export const validateMinLength = (value, minLength) => {
  return value && value.length >= minLength;
};

export const validateMaxLength = (value, maxLength) => {
  return !value || value.length <= maxLength;
};

export const validateYear = (year) => {
  const currentYear = new Date().getFullYear();
  const numericYear = parseInt(year);
  return numericYear >= 1900 && numericYear <= currentYear + 10;
};

export const validateCustomerForm = (data) => {
  const errors = {};
  
  if (!validateRequired(data.firstName)) {
    errors.firstName = 'First name is required';
  }
  
  if (!validateRequired(data.lastName)) {
    errors.lastName = 'Last name is required';
  }
  
  if (data.email && !validateEmail(data.email)) {
    errors.email = 'Please enter a valid email address';
  }
  
  if (data.phone && !validatePhone(data.phone)) {
    errors.phone = 'Please enter a valid phone number';
  }
  
  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
};

export const validateRadiatorForm = (data) => {
  const errors = {};
  
  if (!validateRequired(data.brand)) {
    errors.brand = 'Brand is required';
  }
  
  if (!validateRequired(data.code)) {
    errors.code = 'Code is required';
  }
  
  if (!validateRequired(data.name)) {
    errors.name = 'Name is required';
  }
  
  if (!validateYear(data.year)) {
    errors.year = 'Please enter a valid year between 1900 and ' + (new Date().getFullYear() + 10);
  }
  
  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
};
