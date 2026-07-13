# States Feature

This feature manages states/provinces/regions within countries in the HR Management System.

## Structure

```
states/
├── components/           # React components
│   ├── stateForm.tsx            # Form for add/edit/view state
│   ├── stateDeleteDialog.tsx    # Delete confirmation dialog
│   └── statesDashboardHeader.tsx # Dashboard statistics header
├── hooks/               # Custom React hooks
│   ├── useStateQueries.ts       # TanStack Query hooks
│   └── useStateGridLogic.ts     # Grid logic and state management
├── services/            # API services
│   └── stateService.ts          # State API calls
├── types/               # TypeScript type definitions
│   └── State.ts                 # State interfaces and types
├── utils/               # Utility functions
│   ├── validation.ts            # Form validation schemas
│   ├── stateHandler.ts          # SignalR handler for real-time updates
│   └── fakeData.ts              # Mock data for development
├── Reports/             # Reporting components
│   └── stateReports.tsx         # State reports
├── statesPage.tsx       # Main states page component
├── index.ts             # Feature exports
└── README.md            # This file
```

## Features

- **CRUD Operations**: Create, Read, Update, Delete states
- **Form Validation**: Client-side validation with Yup schemas
- **Real-time Updates**: SignalR integration for live updates
- **Country Association**: States are linked to countries
- **Dashboard Statistics**: Overview of state data quality and distribution
- **TypeScript Support**: Full type safety throughout the feature
- **Internationalization**: Support for Arabic and English

## Key Components

### StateForm
- Handles add/edit/view operations
- Form validation with real-time feedback
- Country selection dropdown
- Supports both Arabic and English names

### StatesDashboardHeader
- Displays key statistics about states
- Data quality metrics
- Country distribution information

### useStateGridLogic
- Centralized state management for the grid
- Handles all CRUD operations
- Navigation and highlighting logic
- Error handling and notifications

## API Integration

The feature integrates with the backend API endpoints:
- `GET /api/states` - Get all states
- `GET /api/states/{id}` - Get state by ID
- `POST /api/states` - Create new state
- `PUT /api/states/{id}` - Update existing state
- `DELETE /api/states/{id}` - Delete state
- `GET /api/states/by-country/{countryId}` - Get states by country

## Validation Rules

Based on the backend StateRequestValidator:
- **NameAr**: Required, 2-100 characters, Arabic letters only
- **NameEn**: Required, 2-100 characters, English letters only
- **Code**: Required, 2-10 characters
- **CountryId**: Required, must be a valid country ID
- **Uniqueness**: Names and codes must be unique within the same country

## Usage

```tsx
import { StatesPage } from '@/features/basicData/states';

// Use in routing
<Route path="/states" component={StatesPage} />
```

## Future Enhancements

- DataGrid implementation for state listing
- Advanced filtering and search
- Export functionality
- Bulk operations
- State hierarchy support (if needed)
- Geographic mapping integration