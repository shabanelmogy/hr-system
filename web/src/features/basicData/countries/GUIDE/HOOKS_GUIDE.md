# Countries Hooks Documentation

## Overview

The Countries feature uses custom React hooks to manage data fetching, state management, and business logic. These hooks leverage TanStack Query (React Query) for efficient data management and provide a clean separation of concerns between UI components and data logic.

## Hook Files

### 1. useCountryQueries.ts
### 2. useCountryGridLogic.ts

---

## useCountryQueries.ts

**Purpose**: Provides TanStack Query hooks for all country-related API operations including queries and mutations.

### Query Keys

```typescript
export const countryKeys = {
  all: ["countries"] as const,
  list: () => [...countryKeys.all, "list"] as const,
  detail: (id: string | number) => [...countryKeys.all, "detail", id] as const,
};
```

**Purpose**: Centralized query key management for consistent caching and invalidation.

### Query Hooks

#### useCountries

```typescript
export const useCountries = (options?: UseQueryOptions<Country[], Error>) =>
  useQuery({
    queryKey: countryKeys.list(),
    queryFn: CountryService.getAll,
    staleTime: 5 * 60 * 1000, // 5 minutes
    ...options,
  });
```

**Purpose**: Fetches all countries from the API.

**Features**:
- 5-minute stale time for performance
- Automatic background refetching
- Error handling
- Loading states
- Customizable options

**Usage**:
```typescript
const { data: countries, isLoading, error, refetch } = useCountries();
```

#### useCountry

```typescript
export const useCountry = (id: string | number | null | undefined, options?: UseQueryOptions<Country, Error>) =>
  useQuery({
    queryKey: countryKeys.detail(id!),
    queryFn: () => CountryService.getById(id!),
    enabled: !!id, // Only run when ID is provided
    staleTime: 5 * 60 * 1000,
    ...options,
  });
```

**Purpose**: Fetches a single country by ID.

**Features**:
- Conditional execution (only when ID is provided)
- Individual country caching
- 5-minute stale time

**Usage**:
```typescript
const { data: country, isLoading } = useCountry(countryId);
```

#### useCountrySearch

```typescript
export const useCountrySearch = (
  searchTerm: string,
  existingCountries: Country[] = []
) =>
  useMemo(() => {
    if (!searchTerm.trim()) return existingCountries;
    return CountryService.searchCountries(existingCountries, searchTerm);
  }, [searchTerm, existingCountries]);
```

**Purpose**: Client-side search functionality for countries.

**Features**:
- Memoized for performance
- Searches across multiple fields
- Includes state search
- Returns original data when no search term

**Usage**:
```typescript
const filteredCountries = useCountrySearch(searchTerm, countries);
```

### Mutation Hooks

#### Generic Mutation Factory

```typescript
function useCountryMutation<TData = unknown, TVariables = unknown>(
  mutationFn: (variables: TVariables) => Promise<TData>,
  options?: UseMutationOptions<TData, Error, TVariables>
) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn,
    ...options,
    onSuccess: (data, variables, context) => {
      queryClient.invalidateQueries({ queryKey: countryKeys.all });
      if (options && typeof options.onSuccess === "function") {
        options.onSuccess(data, variables, context);
      }
    },
  });
}
```

**Purpose**: Factory function for creating mutations with automatic cache invalidation.

#### useCreateCountry

```typescript
export const useCreateCountry = (options?: UseMutationOptions<Country, Error, Partial<Country>>) =>
  useCountryMutation(CountryService.create, options);
```

**Purpose**: Creates a new country.

**Features**:
- Automatic cache invalidation
- Success/error callbacks
- Loading states

**Usage**:
```typescript
const createMutation = useCreateCountry({
  onSuccess: (newCountry) => {
    showToast.success(`Country "${newCountry.nameEn}" created!`);
  },
  onError: (error) => {
    showToast.error("Failed to create country");
  }
});

// Usage
createMutation.mutate(countryData);
```

#### useUpdateCountry

```typescript
export const useUpdateCountry = (options?: UseMutationOptions<Country, Error, Partial<Country>>) =>
  useCountryMutation(CountryService.update, options);
```

**Purpose**: Updates an existing country.

**Usage**:
```typescript
const updateMutation = useUpdateCountry({
  onSuccess: (updatedCountry) => {
    showToast.success(`Country "${updatedCountry.nameEn}" updated!`);
  }
});

updateMutation.mutate({ id: countryId, ...updatedData });
```

#### useDeleteCountry

```typescript
export const useDeleteCountry = (options?: UseMutationOptions<string | number, Error, string | number>) =>
  useCountryMutation<string | number, string | number>(CountryService.delete, options);
```

**Purpose**: Deletes a country (soft delete).

**Usage**:
```typescript
const deleteMutation = useDeleteCountry({
  onSuccess: () => {
    showToast.success("Country deleted successfully!");
  }
});

deleteMutation.mutate(countryId);
```

### Utility Hooks

#### useInvalidateCountries

```typescript
export const useInvalidateCountries = () => {
  const queryClient = useQueryClient();
  return () => queryClient.invalidateQueries({ queryKey: countryKeys.all });
};
```

**Purpose**: Provides a function to manually invalidate country queries.

**Usage**:
```typescript
const invalidateCountries = useInvalidateCountries();

// Later...
invalidateCountries(); // Refetch all country data
```

---

## useCountryGridLogic.ts

**Purpose**: Comprehensive hook that manages all business logic for the countries grid/list view, including CRUD operations, dialog management, and navigation.

### Return Interface

```typescript
interface UseCountryGridLogicReturn {
  // State
  dialogType: DialogType;
  selectedCountry: Country | null;
  loading: boolean;
  countries: Country[];
  apiRef: React.MutableRefObject<GridApiCommon>;
  error: any;
  isFetching: boolean;

  // Dialog methods
  openDialog: (type: DialogType, country?: Country | null) => void;
  closeDialog: () => void;

  // Form and action handlers
  handleFormSubmit: (formdata: CreateCountryRequest) => Promise<void>;
  handleDelete: () => Promise<void>;
  handleRefresh: () => void;

  // Action methods
  onEdit: (country: Country) => void;
  onView: (country: Country) => void;
  onDelete: (country: Country) => void;
  onAdd: () => void;

  // Mutation states
  isCreating: boolean;
  isUpdating: boolean;
  isDeleting: boolean;

  // Navigation state
  lastAddedId: number | null;
  lastEditedId: number | null;
  lastDeletedIndex: number | null;
}
```

### Key Features

#### 1. Data Management
- Fetches countries using `useCountries`
- Handles loading and error states
- Provides stable country data with memoization

#### 2. Dialog Management
```typescript
type DialogType = "add" | "edit" | "view" | "delete" | null;

const openDialog = useCallback((type: DialogType, country: Country | null = null) => {
  setDialogType(type);
  setSelectedCountry(country);
}, []);
```

#### 3. CRUD Operations

**Create Country**:
```typescript
const createCountryMutation = useCreateCountry({
  onSuccess: (newCountry: Country) => {
    showToast.success(`Country "${newCountry.nameEn}" created successfully!`);
    setLastAddedRowId(newCountry.id);
    setNewRowAdded(true);
    // Auto-scroll and highlight logic
  },
  onError: (error) => {
    showToast.error("Failed to create country");
  },
});
```

**Update Country**:
```typescript
const updateCountryMutation = useUpdateCountry({
  onSuccess: (updatedCountry: Country) => {
    showToast.success(`Country "${updatedCountry.nameEn}" updated successfully!`);
    setLastEditedRowId(updatedCountry.id);
    setRowEdited(true);
  }
});
```

**Delete Country**:
```typescript
const deleteCountryMutation = useDeleteCountry({
  onSuccess: () => {
    showToast.success("Country deleted successfully!");
    setRowDeleted(true);
  }
});
```

#### 4. Grid Navigation & Highlighting

**Auto-scroll to New Items**:
- Automatically navigates to newly created countries
- Highlights the new row for 4 seconds
- Handles pagination automatically

**Edit Navigation**:
- Scrolls to edited items
- Maintains selection state
- Provides visual feedback

**Delete Navigation**:
- Navigates to previous item after deletion
- Handles edge cases (first/last item)
- Maintains grid state

#### 5. Form Handling

```typescript
const handleFormSubmit = useCallback(
  async (formdata: CreateCountryRequest) => {
    try {
      if (dialogType === "edit" && selectedCountry?.id) {
        await updateCountryMutation.mutateAsync({
          ...formdata,
          id: selectedCountry.id,
        });
      } else if (dialogType === "add") {
        await createCountryMutation.mutateAsync(formdata);
      }
    } catch (error) {
      console.error("Form submission error:", error);
    }
  },
  [dialogType, selectedCountry, updateCountryMutation, createCountryMutation]
);
```

#### 6. Error Handling
- Displays toast notifications for all operations
- Handles API errors gracefully
- Provides user-friendly error messages
- Supports internationalization

### Usage Example

```typescript
const CountriesPage = () => {
  const {
    dialogType,
    selectedCountry,
    loading,
    countries,
    apiRef,
    onEdit,
    onView,
    onDelete,
    onAdd,
    closeDialog,
    handleFormSubmit,
    handleDelete,
    handleRefresh,
    isCreating,
    isUpdating,
    isDeleting,
    lastAddedId,
    lastEditedId,
    lastDeletedIndex,
  } = useCountryGridLogic();

  return (
    <>
      <CountriesMultiView
        countries={countries}
        loading={loading}
        onEdit={onEdit}
        onView={onView}
        onDelete={onDelete}
        onAdd={onAdd}
        // ... other props
      />
      
      <CountryForm
        open={["edit", "add", "view"].includes(dialogType)}
        dialogType={dialogType}
        selectedCountry={selectedCountry}
        onClose={closeDialog}
        onSubmit={handleFormSubmit}
        loading={isCreating || isUpdating}
      />
      
      <CountryDeleteDialog
        open={dialogType === "delete"}
        onClose={closeDialog}
        onConfirm={handleDelete}
        selectedCountry={selectedCountry}
        loading={isDeleting}
      />
    </>
  );
};
```

## Best Practices

### 1. Query Key Management
- Use centralized query keys for consistency
- Include relevant parameters in query keys
- Use hierarchical key structure

### 2. Error Handling
- Always provide user feedback for errors
- Use consistent error message patterns
- Support internationalization

### 3. Loading States
- Show loading indicators for all async operations
- Disable actions during loading
- Provide visual feedback for mutations

### 4. Cache Management
- Invalidate relevant queries after mutations
- Use appropriate stale times
- Consider optimistic updates for better UX

### 5. Performance
- Use memoization for expensive computations
- Implement proper dependency arrays
- Consider pagination for large datasets

## Dependencies

- **@tanstack/react-query**: Data fetching and caching
- **react**: Core React hooks
- **react-i18next**: Internationalization
- **@mui/x-data-grid**: Grid API reference
- **@/shared/components**: Toast notifications
- **@/shared/utils**: Error handling utilities

## Future Enhancements

- **Optimistic Updates**: Implement optimistic updates for better UX
- **Infinite Queries**: Add support for infinite scrolling
- **Real-time Updates**: WebSocket integration for live data
- **Offline Support**: Cache strategies for offline functionality
- **Advanced Filtering**: Server-side filtering and sorting
- **Bulk Operations**: Support for bulk create/update/delete operations