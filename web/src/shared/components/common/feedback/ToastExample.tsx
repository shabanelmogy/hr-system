import React from 'react';
import { showToast, useToast } from './Toast';

/**
 * Example component demonstrating how to use the Toast component
 * This is for reference and can be removed in production
 */
const ToastExample: React.FC = () => {
  // const toast = useToast(); // Unused variable

  // Example API call simulation
  const simulateApiCall = (shouldSucceed: boolean = true): Promise<{ message: string }> => {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        if (shouldSucceed) {
          resolve({ message: 'Operation completed successfully!' });
        } else {
          reject(new Error('Something went wrong!'));
        }
      }, 2000);
    });
  };

  const handleSuccess = () => {
    showToast.success('Country created successfully!');
  };

  const handleError = () => {
    showToast.error('Failed to delete country. Please try again.');
  };

  const handleWarning = () => {
    showToast.warning('This action cannot be undone!');
  };

  const handleInfo = () => {
    showToast.info('New features are available in the settings.');
  };

  const handleLoading = () => {
    const loadingToast = showToast.loading('Saving country...');
    
    // Simulate API call
    setTimeout(() => {
      showToast.dismiss(loadingToast);
      showToast.success('Country saved successfully!');
    }, 3000);
  };

  const handlePromise = () => {
    showToast.promise(
      simulateApiCall(true),
      {
        loading: 'Creating country...',
        success: (data) => `Success: ${data.message}`,
        error: (error) => `Error: ${error.message}`,
      }
    );
  };

  const handlePromiseError = () => {
    showToast.promise(
      simulateApiCall(false),
      {
        loading: 'Deleting country...',
        success: 'Country deleted successfully!',
        error: (error) => `Failed to delete: ${error.message}`,
      }
    );
  };

  const handleCustom = () => {
    showToast.custom('🎉 Welcome to the HR Management System!', {
      duration: 6000,
      style: {
        background: 'linear-gradient(90deg, #667eea 0%, #764ba2 100%)',
        color: '#fff',
        fontWeight: 'bold',
      },
    });
  };

  const handleMultiple = () => {
    showToast.success('First notification');
    setTimeout(() => showToast.info('Second notification'), 500);
    setTimeout(() => showToast.warning('Third notification'), 1000);
  };

  const handleDismissAll = () => {
    showToast.dismiss();
  };

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Toast Component Examples</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {/* Basic Toasts */}
        <div className="space-y-3">
          <h3 className="font-semibold text-lg">Basic Toasts</h3>
          
          <button
            onClick={handleSuccess}
            className="w-full px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition-colors"
          >
            Success Toast
          </button>
          
          <button
            onClick={handleError}
            className="w-full px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition-colors"
          >
            Error Toast
          </button>
          
          <button
            onClick={handleWarning}
            className="w-full px-4 py-2 bg-yellow-600 text-white rounded hover:bg-yellow-700 transition-colors"
          >
            Warning Toast
          </button>
          
          <button
            onClick={handleInfo}
            className="w-full px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
          >
            Info Toast
          </button>
        </div>

        {/* Advanced Toasts */}
        <div className="space-y-3">
          <h3 className="font-semibold text-lg">Advanced Toasts</h3>
          
          <button
            onClick={handleLoading}
            className="w-full px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700 transition-colors"
          >
            Loading Toast
          </button>
          
          <button
            onClick={handlePromise}
            className="w-full px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700 transition-colors"
          >
            Promise Toast (Success)
          </button>
          
          <button
            onClick={handlePromiseError}
            className="w-full px-4 py-2 bg-pink-600 text-white rounded hover:bg-pink-700 transition-colors"
          >
            Promise Toast (Error)
          </button>
          
          <button
            onClick={handleCustom}
            className="w-full px-4 py-2 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded hover:from-purple-700 hover:to-blue-700 transition-all"
          >
            Custom Toast
          </button>
        </div>

        {/* Utility Functions */}
        <div className="space-y-3">
          <h3 className="font-semibold text-lg">Utilities</h3>
          
          <button
            onClick={handleMultiple}
            className="w-full px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700 transition-colors"
          >
            Multiple Toasts
          </button>
          
          <button
            onClick={handleDismissAll}
            className="w-full px-4 py-2 bg-gray-800 text-white rounded hover:bg-gray-900 transition-colors"
          >
            Dismiss All
          </button>
        </div>
      </div>

      {/* Usage Examples */}
      <div className="mt-8 p-4 bg-gray-50 rounded-lg">
        <h3 className="font-semibold text-lg mb-3">Usage Examples</h3>
        
        <div className="space-y-4 text-sm">
          <div>
            <h4 className="font-medium">Basic Usage:</h4>
            <pre className="bg-gray-800 text-green-400 p-2 rounded mt-1 overflow-x-auto">
{`import { showToast } from '@/shared/components';

// Simple success message
showToast.success('Operation completed!');

// Error with custom duration
showToast.error('Something went wrong!', { duration: 6000 });`}
            </pre>
          </div>
          
          <div>
            <h4 className="font-medium">With Hook:</h4>
            <pre className="bg-gray-800 text-green-400 p-2 rounded mt-1 overflow-x-auto">
{`import { useToast } from '@/shared/components';

const MyComponent = () => {
  const toast = useToast();
  
  const handleSave = () => {
    toast.success('Data saved successfully!');
  };
};`}
            </pre>
          </div>
          
          <div>
            <h4 className="font-medium">Promise Toast:</h4>
            <pre className="bg-gray-800 text-green-400 p-2 rounded mt-1 overflow-x-auto">
{`showToast.promise(
  apiCall(),
  {
    loading: 'Saving...',
    success: 'Saved successfully!',
    error: 'Failed to save',
  }
);`}
            </pre>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ToastExample;