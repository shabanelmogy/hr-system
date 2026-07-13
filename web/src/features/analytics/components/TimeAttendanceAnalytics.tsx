import React, { useState, useEffect } from 'react';
import { Grid, Card, CardContent, Typography, Box, Alert, Skeleton, Tabs, Tab } from '@mui/material';
import MetricCard from '@/shared/components/charts/MetricCard';
import BarChart from '@/shared/components/charts/BarChart';
import LineChart from '@/shared/components/charts/LineChart';
import PieChart from '@/shared/components/charts/PieChart';
import StatCard from '@/shared/components/charts/StatCard';
import useApiHandler from '@/shared/hooks/useApiHandler';
import { analyticsService } from '../services/analyticsService';
import { AttendanceAnalytics, AnalyticsFilters } from '../types';

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
      id={`attendance-tabpanel-${index}`}
      aria-labelledby={`attendance-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );
}

const TimeAttendanceAnalytics: React.FC = () => {
  const [attendanceData, setAttendanceData] = useState<AttendanceAnalytics | null>(null);
  const [filters] = useState<AnalyticsFilters>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [tabValue, setTabValue] = useState(0);

  const { handleApiCall } = useApiHandler();

  useEffect(() => {
    loadAttendanceData();
  }, [filters]);

  const loadAttendanceData = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await handleApiCall(() => analyticsService.getAttendanceAnalytics(filters));

      if (response?.success && response.data) {
        setAttendanceData(response.data);
      }
    } catch (err) {
      setError('Failed to load attendance analytics data');
      console.error('Attendance analytics load error:', err);
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
          Time & Attendance Analytics
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

  if (!attendanceData) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="info">
          No attendance data available
        </Alert>
      </Box>
    );
  }

  const attendanceStatusData = [
    { name: 'Present', value: attendanceData.presentToday },
    { name: 'Absent', value: attendanceData.absentToday },
    { name: 'Late', value: attendanceData.lateToday }
  ];

  const leaveBalanceData = [
    { name: 'Vacation', value: attendanceData.leaveBalance.vacation },
    { name: 'Sick Leave', value: attendanceData.leaveBalance.sick },
    { name: 'Personal', value: attendanceData.leaveBalance.personal }
  ];

  const attendanceTrendsData = attendanceData.trends.attendance.map(trend => ({
    period: trend.period,
    value: trend.value
  }));

  const overtimeTrendsData = attendanceData.trends.overtime.map(trend => ({
    period: trend.period,
    value: trend.value
  }));

  const punctualityData = attendanceData.trends.punctuality.map(trend => ({
    period: trend.period,
    value: trend.value
  }));

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        Time & Attendance Analytics
      </Typography>

      <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
        <Tabs value={tabValue} onChange={handleTabChange} aria-label="time attendance analytics tabs">
          <Tab label="Overview" />
          <Tab label="Attendance" />
          <Tab label="Overtime" />
          <Tab label="Leave" />
        </Tabs>
      </Box>

      <TabPanel value={tabValue} index={0}>
        {/* Overview Tab */}
        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <MetricCard
              title="Attendance Rate"
              value={`${attendanceData.attendanceRate.toFixed(1)}%`}
              change={2.5}
              changeType="increase"
              format="percentage"
              icon="calendar_today"
              color="success"
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <MetricCard
              title="Avg Hours Worked"
              value={`${attendanceData.averageHoursWorked.toFixed(1)}h`}
              change={-0.2}
              changeType="decrease"
              format="number"
              icon="schedule"
              color="primary"
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <MetricCard
              title="Overtime Hours"
              value={`${attendanceData.overtimeHours.toFixed(1)}h`}
              change={5.8}
              changeType="increase"
              format="number"
              icon="more_time"
              color="warning"
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <MetricCard
              title="Present Today"
              value={attendanceData.presentToday.toString()}
              change={12}
              changeType="increase"
              format="number"
              icon="check_circle"
              color="info"
            />
          </Grid>
        </Grid>

        <Grid container spacing={3}>
          <Grid size={{ xs: 12, md: 6 }}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Today's Attendance Status
                </Typography>
                <PieChart
                  data={attendanceStatusData}
                  title="Attendance Status"
                  subtitle="Today's attendance breakdown"
                  nameKey="name"
                  valueKey="value"
                  height={300}
                  showLegend={true}
                  showTooltip={true}
                />
              </CardContent>
            </Card>
          </Grid>
          <Grid size={{ xs: 12, md: 6 }}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Leave Balance Overview
                </Typography>
                <BarChart
                  data={leaveBalanceData}
                  title="Leave Balance"
                  subtitle="Available leave days by type"
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
        {/* Attendance Tab */}
        <Grid container spacing={3}>
          <Grid size={{ xs: 12, md: 8 }}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Attendance Trends
                </Typography>
                <LineChart
                  data={attendanceTrendsData}
                  title="Attendance Trends"
                  subtitle="Attendance rate over time"
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
                  Attendance Summary
                </Typography>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                  <StatCard
                    title="Total Employees"
                    value={attendanceData.totalEmployees.toString()}
                    subtitle="Active workforce"
                  />
                  <StatCard
                    title="Present Today"
                    value={attendanceData.presentToday.toString()}
                    subtitle={`${((attendanceData.presentToday / attendanceData.totalEmployees) * 100).toFixed(1)}% of total`}
                  />
                  <StatCard
                    title="Late Today"
                    value={attendanceData.lateToday.toString()}
                    subtitle={`${((attendanceData.lateToday / attendanceData.totalEmployees) * 100).toFixed(1)}% of total`}
                  />
                </Box>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </TabPanel>

      <TabPanel value={tabValue} index={2}>
        {/* Overtime Tab */}
        <Grid container spacing={3}>
          <Grid size={{ xs: 12 }}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Overtime Trends
                </Typography>
                <LineChart
                  data={overtimeTrendsData}
                  title="Overtime Trends"
                  subtitle="Overtime hours over time"
                  xKey="period"
                  yKey="value"
                  height={400}
                  showLegend={false}
                  showTooltip={true}
                />
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </TabPanel>

      <TabPanel value={tabValue} index={3}>
        {/* Leave Tab */}
        <Grid container spacing={3}>
          <Grid size={{ xs: 12, md: 6 }}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Leave Balance by Type
                </Typography>
                <BarChart
                  data={leaveBalanceData}
                  title="Leave Balance"
                  subtitle="Available leave days by type"
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
                  Punctuality Trends
                </Typography>
                <LineChart
                  data={punctualityData}
                  title="Punctuality Trends"
                  subtitle="On-time arrival rate over time"
                  xKey="period"
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
    </Box>
  );
};

export default TimeAttendanceAnalytics;