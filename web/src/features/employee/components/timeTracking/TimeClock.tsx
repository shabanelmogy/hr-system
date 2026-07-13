import React, { useState, useEffect } from 'react';
import { Box, Typography, Button, Card, CardContent, Grid, Chip, IconButton, Tooltip } from '@mui/material';
import { PlayArrow, Stop, Pause, PlayCircleOutlined, LocationOn, AccessTime } from '@mui/icons-material';
import { TimeEntry, BreakEntry } from '../../types/Employee';

interface TimeClockProps {
  employeeId: string;
  onClockIn: (entry: Partial<TimeEntry>) => void;
  onClockOut: (entry: TimeEntry) => void;
  onBreakStart: (breakEntry: Partial<BreakEntry>) => void;
  onBreakEnd: (breakEntry: BreakEntry) => void;
  currentEntry?: TimeEntry;
  loading?: boolean;
}

export const TimeClock: React.FC<TimeClockProps> = ({
  employeeId,
  onClockIn,
  onClockOut,
  onBreakStart,
  onBreakEnd,
  currentEntry,
  loading = false,
}) => {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [sessionDuration, setSessionDuration] = useState(0);
  const [breakDuration, setBreakDuration] = useState(0);
  const [location, setLocation] = useState<string>('');

  // Update current time every second
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Calculate session duration
  useEffect(() => {
    if (currentEntry?.clockIn && !currentEntry.clockOut) {
      const startTime = new Date(currentEntry.clockIn);
      const timer = setInterval(() => {
        setSessionDuration(Math.floor((new Date().getTime() - startTime.getTime()) / 1000));
      }, 1000);
      return () => clearInterval(timer);
    } else {
      setSessionDuration(0);
    }
  }, [currentEntry]);

  // Calculate current break duration
  useEffect(() => {
    const currentBreak = currentEntry?.breaks?.find(b => !b.endTime);
    if (currentBreak?.startTime) {
      const startTime = new Date(currentBreak.startTime);
      const timer = setInterval(() => {
        setBreakDuration(Math.floor((new Date().getTime() - startTime.getTime()) / 1000));
      }, 1000);
      return () => clearInterval(timer);
    } else {
      setBreakDuration(0);
    }
  }, [currentEntry]);

  // Get user location
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setLocation(`${position.coords.latitude.toFixed(4)}, ${position.coords.longitude.toFixed(4)}`);
        },
        (error) => {
          console.error('Error getting location:', error);
          setLocation('Location unavailable');
        }
      );
    }
  }, []);

  const formatTime = (seconds: number): string => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const formatCurrentTime = (date: Date): string => {
    return date.toLocaleTimeString('en-US', {
      hour12: true,
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
  };

  const handleClockIn = () => {
    const now = new Date().toISOString();
    onClockIn({
      employeeId,
      date: now.split('T')[0],
      clockIn: now,
      status: 'active',
      totalHours: 0,
      overtimeHours: 0,
      breaks: [],
      createdAt: now,
      updatedAt: now,
    });
  };

  const handleClockOut = () => {
    if (currentEntry) {
      const now = new Date().toISOString();
      const clockOutTime = new Date(now);
      const clockInTime = new Date(currentEntry.clockIn);
      const totalSeconds = Math.floor((clockOutTime.getTime() - clockInTime.getTime()) / 1000);
      const totalHours = totalSeconds / 3600;

      // Calculate break time
      const breakSeconds = currentEntry.breaks?.reduce((total, breakEntry) => {
        if (breakEntry.endTime) {
          const breakStart = new Date(breakEntry.startTime);
          const breakEnd = new Date(breakEntry.endTime);
          return total + Math.floor((breakEnd.getTime() - breakStart.getTime()) / 1000);
        }
        return total;
      }, 0) || 0;

      const workSeconds = totalSeconds - breakSeconds;
      const workHours = workSeconds / 3600;

      onClockOut({
        ...currentEntry,
        clockOut: now,
        totalHours: workHours,
        overtimeHours: Math.max(0, workHours - 8), // Assuming 8-hour workday
        status: 'completed',
        updatedAt: now,
      });
    }
  };

  const handleBreakStart = (type: BreakEntry['type']) => {
    const now = new Date().toISOString();
    onBreakStart({
      startTime: now,
      type,
      duration: 0,
    });
  };

  const handleBreakEnd = () => {
    const currentBreak = currentEntry?.breaks?.find(b => !b.endTime);
    if (currentBreak) {
      const now = new Date().toISOString();
      const startTime = new Date(currentBreak.startTime);
      const endTime = new Date(now);
      const duration = Math.floor((endTime.getTime() - startTime.getTime()) / 1000 / 60); // minutes

      onBreakEnd({
        ...currentBreak,
        endTime: now,
        duration,
      });
    }
  };

  const isOnBreak = currentEntry?.breaks?.some(b => !b.endTime);
  const isClockedIn = currentEntry && !currentEntry.clockOut;

  return (
    <Card>
      <CardContent>
        <Typography variant="h5" gutterBottom>
          Time Clock
        </Typography>

        {/* Current Time Display */}
        <Box textAlign="center" mb={3}>
          <Typography variant="h3" color="primary">
            {formatCurrentTime(currentTime)}
          </Typography>
          <Typography variant="body2" color="textSecondary">
            {currentTime.toLocaleDateString('en-US', {
              weekday: 'long',
              year: 'numeric',
              month: 'long',
              day: 'numeric'
            })}
          </Typography>
        </Box>

        {/* Status Indicators */}
        <Grid container spacing={2} mb={3}>
          <Grid size={{ xs: 12, sm: 6 }}>
            <Box display="flex" alignItems="center" gap={1}>
              <AccessTime color={isClockedIn ? "success" : "disabled"} />
              <Box>
                <Typography variant="body2">Status</Typography>
                <Chip
                  label={isClockedIn ? (isOnBreak ? 'On Break' : 'Clocked In') : 'Clocked Out'}
                  color={isClockedIn ? (isOnBreak ? 'warning' : 'success') : 'default'}
                  size="small"
                />
              </Box>
            </Box>
          </Grid>
          <Grid size={{ xs: 12, sm: 6 }}>
            <Box display="flex" alignItems="center" gap={1}>
              <LocationOn color="action" />
              <Box>
                <Typography variant="body2">Location</Typography>
                <Typography variant="body2" color="textSecondary">
                  {location || 'Detecting...'}
                </Typography>
              </Box>
            </Box>
          </Grid>
        </Grid>

        {/* Session Timer */}
        {isClockedIn && (
          <Box textAlign="center" mb={3}>
            <Typography variant="h6">Session Duration</Typography>
            <Typography variant="h4" color="primary">
              {formatTime(sessionDuration)}
            </Typography>
          </Box>
        )}

        {/* Break Timer */}
        {isOnBreak && (
          <Box textAlign="center" mb={3}>
            <Typography variant="h6">Break Duration</Typography>
            <Typography variant="h4" color="warning.main">
              {formatTime(breakDuration)}
            </Typography>
          </Box>
        )}

        {/* Action Buttons */}
        <Grid container spacing={2}>
          <Grid size={{ xs: 12, sm: 6 }}>
            <Button
              fullWidth
              variant="contained"
              color={isClockedIn ? "error" : "success"}
              startIcon={isClockedIn ? <Stop /> : <PlayArrow />}
              onClick={isClockedIn ? handleClockOut : handleClockIn}
              disabled={loading}
              size="large"
            >
              {isClockedIn ? 'Clock Out' : 'Clock In'}
            </Button>
          </Grid>

          <Grid size={{ xs: 12, sm: 6 }}>
            {isClockedIn && (
              <Button
                fullWidth
                variant="outlined"
                color={isOnBreak ? "success" : "warning"}
                startIcon={isOnBreak ? <PlayCircleOutlined /> : <Pause />}
                onClick={isOnBreak ? handleBreakEnd : () => handleBreakStart('short-break')}
                disabled={loading}
                size="large"
              >
                {isOnBreak ? 'End Break' : 'Start Break'}
              </Button>
            )}
          </Grid>
        </Grid>

        {/* Quick Break Actions */}
        {isClockedIn && !isOnBreak && (
          <Box mt={2}>
            <Typography variant="body2" gutterBottom>Quick Breaks:</Typography>
            <Box display="flex" gap={1} flexWrap="wrap">
              <Tooltip title="Lunch Break">
                <IconButton
                  size="small"
                  onClick={() => handleBreakStart('lunch')}
                  disabled={loading}
                >
                  🍽️
                </IconButton>
              </Tooltip>
              <Tooltip title="Meeting">
                <IconButton
                  size="small"
                  onClick={() => handleBreakStart('meeting')}
                  disabled={loading}
                >
                  📅
                </IconButton>
              </Tooltip>
              <Tooltip title="Other">
                <IconButton
                  size="small"
                  onClick={() => handleBreakStart('other')}
                  disabled={loading}
                >
                  ⚡
                </IconButton>
              </Tooltip>
            </Box>
          </Box>
        )}
      </CardContent>
    </Card>
  );
};

export default TimeClock;