# Error Utilities

This module provides reusable utility functions for handling API errors across the application.

## Functions

### `extractErrorMessage(error)`

Extracts user-friendly error messages from API error responses with detailed console logging for debugging.

**Parameters:**
- `error` (Object): The error object from API response

**Returns:**
- `string`: Formatted error message

**Usage:**
```javascript
import { extractErrorMessage } from '@/shared/utils';

// In a mutation error handler
const errorMessage = extractErrorMessage(error);
showError(errorMessage);
```

### `extractErrorMessageSilent(error)`

Same as `extractErrorMessage` but without console logging (for production use).

**Usage:**
```javascript
import { extractErrorMessageSilent } from '@/shared/utils';

const errorMessage = extractErrorMessageSilent(error);
```

### `extractValidationErrors(error)`

Extracts field-specific validation errors for form display.

**Returns:**
- `Object`: Object with field names as keys and error messages as values

**Usage:**
```javascript
import { extractValidationErrors } from '@/shared/utils';

const validationErrors = extractValidationErrors(error);
// Result: { name: 'Name is required', email: 'Email must be valid' }
```

### `isValidationError(error)`

Checks if the error is a validation error (400 status with field-specific errors).

**Returns:**
- `boolean`: True if it's a validation error

**Usage:**
```javascript
import { isValidationError } from '@/shared/utils';

if (isValidationError(error)) {
  // Handle validation errors
  const validationErrors = extractValidationErrors(error);
} else {
  // Handle general errors
  const errorMessage = extractErrorMessage(error);
}
```

### `isServerError(error)`

Checks if the error is a server error (5xx status).

**Usage:**
```javascript
import { isServerError } from '@/shared/utils';

if (isServerError(error)) {
  showError('Server error occurred. Please try again later.');
}
```

### `isNetworkError(error)`

Checks if the error is a network error.

**Usage:**
```javascript
import { isNetworkError } from '@/shared/utils';

if (isNetworkError(error)) {
  showError('Network error. Please check your connection.');
}
```

### `getErrorStatus(error)`

Gets the HTTP status code from the error.

**Returns:**
- `number|null`: HTTP status code or null if not available

**Usage:**
```javascript
import { getErrorStatus } from '@/shared/utils';

const status = getErrorStatus(error);
if (status === 401) {
  // Handle unauthorized
} else if (status === 403) {
  // Handle forbidden
}
```

## Error Response Structures Supported

The utilities handle multiple error response structures:

### 1. Errors Array
```javascript
{
  response: {
    data: {
      errors: ['Country is in use by states', 'Another error']
    }
  }
}
```

### 2. Errors Object (Validation)
```javascript
{
  response: {
    data: {
      errors: {
        name: ['Name is required'],
        email: ['Email must be valid', 'Email already exists']
      }
    }
  }
}
```

### 3. Direct Errors
```javascript
{
  errors: ['Direct error message']
}
```

### 4. Message/Title
```javascript
{
  response: {
    data: {
      message: 'Bad Request',
      title: 'Validation Failed'
    }
  }
}
```

## Example Usage in Components

### TanStack Query Mutations
```javascript
import { extractErrorMessage } from '@/shared/utils';

const createMutation = useCreateItem({
  onError: (error) => {
    const errorMessage = extractErrorMessage(error);
    showError(errorMessage);
  }
});
```

### Form Validation
```javascript
import { isValidationError, extractValidationErrors, extractErrorMessage } from '@/shared/utils';

const handleSubmit = async (data) => {
  try {
    await submitForm(data);
  } catch (error) {
    if (isValidationError(error)) {
      const validationErrors = extractValidationErrors(error);
      setFieldErrors(validationErrors);
    } else {
      const errorMessage = extractErrorMessage(error);
      showError(errorMessage);
    }
  }
};
```

### Error Boundary
```javascript
import { extractErrorMessage, isServerError } from '@/shared/utils';

const ErrorBoundary = ({ error }) => {
  const errorMessage = extractErrorMessage(error);
  const isServer = isServerError(error);
  
  return (
    <div>
      <h2>{isServer ? 'Server Error' : 'Application Error'}</h2>
      <p>{errorMessage}</p>
    </div>
  );
};
```