import React, { useState, useEffect } from 'react';
import { Grid, Card, CardContent, Typography, Box, Alert, Skeleton, Tabs, Tab } from '@mui/material';
import MetricCard from '@/shared/components/charts/MetricCard';
import BarChart from '@/shared/components/charts/BarChart';
import LineChart from '@/shared/components/charts/LineChart';
import StatCard from '@/shared/components/charts/StatCard';
import useApiHandler from '@/shared/hooks/useApiHandler';
import { analyticsService } from '../services/analyticsService';
import { PerformanceAnalytics as PerformanceAnalyticsType, DepartmentAnalytics, AnalyticsFilters } from '../types';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`performance-tabpanel-${index}`}
      aria-labelledby={`performance-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );
}

const PerformanceAnalytics: React.FC = () => {
  const [performanceData, setPerformanceData] = useState<PerformanceAnalyticsType | null>(null);
  const [departmentData, setDepartmentData] = useState<DepartmentAnalytics[]>([]);
  const [filters] = useState<AnalyticsFilters>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [tabValue, setTabValue] = useState(0);

  const { handleApiCall } = useApiHandler();

  useEffect(() => {
    loadPerformanceData();
  }, [filters]);

  const loadPerformanceData = async () => {
    setLoading(true);
    setError(null);

    try {
      const [performanceResponse, departmentResponse] = await Promise.all([
        handleApiCall(() => analyticsService.getPerformanceAnalytics(filters)),
        handleApiCall(() => analyticsService.getDepartmentAnalytics(filters))
      ]);

      if (performanceResponse?.success && performanceResponse.data) {
        setPerformanceData(performanceResponse.data);
      }

      if (departmentResponse?.success && departmentResponse.data) {
        setDepartmentData(departmentResponse.data);
      }
    } catch (err) {
      setError('Failed to load performance analytics data');
      console.error('Performance analytics load error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  if (loading) {
    return (
      <Box sx={{ p: 3 }}>
        <Typography variant="h4" gutterBottom>
          Performance Analytics
        </Typography>
        <Grid container spacing={3}>
          {Array.from({ length: 6 }).map((_, index) => (
            <Grid size={{ xs: 12, sm: 6, md: 4 }} key={index}>
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

  if (!performanceData) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="info">
          No performance data available
        </Alert>
      </Box>
    );
  }

  const reviewCompletionData = [
    { name: 'Completed', value: performanceData.reviewCompletionRate * 100 },
    { name: 'Pending', value: 100 - (performanceData.reviewCompletionRate * 100) }
  ];

  const goalAchievementData = [
    { name: 'Achieved', value: performanceData.goalAchievementRate * 100 },
    { name: 'In Progress', value: 30 },
    { name: 'Not Started', value: 20 }
  ];

  const departmentPerformanceData = departmentData.map(dept => ({
    name: dept.departmentName,
    value: dept.averagePerformance
  }));

  const performanceTrendsData = performanceData.trends.performance.map(trend => ({
    period: trend.period,
    value: trend.value
  }));

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        Performance Analytics
      </Typography>

      <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
        <Tabs value={tabValue} onChange={handleTabChange} aria-label="performance analytics tabs">
          <Tab label="Overview" />
          <Tab label="Departments" />
          <Tab label="Trends" />
          <Tab label="Goals" />
        </Tabs>
      </Box>

      <TabPanel value={tabValue} index={0}>
        {/* Overview Tab */}
        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <MetricCard
              title="Average Rating"
              value={performanceData.averageRating.toFixed(1)}
              change={5.2}
              changeType="increase"
              format="number"
              icon="star"
              color="primary"
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <MetricCard
              title="Review Completion"
              value={`${(performanceData.reviewCompletionRate * 100).toFixed(1)}%`}
              change={8.5}
              changeType="increase"
              format="percentage"
              icon="check_circle"
              color="success"
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <MetricCard
              title="Goal Achievement"
              value={`${(performanceData.goalAchievementRate * 100).toFixed(1)}%`}
              change={-2.1}
              changeType="decrease"
              format="percentage"
              icon="target"
              color="warning"
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <MetricCard
              title="Top Performers"
              value={performanceData.topPerformers.length.toString()}
              change={15}
              changeType="increase"
              format="number"
              icon="trending_up"
              color="info"
            />
          </Grid>
        </Grid>

        <Grid container spacing={3}>
          <Grid size={{ xs: 12, md: 6 }}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Review Completion Rate
                </Typography>
                <BarChart
                  data={reviewCompletionData}
                  title="Review Completion"
                  subtitle="Percentage of completed reviews"
                  xKey="name"
                  yKey="value"
                  height={300}
                  showLegend={false}
                  showTooltip={true}
                />
              </CardContent>
            </Card>
          </Grid>
          <Grid size={{ xs: 12, md: 6 }}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Department Performance
                </Typography>
                <BarChart
                  data={departmentPerformanceData}
                  title="Department Performance"
                  subtitle="Average ratings by department"
                  xKey="name"
                  yKey="value"
                  height={300}
                  showLegend={false}
                  showTooltip={true}
                />
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </TabPanel>

      <TabPanel value={tabValue} index={1}>
        {/* Departments Tab */}
        <Grid container spacing={3}>
          {departmentData.map((dept) => (
            <Grid size={{ xs: 12, md: 6, lg: 4 }} key={dept.departmentId}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    {dept.departmentName}
                  </Typography>
                  <Box sx={{ mb: 2 }}>
                    <Typography variant="body2" color="text.secondary">
                      Average Performance: {dept.averagePerformance.toFixed(1)}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Employee Count: {dept.employeeCount}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Top Performers: {dept.topPerformers.length}
                    </Typography>
                  </Box>
                  <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                    {dept.topPerformers.slice(0, 3).map((performer, index) => (
                      <Typography key={index} variant="caption" sx={{
                        bgcolor: 'primary.light',
                        color: 'primary.contrastText',
                        px: 1,
                        py: 0.5,
                        borderRadius: 1
                      }}>
                        {performer}
                      </Typography>
                    ))}
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </TabPanel>

      <TabPanel value={tabValue} index={2}>
        {/* Trends Tab */}
        <Grid container spacing={3}>
          <Grid size={{ xs: 12, md: 8 }}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Performance Trends Over Time
                </Typography>
                <LineChart
                  data={performanceTrendsData}
                  title="Performance Trends"
                  subtitle="Average performance ratings over time"
                  xKey="period"
                  yKey="value"
                  height={400}
                  showLegend={false}
                  showTooltip={true}
                />
              </CardContent>
            </Card>
          </Grid>
          <Grid size={{ xs: 12, md: 4 }}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Key Metrics
                </Typography>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                  <StatCard
                    title="Review Completion Trend"
                    value={`${performanceData.trends.reviews[performanceData.trends.reviews.length - 1]?.value || 0}%`}
                    subtitle="Latest period"
                    trend="up"
                    trendValue="5.2%"
                  />
                  <StatCard
                    title="Goal Achievement Trend"
                    value={`${performanceData.trends.goals[performanceData.trends.goals.length - 1]?.value || 0}%`}
                    subtitle="Latest period"
                    trend="up"
                    trendValue="3.1%"
                  />
                </Box>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </TabPanel>

      <TabPanel value={tabValue} index={3}>
        {/* Goals Tab */}
        <Grid container spacing={3}>
          <Grid size={{ xs: 12, md: 6 }}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Goal Achievement Distribution
                </Typography>
                <BarChart
                  data={goalAchievementData}
                  title="Goal Achievement"
                  subtitle="Distribution of goal statuses"
                  xKey="name"
                  yKey="value"
                  height={300}
                  showLegend={false}
                  showTooltip={true}
                />
              </CardContent>
            </Card>
          </Grid>
          <Grid size={{ xs: 12, md: 6 }}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Performance Categories
                </Typography>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                  {performanceData.categories.map((category, index) => (
                    <Box key={index} sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <Typography variant="body2">{category.category}</Typography>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Typography variant="body2" fontWeight="bold">
                          {category.averageRating.toFixed(1)}
                        </Typography>
                        <Typography variant="caption" color={category.trend === 'up' ? 'success.main' : 'error.main'}>
                          {category.trend === 'up' ? '↑' : '↓'}
                        </Typography>
                      </Box>
                    </Box>
                  ))}
                </Box>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </TabPanel>
    </Box>
  );
};

export default PerformanceAnalytics;