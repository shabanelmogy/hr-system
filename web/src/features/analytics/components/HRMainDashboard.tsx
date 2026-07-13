import BarChart from '@/shared/components/charts/BarChart';
import LineChart from '@/shared/components/charts/LineChart';
import MetricCard from '@/shared/components/charts/MetricCard';
import PieChart from '@/shared/components/charts/PieChart';
import StatCard from '@/shared/components/charts/StatCard';
import useApiHandler from '@/shared/hooks/useApiHandler';
import { Alert, Box, Card, CardContent, Grid, Skeleton, Typography } from '@mui/material';
import React, { useEffect, useState } from 'react';
import { analyticsService } from '../services/analyticsService';
import { AnalyticsFilters, ChartConfig, DashboardMetric } from '../types';

const HRMainDashboard: React.FC = () => {
  const [kpis, setKpis] = useState<DashboardMetric[]>([]);
  const [charts, setCharts] = useState<ChartConfig[]>([]);
  const [filters] = useState<AnalyticsFilters>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const { handleApiCall } = useApiHandler();

  useEffect(() => {
    loadDashboardData();
  }, [filters]);

  const loadDashboardData = async () => {
    setLoading(true);
    setError(null);

    try {
      const [kpisResponse, dashboardResponse] = await Promise.all([
        handleApiCall(() => analyticsService.getKPIs(filters)),
        handleApiCall(() => analyticsService.getDashboard('main', filters))
      ]);

      if (kpisResponse?.success && kpisResponse.data) {
        setKpis(kpisResponse.data);
      }

      if (dashboardResponse?.success && dashboardResponse.data) {
        // Transform dashboard sections into charts
        const dashboardCharts: ChartConfig[] = [];
        dashboardResponse.data.sections.forEach((section: any) => {
          if (section.charts) {
            dashboardCharts.push(...section.charts);
          }
        });
        setCharts(dashboardCharts);
      }
    } catch (err) {
      setError('Failed to load dashboard data');
      console.error('Dashboard load error:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Box sx={{ p: 3 }}>
        <Typography variant="h4" gutterBottom>
          HR Analytics Dashboard
        </Typography>
        <Grid container spacing={3}>
          {Array.from({ length: 8 }).map((_, index) => (
            <Grid size={{ xs: 12, sm: 6, md: 3 }} key={index}>
              <Skeleton variant="rectangular" height={120} />
            </Grid>
          ))}
        </Grid>
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        HR Analytics Dashboard
      </Typography>

      {/* KPI Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        {kpis.map((kpi) => (
          <Grid size={{ xs: 12, sm: 6, md: 3 }} key={kpi.id}>
            <MetricCard
              title={kpi.title}
              value={kpi.value}
              change={kpi.change}
              changeType={kpi.changeType}
              format={kpi.format}
              icon={kpi.icon}
              color={kpi.color}
            />
          </Grid>
        ))}
      </Grid>

      {/* Charts Section */}
      <Grid container spacing={3}>
        {charts.map((chart) => (
          <Grid size={{ xs: 12, md: 6, lg: 4 }} key={chart.id}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  {chart.title}
                </Typography>
                <Box sx={{ height: chart.height || 300 }}>
                  {renderChart(chart)}
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Additional Stats */}
      <Grid container spacing={3} sx={{ mt: 2 }}>
        <Grid size={{ xs: 12, md: 4 }}>
          <StatCard
            title="Employee Turnover Rate"
            value="8.5%"
            subtitle="Last 12 months"
            trend="down"
            trendValue="2.1%"
          />
        </Grid>
        <Grid size={{ xs: 12, md: 4 }}>
          <StatCard
            title="Average Time to Hire"
            value="24 days"
            subtitle="Current quarter"
            trend="up"
            trendValue="5 days"
          />
        </Grid>
        <Grid size={{ xs: 12, md: 4 }}>
          <StatCard
            title="Training Completion Rate"
            value="87%"
            subtitle="This year"
            trend="up"
            trendValue="12%"
          />
        </Grid>
      </Grid>
    </Box>
  );
};

const renderChart = (chart: ChartConfig) => {
  const commonProps = {
    data: chart.data,
    title: chart.title,
    subtitle: '',
    height: chart.height || 300,
    showLegend: chart.showLegend,
    showTooltip: chart.showTooltip,
  };

  switch (chart.type) {
    case 'bar':
      return (
        <BarChart
          {...commonProps}
          xKey={chart.xAxisKey || 'name'}
          yKey={chart.dataKeys?.[0] || 'value'}
        />
      );
    case 'line':
      return (
        <LineChart
          {...commonProps}
          xKey={chart.xAxisKey || 'name'}
          yKey={chart.dataKeys?.[0] || 'value'}
        />
      );
    case 'pie':
      return (
        <PieChart
          {...commonProps}
          valueKey={chart.dataKeys?.[0] || 'value'}
          nameKey={chart.xAxisKey || 'name'}
        />
      );
    case 'composed':
      return (
        <BarChart
          {...commonProps}
          xKey={chart.xAxisKey || 'name'}
          yKey={chart.dataKeys?.[0] || 'value'}
        />
      );
    default:
      return (
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%' }}>
          <Typography variant="body2" color="text.secondary">
            Chart type not supported
          </Typography>
        </Box>
      );
  }
};

export default HRMainDashboard;