# Country Types Documentation

This document describes the TypeScript interfaces and types used in the Countries feature.

## Core Interfaces

### Country
The main interface representing a country entity with its related states.

```typescript
interface Country {
  id: string | number;           // Unique identifier
  nameAr: string;               // Arabic name
  nameEn: string;               // English name
  alpha2Code: string;           // ISO 3166-1 alpha-2 code (e.g., "US")
  alpha3Code: string;           // ISO 3166-1 alpha-3 code (e.g., "USA")
  phoneCode: string;            // International dialing code (e.g., "1")
  currencyCode: string | null;  // ISO 4217 currency code (e.g., "USD")
  states?: SimpleState[];       // Related states (optional)
  statesCount?: number;         // Computed count of active states
  createdOn: string;            // ISO date string
  updatedOn: string;            // ISO date string
  isDeleted: boolean;           // Soft delete flag
  [key: string]: any;           // Additional dynamic properties
}
```

### SimpleState
Represents a state/province within a country.

```typescript
interface SimpleState {
  id: string | number;          // Unique identifier
  nameAr: string;               // Arabic name
  nameEn: string;               // English name
  code?: string;                // State/province code (optional)
  isDeleted: boolean;           // Soft delete flag
}
```

## Request/Response Types

### CreateCountryRequest
Used when creating a new country.

```typescript
interface CreateCountryRequest {
  nameEn: string;                    // Required English name
  nameAr: string;                    // Required Arabic name
  alpha2Code?: string | null;        // Optional ISO alpha-2 code
  alpha3Code?: string | null;        // Optional ISO alpha-3 code
  phoneCode?: string | null;         // Optional phone code
  currencyCode?: string | null;      // Optional currency code
}
```

### UpdateCountryRequest
Used when updating an existing country.

```typescript
interface UpdateCountryRequest extends CreateCountryRequest {
  id: string | number;               // Required ID for updates
}
```

### CountryResponse
Represents the API response structure.

```typescript
interface CountryResponse {
  id: number;                        // Server-assigned ID
  nameAr: string;
  nameEn: string;
  alpha2Code: string;
  alpha3Code: string;
  phoneCode: string;
  currencyCode: string | null;
  states: SimpleState[];             // Always includes states array
  createdOn: string;
  updatedOn: string;
  isDeleted: boolean;
}
```

## Query and Filter Types

### CountryFilters
Used for filtering countries in queries.

```typescript
interface CountryFilters {
  search?: string;                   // Text search across all fields
  hasStates?: boolean;               // Filter by presence of states
  hasCurrency?: boolean;             // Filter by presence of currency
  hasPhoneCode?: boolean;            // Filter by presence of phone code
  isActive?: boolean;                // Filter by deletion status
}
```

### CountryQueryParams
Used for paginated queries with sorting and filtering.

```typescript
interface CountryQueryParams {
  page?: number;                     // Page number (0-based)
  pageSize?: number;                 // Items per page
  sortBy?: string;                   // Field to sort by
  sortDirection?: 'asc' | 'desc';    // Sort direction
  filters?: CountryFilters;          // Applied filters
}
```

## Usage Examples

### Creating a Country
```typescript
const newCountry: CreateCountryRequest = {
  nameEn: "United States",
  nameAr: "الولايات المتحدة",
  alpha2Code: "US",
  alpha3Code: "USA",
  phoneCode: "1",
  currencyCode: "USD"
};
```

### Filtering Countries
```typescript
const filters: CountryFilters = {
  search: "united",
  hasStates: true,
  isActive: true
};
```

### Working with States
```typescript
// Get active states from a country
const activeStates = country.states?.filter(state => !state.isDeleted) || [];

// Count active states
const statesCount = activeStates.length;

// Search within states
const matchingStates = activeStates.filter(state => 
  state.nameEn.toLowerCase().includes(searchTerm.toLowerCase())
);
```

## API Response Example

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
    },
    {
      "id": 4002,
      "nameAr": "القاهرة",
      "nameEn": "Cairo",
      "isDeleted": false
    }
  ],
  "createdOn": "2025-08-09T18:07:05.6274913",
  "updatedOn": "2025-09-24T16:40:02.742929",
  "isDeleted": false
}
```

## Type Safety Notes

1. **Null vs Undefined**: `currencyCode` can be `null` from the API, but optional fields use `undefined`
2. **ID Types**: IDs can be either `string` or `number` to handle different scenarios
3. **States Array**: May be undefined if not loaded, empty array if no states exist
4. **Soft Deletes**: Always check `isDeleted` flag before displaying data
5. **Date Strings**: All dates are ISO 8601 strings from the server

## Utility Functions

The following utility functions work with these types:

- `getActiveStates(states)` - Filters out deleted states
- `getStatesCount(states)` - Counts active states
- `formatStatesForDisplay(states, maxDisplay)` - Formats states for UI display
- `searchCountryStates(states, searchTerm)` - Searches within states