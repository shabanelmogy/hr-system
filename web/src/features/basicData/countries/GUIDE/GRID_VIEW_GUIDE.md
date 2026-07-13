# 📊 Grid View Implementation Guide - Countries Feature

## 🎯 Overview

This guide provides a comprehensive walkthrough for implementing data grid views in the HR Management system, using the Countries feature as a reference implementation. The grid view provides a powerful, tabular interface for displaying, sorting, filtering, and managing large datasets with advanced features like pagination, export capabilities, and inline actions.

---

## 📁 File Structure

```
src/features/basicData/countries/components/
├── countriesMultiView.tsx          # Multi-view container
└── gridView/
    ├── countriesDataGrid.tsx       # Main grid component
    ├── columns.tsx                 # Column definitions
    └── gridActions.tsx             # Action buttons factory
```

### **Supporting Shared Components**
```
src/shared/components/common/datagrid/
├── myDataGrid.jsx                  # Enhanced DataGrid wrapper
├── myCustomToolbar.jsx             # Custom toolbar with export
└── index.js                        # Barrel exports
```

---

## 🏗️ Architecture Overview

### **1. Main Grid Component**
The main grid component (`countriesDataGrid.tsx`) orchestrates:
- **Data Display**: Structured tabular presentation
- **Column Configuration**: Dynamic column definitions
- **Action Integration**: CRUD operation buttons
- **Permission Handling**: Role-based feature access
- **Export Functionality**: Multiple export formats

### **2. Column Factory**
The columns factory (`columns.tsx`) provides:
- **Dynamic Columns**: Configurable column definitions
- **Custom Renderers**: Specialized cell rendering
- **Responsive Design**: Adaptive column widths
- **Internationalization**: Translated headers

### **3. Actions Factory**
The actions factory (`gridActions.tsx`) handles:
- **Permission-Based Actions**: Role-aware button display
- **CRUD Operations**: View, Edit, Delete actions
- **Icon Integration**: Consistent visual design
- **Event Handling**: Action callback management

### **4. Enhanced DataGrid Wrapper**
The shared `MyDataGrid` component adds:
- **Custom Toolbar**: Export, filter, column controls
- **Navigation Controls**: Record-by-record navigation
- **Pagination Enhancement**: Advanced pagination features
- **Loading States**: Progress indicators
- **Internationalization**: RTL/LTR support

---

## 🚀 Implementation Steps

## **Step 1: Create Main Grid Component**

Create `countriesDataGrid.tsx` as the primary grid container:

```typescript
/* eslint-disable react/prop-types */
import React, { useCallback } from "react";
import { GridApiCommon } from "@mui/x-data-grid";
import { MyContentsWrapper } from "@/layouts";
import { MyDataGrid } from "@/shared/components";
import { useCountriesPermissions } from "@/shared/hooks/usePermissions";
import { Country } from "../../types/Country";
import { makeCountryActions } from "./gridActions";
import { useCountryColumns } from "./columns";

// Define interfaces for better type safety
interface CountriesDataGridProps {
  countries: Country[];
  loading?: boolean;
  apiRef?: React.RefObject<GridApiCommon>;
  onEdit: (country: Country) => void;
  onDelete: (country: Country) => void;
  onView: (country: Country) => void;
  onAdd: () => void;
  t: (key: string) => string;
}

const CountriesDataGrid: React.FC<CountriesDataGridProps> = ({
  countries,
  loading = false,
  apiRef,
  onEdit,
  onDelete,
  onView,
  onAdd,
  t,
}) => {
  // Get user permissions for this module
  const permissions = useCountriesPermissions();

  // Create actions factory based on permissions and handlers
  const getActions = useCallback(
    makeCountryActions({ t, permissions, onView, onEdit, onDelete }),
    [t, permissions, onView, onEdit, onDelete]
  );

  // Generate columns with actions
  const columns = useCountryColumns({ t, permissions, getActions });

  // Enhanced add button with permission check
  const handleAddNew = useCallback(() => {
    if (permissions.canCreate) {
      onAdd();
    }
  }, [onAdd, permissions.canCreate]);

  return (
    <MyContentsWrapper>
      <MyDataGrid
        rows={countries}
        columns={columns}
        loading={loading}
        apiRef={apiRef}
        filterMode="client"
        sortModel={[{ field: "id", sort: "asc" }]}
        addNewRow={permissions.canCreate ? handleAddNew : undefined}
        pagination
        pageSizeOptions={[5, 10, 25, 50]}
        fileName={t("countries.title")}
        reportPdfHeader={t("countries.title")}
        showNavigationButtons={true}
        excludeColumnsFromExport={['actions']}
      />
    </MyContentsWrapper>
  );
};

export default CountriesDataGrid;

// Export types for use in other components
export type { CountriesDataGridProps, Country };
```

## **Step 2: Create Column Definitions**

Build `columns.tsx` with comprehensive column configuration:

```typescript
import React from "react";
import { LocationOn } from "@mui/icons-material";
import { useTheme } from "@mui/material";
import { GridColDef, GridActionsCellItemProps } from "@mui/x-data-grid";
import { 
  renderAlphaCode, 
  renderCountryName, 
  renderCurrencyCode, 
  renderDate, 
  renderList, 
  renderPhoneCode 
} from "@/shared/components";
import type { Country } from "../../types/Country";

export interface ColumnsFactoryProps {
  t: (key: string) => string;
  permissions: { canView: boolean; canEdit: boolean; canDelete: boolean };
  getActions: (params: { row: Country }) => React.ReactElement<GridActionsCellItemProps>[];
}

export const useCountryColumns = ({ t, permissions, getActions }: ColumnsFactoryProps): GridColDef[] => {
  const theme = useTheme();

  const baseColumns: GridColDef[] = [
    {
      field: "id",
      headerName: t("general.id"),
      flex: 0.5,
      align: "center",
      headerAlign: "center",
      minWidth: 80,
    },
    {
      field: "nameAr",
      headerName: t("general.nameAr"),
      flex: 1,
      align: "center",
      headerAlign: "center",
      minWidth: 150,
      renderCell: renderCountryName(true),
    },
    {
      field: "nameEn",
      headerName: t("general.nameEn"),
      flex: 1.5,
      align: "center",
      headerAlign: "center",
      minWidth: 180,
      renderCell: renderCountryName(true),
    },
    {
      field: "alpha2Code",
      headerName: t("countries.alpha2Code"),
      flex: 0.8,
      align: "center",
      headerAlign: "center",
      minWidth: 100,
      renderCell: renderAlphaCode,
    },
    {
      field: "alpha3Code",
      headerName: t("countries.alpha3Code"),
      flex: 0.8,
      align: "center",
      headerAlign: "center",
      minWidth: 100,
      renderCell: renderAlphaCode,
    },
    {
      field: "phoneCode",
      headerName: t("countries.phoneCode"),
      flex: 0.8,
      align: "center",
      headerAlign: "center",
      minWidth: 120,
      renderCell: renderPhoneCode,
    },
    {
      field: "currencyCode",
      headerName: t("countries.currencyCode"),
      flex: 0.8,
      align: "center",
      headerAlign: "center",
      minWidth: 120,
      renderCell: renderCurrencyCode,
    },
    {
      field: "states",
      headerName: t("countries.states") || "States",
      flex: 1.2,
      align: "center",
      headerAlign: "center",
      minWidth: 200,
      sortable: false,
      valueGetter: (params: any) => {
        return Array.isArray(params)
          ? params
              .filter((state: any) => !state.isDeleted)
              .map((state: any) => (theme.direction === "rtl" ? state.nameAr : state.nameEn))
          : [];
      },
      renderCell: renderList({
        displayType: "chips",
        maxItems: 2,
        defaultColor: "primary",
        variant: "outlined",
        size: "small",
        showCount: true,
        emptyText: t("countries.noStates") || "No states",
        chipProps: {
          icon: <LocationOn sx={{ fontSize: 14 }} />,
          sx: { fontSize: "0.75rem" },
        },
      }),
    },
    {
      field: "createdOn",
      headerName: t("general.createdOn"),
      flex: 1,
      align: "center",
      headerAlign: "center",
      minWidth: 140,
      valueFormatter: renderDate,
    },
    {
      field: "updatedOn",
      headerName: t("general.updatedOn"),
      flex: 1,
      align: "center",
      headerAlign: "center",
      minWidth: 140,
      valueFormatter: renderDate,
    },
  ];

  // Add actions column if user has any permissions
  if (permissions.canView || permissions.canEdit || permissions.canDelete) {
    baseColumns.push({
      field: "actions",
      type: "actions",
      headerName: t("actions.buttons"),
      flex: 1,
      align: "center",
      headerAlign: "center",
      minWidth: 120,
      getActions,
    });
  }

  return baseColumns;
};
```

## **Step 3: Create Actions Factory**

Build `gridActions.tsx` for permission-based action buttons:

```typescript
import React from "react";
import { GridActionsCellItem, GridActionsCellItemProps } from "@mui/x-data-grid";
import { Delete, Edit, Visibility } from "@mui/icons-material";
import type { Country } from "../../types/Country";

export interface CountriesPermissionsModel {
  canView: boolean;
  canEdit: boolean;
  canDelete: boolean;
}

export interface ActionFactoryProps {
  t: (key: string) => string;
  permissions: CountriesPermissionsModel;
  onView: (country: Country) => void;
  onEdit: (country: Country) => void;
  onDelete: (country: Country) => void;
}

export const makeCountryActions = ({ 
  t, 
  permissions, 
  onView, 
  onEdit, 
  onDelete 
}: ActionFactoryProps) => {
  return (params: { row: Country }): React.ReactElement<GridActionsCellItemProps>[] => {
    const actions: React.ReactElement<GridActionsCellItemProps>[] = [];

    // View action
    if (permissions.canView) {
      actions.push(
        <GridActionsCellItem
          key={`view-${params.row.id}`}
          icon={<Visibility sx={{ fontSize: 20 }} />}
          label={t("actions.view")}
          color="info"
          onClick={() => onView(params.row)}
          showInMenu={false}
        />
      );
    }

    // Edit action
    if (permissions.canEdit) {
      actions.push(
        <GridActionsCellItem
          key={`edit-${params.row.id}`}
          icon={<Edit sx={{ fontSize: 20 }} />}
          label={t("actions.edit")}
          color="primary"
          onClick={() => onEdit(params.row)}
          showInMenu={false}
        />
      );
    }

    // Delete action
    if (permissions.canDelete) {
      actions.push(
        <GridActionsCellItem
          key={`delete-${params.row.id}`}
          icon={<Delete sx={{ fontSize: 20 }} />}
          label={t("actions.delete")}
          color="error"
          onClick={() => onDelete(params.row)}
          showInMenu={false}
        />
      );
    }

    return actions;
  };
};
```

## **Step 4: Integration with Multi-View**

Integrate the grid view into the multi-view container:

```typescript
// In countriesMultiView.tsx
import DistrictsDataGrid from "./gridView/countriesDataGrid";

const renderView = () => {
  switch (currentViewType) {
    case "grid":
      return (
        <CountriesDataGrid
          countries={displayCountries}
          loading={displayLoading}
          apiRef={apiRef}
          onEdit={onEdit}
          onDelete={onDelete}
          onView={onView}
          onAdd={onAdd}
          t={t}
        />
      );
    case "cards":
      return (
        <CountriesCardView
          // ... card view props
        />
      );
    case "chart":
      return (
        <CountriesChartView
          // ... chart view props
        />
      );
    default:
      return (
        <CountriesDataGrid
          countries={displayCountries}
          loading={displayLoading}
          apiRef={apiRef}
          onEdit={onEdit}
          onDelete={onDelete}
          onView={onView}
          onAdd={onAdd}
          t={t}
        />
      );
  }
};
```

---

## 🎨 Key Features

### **1. Advanced Data Grid**
- **MUI X DataGrid**: Professional-grade data grid component
- **Custom Styling**: Consistent theme integration
- **Responsive Design**: Adaptive column widths and layouts
- **Performance Optimized**: Handles large datasets efficiently

### **2. Column Management**
- **Dynamic Columns**: Configurable column definitions
- **Custom Renderers**: Specialized cell rendering for different data types
- **Sorting & Filtering**: Built-in sorting and filtering capabilities
- **Resizable Columns**: User-adjustable column widths

### **3. Custom Toolbar**
- **Export Options**: Excel, PDF, CSV, Print
- **Column Controls**: Show/hide columns
- **Density Selector**: Compact, standard, comfortable views
- **Filter Button**: Advanced filtering interface
- **Add Button**: Permission-based record creation

### **4. Enhanced Navigation**
- **Record Navigation**: First, previous, next, last record buttons
- **Page Information**: Current page and total pages display
- **Row Selection**: Single and multiple row selection
- **Keyboard Navigation**: Full keyboard accessibility

### **5. Permission System**
- **Role-Based Access**: Actions based on user permissions
- **Dynamic UI**: Show/hide features based on roles
- **Secure Operations**: Backend permission validation

---

## 📊 Column Types & Renderers

### **1. Basic Columns**
```typescript
{
  field: "id",
  headerName: t("general.id"),
  flex: 0.5,
  align: "center",
  headerAlign: "center",
  minWidth: 80,
}
```

### **2. Text Columns with Custom Rendering**
```typescript
{
  field: "nameEn",
  headerName: t("general.nameEn"),
  flex: 1.5,
  align: "center",
  headerAlign: "center",
  minWidth: 180,
  renderCell: renderCountryName(true),
}
```

### **3. Code Columns**
```typescript
{
  field: "alpha2Code",
  headerName: t("countries.alpha2Code"),
  flex: 0.8,
  align: "center",
  headerAlign: "center",
  minWidth: 100,
  renderCell: renderAlphaCode,
}
```

### **4. List/Array Columns**
```typescript
{
  field: "states",
  headerName: t("countries.states"),
  flex: 1.2,
  align: "center",
  headerAlign: "center",
  minWidth: 200,
  sortable: false,
  valueGetter: (params: any) => {
    return Array.isArray(params)
      ? params
          .filter((state: any) => !state.isDeleted)
          .map((state: any) => (theme.direction === "rtl" ? state.nameAr : state.nameEn))
      : [];
  },
  renderCell: renderList({
    displayType: "chips",
    maxItems: 2,
    defaultColor: "primary",
    variant: "outlined",
    size: "small",
    showCount: true,
    emptyText: t("countries.noStates"),
    chipProps: {
      icon: <LocationOn sx={{ fontSize: 14 }} />,
      sx: { fontSize: "0.75rem" },
    },
  }),
}
```

### **5. Date Columns**
```typescript
{
  field: "createdOn",
  headerName: t("general.createdOn"),
  flex: 1,
  align: "center",
  headerAlign: "center",
  minWidth: 140,
  valueFormatter: renderDate,
}
```

### **6. Actions Column**
```typescript
{
  field: "actions",
  type: "actions",
  headerName: t("actions.buttons"),
  flex: 1,
  align: "center",
  headerAlign: "center",
  minWidth: 120,
  getActions: (params) => [
    <GridActionsCellItem
      icon={<Visibility />}
      label={t("actions.view")}
      onClick={() => onView(params.row)}
    />,
    // ... more actions
  ],
}
```

---

## 🔧 Advanced Features

### **1. Export Functionality**
```typescript
// Multiple export formats
const exportOptions = {
  excel: "Server-side Excel export with formatting",
  pdf: "PDF export with custom headers",
  csv: "Client-side CSV export",
  print: "Print-friendly format"
};

// Usage in toolbar
<MenuItem onClick={() => serverExportToExcel({ selectedOnly: false })}>
  {t("actions.exportExcel")}
</MenuItem>
```

### **2. Custom Filtering**
```typescript
// Built-in filtering with custom operators
const filterOperators = {
  contains: "Contains text",
  equals: "Exact match",
  startsWith: "Starts with",
  endsWith: "Ends with",
  isEmpty: "Is empty",
  isNotEmpty: "Is not empty"
};
```

### **3. Sorting Configuration**
```typescript
// Default sort model
sortModel={[{ field: "id", sort: "asc" }]}

// Multi-column sorting support
const sortModel = [
  { field: "nameEn", sort: "asc" },
  { field: "createdOn", sort: "desc" }
];
```

### **4. Pagination Options**
```typescript
// Flexible pagination
pageSizeOptions={[5, 10, 25, 50, 100]}

// Initial pagination state
initialState={{
  pagination: {
    paginationModel: { pageSize: 10, page: 0 },
  },
}}
```

---

## 📱 Responsive Design

### **Column Flexibility**
```typescript
// Responsive column configuration
const columns = [
  {
    field: "nameEn",
    flex: 1.5,        // Flexible width
    minWidth: 180,    // Minimum width
    maxWidth: 300,    // Maximum width (optional)
  }
];
```

### **Breakpoint Considerations**
- **Desktop (>1200px)**: Full column display
- **Tablet (768-1200px)**: Hide less important columns
- **Mobile (<768px)**: Show only essential columns

---

## 🎯 Performance Optimization

### **1. Virtualization**
- **Row Virtualization**: Only render visible rows
- **Column Virtualization**: Only render visible columns
- **Lazy Loading**: Load data on demand

### **2. Memoization**
```typescript
// Memoize expensive operations
const columns = useMemo(() => 
  useCountryColumns({ t, permissions, getActions }), 
  [t, permissions, getActions]
);

const getActions = useCallback(
  makeCountryActions({ t, permissions, onView, onEdit, onDelete }),
  [t, permissions, onView, onEdit, onDelete]
);
```

### **3. Efficient Updates**
```typescript
// Use stable references for callbacks
const handleEdit = useCallback((country: Country) => {
  onEdit(country);
}, [onEdit]);
```

---

## 🧪 Testing Checklist

### **Functionality Tests**
- [ ] **Data Display**: All columns render correctly
- [ ] **Sorting**: All sortable columns work properly
- [ ] **Filtering**: Filter functionality works as expected
- [ ] **Pagination**: Navigation between pages works
- [ ] **Actions**: CRUD operations function correctly
- [ ] **Export**: All export formats work properly
- [ ] **Selection**: Row selection works correctly

### **Performance Tests**
- [ ] **Large Datasets**: Handles 10,000+ records smoothly
- [ ] **Sorting Performance**: No lag when sorting large datasets
- [ ] **Filter Performance**: Quick filtering response
- [ ] **Memory Usage**: No memory leaks during navigation

### **Accessibility Tests**
- [ ] **Keyboard Navigation**: Full keyboard accessibility
- [ ] **Screen Readers**: Proper ARIA labels
- [ ] **Focus Management**: Clear focus indicators
- [ ] **Color Contrast**: Meets WCAG guidelines

### **Responsive Tests**
- [ ] **Desktop**: Full functionality on large screens
- [ ] **Tablet**: Appropriate column hiding/showing
- [ ] **Mobile**: Essential columns visible and usable

---

## 🔄 Reusability Guidelines

### **1. Generic Column Factory**
```typescript
// Create reusable column patterns
export const createStandardColumns = <T>(
  fields: Array<keyof T>,
  t: (key: string) => string
): GridColDef[] => {
  return fields.map(field => ({
    field: field as string,
    headerName: t(`general.${field as string}`),
    flex: 1,
    align: "center",
    headerAlign: "center",
  }));
};
```

### **2. Permission-Based Actions**
```typescript
// Reusable action factory
export const createStandardActions = <T>(
  permissions: PermissionModel,
  handlers: ActionHandlers<T>,
  t: (key: string) => string
) => {
  return (params: { row: T }) => {
    const actions = [];
    
    if (permissions.canView) {
      actions.push(createViewAction(params.row, handlers.onView, t));
    }
    
    if (permissions.canEdit) {
      actions.push(createEditAction(params.row, handlers.onEdit, t));
    }
    
    if (permissions.canDelete) {
      actions.push(createDeleteAction(params.row, handlers.onDelete, t));
    }
    
    return actions;
  };
};
```

### **3. Configuration-Driven Grids**
```typescript
// Grid configuration object
interface GridConfig<T> {
  columns: ColumnConfig[];
  permissions: PermissionModel;
  exportOptions: ExportConfig;
  paginationOptions: PaginationConfig;
}

// Usage
const countryGridConfig: GridConfig<Country> = {
  columns: [
    { field: 'nameEn', type: 'text', flex: 1.5 },
    { field: 'alpha2Code', type: 'code', flex: 0.8 },
    // ... more columns
  ],
  permissions: useCountriesPermissions(),
  exportOptions: {
    fileName: 'countries',
    formats: ['excel', 'pdf', 'csv']
  },
  paginationOptions: {
    pageSizes: [5, 10, 25, 50],
    defaultPageSize: 10
  }
};
```

---

## 📚 Best Practices

### **1. Code Organization**
- **Separation of Concerns**: Keep columns, actions, and main component separate
- **Type Safety**: Use comprehensive TypeScript interfaces
- **Consistent Naming**: Follow established conventions

### **2. Performance**
- **Memoization**: Use React.memo, useMemo, and useCallback appropriately
- **Virtualization**: Enable for large datasets
- **Efficient Rendering**: Minimize re-renders with stable references

### **3. User Experience**
- **Loading States**: Show progress during data loading
- **Error Handling**: Graceful error recovery and user feedback
- **Accessibility**: Full keyboard and screen reader support

### **4. Maintainability**
- **Documentation**: Comprehensive inline comments
- **Testing**: Unit and integration test coverage
- **Modularity**: Easy to extend and modify

---

## 🌐 Internationalization

### **1. Column Headers**
```typescript
// Translated headers
headerName: t("countries.alpha2Code")
```

### **2. Action Labels**
```typescript
// Translated action labels
label={t("actions.view")}
```

### **3. RTL Support**
```typescript
// RTL-aware value getters
valueGetter: (params: any) => {
  return theme.direction === "rtl" ? params.nameAr : params.nameEn;
}
```

### **4. Export File Names**
```typescript
// Localized export file names
fileName={t("countries.title")}
reportPdfHeader={t("countries.title")}
```

---

## 🎯 Summary

This grid view implementation provides:

✅ **Professional Data Grid** - MUI X DataGrid with advanced features
✅ **Comprehensive Functionality** - Sort, filter, export, navigate
✅ **Permission-Based Security** - Role-aware UI and operations
✅ **Performance Optimized** - Handles large datasets efficiently
✅ **Fully Accessible** - Keyboard and screen reader friendly
✅ **Internationalized** - Multi-language and RTL support
✅ **Highly Customizable** - Configurable columns and actions
✅ **Export Capabilities** - Multiple export formats
✅ **Responsive Design** - Works across all device sizes
✅ **Type Safe** - Comprehensive TypeScript coverage

Use this guide as a template for implementing grid views in other features like States, Districts, or Employees. The patterns and components can be easily adapted while maintaining consistency and functionality across the application.

The grid view is ideal for:
- **Data Management**: Large datasets requiring sorting and filtering
- **Administrative Tasks**: Bulk operations and data export
- **Power Users**: Advanced features and keyboard navigation
- **Reporting**: Data analysis and export capabilities