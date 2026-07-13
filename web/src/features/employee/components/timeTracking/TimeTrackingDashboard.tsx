import React, { useMemo } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Grid,
  LinearProgress,
  Chip,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Avatar,
  Divider,
  Paper,
} from '@mui/material';
import {
  AccessTime,
  TrendingUp,
  Work,
  Schedule,
  Timeline,
  CheckCircle,
  PlayArrow,
  Stop,
  Pause,
} from '@mui/icons-material';
import { TimeEntry, AttendanceRecord } from '../../types/Employee';

interface TimeTrackingDashboardProps {
  timeEntries: TimeEntry[];
  attendanceRecords: AttendanceRecord[];
  employeeId?: string;
  period?: 'week' | 'month' | 'quarter';
  loading?: boolean;
}

const TimeTrackingDashboard: React.FC<TimeTrackingDashboardProps> = ({
  timeEntries,
  attendanceRecords,
  employeeId,
  period = 'week',
  loading = false,
}) => {
  // Calculate date range based on period
  const dateRange = useMemo(() => {
    const now = new Date();
    const start = new Date(now);

    switch (period) {
      case 'week':
        start.setDate(now.getDate() - 7);
        break;
      case 'month':
        start.setMonth(now.getMonth() - 1);
        break;
      case 'quarter':
        start.setMonth(now.getMonth() - 3);
        break;
    }

    return { start, end: now };
  }, [period]);

  // Filter entries by date range and employee
  const filteredTimeEntries = useMemo(() => {
    return timeEntries.filter(entry => {
      if (employeeId && entry.employeeId !== employeeId) return false;
      const entryDate = new Date(entry.date);
      return entryDate >= dateRange.start && entryDate <= dateRange.end;
    });
  }, [timeEntries, employeeId, dateRange]);

  const filteredAttendanceRecords = useMemo(() => {
    return attendanceRecords.filter(record => {
      if (employeeId && record.employeeId !== employeeId) return false;
      const recordDate = new Date(record.date);
      return recordDate >= dateRange.start && recordDate <= dateRange.end;
    });
  }, [attendanceRecords, employeeId, dateRange]);

  // Calculate metrics
  const metrics = useMemo(() => {
    const totalHours = filteredTimeEntries.reduce((sum, entry) => sum + entry.totalHours, 0);
    const totalOvertime = filteredTimeEntries.reduce((sum, entry) => sum + entry.overtimeHours, 0);
    const regularHours = totalHours - totalOvertime;

    const presentDays = filteredAttendanceRecords.filter(r => r.status === 'present').length;
    const absentDays = filteredAttendanceRecords.filter(r => r.status === 'absent').length;
    const lateDays = filteredAttendanceRecords.filter(r => r.status === 'late').length;
    const totalDays = filteredAttendanceRecords.length;

    const attendanceRate = totalDays > 0 ? (presentDays / totalDays) * 100 : 0;

    // Calculate average hours per day
    const workingDays = presentDays || 1; // Avoid division by zero
    const avgHoursPerDay = totalHours / workingDays;

    // Calculate productivity score (simple metric: hours worked vs expected)
    const expectedHours = workingDays * 8; // Assuming 8-hour workday
    const productivityScore = expectedHours > 0 ? (totalHours / expectedHours) * 100 : 0;

    return {
      totalHours,
      regularHours,
      totalOvertime,
      presentDays,
      absentDays,
      lateDays,
      attendanceRate,
      avgHoursPerDay,
      productivityScore,
      totalDays,
    };
  }, [filteredTimeEntries, filteredAttendanceRecords]);

  // Get recent activity
  const recentActivity = useMemo(() => {
    const activities: Array<{
      id: string;
      type: 'clock_in' | 'clock_out' | 'break_start' | 'break_end' | 'attendance';
      message: string;
      timestamp: string;
      icon: React.ReactNode;
    }> = [];

    // Add time entry activities
    filteredTimeEntries.forEach(entry => {
      if (entry.clockIn) {
        activities.push({
          id: `clock_in_${entry.id}`,
          type: 'clock_in',
          message: `Clocked in at ${new Date(entry.clockIn).toLocaleTimeString()}`,
          timestamp: entry.clockIn,
          icon: <PlayArrow color="success" />,
        });
      }

      if (entry.clockOut) {
        activities.push({
          id: `clock_out_${entry.id}`,
          type: 'clock_out',
          message: `Clocked out at ${new Date(entry.clockOut).toLocaleTimeString()}`,
          timestamp: entry.clockOut,
          icon: <Stop color="error" />,
        });
      }

      // Add break activities
      entry.breaks?.forEach((breakEntry, index) => {
        if (breakEntry.startTime) {
          activities.push({
            id: `break_start_${entry.id}_${index}`,
            type: 'break_start',
            message: `Started ${breakEntry.type} break`,
            timestamp: breakEntry.startTime,
            icon: <Pause color="warning" />,
          });
        }

        if (breakEntry.endTime) {
          activities.push({
            id: `break_end_${entry.id}_${index}`,
            type: 'break_end',
            message: `Ended ${breakEntry.type} break (${breakEntry.duration} min)`,
            timestamp: breakEntry.endTime,
            icon: <PlayArrow color="success" />,
          });
        }
      });
    });

    // Add attendance activities
    filteredAttendanceRecords.forEach(record => {
      activities.push({
        id: `attendance_${record.id}`,
        type: 'attendance',
        message: `Marked as ${record.status.replace('-', ' ')}`,
        timestamp: record.createdAt,
        icon: <CheckCircle color="info" />,
      });
    });

    // Sort by timestamp descending and take last 10
    return activities
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
      .slice(0, 10);
  }, [filteredTimeEntries, filteredAttendanceRecords]);

  // Time allocation by project/task (mock data for now)
  const timeAllocation = useMemo(() => {
    // In a real app, this would be calculated from actual project/task data
    return [
      { name: 'Project Alpha', hours: 25.5, percentage: 35 },
      { name: 'Project Beta', hours: 18.0, percentage: 25 },
      { name: 'Meetings', hours: 12.5, percentage: 17 },
      { name: 'Admin Tasks', hours: 8.0, percentage: 11 },
      { name: 'Training', hours: 7.0, percentage: 10 },
      { name: 'Other', hours: 1.5, percentage: 2 },
    ];
  }, []);

  const formatHours = (hours: number): string => {
    const wholeHours = Math.floor(hours);
    const minutes = Math.round((hours - wholeHours) * 60);
    return `${wholeHours}:${minutes.toString().padStart(2, '0')}`;
  };

  if (loading) {
    return (
      <Box>
        <Typography variant="h6">Loading dashboard...</Typography>
        <LinearProgress />
      </Box>
    );
  }

  return (
    <Box>
      {/* Header */}
      <Box mb={3}>
        <Typography variant="h4" gutterBottom>
          Time Tracking Dashboard
        </Typography>
        <Typography variant="body2" color="textSecondary">
          {period === 'week' ? 'Last 7 days' : period === 'month' ? 'Last 30 days' : 'Last 90 days'}
        </Typography>
      </Box>

      {/* Key Metrics */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <AccessTime sx={{ fontSize: 40, color: 'primary.main', mb: 1 }} />
              <Typography variant="h4" color="primary">
                {formatHours(metrics.totalHours)}
              </Typography>
              <Typography variant="body2" color="textSecondary">
                Total Hours
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <Work sx={{ fontSize: 40, color: 'success.main', mb: 1 }} />
              <Typography variant="h4" color="success.main">
                {formatHours(metrics.regularHours)}
              </Typography>
              <Typography variant="body2" color="textSecondary">
                Regular Hours
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <Schedule sx={{ fontSize: 40, color: 'warning.main', mb: 1 }} />
              <Typography variant="h4" color="warning.main">
                {formatHours(metrics.totalOvertime)}
              </Typography>
              <Typography variant="body2" color="textSecondary">
                Overtime Hours
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <TrendingUp sx={{ fontSize: 40, color: 'info.main', mb: 1 }} />
              <Typography variant="h4" color="info.main">
                {metrics.productivityScore.toFixed(1)}%
              </Typography>
              <Typography variant="body2" color="textSecondary">
                Productivity
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Attendance Summary */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid size={{ xs: 12, md: 8 }}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Attendance Summary
              </Typography>
              <Grid container spacing={2}>
                <Grid size={{ xs: 6, sm: 3 }}>
                  <Box textAlign="center">
                    <Typography variant="h4" color="success.main">
                      {metrics.presentDays}
                    </Typography>
                    <Typography variant="body2" color="textSecondary">
                      Present
                    </Typography>
                  </Box>
                </Grid>
                <Grid size={{ xs: 6, sm: 3 }}>
                  <Box textAlign="center">
                    <Typography variant="h4" color="error.main">
                      {metrics.absentDays}
                    </Typography>
                    <Typography variant="body2" color="textSecondary">
                      Absent
                    </Typography>
                  </Box>
                </Grid>
                <Grid size={{ xs: 6, sm: 3 }}>
                  <Box textAlign="center">
                    <Typography variant="h4" color="warning.main">
                      {metrics.lateDays}
                    </Typography>
                    <Typography variant="body2" color="textSecondary">
                      Late
                    </Typography>
                  </Box>
                </Grid>
                <Grid size={{ xs: 6, sm: 3 }}>
                  <Box textAlign="center">
                    <Typography variant="h4" color="info.main">
                      {metrics.attendanceRate.toFixed(1)}%
                    </Typography>
                    <Typography variant="body2" color="textSecondary">
                      Attendance Rate
                    </Typography>
                  </Box>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>

        <Grid size={{ xs: 12, md: 4 }}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Average Daily Hours
              </Typography>
              <Box textAlign="center" mt={2}>
                <Typography variant="h3" color="primary">
                  {formatHours(metrics.avgHoursPerDay)}
                </Typography>
                <Typography variant="body2" color="textSecondary" mt={1}>
                  per working day
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Time Allocation */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid size={{ xs: 12, md: 6 }}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Time Allocation by Project
              </Typography>
              <Box>
                {timeAllocation.map((item, index) => (
                  <Box key={index} sx={{ mb: 2 }}>
                    <Box display="flex" justifyContent="space-between" alignItems="center" mb={0.5}>
                      <Typography variant="body2">{item.name}</Typography>
                      <Typography variant="body2" color="textSecondary">
                        {formatHours(item.hours)} ({item.percentage}%)
                      </Typography>
                    </Box>
                    <LinearProgress
                      variant="determinate"
                      value={item.percentage}
                      sx={{ height: 8, borderRadius: 4 }}
                    />
                  </Box>
                ))}
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid size={{ xs: 12, md: 6 }}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Recent Activity
              </Typography>
              <List dense>
                {recentActivity.length === 0 ? (
                  <ListItem>
                    <ListItemText
                      primary="No recent activity"
                      secondary="Activity will appear here as you track time"
                    />
                  </ListItem>
                ) : (
                  recentActivity.map((activity) => (
                    <React.Fragment key={activity.id}>
                      <ListItem alignItems="flex-start">
                        <ListItemAvatar>
                          <Avatar sx={{ bgcolor: 'transparent' }}>
                            {activity.icon}
                          </Avatar>
                        </ListItemAvatar>
                        <ListItemText
                          primary={activity.message}
                          secondary={new Date(activity.timestamp).toLocaleString()}
                        />
                      </ListItem>
                      <Divider variant="inset" component="li" />
                    </React.Fragment>
                  ))
                )}
              </List>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Weekly/Monthly Progress */}
      <Card>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Progress Overview
          </Typography>
          <Box display="flex" gap={2} flexWrap="wrap">
            <Chip
              label={`Total Hours: ${formatHours(metrics.totalHours)}`}
              color="primary"
              variant="outlined"
            />
            <Chip
              label={`Working Days: ${metrics.presentDays}`}
              color="success"
              variant="outlined"
            />
            <Chip
              label={`Attendance Rate: ${metrics.attendanceRate.toFixed(1)}%`}
              color={metrics.attendanceRate >= 90 ? "success" : metrics.attendanceRate >= 75 ? "warning" : "error"}
              variant="outlined"
            />
            <Chip
              label={`Overtime: ${formatHours(metrics.totalOvertime)}`}
              color={metrics.totalOvertime > 0 ? "warning" : "default"}
              variant="outlined"
            />
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
};

export default TimeTrackingDashboard;