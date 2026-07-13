# API Routes and Sidebar Configuration Guide

## Overview

This guide shows how to configure API routes for the Countries feature and how to add new items to the sidebar navigation. It provides step-by-step instructions with real examples from the Countries implementation.

## Part 1: API Routes Configuration

### Current Countries API Routes

The Countries feature uses these API routes defined in `src/routes/apiRoutes.tsx`:

```typescript
countries: {
  getAll: `${version}/countries/getAll`,
  getById: (id: string | number) => `${version}/countries/${id}`,
  add: `${version}/countries/add`,
  update: `${version}/countries/update`,
  delete: (id: string | number) => `${version}/countries/delete/${id}`,
}
```

### How API Routes Are Used in Countries Service

```typescript
// src/features/basicData/countries/services/countryService.ts
import { apiRoutes } from "@/routes";
import { apiService } from "@/shared/services";

export class CountryService {
  // GET all countries
  static async getAll(): Promise<Country[]> {
    const response = await apiService.get(apiRoutes.countries.getAll);
    return extractValues<Country>(response);
  }

  // GET country by ID
  static async getById(id: string | number): Promise<Country> {
    const response = await apiService.get(apiRoutes.countries.getById(id));
    return extractValue<Country>(response);
  }

  // POST create new country
  static async create(countryData: CreateCountryRequest): Promise<Country> {
    const response = await apiService.post(
      apiRoutes.countries.add,
      countryData
    );
    return extractValue<Country>(response);
  }

  // PUT update country
  static async update(countryData: UpdateCountryRequest): Promise<Country> {
    const response = await apiService.put(
      apiRoutes.countries.update,
      countryData
    );
    return extractValue<Country>(response);
  }

  // DELETE country
  static async delete(id: string | number): Promise<string | number> {
    await apiService.delete(apiRoutes.countries.delete(id));
    return id;
  }
}
```

## How to Add New API Routes

### Step 1: Define Routes in apiRoutes.tsx

```typescript
// src/routes/apiRoutes.tsx

// Add to the main ApiRoutes interface
interface ApiRoutes {
  version: string;
  auth: AuthRoutes;
  countries: CrudRoutes;
  states: StatesRoutes;
  districts: DistrictsRoutes;
  // Add your new feature here
  companies: CrudRoutes;  // Example: Adding companies
  departments: CrudRoutes; // Example: Adding departments
  // ... other routes
}

// Add the actual route configuration
const apiRoutes: ApiRoutes = {
  version,
  
  // Existing routes...
  countries: {
    getAll: `${version}/countries/getAll`,
    getById: (id: string | number) => `${version}/countries/${id}`,
    add: `${version}/countries/add`,
    update: `${version}/countries/update`,
    delete: (id: string | number) => `${version}/countries/delete/${id}`,
  },

  // Add new routes following the same pattern
  companies: {
    getAll: `${version}/companies/getAll`,
    getById: (id: string | number) => `${version}/companies/${id}`,
    add: `${version}/companies/add`,
    update: `${version}/companies/update`,
    delete: (id: string | number) => `${version}/companies/delete/${id}`,
  },

  departments: {
    getAll: `${version}/departments/getAll`,
    getById: (id: string | number) => `${version}/departments/${id}`,
    add: `${version}/departments/add`,
    update: `${version}/departments/update`,
    delete: (id: string | number) => `${version}/departments/delete/${id}`,
  },
  
  // ... rest of routes
};
```

### Step 2: Create Service Using New Routes

```typescript
// src/features/basicData/companies/services/companyService.ts
import { apiRoutes } from "@/routes";
import { apiService } from "@/shared/services";
import { extractValue, extractValues } from "@/shared/utils/ApiHelper";

export class CompanyService {
  static async getAll(): Promise<Company[]> {
    const response = await apiService.get(apiRoutes.companies.getAll);
    return extractValues<Company>(response);
  }

  static async getById(id: string | number): Promise<Company> {
    const response = await apiService.get(apiRoutes.companies.getById(id));
    return extractValue<Company>(response);
  }

  static async create(companyData: CreateCompanyRequest): Promise<Company> {
    const response = await apiService.post(
      apiRoutes.companies.add,
      companyData
    );
    return extractValue<Company>(response);
  }

  static async update(companyData: UpdateCompanyRequest): Promise<Company> {
    const response = await apiService.put(
      apiRoutes.companies.update,
      companyData
    );
    return extractValue<Company>(response);
  }

  static async delete(id: string | number): Promise<string | number> {
    await apiService.delete(apiRoutes.companies.delete(id));
    return id;
  }
}
```

## Part 2: Sidebar Configuration

### Current Countries Sidebar Configuration

The Countries item is configured in `src/layouts/components/sidebar/navigationConfig.tsx`:

```typescript
{
  id: NavigationSectionId.ARCHIVE,
  title: NavigationTitles.BASIC_DATA,
  icon: (
    <ColoredIcon color={NavigationColors.PRIMARY_BLUE}>
      <ArchiveIcon />
    </ColoredIcon>
  ),
  items: [
    {
      title: NavigationTitles.COUNTRIES,
      icon: (
        <ColoredIcon color={NavigationColors.SECONDARY_BLUE}>
          <CategoryIcon />
        </ColoredIcon>
      ),
      path: appRoutes.basicData.countries,
      permissions: [Permissions.ViewCountries],
    },
    {
      title: NavigationTitles.STATES,
      icon: (
        <ColoredIcon color={NavigationColors.SECONDARY_BLUE}>
          <LocationCityIcon />
        </ColoredIcon>
      ),
      path: appRoutes.basicData.states,
      roles: [UserRoles.ADMIN],
    },
    // ... other items
  ],
}
```

## How to Add New Items to Sidebar

### Step 1: Add App Route

First, add the route to `src/routes/appRoutes.ts`:

```typescript
// src/routes/appRoutes.ts

export interface BasicDataRoutes {
  countries: string;
  states: string;
  districts: string;
  employees: string;
  // Add new routes here
  companies: string;
  departments: string;
  // ... other routes
}

export const appRoutes: AppRoutes = {
  // ... existing routes

  basicData: {
    countries: "basic-data/countries",
    states: "basic-data/states",
    districts: "basic-data/districts",
    employees: "basic-data/employees",
    // Add new app routes
    companies: "basic-data/companies",
    departments: "basic-data/departments",
    // ... other routes
  },

  // ... rest of routes
};
```

### Step 2: Add React Route

Add the route to `src/routes/routes.jsx`:

```typescript
// src/routes/routes.jsx
import CompaniesPage from "../features/basicData/companies/companiesPage";
import DepartmentsPage from "../features/basicData/departments/departmentsPage";

const AppRoutes = () => {
  return (
    <Suspense fallback={<MyLoadingIndicator />}>
      <Routes>
        {/* Protected Main App Routes */}
        <Route element={<ProtectedRoute />}>
          <Route element={<MainLayout />}>
            
            {/* Existing routes */}
            <Route
              path={appRoutes.basicData.countries}
              element={
                <Suspense fallback={<MyLoadingIndicator />}>
                  <CountriesPage />
                </Suspense>
              }
            />
            
            {/* Add new routes */}
            <Route
              path={appRoutes.basicData.companies}
              element={
                <Suspense fallback={<MyLoadingIndicator />}>
                  <CompaniesPage />
                </Suspense>
              }
            />
            
            <Route
              path={appRoutes.basicData.departments}
              element={
                <Suspense fallback={<MyLoadingIndicator />}>
                  <DepartmentsPage />
                </Suspense>
              }
            />
            
            {/* ... other routes */}
          </Route>
        </Route>
      </Routes>
    </Suspense>
  );
};
```

### Step 3: Add Navigation Titles

Add titles to `src/layouts/components/sidebar/navigationTypes.tsx`:

```typescript
// src/layouts/components/sidebar/navigationTypes.tsx

export enum NavigationTitles {
  // Existing titles
  BASIC_DATA = "menu.basicData",
  COUNTRIES = "menu.countries",
  STATES = "menu.states",
  DISTRICTS = "menu.districts",
  EMPLOYEES = "menu.employees",
  
  // Add new titles
  COMPANIES = "menu.companies",
  DEPARTMENTS = "menu.departments",
  
  // ... other titles
}
```

### Step 4: Add Translation Keys

Add translations to `src/locales/en/translation.json` and `src/locales/ar/translation.json`:

```json
// English (src/locales/en/translation.json)
{
  "menu": {
    "basicData": "Basic Data",
    "countries": "Countries",
    "states": "States",
    "districts": "Districts",
    "employees": "Employees",
    "companies": "Companies",
    "departments": "Departments"
  }
}

// Arabic (src/locales/ar/translation.json)
{
  "menu": {
    "basicData": "البيانات الأساسية",
    "countries": "الدول",
    "states": "المحافظات",
    "districts": "الأحياء",
    "employees": "الموظفين",
    "companies": "الشركات",
    "departments": "الأقسام"
  }
}
```

### Step 5: Add to Navigation Configuration

Add the new items to `src/layouts/components/sidebar/navigationConfig.tsx`:

```typescript
// src/layouts/components/sidebar/navigationConfig.tsx
import BusinessIcon from "@mui/icons-material/Business";
import DepartmentIcon from "@mui/icons-material/AccountTree";

export const getNavigationConfig = (): NavigationConfig => {
  const fullConfig: NavigationConfig = [
    {
      id: NavigationSectionId.ARCHIVE,
      title: NavigationTitles.BASIC_DATA,
      icon: (
        <ColoredIcon color={NavigationColors.PRIMARY_BLUE}>
          <ArchiveIcon />
        </ColoredIcon>
      ),
      items: [
        // Existing items
        {
          title: NavigationTitles.COUNTRIES,
          icon: (
            <ColoredIcon color={NavigationColors.SECONDARY_BLUE}>
              <CategoryIcon />
            </ColoredIcon>
          ),
          path: appRoutes.basicData.countries,
          permissions: [Permissions.ViewCountries],
        },
        {
          title: NavigationTitles.STATES,
          icon: (
            <ColoredIcon color={NavigationColors.SECONDARY_BLUE}>
              <LocationCityIcon />
            </ColoredIcon>
          ),
          path: appRoutes.basicData.states,
          roles: [UserRoles.ADMIN],
        },
        
        // Add new items
        {
          title: NavigationTitles.COMPANIES,
          icon: (
            <ColoredIcon color={NavigationColors.SECONDARY_BLUE}>
              <BusinessIcon />
            </ColoredIcon>
          ),
          path: appRoutes.basicData.companies,
          permissions: [Permissions.ViewCompanies], // Define this permission
        },
        {
          title: NavigationTitles.DEPARTMENTS,
          icon: (
            <ColoredIcon color={NavigationColors.SECONDARY_BLUE}>
              <DepartmentIcon />
            </ColoredIcon>
          ),
          path: appRoutes.basicData.departments,
          roles: [UserRoles.ADMIN, UserRoles.MANAGER], // Or use permissions
        },
        
        // ... other existing items
      ],
    },
    // ... other sections
  ];

  // ... rest of configuration
};
```

### Step 6: Add Permissions (Optional)

If using permissions, add them to `src/constants/appPermissions.ts`:

```typescript
// src/constants/appPermissions.ts
const Permissions = {
  // Existing permissions
  ViewCountries: "Countries.View",
  CreateCountries: "Countries.Create",
  UpdateCountries: "Countries.Update",
  DeleteCountries: "Countries.Delete",
  
  // Add new permissions
  ViewCompanies: "Companies.View",
  CreateCompanies: "Companies.Create",
  UpdateCompanies: "Companies.Update",
  DeleteCompanies: "Companies.Delete",
  
  ViewDepartments: "Departments.View",
  CreateDepartments: "Departments.Create",
  UpdateDepartments: "Departments.Update",
  DeleteDepartments: "Departments.Delete",
  
  // ... other permissions
};
```

## Complete Example: Adding a "Companies" Feature

Here's a complete example of adding a Companies feature:

### 1. API Routes
```typescript
// In src/routes/apiRoutes.tsx
companies: {
  getAll: `${version}/companies/getAll`,
  getById: (id: string | number) => `${version}/companies/${id}`,
  add: `${version}/companies/add`,
  update: `${version}/companies/update`,
  delete: (id: string | number) => `${version}/companies/delete/${id}`,
}
```

### 2. App Routes
```typescript
// In src/routes/appRoutes.ts
basicData: {
  countries: "basic-data/countries",
  states: "basic-data/states",
  districts: "basic-data/districts",
  employees: "basic-data/employees",
  companies: "basic-data/companies", // Add this
}
```

### 3. React Route
```typescript
// In src/routes/routes.jsx
<Route
  path={appRoutes.basicData.companies}
  element={
    <Suspense fallback={<MyLoadingIndicator />}>
      <CompaniesPage />
    </Suspense>
  }
/>
```

### 4. Navigation Title
```typescript
// In src/layouts/components/sidebar/navigationTypes.tsx
export enum NavigationTitles {
  COMPANIES = "menu.companies",
}
```

### 5. Translation
```json
// In src/locales/en/translation.json and src/locales/ar/translation.json
{
  "menu": {
    "companies": "Companies" // "الشركات" in Arabic
  }
}
```

### 6. Sidebar Item
```typescript
// In src/layouts/components/sidebar/navigationConfig.tsx
{
  title: NavigationTitles.COMPANIES,
  icon: (
    <ColoredIcon color={NavigationColors.SECONDARY_BLUE}>
      <BusinessIcon />
    </ColoredIcon>
  ),
  path: appRoutes.basicData.companies,
  permissions: [Permissions.ViewCompanies],
}
```

### 7. Service
```typescript
// Create src/features/basicData/companies/services/companyService.ts
import { apiRoutes } from "@/routes";
import { apiService } from "@/shared/services";

export class CompanyService {
  static async getAll(): Promise<Company[]> {
    const response = await apiService.get(apiRoutes.companies.getAll);
    return extractValues<Company>(response);
  }
  // ... other methods
}
```

### 8. Component
```typescript
// Create src/features/basicData/companies/companiesPage.tsx
import React from 'react';

const CompaniesPage = () => {
  return (
    <div>
      <h1>Companies Management</h1>
      {/* Your companies component content */}
    </div>
  );
};

export default CompaniesPage;
```

## Adding to Different Sidebar Sections

### Adding to Existing Section
```typescript
// Add to Basic Data section
{
  id: NavigationSectionId.ARCHIVE, // Existing section
  title: NavigationTitles.BASIC_DATA,
  items: [
    // ... existing items
    {
      title: NavigationTitles.NEW_FEATURE,
      icon: <NewIcon />,
      path: appRoutes.basicData.newFeature,
    }
  ]
}
```

### Creating New Section
```typescript
// Add new section
{
  id: NavigationSectionId.NEW_SECTION, // Define this in navigationTypes.tsx
  title: NavigationTitles.NEW_SECTION_TITLE,
  icon: (
    <ColoredIcon color={NavigationColors.PRIMARY_BLUE}>
      <NewSectionIcon />
    </ColoredIcon>
  ),
  items: [
    {
      title: NavigationTitles.NEW_FEATURE,
      icon: (
        <ColoredIcon color={NavigationColors.SECONDARY_BLUE}>
          <NewFeatureIcon />
        </ColoredIcon>
      ),
      path: appRoutes.newSection.newFeature,
      permissions: [Permissions.ViewNewFeature],
    },
  ],
}
```

## Permission and Role-Based Access

### Using Permissions
```typescript
{
  title: NavigationTitles.COUNTRIES,
  icon: <CountryIcon />,
  path: appRoutes.basicData.countries,
  permissions: [Permissions.ViewCountries], // User needs this permission
}
```

### Using Roles
```typescript
{
  title: NavigationTitles.ADMIN_PANEL,
  icon: <AdminIcon />,
  path: appRoutes.admin.panel,
  roles: [UserRoles.ADMIN], // Only admins can see this
}
```

### Using Both (OR condition)
```typescript
{
  title: NavigationTitles.REPORTS,
  icon: <ReportIcon />,
  path: appRoutes.reports.main,
  roles: [UserRoles.ADMIN, UserRoles.MANAGER], // Admins OR Managers
  permissions: [Permissions.ViewReports], // OR users with this permission
}
```

## Testing Your Changes

### 1. Check API Routes
```typescript
// Test in browser console or service
console.log(apiRoutes.companies.getAll); // Should output: /api/v1/companies/getAll
console.log(apiRoutes.companies.getById(123)); // Should output: /api/v1/companies/123
```

### 2. Check App Routes
```typescript
// Test navigation
console.log(appRoutes.basicData.companies); // Should output: basic-data/companies
```

### 3. Check Sidebar
- Login to the application
- Check if the new menu item appears in the sidebar
- Click the item to ensure navigation works
- Test with different user roles/permissions

## Common Issues and Solutions

### 1. Menu Item Not Showing
- Check if user has required permissions/roles
- Verify translation keys exist
- Check if route is properly defined

### 2. Navigation Not Working
- Ensure React route is added to routes.jsx
- Check if component is properly imported
- Verify path matches between appRoutes and React Router

### 3. API Calls Failing
- Check if API routes are correctly defined
- Verify backend endpoints exist
- Check network tab for actual URLs being called

### 4. TypeScript Errors
- Ensure all interfaces are properly updated
- Check imports and exports
- Verify type definitions match usage

This guide provides everything you need to add API routes and sidebar items following the same patterns used in the Countries feature.