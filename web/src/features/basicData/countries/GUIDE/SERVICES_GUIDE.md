# Countries Services Documentation

## Overview

The Countries service layer provides a clean abstraction for all API operations related to country data management. It handles HTTP requests, data transformation, error handling, and client-side search functionality.

## Service File

**File**: `services/countryService.ts`

## CountryService Class

The `CountryService` is a static class that encapsulates all country-related API operations and utilities.

### Dependencies

```typescript
import { apiRoutes } from "@/routes";
import { apiService } from "@/shared/services";
import { extractValue, extractValues } from "@/shared/utils/ApiHelper";
import { Country, CreateCountryRequest, UpdateCountryRequest } from "../types/Country";
```

## API Methods

### getAll()

```typescript
static async getAll(): Promise<Country[]>
```

**Purpose**: Retrieves all countries from the API.

**Features**:
- Filters out soft-deleted countries (`isDeleted: false`)
- Uses shared API service for HTTP requests
- Extracts data using utility helper
- Returns clean Country array

**Implementation**:
```typescript
static async getAll(): Promise<Country[]> {
  const response = await apiService.get(apiRoutes.countries.getAll);
  const countries = extractValues<Country>(response);
  return countries.filter((country) => !country.isDeleted);
}
```

**Usage**:
```typescript
const countries = await CountryService.getAll();
```

**Error Handling**:
- Throws API errors to be handled by calling code
- Network errors are propagated
- Invalid response format errors are handled by `extractValues`

### getById()

```typescript
static async getById(id: string | number): Promise<Country>
```

**Purpose**: Retrieves a single country by its ID.

**Parameters**:
- `id`: Country identifier (string or number)

**Implementation**:
```typescript
static async getById(id: string | number): Promise<Country> {
  const response = await apiService.get(apiRoutes.countries.getById(id));
  return extractValue<Country>(response);
}
```

**Usage**:
```typescript
const country = await CountryService.getById(123);
```

**Features**:
- Supports both string and numeric IDs
- Uses parameterized route building
- Returns single Country object

### create()

```typescript
static async create(countryData: CreateCountryRequest): Promise<Country>
```

**Purpose**: Creates a new country.

**Parameters**:
- `countryData`: Country creation data

**Implementation**:
```typescript
static async create(countryData: CreateCountryRequest): Promise<Country> {
  const response = await apiService.post(
    apiRoutes.countries.add,
    countryData
  );
  return extractValue<Country>(response);
}
```

**Usage**:
```typescript
const newCountry = await CountryService.create({
  nameEn: "United States",
  nameAr: "الولايات المتحدة",
  alpha2Code: "US",
  alpha3Code: "USA",
  phoneCode: "1",
  currencyCode: "USD"
});
```

**Features**:
- Validates data structure via TypeScript
- Returns created country with server-assigned ID
- Handles server validation errors

### update()

```typescript
static async update(countryData: UpdateCountryRequest): Promise<Country>
```

**Purpose**: Updates an existing country.

**Parameters**:
- `countryData`: Country update data (includes ID)

**Implementation**:
```typescript
static async update(countryData: UpdateCountryRequest): Promise<Country> {
  const response = await apiService.put(
    apiRoutes.countries.update,
    countryData
  );
  return extractValue<Country>(response);
}
```

**Usage**:
```typescript
const updatedCountry = await CountryService.update({
  id: 123,
  nameEn: "Updated Name",
  nameAr: "اسم محدث",
  // ... other fields
});
```

**Features**:
- Requires ID in the request data
- Returns updated country object
- Supports partial updates

### delete()

```typescript
static async delete(id: string | number): Promise<string | number>
```

**Purpose**: Performs soft delete on a country.

**Parameters**:
- `id`: Country identifier to delete

**Implementation**:
```typescript
static async delete(id: string | number): Promise<string | number> {
  await apiService.delete(apiRoutes.countries.delete(id));
  return id;
}
```

**Usage**:
```typescript
const deletedId = await CountryService.delete(123);
```

**Features**:
- Performs soft delete (sets `isDeleted: true`)
- Returns the deleted ID for confirmation
- Uses parameterized route building

## Search Functionality

### searchCountries()

```typescript
static searchCountries(countries: Country[], searchTerm: string): Country[]
```

**Purpose**: Client-side search functionality across country and state data.

**Parameters**:
- `countries`: Array of countries to search within
- `searchTerm`: Search query string

**Implementation**:
```typescript
static searchCountries(countries: Country[], searchTerm: string): Country[] {
  if (!searchTerm.trim()) {
    return countries;
  }

  const term = searchTerm.toLowerCase().trim();
  return countries.filter((country) => {
    if (!country || country.isDeleted) return false;

    // Search in country fields
    const countryMatch = (
      country.nameEn?.toLowerCase().includes(term) ||
      country.nameAr?.includes(term) ||
      country.alpha2Code?.toLowerCase().includes(term) ||
      country.alpha3Code?.toLowerCase().includes(term) ||
      country.phoneCode?.toString().includes(term) ||
      country.currencyCode?.toLowerCase().includes(term)
    );

    // Search in states
    const statesMatch = country.states?.some(state => 
      !state.isDeleted && (
        state.nameEn?.toLowerCase().includes(term) ||
        state.nameAr?.includes(term) ||
        state.code?.toLowerCase().includes(term)
      )
    );

    return countryMatch || statesMatch;
  });
}
```

**Search Fields**:

**Country Fields**:
- `nameEn` (English name)
- `nameAr` (Arabic name)
- `alpha2Code` (ISO 2-letter code)
- `alpha3Code` (ISO 3-letter code)
- `phoneCode` (International dialing code)
- `currencyCode` (Currency code)

**State Fields**:
- `nameEn` (State English name)
- `nameAr` (State Arabic name)
- `code` (State code)

**Features**:
- Case-insensitive search
- Searches across multiple fields
- Includes nested state search
- Filters out deleted items
- Returns original array if no search term
- Handles null/undefined values safely

**Usage**:
```typescript
const filteredCountries = CountryService.searchCountries(
  allCountries, 
  "united"
);
```

## API Routes Integration

The service integrates with the application's routing system:

```typescript
// Example route structure
apiRoutes.countries = {
  getAll: "/api/countries",
  getById: (id) => `/api/countries/${id}`,
  add: "/api/countries",
  update: "/api/countries",
  delete: (id) => `/api/countries/${id}`
};
```

## Error Handling Strategy

### API Errors
- Network errors are propagated to calling code
- HTTP status errors are handled by `apiService`
- Server validation errors are passed through
- Response format errors are handled by extract utilities

### Data Validation
- TypeScript provides compile-time validation
- Runtime validation is handled by the API
- Null/undefined checks in search functionality

### Example Error Handling
```typescript
try {
  const countries = await CountryService.getAll();
} catch (error) {
  if (error.response?.status === 404) {
    // Handle not found
  } else if (error.response?.status === 500) {
    // Handle server error
  } else {
    // Handle network error
  }
}
```

## Data Transformation

### Input Transformation
- Converts UI form data to API format
- Handles optional fields appropriately
- Maintains type safety

### Output Transformation
- Filters deleted items automatically
- Extracts data from API response wrapper
- Maintains consistent data structure

## Usage Examples

### Complete CRUD Example
```typescript
// Create
const newCountry = await CountryService.create({
  nameEn: "New Country",
  nameAr: "دولة جديدة",
  alpha2Code: "NC",
  alpha3Code: "NCO",
  phoneCode: "999",
  currencyCode: "NCU"
});

// Read all
const countries = await CountryService.getAll();

// Read one
const country = await CountryService.getById(newCountry.id);

// Update
const updatedCountry = await CountryService.update({
  id: country.id,
  nameEn: "Updated Country",
  nameAr: "دولة محدثة",
  alpha2Code: "UC",
  alpha3Code: "UPC",
  phoneCode: "888",
  currencyCode: "UCU"
});

// Delete
await CountryService.delete(updatedCountry.id);

// Search
const searchResults = CountryService.searchCountries(
  countries, 
  "search term"
);
```

### Integration with React Query
```typescript
// In hooks/useCountryQueries.ts
export const useCountries = () =>
  useQuery({
    queryKey: ['countries'],
    queryFn: CountryService.getAll,
    staleTime: 5 * 60 * 1000,
  });

export const useCreateCountry = () =>
  useMutation({
    mutationFn: CountryService.create,
    onSuccess: () => {
      queryClient.invalidateQueries(['countries']);
    },
  });
```

## Performance Considerations

### Client-Side Search
- Efficient filtering with early returns
- Handles large datasets well
- Memory-efficient (no data duplication)

### API Calls
- Uses shared HTTP client for connection pooling
- Supports request/response interceptors
- Handles caching at the HTTP level

### Data Processing
- Minimal data transformation
- Efficient array filtering
- Safe null/undefined handling

## Security Considerations

### Input Validation
- Server-side validation for all inputs
- XSS prevention through proper encoding
- SQL injection prevention through parameterized queries

### Authentication
- Uses shared API service with auth headers
- Token-based authentication
- Automatic token refresh

## Testing Strategy

### Unit Tests
```typescript
describe('CountryService', () => {
  describe('searchCountries', () => {
    it('should filter countries by name', () => {
      const countries = [
        { nameEn: 'United States', nameAr: 'الولايات المتحدة' },
        { nameEn: 'Canada', nameAr: 'كندا' }
      ];
      
      const result = CountryService.searchCountries(countries, 'united');
      expect(result).toHaveLength(1);
      expect(result[0].nameEn).toBe('United States');
    });
  });
});
```

### Integration Tests
```typescript
describe('CountryService API', () => {
  it('should create and retrieve country', async () => {
    const countryData = {
      nameEn: 'Test Country',
      nameAr: 'دولة اختبار'
    };
    
    const created = await CountryService.create(countryData);
    const retrieved = await CountryService.getById(created.id);
    
    expect(retrieved.nameEn).toBe(countryData.nameEn);
  });
});
```

## Future Enhancements

### Advanced Search
- Full-text search with ranking
- Fuzzy matching
- Search suggestions
- Search history

### Caching
- Client-side caching strategies
- Cache invalidation policies
- Offline support

### Batch Operations
- Bulk create/update/delete
- Transaction support
- Progress tracking

### Real-time Updates
- WebSocket integration
- Live data synchronization
- Conflict resolution

## Dependencies

- **@/routes**: API route definitions
- **@/shared/services**: HTTP client service
- **@/shared/utils/ApiHelper**: Response extraction utilities
- **../types/Country**: TypeScript type definitions

## Related Files

- `hooks/useCountryQueries.ts`: React Query integration
- `types/Country.ts`: Type definitions
- `components/`: UI components that consume the service
- `utils/`: Additional utility functions