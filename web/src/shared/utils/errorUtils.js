/**
 * Utility functions for handling API errors
 */

/**
 * Extracts error message from API error response
 * Handles multiple error response structures from different APIs
 * 
 * @param {Object} error - The error object from API response
 * @returns {string} - Formatted error message
 */
export const extractErrorMessage = (error) => {
  console.log('Full error object:', error);
  console.log('Error response data:', error?.response?.data);
  
  // Check if error has response data with errors array
  if (error?.response?.data?.errors && Array.isArray(error.response.data.errors)) {
    console.log('Found errors array:', error.response.data.errors);
    return error.response.data.errors.join(', ');
  }
  
  // Check if error has response data with errors object (key-value pairs)
  if (error?.response?.data?.errors && typeof error.response.data.errors === 'object') {
    console.log('Found errors object:', error.response.data.errors);
    const errorMessages = Object.values(error.response.data.errors).flat();
    return errorMessages.join(', ');
  }
  
  // Check if the main error object has an errors property (direct access)
  if (error?.errors && Array.isArray(error.errors)) {
    console.log('Found direct errors array:', error.errors);
    return error.errors.join(', ');
  }
  
  // Check if the main error object has an errors property as object
  if (error?.errors && typeof error.errors === 'object') {
    console.log('Found direct errors object:', error.errors);
    const errorMessages = Object.values(error.errors).flat();
    return errorMessages.join(', ');
  }
  
  // Check if error has response data with message
  if (error?.response?.data?.message) {
    console.log('Found message:', error.response.data.message);
    return error.response.data.message;
  }
  
  // Check if error has response data with title
  if (error?.response?.data?.title) {
    console.log('Found title:', error.response.data.title);
    return error.response.data.title;
  }
  
  // Check if error has a message property
  if (error?.message) {
    console.log('Found error message:', error.message);
    return error.message;
  }
  
  // Fallback to generic message
  console.log('Using fallback message');
  return "An error occurred";
};

/**
 * Extracts error message without console logging (for production use)
 * 
 * @param {Object} error - The error object from API response
 * @returns {string} - Formatted error message
 */
export const extractErrorMessageSilent = (error) => {
  // Check if error has response data with errors array
  if (error?.response?.data?.errors && Array.isArray(error.response.data.errors)) {
    return error.response.data.errors.join(', ');
  }
  
  // Check if error has response data with errors object (key-value pairs)
  if (error?.response?.data?.errors && typeof error.response.data.errors === 'object') {
    const errorMessages = Object.values(error.response.data.errors).flat();
    return errorMessages.join(', ');
  }
  
  // Check if the main error object has an errors property (direct access)
  if (error?.errors && Array.isArray(error.errors)) {
    return error.errors.join(', ');
  }
  
  // Check if the main error object has an errors property as object
  if (error?.errors && typeof error.errors === 'object') {
    const errorMessages = Object.values(error.errors).flat();
    return errorMessages.join(', ');
  }
  
  // Check if error has response data with message
  if (error?.response?.data?.message) {
    return error.response.data.message;
  }
  
  // Check if error has response data with title
  if (error?.response?.data?.title) {
    return error.response.data.title;
  }
  
  // Check if error has a message property
  if (error?.message) {
    return error.message;
  }
  
  // Fallback to generic message
  return "An error occurred";
};

/**
 * Formats validation errors for form display
 * 
 * @param {Object} error - The error object from API response
 * @returns {Object} - Object with field names as keys and error messages as values
 */
export const extractValidationErrors = (error) => {
  const validationErrors = {};
  
  // Check if error has response data with errors object (validation errors)
  if (error?.response?.data?.errors && typeof error.response.data.errors === 'object') {
    Object.keys(error.response.data.errors).forEach(field => {
      const fieldErrors = error.response.data.errors[field];
      if (Array.isArray(fieldErrors)) {
        validationErrors[field] = fieldErrors.join(', ');
      } else {
        validationErrors[field] = fieldErrors;
      }
    });
  }
  
  return validationErrors;
};

/**
 * Checks if the error is a validation error (400 status with field-specific errors)
 * 
 * @param {Object} error - The error object from API response
 * @returns {boolean} - True if it's a validation error
 */
export const isValidationError = (error) => {
  return error?.response?.status === 400 && 
         error?.response?.data?.errors && 
         typeof error.response.data.errors === 'object';
};

/**
 * Checks if the error is a server error (5xx status)
 * 
 * @param {Object} error - The error object from API response
 * @returns {boolean} - True if it's a server error
 */
export const isServerError = (error) => {
  return error?.response?.status >= 500;
};

/**
 * Checks if the error is a network error
 * 
 * @param {Object} error - The error object from API response
 * @returns {boolean} - True if it's a network error
 */
export const isNetworkError = (error) => {
  return !error?.response && error?.message === 'Network Error';
};

/**
 * Gets the HTTP status code from the error
 * 
 * @param {Object} error - The error object from API response
 * @returns {number|null} - HTTP status code or null if not available
 */
export const getErrorStatus = (error) => {
  return error?.response?.status || null;
};