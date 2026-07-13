# Countries Types Documentation

## Overview

This document provides comprehensive documentation for all TypeScript interfaces, types, and data structures used in the Countries feature. These types ensure type safety, improve developer experience, and provide clear contracts for data exchange between components, services, and APIs.

## Core Entity Types

### Country Interface

```typescript
export interface Country {
  id: string | number;           // Unique identifier (flexible type for different backends)
  nameAr: string;               // Arabic name (required)
  nameEn: string;               // English name (required)
  alpha2Code: string;           // ISO 3166-1 alpha-2 code (e.g., "US", "CA")
  alpha3Code: string;           // ISO 3166-1 alpha-3 code (e.g., "USA", "CAN")
  phoneCode: string;            // International dialing code (e.g., "1", "44")
  currencyCode: string | null;  // ISO 4217 currency code (e.g., "USD", "EUR") - nullable
  states?: SimpleState[];       // Associated states/provinces (optional)
  statesCount?: number;         // Computed count of active states (optional)
  createdOn: string;            // ISO 8601 date string
  updatedOn: string;            // ISO 8601 date string
  isDeleted: boolean;           // Soft delete flag
  [key: string]: any;           // Index signature for additional dynamic properties
}
```

**Key Features**:
- **Flexible ID**: Supports both string and number IDs for different backend systems
- **Bilingual Support**: Both Arabic and English names are required
- **ISO Standards**: Uses standard country and currency codes
- **Soft Delete**: Uses `isDeleted` flag instead of hard deletion
- **Extensible**: Index signature allows for additional properties
- **Optional Relations**: States are optional to support different loading strategies

**Usage Examples**:
```typescript
// Basic country
const country: Country = {
  id: 1,
  nameAr: "الولايات المتحدة",
  nameEn: "United States",
  alpha2Code: "US",
  alpha3Code: "USA",
  phoneCode: "1",
  currencyCode: "USD",
  createdOn: "2023-01-01T00:00:00Z",
  updatedOn: "2023-01-01T00:00:00Z",
  isDeleted: false
};

// Country with states
const countryWithStates: Country = {
  ...country,
  states: [
    {
      id: 1,
      nameAr: "كاليفورنيا",
      nameEn: "California",
      code: "CA",
      isDeleted: false
    }
  ],
  statesCount: 1
};
```

### SimpleState Interface

```typescript
export interface SimpleState {
  id: string | number;          // Unique identifier
  nameAr: string;               // Arabic name (required)
  nameEn: string;               // English name (required)
  code?: string;                // State/province code (optional, e.g., "CA", "TX")
  isDeleted: boolean;           // Soft delete flag
}
```

**Purpose**: Represents states, provinces, or administrative divisions within a country.

**Features**:
- **Lightweight**: Minimal properties for efficient data transfer
- **Bilingual**: Supports both Arabic and English names
- **Optional Code**: State codes are optional as not all regions have standardized codes
- **Soft Delete**: Consistent with parent Country entity

**Usage Examples**:
```typescript
const state: SimpleState = {
  id: 1,
  nameAr: "تكساس",
  nameEn: "Texas",
  code: "TX",
  isDeleted: false
};

// State without code
const stateNoCode: SimpleState = {
  id: 2,
  nameAr: "منطقة خاصة",
  nameEn: "Special Region",
  isDeleted: false
};
```

## Request/Response Types

### CreateCountryRequest

```typescript
export interface CreateCountryRequest {
  nameEn: string;                    // Required English name
  nameAr: string;                    // Required Arabic name
  alpha2Code?: string | null;        // Optional ISO alpha-2 code
  alpha3Code?: string | null;        // Optional ISO alpha-3 code
  phoneCode?: string | null;         // Optional international dialing code
  currencyCode?: string | null;      // Optional ISO currency code
}
```

**Purpose**: Data structure for creating new countries.

**Features**:
- **Required Names**: Both Arabic and English names are mandatory
- **Optional Codes**: All code fields are optional for flexibility
- **Null Support**: Explicitly allows null values for optional fields
- **Validation Ready**: Structure supports both client and server validation

**Usage Example**:
```typescript
const createRequest: CreateCountryRequest = {
  nameEn: "New Country",
  nameAr: "دولة جديدة",
  alpha2Code: "NC",
  alpha3Code: "NCO",
  phoneCode: "999",
  currencyCode: "NCU"
};

// Minimal request
const minimalRequest: CreateCountryRequest = {
  nameEn: "Minimal Country",
  nameAr: "دولة بسيطة"
};
```

### UpdateCountryRequest

```typescript
export interface UpdateCountryRequest extends CreateCountryRequest {
  id: string | number;               // Required ID for updates
}
```

**Purpose**: Data structure for updating existing countries.

**Features**:
- **Extends Create**: Inherits all creation fields
- **Required ID**: Must include ID for identification
- **Partial Updates**: Can update any subset of fields
- **Type Safety**: Ensures ID is always provided

**Usage Example**:
```typescript
const updateRequest: UpdateCountryRequest = {
  id: 123,
  nameEn: "Updated Country Name",
  nameAr: "اسم الدولة المحدث",
  currencyCode: "UPD"
  // Other fields remain unchanged
};
```

### CountryResponse

```typescript
export interface CountryResponse {
  id: number;                        // Server-assigned numeric ID
  nameAr: string;                    // Arabic name
  nameEn: string;                    // English name
  alpha2Code: string;                // ISO alpha-2 code
  alpha3Code: string;                // ISO alpha-3 code
  phoneCode: string;                 // International dialing code
  currencyCode: string | null;       // ISO currency code (nullable)
  states: SimpleState[];             // Always includes states array (may be empty)
  createdOn: string;                 // ISO 8601 creation timestamp
  updatedOn: string;                 // ISO 8601 update timestamp
  isDeleted: boolean;                // Soft delete status
}
```

**Purpose**: Represents the exact structure returned by the API.

**Features**:
- **Numeric ID**: Server always returns numeric IDs
- **Complete Data**: Includes all fields from the database
- **States Array**: Always present (empty if no states)
- **Timestamps**: Server-managed creation and update times

**Usage Example**:
```typescript
// API response handling
const handleApiResponse = (response: CountryResponse) => {
  const country: Country = {
    ...response,
    statesCount: response.states.filter(s => !s.isDeleted).length
  };
  return country;
};
```

## Query and Filter Types

### CountryFilters

```typescript
export interface CountryFilters {
  search?: string;                   // Text search across multiple fields
  hasStates?: boolean;               // Filter by presence of states
  hasCurrency?: boolean;             // Filter by presence of currency code
  hasPhoneCode?: boolean;            // Filter by presence of phone code
  isActive?: boolean;                // Filter by deletion status (active/inactive)
}
```

**Purpose**: Defines available filtering options for country queries.

**Features**:
- **Text Search**: Searches across names, codes, and related data
- **Boolean Filters**: Simple yes/no filtering options
- **Flexible**: All filters are optional
- **Composable**: Multiple filters can be combined

**Usage Examples**:
```typescript
// Search for active countries with states
const filters: CountryFilters = {
  search: "united",
  hasStates: true,
  isActive: true
};

// Find countries without currency codes
const noCurrencyFilter: CountryFilters = {
  hasCurrency: false,
  isActive: true
};

// Text search only
const searchFilter: CountryFilters = {
  search: "arab"
};
```

### CountryQueryParams

```typescript
export interface CountryQueryParams {
  page?: number;                     // Page number (0-based indexing)
  pageSize?: number;                 // Number of items per page
  sortBy?: string;                   // Field name to sort by
  sortDirection?: 'asc' | 'desc';    // Sort direction
  filters?: CountryFilters;          // Applied filters
}
```

**Purpose**: Complete query parameters for paginated and filtered country requests.

**Features**:
- **Pagination**: Supports page-based pagination
- **Sorting**: Flexible sorting by any field
- **Filtering**: Integrates with CountryFilters
- **Optional**: All parameters are optional with sensible defaults

**Usage Examples**:
```typescript
// Paginated query with sorting
const queryParams: CountryQueryParams = {
  page: 0,
  pageSize: 20,
  sortBy: "nameEn",
  sortDirection: "asc",
  filters: {
    isActive: true
  }
};

// Search with custom page size
const searchQuery: CountryQueryParams = {
  pageSize: 50,
  filters: {
    search: "europe"
  }
};
```

## Utility Types

### Chart Data Types

```typescript
// For chart components
export interface RegionData {
  name: string;                      // Region name
  value: number;                     // Count of countries in region
}

export interface CurrencyData {
  name: string;                      // Currency code
  value: number;                     // Number of countries using currency
}

export interface TimelineData {
  month: string;                     // YYYY-MM format
  count: number;                     // Countries created in month
  cumulative: number;                // Cumulative count up to month
}

export interface StatesData {
  name: string;                      // Country name
  statesCount: number;               // Number of active states
  totalStates: number;               // Total states (including inactive)
}
```

### Form Types

```typescript
// For form validation and handling
export interface CountryFormData {
  nameEn: string;
  nameAr: string;
  alpha2Code: string;
  alpha3Code: string;
  phoneCode: string;
  currencyCode: string;
}

export interface CountryFormErrors {
  nameEn?: string;
  nameAr?: string;
  alpha2Code?: string;
  alpha3Code?: string;
  phoneCode?: string;
  currencyCode?: string;
}
```

### Grid Types

```typescript
// For data grid components
export interface CountryGridRow extends Country {
  statesDisplay: string;             // Formatted states for display
  createdOnFormatted: string;        // Formatted creation date
  updatedOnFormatted: string;        // Formatted update date
}

export interface GridColumn {
  field: keyof Country;
  headerName: string;
  width?: number;
  sortable?: boolean;
  filterable?: boolean;
}
```

## Type Guards and Validation

### Type Guards

```typescript
// Type guard functions for runtime type checking
export const isCountry = (obj: any): obj is Country => {
  return (
    obj &&
    typeof obj === 'object' &&
    (typeof obj.id === 'string' || typeof obj.id === 'number') &&
    typeof obj.nameEn === 'string' &&
    typeof obj.nameAr === 'string' &&
    typeof obj.isDeleted === 'boolean'
  );
};

export const isSimpleState = (obj: any): obj is SimpleState => {
  return (
    obj &&
    typeof obj === 'object' &&
    (typeof obj.id === 'string' || typeof obj.id === 'number') &&
    typeof obj.nameEn === 'string' &&
    typeof obj.nameAr === 'string' &&
    typeof obj.isDeleted === 'boolean'
  );
};

export const isCreateCountryRequest = (obj: any): obj is CreateCountryRequest => {
  return (
    obj &&
    typeof obj === 'object' &&
    typeof obj.nameEn === 'string' &&
    typeof obj.nameAr === 'string'
  );
};
```

### Validation Schemas

```typescript
// Validation rules (can be used with libraries like Yup or Zod)
export const countryValidationRules = {
  nameEn: {
    required: true,
    minLength: 2,
    maxLength: 100,
    pattern: /^[a-zA-Z\s\-'\.]+$/
  },
  nameAr: {
    required: true,
    minLength: 2,
    maxLength: 100,
    pattern: /^[\u0600-\u06FF\s\-'\.]+$/
  },
  alpha2Code: {
    required: false,
    length: 2,
    pattern: /^[A-Z]{2}$/
  },
  alpha3Code: {
    required: false,
    length: 3,
    pattern: /^[A-Z]{3}$/
  },
  phoneCode: {
    required: false,
    minLength: 1,
    maxLength: 4,
    pattern: /^\d+$/
  },
  currencyCode: {
    required: false,
    length: 3,
    pattern: /^[A-Z]{3}$/
  }
};
```

## API Response Examples

### Single Country Response

```json
{
  "id": 1035,
  "nameAr": "بلد واحد",
  "nameEn": "Country one",
  "alpha2Code": "AA",
  "alpha3Code": "AAA",
  "phoneCode": "123",
  "currencyCode": null,
  "states": [
    {
      "id": 2004,
      "nameAr": "مدينة اولى",
      "nameEn": "City One",
      "isDeleted": true
    },
    {
      "id": 3002,
      "nameAr": "ءءءءءءءءء",
      "nameEn": "xxxxxxxxx",
      "isDeleted": false
    }
  ],
  "createdOn": "2025-08-09T18:07:05.6274913",
  "updatedOn": "2025-09-24T16:40:02.742929",
  "isDeleted": false
}
```

### Countries List Response

```json
{
  "data": [
    {
      "id": 1,
      "nameAr": "الولايات المتحدة",
      "nameEn": "United States",
      "alpha2Code": "US",
      "alpha3Code": "USA",
      "phoneCode": "1",
      "currencyCode": "USD",
      "states": [],
      "createdOn": "2023-01-01T00:00:00Z",
      "updatedOn": "2023-01-01T00:00:00Z",
      "isDeleted": false
    }
  ],
  "totalCount": 195,
  "page": 0,
  "pageSize": 20
}
```

## Usage Patterns

### Data Transformation

```typescript
// API response to internal format
const transformApiResponse = (response: CountryResponse): Country => {
  return {
    ...response,
    statesCount: response.states.filter(state => !state.isDeleted).length
  };
};

// Form data to API request
const transformFormToRequest = (formData: CountryFormData): CreateCountryRequest => {
  return {
    nameEn: formData.nameEn.trim(),
    nameAr: formData.nameAr.trim(),
    alpha2Code: formData.alpha2Code || null,
    alpha3Code: formData.alpha3Code || null,
    phoneCode: formData.phoneCode || null,
    currencyCode: formData.currencyCode || null
  };
};
```

### Type-Safe Filtering

```typescript
// Type-safe property access
const getCountryProperty = <K extends keyof Country>(
  country: Country,
  key: K
): Country[K] => {
  return country[key];
};

// Safe state access
const getActiveStates = (country: Country): SimpleState[] => {
  return country.states?.filter(state => !state.isDeleted) || [];
};

// Type-safe search
const searchCountries = (
  countries: Country[],
  searchTerm: string,
  fields: (keyof Country)[]
): Country[] => {
  return countries.filter(country =>
    fields.some(field => {
      const value = country[field];
      return typeof value === 'string' && 
             value.toLowerCase().includes(searchTerm.toLowerCase());
    })
  );
};
```

## Best Practices

### 1. Type Safety
- Always use type guards for runtime validation
- Prefer explicit types over `any`
- Use union types for flexible but controlled values

### 2. Null Handling
- Distinguish between `null` (API value) and `undefined` (missing property)
- Use optional chaining for nested properties
- Provide default values where appropriate

### 3. Immutability
- Use readonly modifiers for immutable data
- Prefer spreading over mutation
- Consider using utility types like `Readonly<T>`

### 4. API Integration
- Keep request/response types separate from internal types
- Transform data at service boundaries
- Validate API responses with type guards

### 5. Documentation
- Document complex types with JSDoc comments
- Provide usage examples for interfaces
- Explain business rules in type definitions

## Future Enhancements

### Advanced Types
- Generic types for reusable patterns
- Conditional types for complex scenarios
- Template literal types for string validation

### Validation Integration
- Schema validation with Zod or Yup
- Runtime type checking
- Form validation integration

### API Evolution
- Versioned types for API compatibility
- Migration utilities for type changes
- Backward compatibility helpers

## Dependencies

- **TypeScript**: Core type system
- **React**: Component prop types
- **@mui/x-data-grid**: Grid-specific types
- **@tanstack/react-query**: Query-related types

## Related Files

- `services/countryService.ts`: Service layer using these types
- `hooks/useCountryQueries.ts`: React Query hooks with types
- `components/`: UI components consuming these types
- `utils/`: Utility functions working with these types