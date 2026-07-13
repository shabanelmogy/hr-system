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
  Speed,
  LinearScale,
  Dashboard,
  Star,
  Analytics,
  DataUsage
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
  BulletChart,
  ProgressChart,
  MetricCard,
  TimelineChart,
  StatCard,
  SparklineChart,
  RatingChart
} from './index';

import { generateMockData, COLOR_PALETTES } from './chartUtils';

const ChartShowcaseExtended = ({
  data = null,
  title = "Complete Chart Library",
  subtitle = "22+ chart types including MUI-based components"
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

  // Mock data for new chart types
  const progressData = [
    { name: 'Project A', value: 75, max: 100 },
    { name: 'Project B', value: 60, max: 100 },
    { name: 'Project C', value: 90, max: 100 },
    { name: 'Project D', value: 45, max: 100 }
  ];

  const timelineData = [
    {
      date: '2024-01-01',
      title: 'Project Started',
      description: 'Initial project kickoff and planning phase',
      status: 'completed',
      value: 100
    },
    {
      date: '2024-01-15',
      title: 'Development Phase',
      description: 'Core development and implementation',
      status: 'completed',
      value: 250
    },
    {
      date: '2024-02-01',
      title: 'Testing Phase',
      description: 'Quality assurance and testing',
      status: 'warning',
      value: 180
    },
    {
      date: '2024-02-15',
      title: 'Deployment',
      description: 'Production deployment and monitoring',
      status: 'info',
      value: 320
    }
  ];

  const statsData = [
    {
      label: 'Total Users',
      value: 12543,
      color: 'primary',
      trend: 12.5,
      trendDirection: 'up',
      icon: Assessment
    },
    {
      label: 'Revenue',
      value: 98765,
      unit: '$',
      color: 'success',
      trend: 8.2,
      trendDirection: 'up',
      icon: TrendingUp
    },
    {
      label: 'Conversion Rate',
      value: 3.45,
      unit: '%',
      color: 'warning',
      trend: -2.1,
      trendDirection: 'down',
      icon: Analytics
    },
    {
      label: 'Active Sessions',
      value: 1234,
      color: 'info',
      trend: 5.7,
      trendDirection: 'up',
      icon: DataUsage
    }
  ];

  const ratingData = [
    { rating: 5, count: 120 },
    { rating: 4, count: 80 },
    { rating: 3, count: 30 },
    { rating: 2, count: 15 },
    { rating: 1, count: 5 }
  ];

  const sparklineData = Array.from({ length: 20 }, (_, i) => ({
    value: Math.floor(Math.random() * 100) + 20
  }));

  const chartTypes = [
    { value: 'all', label: 'All Charts', icon: <Assessment /> },
    // Recharts-based
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
    { value: 'bullet', label: 'Bullet Chart', icon: <Assessment /> },
    // MUI-based
    { value: 'progress', label: 'Progress Chart', icon: <LinearScale /> },
    { value: 'metric', label: 'Metric Card', icon: <Dashboard /> },
    { value: 'timeline', label: 'Timeline Chart', icon: <Timeline /> },
    { value: 'stats', label: 'Stats Card', icon: <Analytics /> },
    { value: 'sparkline', label: 'Sparkline Chart', icon: <ShowChart /> },
    { value: 'rating', label: 'Rating Chart', icon: <Star /> }
  ];

  const handleChartChange = (event, newChart) => {
    if (newChart !== null) {
      setSelectedChart(newChart);
    }
  };

  const renderChart = (type) => {
    switch (type) {
      // Existing Recharts components
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

      // New MUI-based components
      case 'progress':
        return (
          <ProgressChart
            data={progressData}
            title="Progress Chart Example"
            subtitle="Project completion status"
            orientation="horizontal"
            height={300}
          />
        );

      case 'metric':
        return (
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6} md={3}>
              <MetricCard
                title="Total Revenue"
                value={125000}
                unit="$"
                previousValue={110000}
                target={150000}
                color="success"
                showTrend={true}
                showProgress={true}
                showTarget={true}
                icon={TrendingUp}
              />
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <MetricCard
                title="Active Users"
                value={8542}
                previousValue={7890}
                color="primary"
                showTrend={true}
                icon={Assessment}
              />
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <MetricCard
                title="Conversion Rate"
                value={3.45}
                unit="%"
                previousValue={3.12}
                color="warning"
                showTrend={true}
                icon={Analytics}
              />
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <MetricCard
                title="Customer Satisfaction"
                value={4.8}
                unit="/5"
                previousValue={4.6}
                color="success"
                showTrend={true}
                icon={Star}
              />
            </Grid>
          </Grid>
        );

      case 'timeline':
        return (
          <TimelineChart
            data={timelineData}
            title="Timeline Chart Example"
            subtitle="Project milestone tracking"
            height={400}
          />
        );

      case 'stats':
        return (
          <StatCard
            stats={statsData}
            title="Statistics Dashboard"
            subtitle="Key performance indicators"
            columns={{ xs: 1, sm: 2, md: 4 }}
            showDividers={true}
            gradient={true}
          />
        );

      case 'sparkline':
        return (
          <Box sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom color="primary.main">
              Sparkline Chart Examples
            </Typography>
            <Grid container spacing={3}>
              <Grid item xs={12} md={4}>
                <Card sx={{ p: 2 }}>
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    Sales Trend (Line)
                  </Typography>
                  <SparklineChart
                    data={sparklineData}
                    type="line"
                    width={150}
                    height={50}
                    showValue={true}
                    showTrend={true}
                    color={theme.palette.primary.main}
                  />
                </Card>
              </Grid>
              <Grid item xs={12} md={4}>
                <Card sx={{ p: 2 }}>
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    Revenue Trend (Area)
                  </Typography>
                  <SparklineChart
                    data={sparklineData}
                    type="area"
                    width={150}
                    height={50}
                    showValue={true}
                    showTrend={true}
                    color={theme.palette.success.main}
                  />
                </Card>
              </Grid>
              <Grid item xs={12} md={4}>
                <Card sx={{ p: 2 }}>
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    Activity Trend (Bar)
                  </Typography>
                  <SparklineChart
                    data={sparklineData}
                    type="bar"
                    width={150}
                    height={50}
                    showValue={true}
                    showTrend={true}
                    color={theme.palette.warning.main}
                  />
                </Card>
              </Grid>
            </Grid>
          </Box>
        );

      case 'rating':
        return (
          <RatingChart
            data={ratingData}
            title="Rating Chart Example"
            subtitle="Customer review distribution"
            type="stars"
            showDistribution={true}
            showAverage={true}
            showTotal={true}
            height={400}
          />
        );

      default:
        return null;
    }
  };

  const renderAllCharts = () => (
    <Grid container spacing={3}>
      {/* Recharts-based charts */}
      <Grid item xs={12} md={6}>
        {renderChart('bar')}
      </Grid>
      <Grid item xs={12} md={6}>
        {renderChart('pie')}
      </Grid>
      
      {/* MUI-based charts */}
      <Grid item xs={12}>
        {renderChart('metric')}
      </Grid>
      <Grid item xs={12} md={6}>
        {renderChart('progress')}
      </Grid>
      <Grid item xs={12} md={6}>
        {renderChart('rating')}
      </Grid>
      <Grid item xs={12}>
        {renderChart('timeline')}
      </Grid>
      <Grid item xs={12}>
        {renderChart('stats')}
      </Grid>
      <Grid item xs={12}>
        {renderChart('sparkline')}
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

export default ChartShowcaseExtended;