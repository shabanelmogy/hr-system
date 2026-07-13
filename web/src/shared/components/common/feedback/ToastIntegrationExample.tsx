import React from 'react';
import { useCreateCountry, useUpdateCountry, useDeleteCountry } from '@/features/basicData/countries/hooks/useCountryQueries';
import { showToast } from './Toast';

/**
 * Example showing how to integrate Toast with TanStack Query mutations
 * This demonstrates the recommended pattern for using toasts with API operations
 */
const ToastIntegrationExample: React.FC = () => {
  
  // Country mutations with toast integration
  const createCountryMutation = useCreateCountry({
    onSuccess: (newCountry) => {
      showToast.success(`Country "${newCountry.nameEn}" created successfully!`);
    },
    onError: (error: any) => {
      showToast.error(error?.message || 'Failed to create country');
    },
  });

  const updateCountryMutation = useUpdateCountry({
    onSuccess: (updatedCountry) => {
      showToast.success(`Country "${updatedCountry.nameEn}" updated successfully!`);
    },
    onError: (error: any) => {
      showToast.error(error?.message || 'Failed to update country');
    },
  });

  const deleteCountryMutation = useDeleteCountry({
    onSuccess: () => {
      showToast.success('Country deleted successfully!');
    },
    onError: (error: any) => {
      showToast.error(error?.message || 'Failed to delete country');
    },
  });

  // Example handlers
  const handleCreateCountry = () => {
    const newCountry = {
      nameEn: 'New Country',
      nameAr: 'دولة جديدة',
      alpha2Code: 'NC',
      alpha3Code: 'NCO',
      phoneCode: '+999',
      currencyCode: 'NCU',
    };

    createCountryMutation.mutate(newCountry);
  };

  const handleUpdateCountry = () => {
    const updatedCountry = {
      id: 1,
      nameEn: 'Updated Country',
      nameAr: 'دولة محدثة',
      alpha2Code: 'UC',
      alpha3Code: 'UPC',
      phoneCode: '+888',
      currencyCode: 'UPC',
    };

    updateCountryMutation.mutate(updatedCountry);
  };

  const handleDeleteCountry = () => {
    // Show confirmation toast first
    showToast.warning('Are you sure you want to delete this country?');
    
    // In real app, you'd show a confirmation dialog
    setTimeout(() => {
      deleteCountryMutation.mutate(1);
    }, 2000);
  };

  // Promise-based example
  const handlePromiseExample = () => {
    const apiCall = new Promise((resolve, reject) => {
      setTimeout(() => {
        Math.random() > 0.5 ? resolve('Success!') : reject(new Error('API Error'));
      }, 2000);
    });

    showToast.promise(
      apiCall,
      {
        loading: 'Processing request...',
        success: 'Operation completed successfully!',
        error: (err) => `Error: ${err.message}`,
      }
    );
  };

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Toast Integration Examples</h1>
      
      <div className="space-y-4">
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h3 className="font-semibold text-blue-800 mb-2">TanStack Query Integration</h3>
          <p className="text-blue-700 text-sm mb-4">
            These examples show how to integrate toasts with TanStack Query mutations.
          </p>
          
          <div className="flex gap-3">
            <button
              onClick={handleCreateCountry}
              disabled={createCountryMutation.isPending}
              className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-50 transition-colors"
            >
              {createCountryMutation.isPending ? 'Creating...' : 'Create Country'}
            </button>
            
            <button
              onClick={handleUpdateCountry}
              disabled={updateCountryMutation.isPending}
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50 transition-colors"
            >
              {updateCountryMutation.isPending ? 'Updating...' : 'Update Country'}
            </button>
            
            <button
              onClick={handleDeleteCountry}
              disabled={deleteCountryMutation.isPending}
              className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 disabled:opacity-50 transition-colors"
            >
              {deleteCountryMutation.isPending ? 'Deleting...' : 'Delete Country'}
            </button>
          </div>
        </div>

        <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
          <h3 className="font-semibold text-purple-800 mb-2">Promise Toast Example</h3>
          <p className="text-purple-700 text-sm mb-4">
            This shows how to use promise toasts for async operations.
          </p>
          
          <button
            onClick={handlePromiseExample}
            className="px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700 transition-colors"
          >
            Test Promise Toast
          </button>
        </div>

        <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
          <h3 className="font-semibold text-gray-800 mb-2">Code Examples</h3>
          
          <div className="space-y-3 text-sm">
            <div>
              <h4 className="font-medium">Mutation with Toast:</h4>
              <pre className="bg-gray-800 text-green-400 p-2 rounded mt-1 overflow-x-auto">
{`const createMutation = useCreateCountry({
  onSuccess: (data) => {
    showToast.success(\`Country "\${data.nameEn}" created!\`);
  },
  onError: (error) => {
    showToast.error(error?.message || 'Failed to create');
  },
});`}
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
    </div>
  );
};

export default ToastIntegrationExample;