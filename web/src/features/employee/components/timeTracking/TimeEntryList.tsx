import React, { useState, useMemo } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  Chip,
  IconButton,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Tabs,
  Tab,
  Grid,
  TextField,
  InputAdornment,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Tooltip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Alert,
} from '@mui/material';
import {
  Search,
  Edit,
  Delete,
  FileDownload,
  FilterList,
  CalendarToday,
  AccessTime,
  CheckCircle,
  Pending,
  Cancel,
  PlayArrow,
  Stop,
} from '@mui/icons-material';
import { DatePicker, LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { TimeEntry } from '../../types/Employee';

interface TimeEntryListProps {
  entries: TimeEntry[];
  employeeId?: string;
  onEditEntry?: (entry: TimeEntry) => void;
  onDeleteEntry?: (entry: TimeEntry) => void;
  onApproveEntry?: (entry: TimeEntry) => void;
  onExport?: (entries: TimeEntry[], format: 'csv' | 'excel' | 'pdf') => void;
  loading?: boolean;
  canEdit?: boolean;
  canApprove?: boolean;
}

type ViewMode = 'daily' | 'weekly' | 'monthly';
type StatusFilter = 'all' | 'active' | 'completed' | 'approved' | 'rejected';

const TimeEntryList: React.FC<TimeEntryListProps> = ({
  entries,
  employeeId,
  onEditEntry,
  onDeleteEntry,
  onApproveEntry,
  onExport,
  loading = false,
  canEdit = true,
  canApprove = false,
}) => {
  const [viewMode, setViewMode] = useState<ViewMode>('daily');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDate, setSelectedDate] = useState<Date | null>(new Date());
  const [deleteDialog, setDeleteDialog] = useState<{ open: boolean; entry: TimeEntry | null }>({
    open: false,
    entry: null,
  });

  // Filter entries based on current filters
  const filteredEntries = useMemo(() => {
    let filtered = entries;

    // Status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(entry => entry.status === statusFilter);
    }

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(entry =>
        entry.notes?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        entry.date.includes(searchTerm)
      );
    }

    // Date range filter based on view mode
    if (selectedDate) {
      const startDate = new Date(selectedDate);
      let endDate = new Date(selectedDate);

      switch (viewMode) {
        case 'weekly':
          // Start of week (Sunday)
          startDate.setDate(startDate.getDate() - startDate.getDay());
          // End of week (Saturday)
          endDate.setDate(startDate.getDate() + 6);
          break;
        case 'monthly':
          // Start of month
          startDate.setDate(1);
          // End of month
          endDate.setMonth(endDate.getMonth() + 1, 0);
          break;
        default: // daily
          endDate = startDate;
          break;
      }

      filtered = filtered.filter(entry => {
        const entryDate = new Date(entry.date);
        return entryDate >= startDate && entryDate <= endDate;
      });
    }

    // Sort by date descending
    return filtered.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [entries, statusFilter, searchTerm, selectedDate, viewMode]);

  // Calculate totals
  const totals = useMemo(() => {
    const totalHours = filteredEntries.reduce((sum, entry) => sum + entry.totalHours, 0);
    const totalOvertime = filteredEntries.reduce((sum, entry) => sum + entry.overtimeHours, 0);
    const approvedEntries = filteredEntries.filter(entry => entry.status === 'approved').length;
    const pendingEntries = filteredEntries.filter(entry => entry.status === 'active' || entry.status === 'completed').length;

    return {
      totalHours,
      totalOvertime,
      approvedEntries,
      pendingEntries,
      totalEntries: filteredEntries.length,
    };
  }, [filteredEntries]);

  const formatTime = (dateString: string): string => {
    return new Date(dateString).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const formatDuration = (hours: number): string => {
    const wholeHours = Math.floor(hours);
    const minutes = Math.round((hours - wholeHours) * 60);
    return `${wholeHours}:${minutes.toString().padStart(2, '0')}`;
  };

  const getStatusColor = (status: TimeEntry['status']) => {
    switch (status) {
      case 'active':
        return 'info';
      case 'completed':
        return 'warning';
      case 'approved':
        return 'success';
      case 'rejected':
        return 'error';
      default:
        return 'default';
    }
  };

  const getStatusIcon = (status: TimeEntry['status']) => {
    switch (status) {
      case 'active':
        return <PlayArrow />;
      case 'completed':
        return <Stop />;
      case 'approved':
        return <CheckCircle />;
      case 'rejected':
        return <Cancel />;
      default:
        return <Pending />;
    }
  };

  const handleDeleteClick = (entry: TimeEntry) => {
    setDeleteDialog({ open: true, entry });
  };

  const handleDeleteConfirm = () => {
    if (deleteDialog.entry && onDeleteEntry) {
      onDeleteEntry(deleteDialog.entry);
    }
    setDeleteDialog({ open: false, entry: null });
  };

  const handleExport = (format: 'csv' | 'excel' | 'pdf') => {
    if (onExport) {
      onExport(filteredEntries, format);
    }
  };

  const navigateDate = (direction: 'prev' | 'next') => {
    if (!selectedDate) return;

    const newDate = new Date(selectedDate);

    switch (viewMode) {
      case 'daily':
        newDate.setDate(newDate.getDate() + (direction === 'next' ? 1 : -1));
        break;
      case 'weekly':
        newDate.setDate(newDate.getDate() + (direction === 'next' ? 7 : -7));
        break;
      case 'monthly':
        newDate.setMonth(newDate.getMonth() + (direction === 'next' ? 1 : -1));
        break;
    }

    setSelectedDate(newDate);
  };

  if (loading) {
    return (
      <Box>
        <Typography variant="h6">Loading time entries...</Typography>
      </Box>
    );
  }

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns}>
      <Box>
        {/* Header with filters and actions */}
        <Card sx={{ mb: 3 }}>
          <CardContent>
            <Grid container spacing={3} alignItems="center">
              {/* View Mode Tabs */}
              <Grid size={{ xs: 12, md: 3 }}>
                <Tabs
                  value={viewMode}
                  onChange={(_, value) => setViewMode(value)}
                  variant="fullWidth"
                >
                  <Tab label="Daily" value="daily" />
                  <Tab label="Weekly" value="weekly" />
                  <Tab label="Monthly" value="monthly" />
                </Tabs>
              </Grid>

              {/* Date Navigation */}
              <Grid size={{ xs: 12, md: 4 }}>
                <Box display="flex" alignItems="center" gap={1}>
                  <IconButton onClick={() => navigateDate('prev')}>
                    ‹
                  </IconButton>
                  <DatePicker
                    label="Select Date"
                    value={selectedDate}
                    onChange={setSelectedDate}
                    slotProps={{
                      textField: {
                        size: "small",
                        sx: { minWidth: 150 },
                      },
                    }}
                  />
                  <IconButton onClick={() => navigateDate('next')}>
                    ›
                  </IconButton>
                </Box>
              </Grid>

              {/* Filters */}
              <Grid size={{ xs: 12, md: 5 }}>
                <Box display="flex" gap={2}>
                  <TextField
                    size="small"
                    placeholder="Search entries..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <Search />
                        </InputAdornment>
                      ),
                    }}
                    sx={{ minWidth: 200 }}
                  />

                  <FormControl size="small" sx={{ minWidth: 120 }}>
                    <InputLabel>Status</InputLabel>
                    <Select
                      value={statusFilter}
                      onChange={(e) => setStatusFilter(e.target.value as StatusFilter)}
                      label="Status"
                    >
                      <MenuItem value="all">All Status</MenuItem>
                      <MenuItem value="active">Active</MenuItem>
                      <MenuItem value="completed">Completed</MenuItem>
                      <MenuItem value="approved">Approved</MenuItem>
                      <MenuItem value="rejected">Rejected</MenuItem>
                    </Select>
                  </FormControl>
                </Box>
              </Grid>
            </Grid>
          </CardContent>
        </Card>

        {/* Summary Cards */}
        <Grid container spacing={2} sx={{ mb: 3 }}>
          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <Card>
              <CardContent sx={{ textAlign: 'center' }}>
                <Typography variant="h4" color="primary">
                  {formatDuration(totals.totalHours)}
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
                <Typography variant="h4" color="warning.main">
                  {formatDuration(totals.totalOvertime)}
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
                <Typography variant="h4" color="success.main">
                  {totals.approvedEntries}
                </Typography>
                <Typography variant="body2" color="textSecondary">
                  Approved
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <Card>
              <CardContent sx={{ textAlign: 'center' }}>
                <Typography variant="h4" color="info.main">
                  {totals.totalEntries}
                </Typography>
                <Typography variant="body2" color="textSecondary">
                  Total Entries
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        {/* Export Actions */}
        {onExport && (
          <Box display="flex" justifyContent="flex-end" gap={1} sx={{ mb: 2 }}>
            <Button
              variant="outlined"
              startIcon={<FileDownload />}
              onClick={() => handleExport('csv')}
              size="small"
            >
              Export CSV
            </Button>
            <Button
              variant="outlined"
              startIcon={<FileDownload />}
              onClick={() => handleExport('excel')}
              size="small"
            >
              Export Excel
            </Button>
            <Button
              variant="outlined"
              startIcon={<FileDownload />}
              onClick={() => handleExport('pdf')}
              size="small"
            >
              Export PDF
            </Button>
          </Box>
        )}

        {/* Entries Table */}
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Date</TableCell>
                <TableCell>Time In/Out</TableCell>
                <TableCell>Duration</TableCell>
                <TableCell>Overtime</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Notes</TableCell>
                <TableCell align="right">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredEntries.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} align="center">
                    <Typography variant="body2" color="textSecondary">
                      No time entries found for the selected period.
                    </Typography>
                  </TableCell>
                </TableRow>
              ) : (
                filteredEntries.map((entry) => (
                  <TableRow key={entry.id} hover>
                    <TableCell>
                      <Typography variant="body2" fontWeight="medium">
                        {new Date(entry.date).toLocaleDateString('en-US', {
                          weekday: 'short',
                          month: 'short',
                          day: 'numeric',
                        })}
                      </Typography>
                    </TableCell>

                    <TableCell>
                      <Box>
                        <Typography variant="body2">
                          <AccessTime fontSize="small" sx={{ mr: 0.5, verticalAlign: 'middle' }} />
                          {formatTime(entry.clockIn)}
                        </Typography>
                        {entry.clockOut && (
                          <Typography variant="body2" color="textSecondary">
                            to {formatTime(entry.clockOut)}
                          </Typography>
                        )}
                      </Box>
                    </TableCell>

                    <TableCell>
                      <Typography variant="body2" fontWeight="medium">
                        {formatDuration(entry.totalHours)}
                      </Typography>
                      {entry.breaks && entry.breaks.length > 0 && (
                        <Typography variant="caption" color="textSecondary">
                          {entry.breaks.length} break{entry.breaks.length > 1 ? 's' : ''}
                        </Typography>
                      )}
                    </TableCell>

                    <TableCell>
                      {entry.overtimeHours > 0 ? (
                        <Typography variant="body2" color="warning.main">
                          {formatDuration(entry.overtimeHours)}
                        </Typography>
                      ) : (
                        <Typography variant="body2" color="textSecondary">-</Typography>
                      )}
                    </TableCell>

                    <TableCell>
                      <Chip
                        icon={getStatusIcon(entry.status)}
                        label={entry.status.charAt(0).toUpperCase() + entry.status.slice(1)}
                        color={getStatusColor(entry.status)}
                        size="small"
                        variant="outlined"
                      />
                    </TableCell>

                    <TableCell>
                      <Typography variant="body2" sx={{
                        maxWidth: 200,
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap'
                      }}>
                        {entry.notes || '-'}
                      </Typography>
                    </TableCell>

                    <TableCell align="right">
                      <Box display="flex" justifyContent="flex-end" gap={0.5}>
                        {canApprove && entry.status === 'completed' && (
                          <Tooltip title="Approve Entry">
                            <IconButton
                              size="small"
                              color="success"
                              onClick={() => onApproveEntry?.(entry)}
                            >
                              <CheckCircle fontSize="small" />
                            </IconButton>
                          </Tooltip>
                        )}

                        {canEdit && onEditEntry && (
                          <Tooltip title="Edit Entry">
                            <IconButton
                              size="small"
                              onClick={() => onEditEntry(entry)}
                            >
                              <Edit fontSize="small" />
                            </IconButton>
                          </Tooltip>
                        )}

                        {canEdit && onDeleteEntry && (
                          <Tooltip title="Delete Entry">
                            <IconButton
                              size="small"
                              color="error"
                              onClick={() => handleDeleteClick(entry)}
                            >
                              <Delete fontSize="small" />
                            </IconButton>
                          </Tooltip>
                        )}
                      </Box>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>

        {/* Delete Confirmation Dialog */}
        <Dialog
          open={deleteDialog.open}
          onClose={() => setDeleteDialog({ open: false, entry: null })}
        >
          <DialogTitle>Delete Time Entry</DialogTitle>
          <DialogContent>
            <Alert severity="warning" sx={{ mb: 2 }}>
              Are you sure you want to delete this time entry? This action cannot be undone.
            </Alert>
            {deleteDialog.entry && (
              <Typography>
                Entry for {new Date(deleteDialog.entry.date).toLocaleDateString()} -
                {formatDuration(deleteDialog.entry.totalHours)} hours
              </Typography>
            )}
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setDeleteDialog({ open: false, entry: null })}>
              Cancel
            </Button>
            <Button onClick={handleDeleteConfirm} color="error" variant="contained">
              Delete
            </Button>
          </DialogActions>
        </Dialog>
      </Box>
    </LocalizationProvider>
  );
};

export default TimeEntryList;