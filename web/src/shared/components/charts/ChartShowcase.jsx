/* eslint-disable react/prop-types */
import { useState } from 'react';
import {
  Box,
  Grid,
  ToggleButton,
  ToggleButtonGroup,
  Typography,
  Card,
  CardContent,
  useTheme
} from '@mui/material';
import {
  BarChart as BarChartIcon,
  PieChart as PieChartIcon,
  ShowChart,
  Timeline,
  DonutLarge,
  ScatterPlot,
  Assessment,
  TrendingUp,
  AccountTree,
  FilterList,
  Layers,
  GridOn,
  MultilineChart,
  TrendingDown,
  Speed
} from '@mui/icons-material';

import {
  BarChart,
  PieChart,
  LineChart,
  AreaChart,
  DonutChart,
  ComposedChart,
  RadarChart,
  ScatterChart,
  GaugeChart,
  TreemapChart,
  FunnelChart,
  SankeyChart,
  HeatmapChart,
  CandlestickChart,
  WaterfallChart,
  BulletChart
} from './index';

import { generateMockData, COLOR_PALETTES } from './chartUtils';

const ChartShowcase = ({
  data = null,
  title = "Comprehensive Chart Library",
  subtitle = "All available chart types with interactive examples"
}) => {
  const theme = useTheme();
  const [selectedChart, setSelectedChart] = useState('all');

  // Generate various mock data sets
  const chartData = data || generateMockData(8);
  
  const pieData = chartData.slice(0, 6).map(item => ({
    name: item.name,
    value: item.value
  }));

  const timeSeriesData = Array.from({ length: 12 }, (_, i) => ({
    month: `Month ${i + 1}`,
    sales: Math.floor(Math.random() * 100) + 20,
    profit: Math.floor(Math.random() * 50) + 10,
    expenses: Math.floor(Math.random() * 30) + 5,
    growth: Math.floor(Math.random() * 20) - 10
  }));

  const scatterData = Array.from({ length: 20 }, (_, i) => ({
    x: Math.floor(Math.random() * 100),
    y: Math.floor(Math.random() * 100),
    z: Math.floor(Math.random() * 50) + 10,
    name: `Point ${i + 1}`
  }));

  const radarData = [
    { subject: 'Math', A: 120, B: 110, fullMark: 150 },
    { subject: 'Chinese', A: 98, B: 130, fullMark: 150 },
    { subject: 'English', A: 86, B: 130, fullMark: 150 },
    { subject: 'Geography', A: 99, B: 100, fullMark: 150 },
    { subject: 'Physics', A: 85, B: 90, fullMark: 150 },
    { subject: 'History', A: 65, B: 85, fullMark: 150 }
  ];

  const treemapData = [
    { name: 'Category A', size: 400, category: 'Tech' },
    { name: 'Category B', size: 300, category: 'Finance' },
    { name: 'Category C', size: 200, category: 'Healthcare' },
    { name: 'Category D', size: 150, category: 'Education' },
    { name: 'Category E', size: 100, category: 'Retail' }
  ];

  const funnelData = [
    { name: 'Visitors', value: 1000 },
    { name: 'Leads', value: 800 },
    { name: 'Prospects', value: 600 },
    { name: 'Customers', value: 400 },
    { name: 'Loyal Customers', value: 200 }
  ];

  const sankeyData = {
    nodes: [
      { name: 'Source A' },
      { name: 'Source B' },
      { name: 'Target X' },
      { name: 'Target Y' },
      { name: 'Target Z' }
    ],
    links: [
      { source: 0, target: 2, value: 10 },
      { source: 1, target: 2, value: 15 },
      { source: 0, target: 3, value: 20 },
      { source: 1, target: 4, value: 25 }
    ]
  };

  const heatmapData = Array.from({ length: 5 }, (_, i) =>
    Array.from({ length: 7 }, (_, j) => ({
      x: `Day ${j + 1}`,
      y: `Week ${i + 1}`,
      value: Math.floor(Math.random() * 100)
    }))
  ).flat();

  const candlestickData = Array.from({ length: 20 }, (_, i) => {
    const open = 100 + Math.random() * 50;
    const close = open + (Math.random() - 0.5) * 20;
    const high = Math.max(open, close) + Math.random() * 10;
    const low = Math.min(open, close) - Math.random() * 10;
    
    return {
      date: `Day ${i + 1}`,
      open,
      high,
      low,
      close,
      volume: Math.floor(Math.random() * 1000) + 100
    };
  });

  const waterfallData = [
    { name: 'Starting Value', value: 100, type: 'total' },
    { name: 'Increase A', value: 20 },
    { name: 'Decrease B', value: -15 },
    { name: 'Increase C', value: 30 },
    { name: 'Decrease D', value: -10 },
    { name: 'Final Value', value: 125, type: 'total' }
  ];

  const bulletData = [
    {
      name: 'Revenue',
      value: 75,
      target: 90,
      max: 100,
      ranges: [
        { value: 30, color: '#ffcdd2', label: 'Poor' },
        { value: 60, color: '#fff9c4', label: 'Fair' },
        { value: 100, color: '#c8e6c9', label: 'Good' }
      ]
    },
    {
      name: 'Profit',
      value: 60,
      target: 80,
      max: 100,
      ranges: [
        { value: 25, color: '#ffcdd2', label: 'Low' },
        { value: 75, color: '#fff9c4', label: 'Medium' },
        { value: 100, color: '#c8e6c9', label: 'High' }
      ]
    }
  ];

  const chartTypes = [
    { value: 'all', label: 'All Charts', icon: <Assessment /> },
    { value: 'bar', label: 'Bar Chart', icon: <BarChartIcon /> },
    { value: 'pie', label: 'Pie Chart', icon: <PieChartIcon /> },
    { value: 'line', label: 'Line Chart', icon: <ShowChart /> },
    { value: 'area', label: 'Area Chart', icon: <Timeline /> },
    { value: 'donut', label: 'Donut Chart', icon: <DonutLarge /> },
    { value: 'composed', label: 'Composed Chart', icon: <TrendingUp /> },
    { value: 'radar', label: 'Radar Chart', icon: <ScatterPlot /> },
    { value: 'scatter', label: 'Scatter Chart', icon: <ScatterPlot /> },
    { value: 'gauge', label: 'Gauge Chart', icon: <Speed /> },
    { value: 'treemap', label: 'Treemap Chart', icon: <AccountTree /> },
    { value: 'funnel', label: 'Funnel Chart', icon: <FilterList /> },
    { value: 'sankey', label: 'Sankey Chart', icon: <Layers /> },
    { value: 'heatmap', label: 'Heatmap Chart', icon: <GridOn /> },
    { value: 'candlestick', label: 'Candlestick Chart', icon: <MultilineChart /> },
    { value: 'waterfall', label: 'Waterfall Chart', icon: <TrendingDown /> },
    { value: 'bullet', label: 'Bullet Chart', icon: <Assessment /> }
  ];

  const handleChartChange = (event, newChart) => {
    if (newChart !== null) {
      setSelectedChart(newChart);
    }
  };

  const renderChart = (type) => {
    switch (type) {
      case 'bar':
        return (
          <BarChart
            data={chartData}
            title="Bar Chart Example"
            subtitle="Simple bar chart with custom colors"
            xKey="name"
            yKey="value"
            colors={COLOR_PALETTES.primary}
            showGrid={true}
            height={300}
          />
        );

      case 'pie':
        return (
          <PieChart
            data={pieData}
            title="Pie Chart Example"
            subtitle="Distribution visualization"
            nameKey="name"
            valueKey="value"
            colors={COLOR_PALETTES.rainbow}
            showLegend={true}
            height={300}
          />
        );

      case 'line':
        return (
          <LineChart
            data={timeSeriesData}
            title="Line Chart Example"
            subtitle="Time series data visualization"
            xKey="month"
            multiSeries={[
              { key: 'sales', name: 'Sales', color: theme.palette.primary.main },
              { key: 'profit', name: 'Profit', color: theme.palette.success.main }
            ]}
            showLegend={true}
            height={300}
          />
        );

      case 'area':
        return (
          <AreaChart
            data={timeSeriesData}
            title="Area Chart Example"
            subtitle="Stacked area visualization"
            xKey="month"
            multiSeries={[
              { key: 'sales', name: 'Sales', color: theme.palette.primary.main },
              { key: 'expenses', name: 'Expenses', color: theme.palette.error.main }
            ]}
            stacked={true}
            showLegend={true}
            height={300}
          />
        );

      case 'donut':
        return (
          <DonutChart
            data={pieData}
            title="Donut Chart Example"
            subtitle="Donut chart with center value"
            nameKey="name"
            valueKey="value"
            colors={COLOR_PALETTES.success}
            showLegend={true}
            centerLabel="Total"
            height={300}
          />
        );

      case 'composed':
        return (
          <ComposedChart
            data={timeSeriesData}
            title="Composed Chart Example"
            subtitle="Multiple chart types combined"
            xKey="month"
            series={[
              { type: 'bar', key: 'sales', name: 'Sales', color: theme.palette.primary.main, yAxisId: 'left' },
              { type: 'line', key: 'growth', name: 'Growth %', color: theme.palette.success.main, yAxisId: 'right' }
            ]}
            showLegend={true}
            height={300}
          />
        );

      case 'radar':
        return (
          <RadarChart
            data={radarData}
            title="Radar Chart Example"
            subtitle="Multi-dimensional data comparison"
            multiSeries={[
              { key: 'A', name: 'Student A', color: theme.palette.primary.main },
              { key: 'B', name: 'Student B', color: theme.palette.secondary.main }
            ]}
            showLegend={true}
            height={300}
          />
        );

      case 'scatter':
        return (
          <ScatterChart
            data={scatterData}
            title="Scatter Chart Example"
            subtitle="Correlation analysis"
            xKey="x"
            yKey="y"
            colors={COLOR_PALETTES.info}
            height={300}
          />
        );

      case 'gauge':
        return (
          <GaugeChart
            value={75}
            maxValue={100}
            title="Gauge Chart Example"
            subtitle="KPI visualization"
            showPercentage={true}
            thresholds={[40, 70]}
            colors={[theme.palette.error.main, theme.palette.warning.main, theme.palette.success.main]}
            height={300}
          />
        );

      case 'treemap':
        return (
          <TreemapChart
            data={treemapData}
            title="Treemap Chart Example"
            subtitle="Hierarchical data visualization"
            dataKey="size"
            nameKey="name"
            colors={COLOR_PALETTES.rainbow}
            height={300}
          />
        );

      case 'funnel':
        return (
          <FunnelChart
            data={funnelData}
            title="Funnel Chart Example"
            subtitle="Conversion funnel analysis"
            dataKey="value"
            nameKey="name"
            colors={COLOR_PALETTES.warning}
            height={300}
          />
        );

      case 'sankey':
        return (
          <SankeyChart
            data={sankeyData}
            title="Sankey Chart Example"
            subtitle="Flow diagram visualization"
            colors={COLOR_PALETTES.primary}
            height={300}
          />
        );

      case 'heatmap':
        return (
          <HeatmapChart
            data={heatmapData}
            title="Heatmap Chart Example"
            subtitle="Data intensity visualization"
            xKey="x"
            yKey="y"
            valueKey="value"
            colors={['#ffffff', theme.palette.primary.main]}
            height={300}
          />
        );

      case 'candlestick':
        return (
          <CandlestickChart
            data={candlestickData}
            title="Candlestick Chart Example"
            subtitle="Financial data visualization"
            xKey="date"
            height={300}
          />
        );

      case 'waterfall':
        return (
          <WaterfallChart
            data={waterfallData}
            title="Waterfall Chart Example"
            subtitle="Cumulative effect visualization"
            xKey="name"
            valueKey="value"
            height={300}
          />
        );

      case 'bullet':
        return (
          <BulletChart
            data={bulletData}
            title="Bullet Chart Example"
            subtitle="Performance against targets"
            orientation="horizontal"
            height={300}
          />
        );

      default:
        return null;
    }
  };

  const renderAllCharts = () => (
    <Grid container spacing={3}>
      <Grid item xs={12} md={6}>
        {renderChart('bar')}
      </Grid>
      <Grid item xs={12} md={6}>
        {renderChart('pie')}
      </Grid>
      <Grid item xs={12} md={6}>
        {renderChart('line')}
      </Grid>
      <Grid item xs={12} md={6}>
        {renderChart('area')}
      </Grid>
      <Grid item xs={12} md={6}>
        {renderChart('donut')}
      </Grid>
      <Grid item xs={12} md={6}>
        {renderChart('composed')}
      </Grid>
      <Grid item xs={12} md={6}>
        {renderChart('radar')}
      </Grid>
      <Grid item xs={12} md={6}>
        {renderChart('scatter')}
      </Grid>
      <Grid item xs={12} md={6}>
        {renderChart('gauge')}
      </Grid>
      <Grid item xs={12} md={6}>
        {renderChart('treemap')}
      </Grid>
      <Grid item xs={12} md={6}>
        {renderChart('funnel')}
      </Grid>
      <Grid item xs={12} md={6}>
        {renderChart('sankey')}
      </Grid>
      <Grid item xs={12} md={6}>
        {renderChart('heatmap')}
      </Grid>
      <Grid item xs={12} md={6}>
        {renderChart('candlestick')}
      </Grid>
      <Grid item xs={12} md={6}>
        {renderChart('waterfall')}
      </Grid>
      <Grid item xs={12} md={6}>
        {renderChart('bullet')}
      </Grid>
    </Grid>
  );

  return (
    <Box>
      {/* Header */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h4" gutterBottom color="primary.main" fontWeight="bold">
            {title}
          </Typography>
          <Typography variant="body1" color="text.secondary" paragraph>
            {subtitle}
          </Typography>
          
          {/* Chart Type Selector */}
          <Box sx={{ display: 'flex', justifyContent: 'center', flexWrap: 'wrap', gap: 1 }}>
            <ToggleButtonGroup
              value={selectedChart}
              exclusive
              onChange={handleChartChange}
              aria-label="chart type"
              size="small"
              sx={{
                flexWrap: 'wrap',
                '& .MuiToggleButton-root': {
                  border: `1px solid ${theme.palette.divider}`,
                  borderRadius: 2,
                  mx: 0.25,
                  my: 0.25,
                  px: 1.5,
                  py: 0.75,
                  '&.Mui-selected': {
                    backgroundColor: theme.palette.primary.main,
                    color: theme.palette.primary.contrastText,
                    '&:hover': {
                      backgroundColor: theme.palette.primary.dark,
                    },
                  },
                },
              }}
            >
              {chartTypes.map((type) => (
                <ToggleButton
                  key={type.value}
                  value={type.value}
                  aria-label={type.label}
                >
                  {type.icon}
                  <Box sx={{ ml: 1, display: { xs: 'none', sm: 'block' } }}>
                    {type.label}
                  </Box>
                </ToggleButton>
              ))}
            </ToggleButtonGroup>
          </Box>
        </CardContent>
      </Card>

      {/* Chart Display */}
      {selectedChart === 'all' ? (
        renderAllCharts()
      ) : (
        <Box>
          {renderChart(selectedChart)}
        </Box>
      )}
    </Box>
  );
};

export default ChartShowcase;