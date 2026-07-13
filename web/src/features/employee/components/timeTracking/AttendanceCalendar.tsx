import React, { useState, useMemo } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  IconButton,
  Grid,
  Chip,
  Tooltip,
  Paper,
  Divider,
  Badge,
} from '@mui/material';
import {
  ChevronLeft,
  ChevronRight,
  Today,
  CheckCircle,
  Cancel,
  Schedule,
  Warning,
  WorkOff,
  EventBusy,
  Brightness1,
} from '@mui/icons-material';
import { AttendanceRecord } from '../../types/Employee';

interface AttendanceCalendarProps {
  records: AttendanceRecord[];
  employeeId?: string;
  onDateClick?: (date: string) => void;
  onRecordClick?: (record: AttendanceRecord) => void;
  currentMonth?: Date;
  onMonthChange?: (date: Date) => void;
  loading?: boolean;
}

const AttendanceCalendar: React.FC<AttendanceCalendarProps> = ({
  records,
  employeeId,
  onDateClick,
  onRecordClick,
  currentMonth = new Date(),
  onMonthChange,
  loading = false,
}) => {
  const [selectedMonth, setSelectedMonth] = useState(currentMonth);

  // Create a map of date strings to attendance records for quick lookup
  const recordsMap = useMemo(() => {
    const map: Record<string, AttendanceRecord> = {};
    records.forEach(record => {
      map[record.date] = record;
    });
    return map;
  }, [records]);

  const getStatusConfig = (status: AttendanceRecord['status']) => {
    switch (status) {
      case 'present':
        return {
          color: 'success' as const,
          icon: <CheckCircle fontSize="small" />,
          label: 'Present',
          bgColor: '#e8f5e8',
          textColor: '#2e7d32',
        };
      case 'absent':
        return {
          color: 'error' as const,
          icon: <Cancel fontSize="small" />,
          label: 'Absent',
          bgColor: '#ffebee',
          textColor: '#c62828',
        };
      case 'late':
        return {
          color: 'warning' as const,
          icon: <Schedule fontSize="small" />,
          label: 'Late',
          bgColor: '#fff3e0',
          textColor: '#ef6c00',
        };
      case 'half-day':
        return {
          color: 'info' as const,
          icon: <Brightness1 fontSize="small" />,
          label: 'Half Day',
          bgColor: '#e3f2fd',
          textColor: '#1565c0',
        };
      case 'vacation':
        return {
          color: 'primary' as const,
          icon: <WorkOff fontSize="small" />,
          label: 'Vacation',
          bgColor: '#f3e5f5',
          textColor: '#6a1b9a',
        };
      case 'sick':
        return {
          color: 'secondary' as const,
          icon: <EventBusy fontSize="small" />,
          label: 'Sick Leave',
          bgColor: '#fce4ec',
          textColor: '#ad1457',
        };
      case 'personal-leave':
        return {
          color: 'default' as const,
          icon: <WorkOff fontSize="small" />,
          label: 'Personal Leave',
          bgColor: '#f5f5f5',
          textColor: '#424242',
        };
      case 'maternity-leave':
        return {
          color: 'primary' as const,
          icon: <Brightness1 fontSize="small" />,
          label: 'Maternity Leave',
          bgColor: '#fce4ec',
          textColor: '#ad1457',
        };
      default:
        return {
          color: 'default' as const,
          icon: <Brightness1 fontSize="small" />,
          label: 'Unknown',
          bgColor: '#fafafa',
          textColor: '#616161',
        };
    }
  };

  const getDaysInMonth = (date: Date): Date[] => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const days: Date[] = [];

    // Add days from previous month to fill the first week
    const firstDayOfWeek = firstDay.getDay();
    for (let i = firstDayOfWeek - 1; i >= 0; i--) {
      const prevDate = new Date(year, month, -i);
      days.push(prevDate);
    }

    // Add all days of the current month
    for (let day = 1; day <= lastDay.getDate(); day++) {
      days.push(new Date(year, month, day));
    }

    // Add days from next month to fill the last week
    const lastDayOfWeek = lastDay.getDay();
    for (let i = 1; i < 7 - lastDayOfWeek; i++) {
      const nextDate = new Date(year, month + 1, i);
      days.push(nextDate);
    }

    return days;
  };

  const formatTime = (timeString?: string): string => {
    if (!timeString) return '-';
    return new Date(`1970-01-01T${timeString}`).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const navigateMonth = (direction: 'prev' | 'next') => {
    const newMonth = new Date(selectedMonth);
    if (direction === 'prev') {
      newMonth.setMonth(newMonth.getMonth() - 1);
    } else {
      newMonth.setMonth(newMonth.getMonth() + 1);
    }
    setSelectedMonth(newMonth);
    onMonthChange?.(newMonth);
  };

  const goToToday = () => {
    const today = new Date();
    setSelectedMonth(today);
    onMonthChange?.(today);
  };

  const handleDateClick = (date: Date) => {
    const dateString = date.toISOString().split('T')[0];
    onDateClick?.(dateString);

    const record = recordsMap[dateString];
    if (record) {
      onRecordClick?.(record);
    }
  };

  const isCurrentMonth = (date: Date): boolean => {
    return date.getMonth() === selectedMonth.getMonth() &&
           date.getFullYear() === selectedMonth.getFullYear();
  };

  const isToday = (date: Date): boolean => {
    const today = new Date();
    return date.toDateString() === today.toDateString();
  };

  const daysInMonth = getDaysInMonth(selectedMonth);
  const monthName = selectedMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });

  // Calculate monthly statistics
  const monthlyStats = useMemo(() => {
    const currentMonthRecords = records.filter(record => {
      const recordDate = new Date(record.date);
      return recordDate.getMonth() === selectedMonth.getMonth() &&
             recordDate.getFullYear() === selectedMonth.getFullYear();
    });

    return {
      present: currentMonthRecords.filter(r => r.status === 'present').length,
      absent: currentMonthRecords.filter(r => r.status === 'absent').length,
      late: currentMonthRecords.filter(r => r.status === 'late').length,
      total: currentMonthRecords.length,
    };
  }, [records, selectedMonth]);

  if (loading) {
    return (
      <Card>
        <CardContent>
          <Typography variant="h6">Loading attendance calendar...</Typography>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardContent>
        {/* Header with navigation */}
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
          <Box display="flex" alignItems="center" gap={2}>
            <IconButton onClick={() => navigateMonth('prev')}>
              <ChevronLeft />
            </IconButton>
            <Typography variant="h5" component="h2">
              {monthName}
            </Typography>
            <IconButton onClick={() => navigateMonth('next')}>
              <ChevronRight />
            </IconButton>
          </Box>

          <IconButton onClick={goToToday} color="primary">
            <Today />
          </IconButton>
        </Box>

        {/* Monthly Statistics */}
        <Grid container spacing={2} sx={{ mb: 3 }}>
          <Grid size={{ xs: 6, sm: 3 }}>
            <Paper sx={{ p: 2, textAlign: 'center', bgcolor: 'success.light' }}>
              <Typography variant="h4" color="success.contrastText">
                {monthlyStats.present}
              </Typography>
              <Typography variant="body2" color="success.contrastText">
                Present
              </Typography>
            </Paper>
          </Grid>
          <Grid size={{ xs: 6, sm: 3 }}>
            <Paper sx={{ p: 2, textAlign: 'center', bgcolor: 'error.light' }}>
              <Typography variant="h4" color="error.contrastText">
                {monthlyStats.absent}
              </Typography>
              <Typography variant="body2" color="error.contrastText">
                Absent
              </Typography>
            </Paper>
          </Grid>
          <Grid size={{ xs: 6, sm: 3 }}>
            <Paper sx={{ p: 2, textAlign: 'center', bgcolor: 'warning.light' }}>
              <Typography variant="h4" color="warning.contrastText">
                {monthlyStats.late}
              </Typography>
              <Typography variant="body2" color="warning.contrastText">
                Late
              </Typography>
            </Paper>
          </Grid>
          <Grid size={{ xs: 6, sm: 3 }}>
            <Paper sx={{ p: 2, textAlign: 'center', bgcolor: 'info.light' }}>
              <Typography variant="h4" color="info.contrastText">
                {monthlyStats.total}
              </Typography>
              <Typography variant="body2" color="info.contrastText">
                Total Days
              </Typography>
            </Paper>
          </Grid>
        </Grid>

        {/* Calendar Grid */}
        <Box sx={{ mb: 3 }}>
          {/* Day headers */}
          <Grid container sx={{ mb: 1 }}>
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
              <Grid size={{ xs: 12/7 }} key={day}>
                <Typography
                  variant="subtitle2"
                  align="center"
                  sx={{ fontWeight: 'bold', py: 1 }}
                >
                  {day}
                </Typography>
              </Grid>
            ))}
          </Grid>

          {/* Calendar days */}
          <Grid container>
            {daysInMonth.map((date, index) => {
              const dateString = date.toISOString().split('T')[0];
              const record = recordsMap[dateString];
              const isCurrentMonthDay = isCurrentMonth(date);
              const isTodayDay = isToday(date);
              const statusConfig = record ? getStatusConfig(record.status) : null;

              return (
                <Grid size={{ xs: 12/7 }} key={index}>
                  <Tooltip
                    title={
                      record ? (
                        <Box>
                          <Typography variant="body2" fontWeight="bold">
                            {date.toLocaleDateString('en-US', {
                              weekday: 'long',
                              year: 'numeric',
                              month: 'long',
                              day: 'numeric'
                            })}
                          </Typography>
                          <Typography variant="body2">
                            Status: {statusConfig?.label}
                          </Typography>
                          {record.checkInTime && (
                            <Typography variant="body2">
                              Check In: {formatTime(record.checkInTime)}
                            </Typography>
                          )}
                          {record.checkOutTime && (
                            <Typography variant="body2">
                              Check Out: {formatTime(record.checkOutTime)}
                            </Typography>
                          )}
                          {record.hoursWorked > 0 && (
                            <Typography variant="body2">
                              Hours: {record.hoursWorked.toFixed(2)}
                            </Typography>
                          )}
                          {record.notes && (
                            <Typography variant="body2">
                              Notes: {record.notes}
                            </Typography>
                          )}
                        </Box>
                      ) : (
                        date.toLocaleDateString('en-US', {
                          weekday: 'long',
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric'
                        })
                      )
                    }
                    arrow
                  >
                    <Paper
                      sx={{
                        height: 60,
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                        cursor: isCurrentMonthDay ? 'pointer' : 'default',
                        bgcolor: isCurrentMonthDay
                          ? (statusConfig ? statusConfig.bgColor : 'background.paper')
                          : 'grey.100',
                        border: isTodayDay ? '2px solid' : '1px solid',
                        borderColor: isTodayDay ? 'primary.main' : 'divider',
                        opacity: isCurrentMonthDay ? 1 : 0.5,
                        '&:hover': {
                          bgcolor: isCurrentMonthDay ? 'action.hover' : 'grey.100',
                        },
                        transition: 'all 0.2s',
                      }}
                      onClick={() => isCurrentMonthDay && handleDateClick(date)}
                    >
                      <Typography
                        variant="body2"
                        sx={{
                          fontWeight: isTodayDay ? 'bold' : 'normal',
                          color: isCurrentMonthDay
                            ? (statusConfig ? statusConfig.textColor : 'text.primary')
                            : 'text.disabled',
                        }}
                      >
                        {date.getDate()}
                      </Typography>

                      {record && statusConfig && (
                        <Box sx={{ mt: 0.5 }}>
                          {statusConfig.icon}
                        </Box>
                      )}
                    </Paper>
                  </Tooltip>
                </Grid>
              );
            })}
          </Grid>
        </Box>

        {/* Legend */}
        <Divider sx={{ mb: 2 }} />
        <Typography variant="h6" gutterBottom>
          Legend
        </Typography>
        <Grid container spacing={1}>
          {Object.entries({
            present: 'Present',
            absent: 'Absent',
            late: 'Late',
            'half-day': 'Half Day',
            vacation: 'Vacation',
            sick: 'Sick Leave',
            'personal-leave': 'Personal Leave',
            'maternity-leave': 'Maternity Leave',
          }).map(([status, label]) => {
            const config = getStatusConfig(status as AttendanceRecord['status']);
            return (
              <Grid size={{ xs: 6, sm: 4, md: 3 }} key={status}>
                <Box display="flex" alignItems="center" gap={1}>
                  {config.icon}
                  <Typography variant="body2">{label}</Typography>
                </Box>
              </Grid>
            );
          })}
        </Grid>
      </CardContent>
    </Card>
  );
};

export default AttendanceCalendar;