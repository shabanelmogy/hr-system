# Reusable Chart Components Library

A comprehensive collection of reusable chart components built with Recharts and Material-UI for the HR Management system.

## 📊 Available Charts

### 1. BarChart
Vertical and horizontal bar charts with customizable styling.

```jsx
import { BarChart } from '@/shared/components/charts';

<BarChart
  data={data}
  title="Sales by Region"
  xKey="region"
  yKey="sales"
  colors={COLOR_PALETTES.primary}
  height={400}
  showGrid={true}
  orientation="vertical" // or "horizontal"
/>
```

### 2. PieChart
Traditional pie charts with customizable labels and legends.

```jsx
import { PieChart } from '@/shared/components/charts';

<PieChart
  data={data}
  title="Market Share"
  nameKey="company"
  valueKey="share"
  colors={COLOR_PALETTES.rainbow}
  showLegend={true}
  showLabels={true}
/>
```

### 3. DonutChart
Donut charts with center content display.

```jsx
import { DonutChart } from '@/shared/components/charts';

<DonutChart
  data={data}
  title="Revenue Distribution"
  nameKey="category"
  valueKey="revenue"
  centerLabel="Total"
  showCenterValue={true}
/>
```

### 4. LineChart
Line charts for time series and trend data.

```jsx
import { LineChart } from '@/shared/components/charts';

<LineChart
  data={timeSeriesData}
  title="Growth Trends"
  xKey="month"
  multiSeries={[
    { key: 'sales', name: 'Sales', color: '#1976d2' },
    { key: 'profit', name: 'Profit', color: '#2e7d32' }
  ]}
  smooth={true}
  showDots={true}
/>
```

### 5. AreaChart
Area charts with gradient fills and stacking options.

```jsx
import { AreaChart } from '@/shared/components/charts';

<AreaChart
  data={data}
  title="Cumulative Growth"
  xKey="month"
  multiSeries={[
    { key: 'revenue', name: 'Revenue', color: '#1976d2' },
    { key: 'expenses', name: 'Expenses', color: '#d32f2f' }
  ]}
  stacked={true}
  gradient={true}
/>
```

### 6. ComposedChart
Combination charts with bars, lines, and areas.

```jsx
import { ComposedChart } from '@/shared/components/charts';

<ComposedChart
  data={data}
  title="Sales Analytics"
  xKey="month"
  series={[
    { type: 'bar', key: 'sales', name: 'Sales', color: '#1976d2', yAxisId: 'left' },
    { type: 'line', key: 'growth', name: 'Growth %', color: '#2e7d32', yAxisId: 'right' }
  ]}
/>
```

### 7. ScatterChart
Scatter plots for correlation analysis.

```jsx
import { ScatterChart } from '@/shared/components/charts';

<ScatterChart
  data={scatterData}
  title="Performance Analysis"
  xKey="experience"
  yKey="salary"
  zKey="performance" // For bubble size
/>
```

### 8. RadarChart
Radar/spider charts for multi-dimensional data.

```jsx
import { RadarChart } from '@/shared/components/charts';

<RadarChart
  data={radarData}
  title="Skills Assessment"
  multiSeries={[
    { key: 'employee1', name: 'John Doe', color: '#1976d2' },
    { key: 'employee2', name: 'Jane Smith', color: '#2e7d32' }
  ]}
/>
```

### 9. GaugeChart
Gauge charts for KPI visualization.

```jsx
import { GaugeChart } from '@/shared/components/charts';

<GaugeChart
  value={75}
  maxValue={100}
  title="Performance Score"
  showPercentage={true}
  thresholds={[40, 70]}
  colors={['#d32f2f', '#ff9800', '#2e7d32']}
/>
```

### 10. ChartShowcase
Comprehensive showcase of all chart types.

```jsx
import { ChartShowcase } from '@/shared/components/charts';

<ChartShowcase
  data={yourData}
  title="Data Visualization"
  subtitle="Interactive chart examples"
/>
```

## 🎨 Color Palettes

Pre-defined color palettes available:

```jsx
import { COLOR_PALETTES } from '@/shared/components/charts/chartUtils';

// Available palettes:
COLOR_PALETTES.primary    // Blue tones
COLOR_PALETTES.secondary  // Purple tones
COLOR_PALETTES.success    // Green tones
COLOR_PALETTES.warning    // Orange tones
COLOR_PALETTES.error      // Red tones
COLOR_PALETTES.info       // Light blue tones
COLOR_PALETTES.neutral    // Gray tones
COLOR_PALETTES.rainbow    // Multi-color palette
```

## 🛠️ Utility Functions

### Data Transformation
```jsx
import { transformDataForChart, sortChartData, getTopItems } from '@/shared/components/charts/chartUtils';

// Transform data for charts
const chartData = transformDataForChart(rawData, 'name', 'value', 'category');

// Sort data
const sortedData = sortChartData(data, 'value', 'desc');

// Get top N items
const topItems = getTopItems(data, 'value', 5);
```

### Formatting
```jsx
import { formatNumber, formatPercentage, formatCurrency } from '@/shared/components/charts/chartUtils';

// Format numbers
const formatted = formatNumber(1234.56); // "1,234.56"

// Format percentages
const percent = formatPercentage(75.5); // "75.5%"

// Format currency
const currency = formatCurrency(1234.56, 'USD'); // "$1,234.56"
```

### Statistics
```jsx
import { calculateStats } from '@/shared/components/charts/chartUtils';

const stats = calculateStats(data, 'value');
// Returns: { sum, avg, min, max, count }
```

## 🎯 Common Props

All chart components share these common props:

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `data` | Array | `[]` | Chart data array |
| `title` | String | - | Chart title |
| `subtitle` | String | - | Chart subtitle |
| `height` | Number | `400` | Chart height in pixels |
| `loading` | Boolean | `false` | Show loading state |
| `error` | Object | `null` | Error object to display |
| `colors` | Array | `COLOR_PALETTES.primary` | Color palette |
| `showGrid` | Boolean | `true` | Show grid lines |
| `showLegend` | Boolean | `false` | Show legend |
| `showTooltip` | Boolean | `true` | Show tooltips |
| `gradient` | Boolean | `false` | Apply gradient background |
| `formatValue` | Function | `formatNumber` | Value formatter |
| `formatLabel` | Function | `(label) => label` | Label formatter |

## 📱 Responsive Design

All charts are responsive and adapt to different screen sizes:

- **Mobile (xs)**: Simplified layouts, smaller fonts, icon-only legends
- **Tablet (sm-md)**: Balanced layouts with abbreviated labels
- **Desktop (lg+)**: Full layouts with complete labels and legends

## 🎨 Theming

Charts automatically adapt to your Material-UI theme:

```jsx
// Charts respect theme colors, typography, and spacing
const theme = useTheme();

// Custom theme integration
<BarChart
  data={data}
  colors={[
    theme.palette.primary.main,
    theme.palette.secondary.main,
    theme.palette.success.main
  ]}
/>
```

## 📊 Usage Examples

### States Management Example
```jsx
// In statesChartView.jsx
import { BarChart, PieChart, DonutChart } from '@/shared/components/charts';

const StatesChartView = ({ states }) => {
  const chartData = states.map(state => ({
    name: state.country?.nameEn,
    value: 1
  }));

  return (
    <Grid container spacing={3}>
      <Grid item xs={12} md={6}>
        <BarChart
          data={chartData}
          title="States by Country"
          xKey="name"
          yKey="value"
          colors={COLOR_PALETTES.primary}
        />
      </Grid>
      <Grid item xs={12} md={6}>
        <DonutChart
          data={chartData}
          title="Distribution"
          nameKey="name"
          valueKey="value"
          centerLabel="Total States"
        />
      </Grid>
    </Grid>
  );
};
```

## 🔧 Customization

### Custom Tooltips
```jsx
<BarChart
  data={data}
  customTooltip={({ active, payload, label }) => {
    if (!active) return null;
    return (
      <div className="custom-tooltip">
        <p>{label}</p>
        <p>Value: {payload[0].value}</p>
      </div>
    );
  }}
/>
```

### Event Handlers
```jsx
<PieChart
  data={data}
  onSliceClick={(data, index) => {
    console.log('Clicked slice:', data, index);
  }}
/>
```

### Multi-Series Data
```jsx
<LineChart
  data={timeSeriesData}
  multiSeries={[
    { key: 'series1', name: 'Sales', color: '#1976d2' },
    { key: 'series2', name: 'Profit', color: '#2e7d32' },
    { key: 'series3', name: 'Expenses', color: '#d32f2f' }
  ]}
/>
```

## 🚀 Performance Tips

1. **Data Optimization**: Limit data points for better performance (max 1000 points for line charts)
2. **Lazy Loading**: Use loading states for large datasets
3. **Memoization**: Wrap chart data transformations in `useMemo`
4. **Responsive Images**: Use appropriate chart sizes for different screens

## 📦 Dependencies

- `recharts`: Chart rendering library
- `@mui/material`: Material-UI components
- `@mui/icons-material`: Material-UI icons

## 🤝 Contributing

To add new chart types:

1. Create new component in `/charts/` directory
2. Follow existing component patterns
3. Add to `index.js` exports
4. Update documentation
5. Add examples to `ChartShowcase`

## 📄 License

This chart library is part of the HR Management System and follows the same license terms.