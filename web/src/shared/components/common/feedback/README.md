# State Components

Reusable components for displaying empty states and no-results states throughout the application.

## Components

### EmptyState

A flexible component for displaying empty states when there's no data to show.

#### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `icon` | `React.ComponentType<SvgIconProps>` | `Inbox` | The icon to display |
| `title` | `string` | - | Main title text (required) |
| `subtitle` | `string` | - | Subtitle or description text |
| `actionText` | `string` | - | Primary action button text |
| `onAction` | `() => void` | - | Primary action button handler |
| `secondaryActionText` | `string` | - | Secondary action button text |
| `onSecondaryAction` | `() => void` | - | Secondary action button handler |
| `withPaper` | `boolean` | `true` | Whether to wrap in Paper component |
| `sx` | `object` | `{}` | Custom styling for the container |
| `iconSize` | `'small' \| 'medium' \| 'large'` | `'large'` | Size variant for the icon |
| `showRefresh` | `boolean` | `false` | Whether to show refresh button |
| `onRefresh` | `() => void` | - | Refresh button handler |

#### Usage Examples

```tsx
// Basic usage
<EmptyState
  title="No Employees Found"
  subtitle="Get started by adding your first employee."
  actionText="Add Employee"
  onAction={handleAddEmployee}
/>

// With custom icon and multiple actions
<EmptyState
  icon={Assignment}
  title="No Projects Available"
  subtitle="Create your first project or import existing data."
  actionText="New Project"
  onAction={handleNewProject}
  secondaryActionText="Import Data"
  onSecondaryAction={handleImportData}
/>

// Without paper container (for use inside cards/containers)
<EmptyState
  title="Empty Folder"
  subtitle="This folder contains no files."
  withPaper={false}
  iconSize="small"
/>
```

### NoResultsState

A component for displaying no-results states when searches or filters return empty results.

#### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `searchTerm` | `string` | - | The search term that produced no results |
| `message` | `string` | - | Custom message instead of default |
| `subtitle` | `string` | - | Subtitle or additional context |
| `onClearSearch` | `() => void` | - | Handler for clearing search |
| `onClearFilters` | `() => void` | - | Handler for clearing filters |
| `onRefresh` | `() => void` | - | Handler for refreshing data |
| `icon` | `React.ComponentType<SvgIconProps>` | `Search` | Custom icon to display |
| `withPaper` | `boolean` | `true` | Whether to wrap in Paper component |
| `sx` | `object` | `{}` | Custom styling for the container |
| `iconSize` | `'small' \| 'medium' \| 'large'` | `'large'` | Size variant for the icon |
| `customAction` | `object` | - | Custom action button configuration |

#### CustomAction Object

```tsx
{
  text: string;
  handler: () => void;
  icon?: React.ComponentType<SvgIconProps>;
  variant?: 'contained' | 'outlined' | 'text';
}
```

#### Usage Examples

```tsx
// Basic search no results
<NoResultsState
  searchTerm="john doe"
  onClearSearch={handleClearSearch}
  onRefresh={handleRefresh}
/>

// Filter no results
<NoResultsState
  message="No states match your filters"
  subtitle="Try removing some filters or adjusting your criteria."
  onClearFilters={handleClearFilters}
/>

// With custom action
<NoResultsState
  icon={LocationOn}
  message="No locations in this region"
  customAction={{
    text: "Add Location",
    handler: handleAddLocation,
    variant: "contained"
  }}
/>

// Multiple actions
<NoResultsState
  searchTerm="search term"
  onClearSearch={handleClearSearch}
  onClearFilters={handleClearFilters}
  onRefresh={handleRefresh}
  customAction={{
    text: "Create New",
    handler: handleCreate,
    variant: "outlined"
  }}
/>
```

### EmptyChartState

A specialized component for displaying empty states in chart containers with consistent styling.

#### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `title` | `string` | - | Chart title (required) |
| `message` | `string` | - | Empty state message |
| `subtitle` | `string` | - | Subtitle or description |
| `chartIcon` | `React.ComponentType<SvgIconProps>` | `TrendingUp` | Icon for chart header |
| `emptyIcon` | `React.ComponentType<SvgIconProps>` | `BarChart` | Icon for empty state |
| `height` | `number` | `400` | Height of chart container |
| `actionText` | `string` | - | Primary action button text |
| `onAction` | `() => void` | - | Primary action button handler |
| `secondaryActionText` | `string` | - | Secondary action button text |
| `onSecondaryAction` | `() => void` | - | Secondary action button handler |
| `showRefresh` | `boolean` | `false` | Whether to show refresh button |
| `onRefresh` | `() => void` | - | Refresh button handler |
| `sx` | `object` | `{}` | Custom styling for container |
| `elevation` | `number` | `2` | Paper elevation |
| `gradient` | `boolean` | `false` | Whether to use gradient background |
| `actions` | `React.ReactNode` | - | Additional header actions |

#### Usage Examples

```tsx
// Basic chart empty state
<EmptyChartState
  title="Sales Analytics"
  message="No Sales Data Available"
  subtitle="Start by adding your first sale to see analytics"
  actionText="Add Sale"
  onAction={handleAddSale}
/>

// Custom icons and multiple actions
<EmptyChartState
  title="Performance Dashboard"
  chartIcon={Assessment}
  emptyIcon={Analytics}
  message="No Performance Data"
  actionText="Import Data"
  onAction={handleImport}
  secondaryActionText="Add Entry"
  onSecondaryAction={handleAdd}
  showRefresh={true}
  onRefresh={handleRefresh}
/>

// Chart-specific styling
<EmptyChartState
  title="Revenue by Region"
  chartIcon={BarChart}
  emptyIcon={BarChart}
  height={350}
  gradient={true}
  elevation={3}
/>
```

## When to Use

### EmptyState
- Initial empty lists (no data has been added yet)
- New features with no content
- Empty dashboards or sections
- After data deletion when list becomes empty

### NoResultsState
- Search queries that return no results
- Applied filters that exclude all items
- Temporary empty states due to filtering/searching
- When data exists but current view shows none

### EmptyChartState
- Chart components with no data to display
- Analytics dashboards without data
- Empty visualization containers
- Chart placeholders during initial load

## Design Guidelines

### Icons
- Use contextually appropriate Material-UI icons
- Consider the domain: `People` for users, `Assignment` for tasks, `LocationOn` for locations
- Default icons are sensible but custom icons improve UX

### Messages
- Keep titles concise and descriptive
- Subtitles should guide users on next steps
- Use positive, helpful language

### Actions
- Always provide a clear path forward
- Primary actions should be the most common next step
- Secondary actions provide alternatives
- Use appropriate button variants (contained for primary, outlined for secondary)

### Styling
- Components use theme colors automatically
- Gradient backgrounds provide visual interest
- Consistent spacing and typography
- Responsive design works on all screen sizes

## Import

```tsx
import { EmptyState, NoResultsState, EmptyChartState } from '@/shared/components/common/feedback';
```

## Examples

See `StateComponentsExample.tsx` and `EmptyChartStateExample.tsx` for comprehensive usage examples and interactive demonstrations.