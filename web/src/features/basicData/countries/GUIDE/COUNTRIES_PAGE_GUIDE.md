# Countries Page Documentation

## Overview

The Countries Page (`countriesPage.tsx`) serves as the main entry point and orchestrator for the entire countries feature. It integrates all components, manages global state, handles error scenarios, and provides a cohesive user experience for country data management.

## File Structure

**File**: `countriesPage.tsx`

## Component Architecture

### Main Component

```typescript
const CountriesPage = () => {
  const { t } = useTranslation();

  // All logic is now in the TanStack Query hook
  const {
    dialogType,
    selectedCountry,
    loading,
    countries,
    apiRef,
    error,
    isFetching,
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

  // Component JSX...
};
```

**Purpose**: Acts as a container component that delegates business logic to custom hooks and orchestrates child components.

## Key Features

### 1. Separation of Concerns
- **UI Logic**: Handled by the page component
- **Business Logic**: Delegated to `useCountryGridLogic` hook
- **Data Management**: Managed by TanStack Query hooks
- **Internationalization**: Integrated with react-i18next

### 2. Error Handling
```typescript
// Handle error state
if (error) {
  return (
    <Box sx={{ p: 3 }}>
      <Alert 
        severity="error" 
        action={
          <Button color="inherit" size="small" onClick={handleRefresh}>
            {t("common.retry") || "Retry"}
          </Button>
        }
      >
        {error.message || t("countries.errorMessage") || "Failed to load countries"}
      </Alert>
    </Box>
  );
}
```

**Features**:
- **User-Friendly Messages**: Displays localized error messages
- **Recovery Actions**: Provides retry functionality
- **Graceful Degradation**: Shows error state instead of crashing
- **Accessibility**: Uses Material-UI Alert component

### 3. Component Composition
The page composes three main child components:

#### CountriesMultiView
```typescript
<CountriesMultiView
  countries={countries}
  loading={loading}
  isFetching={isFetching}
  apiRef={apiRef}
  onEdit={onEdit}
  onView={onView}
  onDelete={onDelete}
  onAdd={onAdd}
  onRefresh={handleRefresh}
  t={t}
  lastAddedId={lastAddedId}
  lastEditedId={lastEditedId}
  lastDeletedIndex={lastDeletedIndex}
/>
```

**Purpose**: Main data display component with multiple view modes (grid, card, chart).

#### CountryForm
```typescript
<CountryForm
  open={["edit", "add", "view"].includes(dialogType)}
  dialogType={dialogType as "add" | "edit" | "view"}
  selectedCountry={selectedCountry}
  onClose={closeDialog}
  onSubmit={handleFormSubmit}
  loading={isCreating || isUpdating}
  t={t}
/>
```

**Purpose**: Modal form for creating, editing, and viewing country details.

#### CountryDeleteDialog
```typescript
<CountryDeleteDialog
  open={dialogType === "delete"}
  onClose={closeDialog}
  onConfirm={handleDelete}
  selectedCountry={selectedCountry}
  loading={isDeleting}
  t={t}
/>
```

**Purpose**: Confirmation dialog for country deletion.

## State Management

### Hook Integration
The page leverages the `useCountryGridLogic` hook for comprehensive state management:

```typescript
interface UseCountryGridLogicReturn {
  // Data State
  countries: Country[];
  loading: boolean;
  error: any;
  isFetching: boolean;

  // UI State
  dialogType: DialogType;
  selectedCountry: Country | null;
  apiRef: React.MutableRefObject<GridApiCommon>;

  // Action Handlers
  onEdit: (country: Country) => void;
  onView: (country: Country) => void;
  onDelete: (country: Country) => void;
  onAdd: () => void;

  // Dialog Management
  closeDialog: () => void;

  // Form Handlers
  handleFormSubmit: (formdata: CreateCountryRequest) => Promise<void>;
  handleDelete: () => Promise<void>;
  handleRefresh: () => void;

  // Loading States
  isCreating: boolean;
  isUpdating: boolean;
  isDeleting: boolean;

  // Navigation State
  lastAddedId: number | null;
  lastEditedId: number | null;
  lastDeletedIndex: number | null;
}
```

### State Flow

1. **Data Loading**: Countries are fetched via TanStack Query
2. **User Actions**: Trigger state changes through event handlers
3. **UI Updates**: Components react to state changes
4. **Navigation**: Grid navigation is managed automatically

## Dialog Management

### Dialog Types
```typescript
type DialogType = "add" | "edit" | "view" | "delete" | null;
```

### Dialog State Logic
```typescript
// Form dialogs (add, edit, view)
open={["edit", "add", "view"].includes(dialogType)}

// Delete confirmation dialog
open={dialogType === "delete"}
```

**Features**:
- **Single Source of Truth**: One state variable controls all dialogs
- **Type Safety**: TypeScript ensures valid dialog types
- **Automatic Cleanup**: Dialogs close automatically after operations

## Error Handling Strategy

### Global Error Handling
```typescript
if (error) {
  return (
    <Box sx={{ p: 3 }}>
      <Alert 
        severity="error" 
        action={
          <Button color="inherit" size="small" onClick={handleRefresh}>
            {t("common.retry") || "Retry"}
          </Button>
        }
      >
        {error.message || t("countries.errorMessage") || "Failed to load countries"}
      </Alert>
    </Box>
  );
}
```

### Error Types Handled
- **Network Errors**: Connection failures, timeouts
- **API Errors**: Server errors, validation failures
- **Data Errors**: Invalid response format, missing data
- **Permission Errors**: Unauthorized access

### Error Recovery
- **Retry Mechanism**: Users can retry failed operations
- **Graceful Degradation**: Partial functionality when possible
- **User Feedback**: Clear error messages and recovery instructions

## Loading States

### Multiple Loading Indicators
```typescript
// Global loading (initial data fetch)
loading={loading}

// Background refresh
isFetching={isFetching}

// Operation-specific loading
loading={isCreating || isUpdating} // Form loading
loading={isDeleting}              // Delete dialog loading
```

**Benefits**:
- **Granular Feedback**: Different loading states for different operations
- **Better UX**: Users know exactly what's happening
- **Non-blocking**: Background operations don't block the UI

## Internationalization

### Translation Integration
```typescript
const { t } = useTranslation();

// Usage throughout the component
{error.message || t("countries.errorMessage") || "Failed to load countries"}
{t("common.retry") || "Retry"}
```

**Features**:
- **Fallback Values**: English fallbacks for missing translations
- **Consistent Keys**: Standardized translation key structure
- **Component Isolation**: Each component handles its own translations

### Translation Keys Structure
```typescript
// Common keys
"common.retry"
"common.loading"
"common.error"

// Feature-specific keys
"countries.errorMessage"
"countries.created"
"countries.updated"
"countries.deleted"
"countries.fetchError"
```

## Performance Optimizations

### Efficient Re-rendering
- **Hook Memoization**: Business logic hook uses memoization
- **Stable References**: Event handlers are memoized
- **Conditional Rendering**: Components only render when needed

### Data Management
- **TanStack Query**: Automatic caching and background updates
- **Optimistic Updates**: Immediate UI feedback for operations
- **Stale-While-Revalidate**: Fresh data without blocking UI

### Memory Management
- **Cleanup**: Automatic cleanup of subscriptions and timers
- **Lazy Loading**: Components loaded only when needed
- **Efficient Updates**: Minimal re-renders through proper dependencies

## Navigation and Highlighting

### Auto-Navigation Features
```typescript
// Navigation state from hook
lastAddedId={lastAddedId}
lastEditedId={lastEditedId}
lastDeletedIndex={lastDeletedIndex}
```

**Features**:
- **Auto-scroll**: Automatically scrolls to newly created/edited items
- **Visual Feedback**: Highlights modified items temporarily
- **Smart Pagination**: Handles pagination automatically
- **Edge Cases**: Proper handling of first/last items

## Usage Examples

### Basic Implementation
```typescript
import CountriesPage from './countriesPage';

const App = () => {
  return (
    <Router>
      <Routes>
        <Route path="/countries" element={<CountriesPage />} />
      </Routes>
    </Router>
  );
};
```

### With Layout Integration
```typescript
const DashboardLayout = () => {
  return (
    <Box sx={{ display: 'flex' }}>
      <Sidebar />
      <Box component="main" sx={{ flexGrow: 1, p: 3 }}>
        <Routes>
          <Route path="/countries" element={<CountriesPage />} />
        </Routes>
      </Box>
    </Box>
  );
};
```

### With Permission Checking
```typescript
const ProtectedCountriesPage = () => {
  const { hasPermission } = useAuth();

  if (!hasPermission('countries.read')) {
    return <AccessDenied />;
  }

  return <CountriesPage />;
};
```

## Component Props Flow

### Data Flow Diagram
```
CountriesPage
├── useCountryGridLogic (hook)
│   ├── useCountries (data)
│   ├── useCreateCountry (mutation)
│   ├── useUpdateCountry (mutation)
│   └── useDeleteCountry (mutation)
├── CountriesMultiView
│   ├── countries (data)
│   ├── loading states
│   └── event handlers
├── CountryForm
│   ├── selectedCountry (data)
│   ├── dialogType (state)
│   └── form handlers
└── CountryDeleteDialog
    ├── selectedCountry (data)
    ├── loading state
    └── delete handler
```

## Testing Strategy

### Unit Tests
```typescript
describe('CountriesPage', () => {
  it('should render loading state', () => {
    // Mock loading state
    render(<CountriesPage />);
    expect(screen.getByTestId('loading-indicator')).toBeInTheDocument();
  });

  it('should render error state with retry button', () => {
    // Mock error state
    render(<CountriesPage />);
    expect(screen.getByText('Failed to load countries')).toBeInTheDocument();
    expect(screen.getByText('Retry')).toBeInTheDocument();
  });

  it('should open form dialog when add button is clicked', () => {
    render(<CountriesPage />);
    fireEvent.click(screen.getByText('Add Country'));
    expect(screen.getByRole('dialog')).toBeInTheDocument();
  });
});
```

### Integration Tests
```typescript
describe('CountriesPage Integration', () => {
  it('should create country and show success message', async () => {
    render(<CountriesPage />);
    
    // Open form
    fireEvent.click(screen.getByText('Add Country'));
    
    // Fill form
    fireEvent.change(screen.getByLabelText('English Name'), {
      target: { value: 'Test Country' }
    });
    
    // Submit
    fireEvent.click(screen.getByText('Save'));
    
    // Verify success
    await waitFor(() => {
      expect(screen.getByText('Country created successfully')).toBeInTheDocument();
    });
  });
});
```

## Accessibility Features

### ARIA Support
- **Screen Reader**: Proper ARIA labels and descriptions
- **Keyboard Navigation**: Full keyboard accessibility
- **Focus Management**: Proper focus handling in dialogs

### Material-UI Integration
- **Built-in Accessibility**: Leverages Material-UI's accessibility features
- **Color Contrast**: Meets WCAG guidelines
- **Responsive Design**: Works on all device sizes

## Security Considerations

### Input Validation
- **Client-side**: Form validation for user experience
- **Server-side**: API validation for security
- **XSS Prevention**: Proper data sanitization

### Permission Handling
- **Role-based Access**: Integration with authentication system
- **Operation Permissions**: Granular permission checking
- **Data Filtering**: Users see only authorized data

## Future Enhancements

### Advanced Features
- **Bulk Operations**: Multi-select and bulk actions
- **Advanced Filtering**: Complex filter combinations
- **Export/Import**: Data export and import functionality
- **Audit Trail**: Track all changes with history

### Performance Improvements
- **Virtual Scrolling**: Handle large datasets efficiently
- **Progressive Loading**: Load data as needed
- **Offline Support**: Work without internet connection
- **Real-time Updates**: Live data synchronization

### User Experience
- **Drag and Drop**: Reorder and organize data
- **Customizable Views**: User-configurable layouts
- **Saved Searches**: Bookmark common queries
- **Keyboard Shortcuts**: Power user features

## Dependencies

### Core Dependencies
- **React**: Component framework
- **react-i18next**: Internationalization
- **@mui/material**: UI components
- **@tanstack/react-query**: Data management

### Custom Dependencies
- **useCountryGridLogic**: Business logic hook
- **CountriesMultiView**: Main display component
- **CountryForm**: Form component
- **CountryDeleteDialog**: Delete confirmation

## Related Files

- `hooks/useCountryGridLogic.ts`: Main business logic
- `components/countriesMultiView.tsx`: Multi-view display
- `components/countryForm.tsx`: Form component
- `components/countryDeleteDialog.tsx`: Delete confirmation
- `services/countryService.ts`: API service layer
- `types/Country.ts`: Type definitions