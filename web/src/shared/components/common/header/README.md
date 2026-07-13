# MultiViewHeader Component

A reusable header component for multi-view interfaces that provides consistent styling and functionality across different features.

## Features

- **Responsive Design**: Optimized layouts for both desktop and mobile devices
- **View Toggle**: Support for multiple view types (grid, cards, chart, etc.)
- **Action Buttons**: Configurable action buttons (add, refresh, export, filter)
- **Data Statistics**: Display data count and current view information
- **Customizable**: Flexible props for different use cases
- **Consistent Styling**: Unified design language across all features

## Usage

```jsx
import { useState } from "react";
import { MultiViewHeader } from "@/shared/components";

const MyMultiView = ({ data, onAdd, t }) => {
  const [currentViewType, setCurrentViewType] = useState("grid");

  const handleViewTypeChange = (newViewType) => {
    setCurrentViewType(newViewType);
  };

  return (
    <Box>
      <MultiViewHeader
        title={t("title") || "Data Management"}
        storageKey="my-view-layout"
        defaultView="grid"
        availableViews={["grid", "cards", "chart"]}
        viewLabels={{
          grid: t("views.grid") || "Grid",
          cards: t("views.cards") || "Cards",
          chart: t("views.chart") || "Chart",
        }}
        onAdd={onAdd}
        dataCount={data?.length || 0}
        totalLabel={t("total") || "Total"}
        onViewTypeChange={handleViewTypeChange}
        t={t}
        showActions={{
          add: true,
          refresh: true,
          export: false,
          filter: false,
        }}
      />
      {/* Your view content based on currentViewType */}
    </Box>
  );
};
```

## Props

### Required Props

| Prop | Type | Description |
|------|------|-------------|
| `title` | string | The main title displayed in the header |
| `storageKey` | string | localStorage key for view persistence |
| `onAdd` | function | Handler for add button click |

### Optional Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `defaultView` | string | "grid" | Default view type when no saved preference |
| `availableViews` | array | `["grid", "cards", "chart"]` | Array of available view types |
| `viewLabels` | object | `{}` | Custom labels for view types |
| `dataCount` | number | 0 | Number of items to display in the count chip |
| `totalLabel` | string | "Total" | Label for the total count chip |
| `onRefresh` | function | `window.location.reload` | Handler for refresh button |
| `onExport` | function | `console.log` | Handler for export button |
| `onFilter` | function | `console.log` | Handler for filter button |
| `onViewTypeChange` | function | - | Callback when view type changes |
| `t` | function | `(key) => key` | Translation function |
| `showActions` | object | See below | Configuration for which action buttons to show |
| `additionalChips` | array | `[]` | Additional chips to display |
| `sx` | object | `{}` | Additional styling for the Paper component |

### showActions Object

```jsx
showActions: {
  add: true,      // Show add button
  refresh: true,  // Show refresh button  
  export: false,  // Show export button
  filter: false,  // Show filter button
}
```

### viewOptions Array Structure

```jsx
viewOptions: [
  {
    value: "grid",           // Unique identifier
    label: "Grid View",      // Display label
    icon: <TableChart />     // MUI icon component
  }
]
```

## Examples

### Basic Usage
```jsx
<MultiViewHeader
  title="Countries Management"
  storageKey="countries-view-layout"
  onAdd={onAdd}
  dataCount={countries.length}
  totalLabel="Countries"
  t={t}
/>
```

### With Custom Views and Actions
```jsx
<MultiViewHeader
  title="States Management"
  storageKey="states-view-layout"
  defaultView="grid"
  availableViews={["grid", "cards", "chart"]}
  viewLabels={{
    grid: t("states.views.grid") || "Grid",
    cards: t("states.views.cards") || "Cards",
    chart: t("states.views.chart") || "Chart",
  }}
  onAdd={onAdd}
  dataCount={states.length}
  onRefresh={handleRefresh}
  onExport={handleExport}
  onFilter={handleFilter}
  onViewTypeChange={handleViewTypeChange}
  showActions={{
    add: true,
    refresh: true,
    export: true,
    filter: true,
  }}
  t={t}
/>
```

### With Additional Chips
```jsx
<MultiViewHeader
  title="Products Management"
  storageKey="products-view-layout"
  onAdd={onAdd}
  dataCount={products.length}
  additionalChips={[
    { label: "Active", size: "small", color: "success" },
    { label: "Draft", size: "small", color: "warning" }
  ]}
  t={t}
/>
```

## Migration from Existing Components

To migrate from existing multi-view components:

1. Import the `MultiViewHeader` component
2. Replace the existing header JSX with the `MultiViewHeader` component
3. Pass the required props
4. Remove the old header code and unused imports
5. Test the functionality

## Benefits

- **Consistency**: All multi-view interfaces will have the same look and feel
- **Maintainability**: Changes to the header design only need to be made in one place
- **Reusability**: Easy to implement in new features
- **Responsive**: Built-in mobile optimization
- **Accessibility**: Proper ARIA labels and keyboard navigation