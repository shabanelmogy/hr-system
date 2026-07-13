import React, { useState, useEffect } from 'react';
import {
  Box,
  Button,
  Card,
  CardContent,
  TextField,
  Typography,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Checkbox,
  FormControlLabel,
  Alert,
  Chip,
  Divider,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from '@mui/material';
import { DatePicker, TimePicker, LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { TimeEntry } from '../../types/Employee';

interface TimeEntryFormProps {
  employeeId: string;
  entry?: TimeEntry;
  projects?: Array<{ id: string; name: string; tasks: Array<{ id: string; name: string }> }>;
  onSubmit: (entry: Partial<TimeEntry>) => void;
  onCancel: () => void;
  loading?: boolean;
  open: boolean;
}

interface FormData {
  date: Date | null;
  clockIn: Date | null;
  clockOut: Date | null;
  projectId: string;
  taskId: string;
  description: string;
  isOvertime: boolean;
  overtimeHours: number;
  breaks: Array<{
    startTime: Date | null;
    endTime: Date | null;
    type: 'lunch' | 'short-break' | 'meeting' | 'other';
    description: string;
  }>;
  notes: string;
}

const TimeEntryForm: React.FC<TimeEntryFormProps> = ({
  employeeId,
  entry,
  projects = [],
  onSubmit,
  onCancel,
  loading = false,
  open,
}) => {
  const [formData, setFormData] = useState<FormData>({
    date: new Date(),
    clockIn: null,
    clockOut: null,
    projectId: '',
    taskId: '',
    description: '',
    isOvertime: false,
    overtimeHours: 0,
    breaks: [],
    notes: '',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [totalHours, setTotalHours] = useState(0);

  // Initialize form with existing entry data
  useEffect(() => {
    if (entry) {
      setFormData({
        date: new Date(entry.date),
        clockIn: entry.clockIn ? new Date(entry.clockIn) : null,
        clockOut: entry.clockOut ? new Date(entry.clockOut) : null,
        projectId: '', // Would need to be populated from entry data
        taskId: '',
        description: entry.notes || '',
        isOvertime: entry.overtimeHours > 0,
        overtimeHours: entry.overtimeHours,
        breaks: entry.breaks?.map(breakEntry => ({
          startTime: breakEntry.startTime ? new Date(breakEntry.startTime) : null,
          endTime: breakEntry.endTime ? new Date(breakEntry.endTime) : null,
          type: breakEntry.type,
          description: breakEntry.description || '',
        })) || [],
        notes: entry.notes || '',
      });
    } else {
      // Reset form for new entry
      setFormData({
        date: new Date(),
        clockIn: null,
        clockOut: null,
        projectId: '',
        taskId: '',
        description: '',
        isOvertime: false,
        overtimeHours: 0,
        breaks: [],
        notes: '',
      });
    }
  }, [entry, open]);

  // Calculate total hours whenever clock in/out or breaks change
  useEffect(() => {
    if (formData.clockIn && formData.clockOut) {
      const clockInTime = formData.clockIn.getTime();
      const clockOutTime = formData.clockOut.getTime();
      let workSeconds = (clockOutTime - clockInTime) / 1000;

      // Subtract break time
      formData.breaks.forEach(breakEntry => {
        if (breakEntry.startTime && breakEntry.endTime) {
          const breakStart = breakEntry.startTime.getTime();
          const breakEnd = breakEntry.endTime.getTime();
          workSeconds -= (breakEnd - breakStart) / 1000;
        }
      });

      const hours = Math.max(0, workSeconds / 3600);
      setTotalHours(hours);

      // Auto-calculate overtime if enabled
      if (formData.isOvertime) {
        const standardHours = 8; // Assuming 8-hour workday
        setFormData(prev => ({
          ...prev,
          overtimeHours: Math.max(0, hours - standardHours),
        }));
      }
    } else {
      setTotalHours(0);
    }
  }, [formData.clockIn, formData.clockOut, formData.breaks, formData.isOvertime]);

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.date) {
      newErrors.date = 'Date is required';
    }

    if (!formData.clockIn) {
      newErrors.clockIn = 'Clock in time is required';
    }

    if (!formData.clockOut) {
      newErrors.clockOut = 'Clock out time is required';
    }

    if (formData.clockIn && formData.clockOut && formData.clockIn >= formData.clockOut) {
      newErrors.clockOut = 'Clock out time must be after clock in time';
    }

    if (!formData.projectId) {
      newErrors.projectId = 'Project selection is required';
    }

    if (!formData.taskId) {
      newErrors.taskId = 'Task selection is required';
    }

    if (!formData.description.trim()) {
      newErrors.description = 'Description is required';
    }

    if (formData.isOvertime && formData.overtimeHours <= 0) {
      newErrors.overtimeHours = 'Overtime hours must be greater than 0';
    }

    // Validate breaks
    formData.breaks.forEach((breakEntry, index) => {
      if (breakEntry.startTime && breakEntry.endTime) {
        if (breakEntry.startTime >= breakEntry.endTime) {
          newErrors[`break_${index}_end`] = 'Break end time must be after start time';
        }
      }
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    const breaks = formData.breaks
      .filter(breakEntry => breakEntry.startTime && breakEntry.endTime)
      .map(breakEntry => ({
        id: `break_${Date.now()}_${Math.random()}`,
        startTime: breakEntry.startTime!.toISOString(),
        endTime: breakEntry.endTime!.toISOString(),
        duration: Math.floor((breakEntry.endTime!.getTime() - breakEntry.startTime!.getTime()) / 1000 / 60),
        type: breakEntry.type,
        description: breakEntry.description,
      }));

    const entryData: Partial<TimeEntry> = {
      employeeId,
      date: formData.date!.toISOString().split('T')[0],
      clockIn: formData.clockIn!.toISOString(),
      clockOut: formData.clockOut!.toISOString(),
      breaks,
      totalHours,
      overtimeHours: formData.isOvertime ? formData.overtimeHours : 0,
      status: 'active',
      notes: formData.notes,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    onSubmit(entryData);
  };

  const addBreak = () => {
    setFormData(prev => ({
      ...prev,
      breaks: [...prev.breaks, {
        startTime: null,
        endTime: null,
        type: 'short-break',
        description: '',
      }],
    }));
  };

  const removeBreak = (index: number) => {
    setFormData(prev => ({
      ...prev,
      breaks: prev.breaks.filter((_, i) => i !== index),
    }));
  };

  const updateBreak = (index: number, field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      breaks: prev.breaks.map((breakEntry, i) =>
        i === index ? { ...breakEntry, [field]: value } : breakEntry
      ),
    }));
  };

  const selectedProject = projects.find(p => p.id === formData.projectId);
  const availableTasks = selectedProject?.tasks || [];

  return (
    <Dialog open={open} onClose={onCancel} maxWidth="md" fullWidth>
      <DialogTitle>
        {entry ? 'Edit Time Entry' : 'Add Time Entry'}
      </DialogTitle>

      <form onSubmit={handleSubmit}>
        <DialogContent>
          <LocalizationProvider dateAdapter={AdapterDateFns}>
            <Grid container spacing={3}>
              {/* Date and Times */}
              <Grid size={{ xs: 12, md: 6 }}>
                <DatePicker
                  label="Date"
                  value={formData.date}
                  onChange={(date) => setFormData(prev => ({ ...prev, date }))}
                  slotProps={{
                    textField: {
                      fullWidth: true,
                      error: !!errors.date,
                      helperText: errors.date,
                    },
                  }}
                />
              </Grid>

              <Grid size={{ xs: 12, md: 6 }}>
                <Box display="flex" gap={1} alignItems="center">
                  <Chip
                    label={`${totalHours.toFixed(2)} hours`}
                    color="primary"
                    size="small"
                  />
                  {formData.isOvertime && (
                    <Chip
                      label={`${formData.overtimeHours.toFixed(2)} OT`}
                      color="warning"
                      size="small"
                    />
                  )}
                </Box>
              </Grid>

              <Grid size={{ xs: 12, md: 6 }}>
                <TimePicker
                  label="Clock In"
                  value={formData.clockIn}
                  onChange={(time) => setFormData(prev => ({ ...prev, clockIn: time }))}
                  slotProps={{
                    textField: {
                      fullWidth: true,
                      error: !!errors.clockIn,
                      helperText: errors.clockIn,
                    },
                  }}
                />
              </Grid>

              <Grid size={{ xs: 12, md: 6 }}>
                <TimePicker
                  label="Clock Out"
                  value={formData.clockOut}
                  onChange={(time) => setFormData(prev => ({ ...prev, clockOut: time }))}
                  slotProps={{
                    textField: {
                      fullWidth: true,
                      error: !!errors.clockOut,
                      helperText: errors.clockOut,
                    },
                  }}
                />
              </Grid>

              {/* Project and Task */}
              <Grid size={{ xs: 12, md: 6 }}>
                <FormControl fullWidth error={!!errors.projectId}>
                  <InputLabel>Project</InputLabel>
                  <Select
                    value={formData.projectId}
                    onChange={(e) => setFormData(prev => ({
                      ...prev,
                      projectId: e.target.value,
                      taskId: '', // Reset task when project changes
                    }))}
                    label="Project"
                  >
                    {projects.map(project => (
                      <MenuItem key={project.id} value={project.id}>
                        {project.name}
                      </MenuItem>
                    ))}
                  </Select>
                  {errors.projectId && (
                    <Typography variant="caption" color="error" sx={{ mt: 0.5, ml: 1.5 }}>
                      {errors.projectId}
                    </Typography>
                  )}
                </FormControl>
              </Grid>

              <Grid size={{ xs: 12, md: 6 }}>
                <FormControl fullWidth error={!!errors.taskId}>
                  <InputLabel>Task</InputLabel>
                  <Select
                    value={formData.taskId}
                    onChange={(e) => setFormData(prev => ({ ...prev, taskId: e.target.value }))}
                    label="Task"
                    disabled={!formData.projectId}
                  >
                    {availableTasks.map(task => (
                      <MenuItem key={task.id} value={task.id}>
                        {task.name}
                      </MenuItem>
                    ))}
                  </Select>
                  {errors.taskId && (
                    <Typography variant="caption" color="error" sx={{ mt: 0.5, ml: 1.5 }}>
                      {errors.taskId}
                    </Typography>
                  )}
                </FormControl>
              </Grid>

              {/* Description */}
              <Grid size={{ xs: 12 }}>
                <TextField
                  fullWidth
                  label="Description"
                  multiline
                  rows={3}
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  error={!!errors.description}
                  helperText={errors.description}
                  placeholder="Describe the work performed..."
                />
              </Grid>

              {/* Overtime */}
              <Grid size={{ xs: 12, md: 6 }}>
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={formData.isOvertime}
                      onChange={(e) => setFormData(prev => ({
                        ...prev,
                        isOvertime: e.target.checked,
                        overtimeHours: e.target.checked ? Math.max(0, totalHours - 8) : 0,
                      }))}
                    />
                  }
                  label="Overtime"
                />
              </Grid>

              <Grid size={{ xs: 12, md: 6 }}>
                <TextField
                  fullWidth
                  label="Overtime Hours"
                  type="number"
                  value={formData.overtimeHours}
                  onChange={(e) => setFormData(prev => ({
                    ...prev,
                    overtimeHours: parseFloat(e.target.value) || 0
                  }))}
                  disabled={!formData.isOvertime}
                  error={!!errors.overtimeHours}
                  helperText={errors.overtimeHours}
                  inputProps={{ min: 0, step: 0.25 }}
                />
              </Grid>

              {/* Breaks */}
              <Grid size={{ xs: 12 }}>
                <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                  <Typography variant="h6">Breaks</Typography>
                  <Button variant="outlined" size="small" onClick={addBreak}>
                    Add Break
                  </Button>
                </Box>

                {formData.breaks.map((breakEntry, index) => (
                  <Card key={index} variant="outlined" sx={{ mb: 2 }}>
                    <CardContent sx={{ pb: '16px !important' }}>
                      <Grid container spacing={2} alignItems="center">
                        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                          <FormControl fullWidth size="small">
                            <InputLabel>Type</InputLabel>
                            <Select
                              value={breakEntry.type}
                              onChange={(e) => updateBreak(index, 'type', e.target.value)}
                              label="Type"
                            >
                              <MenuItem value="lunch">Lunch</MenuItem>
                              <MenuItem value="short-break">Short Break</MenuItem>
                              <MenuItem value="meeting">Meeting</MenuItem>
                              <MenuItem value="other">Other</MenuItem>
                            </Select>
                          </FormControl>
                        </Grid>

                        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                          <TimePicker
                            label="Start"
                            value={breakEntry.startTime}
                            onChange={(time) => updateBreak(index, 'startTime', time)}
                            slotProps={{
                              textField: {
                                fullWidth: true,
                                size: "small",
                              },
                            }}
                          />
                        </Grid>

                        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                          <TimePicker
                            label="End"
                            value={breakEntry.endTime}
                            onChange={(time) => updateBreak(index, 'endTime', time)}
                            slotProps={{
                              textField: {
                                fullWidth: true,
                                size: "small",
                                error: !!errors[`break_${index}_end`],
                                helperText: errors[`break_${index}_end`],
                              },
                            }}
                          />
                        </Grid>

                        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                          <Button
                            variant="outlined"
                            color="error"
                            size="small"
                            onClick={() => removeBreak(index)}
                            fullWidth
                          >
                            Remove
                          </Button>
                        </Grid>

                        <Grid size={{ xs: 12 }}>
                          <TextField
                            fullWidth
                            size="small"
                            label="Description (optional)"
                            value={breakEntry.description}
                            onChange={(e) => updateBreak(index, 'description', e.target.value)}
                          />
                        </Grid>
                      </Grid>
                    </CardContent>
                  </Card>
                ))}
              </Grid>

              {/* Notes */}
              <Grid size={{ xs: 12 }}>
                <TextField
                  fullWidth
                  label="Additional Notes"
                  multiline
                  rows={2}
                  value={formData.notes}
                  onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                  placeholder="Any additional notes..."
                />
              </Grid>
            </Grid>
          </LocalizationProvider>
        </DialogContent>

        <DialogActions>
          <Button onClick={onCancel} disabled={loading}>
            Cancel
          </Button>
          <Button
            type="submit"
            variant="contained"
            disabled={loading}
          >
            {entry ? 'Update Entry' : 'Add Entry'}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
};

export default TimeEntryForm;