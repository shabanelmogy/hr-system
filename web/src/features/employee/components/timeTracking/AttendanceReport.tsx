import React, { useState, useMemo } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TextField,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Alert,
  LinearProgress,
  Accordion,
  AccordionSummary,
  AccordionDetails,
} from '@mui/material';
import {
  DatePicker,
  LocalizationProvider,
} from '@mui/x-date-pickers';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import {
  FileDownload,
  ExpandMore,
  Assessment,
  Person,
  CalendarToday,
  TrendingUp,
  Schedule,
  CheckCircle,
  Cancel,
  Warning,
} from '@mui/icons-material';
import { TimeEntry, AttendanceRecord, Employee } from '../../types/Employee';

interface AttendanceReportProps {
  employees: Employee[];
  timeEntries: TimeEntry[];
  attendanceRecords: AttendanceRecord[];
  onGenerateReport?: (filters: ReportFilters) => void;
  onExport?: (data: ReportData, format: 'pdf' | 'excel' | 'csv') => void;
  loading?: boolean;
}

interface ReportFilters {
  employeeIds: string[];
  dateRange: {
    start: Date | null;
    end: Date | null;
  };
  reportType: 'summary' | 'detailed' | 'comparison';
}

interface ReportData {
  summary: {
    totalEmployees: number;
    totalDays: number;
    presentDays: number;
    absentDays: number;
    lateDays: number;
    attendanceRate: number;
    totalHours: number;
    avgHoursPerDay: number;
    overtimeHours: number;
  };
  employeeData: Array<{
    employeeId: string;
    employeeName: string;
    department: string;
    presentDays: number;
    absentDays: number;
    lateDays: number;
    halfDays: number;
    attendanceRate: number;
    totalHours: number;
    avgHoursPerDay: number;
    overtimeHours: number;
    sickDays: number;
    vacationDays: number;
  }>;
  dailyData: Array<{
    date: string;
    totalPresent: number;
    totalAbsent: number;
    totalLate: number;
    attendanceRate: number;
  }>;
}

const AttendanceReport: React.FC<AttendanceReportProps> = ({
  employees,
  timeEntries,
  attendanceRecords,
  onGenerateReport,
  onExport,
  loading = false,
}) => {
  const [filters, setFilters] = useState<ReportFilters>({
    employeeIds: [],
    dateRange: {
      start: new Date(new Date().getFullYear(), new Date().getMonth(), 1), // First day of current month
      end: new Date(),
    },
    reportType: 'summary',
  });

  const [reportData, setReportData] = useState<ReportData | null>(null);
  const [showReport, setShowReport] = useState(false);

  // Generate report data
  const generateReport = () => {
    if (!filters.dateRange.start || !filters.dateRange.end) {
      return;
    }

    const filteredEmployees = filters.employeeIds.length > 0
      ? employees.filter(emp => filters.employeeIds.includes(emp.id))
      : employees;

    const filteredTimeEntries = timeEntries.filter(entry => {
      const entryDate = new Date(entry.date);
      return entryDate >= filters.dateRange.start! && entryDate <= filters.dateRange.end! &&
             filteredEmployees.some(emp => emp.id === entry.employeeId);
    });

    const filteredAttendanceRecords = attendanceRecords.filter(record => {
      const recordDate = new Date(record.date);
      return recordDate >= filters.dateRange.start! && recordDate <= filters.dateRange.end! &&
             filteredEmployees.some(emp => emp.id === record.employeeId);
    });

    // Calculate summary statistics
    const totalEmployees = filteredEmployees.length;
    const totalDays = filteredAttendanceRecords.length;
    const presentDays = filteredAttendanceRecords.filter(r => r.status === 'present').length;
    const absentDays = filteredAttendanceRecords.filter(r => r.status === 'absent').length;
    const lateDays = filteredAttendanceRecords.filter(r => r.status === 'late').length;
    const attendanceRate = totalDays > 0 ? (presentDays / totalDays) * 100 : 0;

    const totalHours = filteredTimeEntries.reduce((sum, entry) => sum + entry.totalHours, 0);
    const overtimeHours = filteredTimeEntries.reduce((sum, entry) => sum + entry.overtimeHours, 0);
    const workingDays = presentDays || 1;
    const avgHoursPerDay = totalHours / workingDays;

    // Calculate per-employee data
    const employeeData = filteredEmployees.map(employee => {
      const empTimeEntries = filteredTimeEntries.filter(entry => entry.employeeId === employee.id);
      const empAttendanceRecords = filteredAttendanceRecords.filter(record => record.employeeId === employee.id);

      const empPresentDays = empAttendanceRecords.filter(r => r.status === 'present').length;
      const empAbsentDays = empAttendanceRecords.filter(r => r.status === 'absent').length;
      const empLateDays = empAttendanceRecords.filter(r => r.status === 'late').length;
      const empHalfDays = empAttendanceRecords.filter(r => r.status === 'half-day').length;
      const empSickDays = empAttendanceRecords.filter(r => r.status === 'sick').length;
      const empVacationDays = empAttendanceRecords.filter(r => r.status === 'vacation').length;

      const empTotalDays = empAttendanceRecords.length;
      const empAttendanceRate = empTotalDays > 0 ? (empPresentDays / empTotalDays) * 100 : 0;

      const empTotalHours = empTimeEntries.reduce((sum, entry) => sum + entry.totalHours, 0);
      const empOvertimeHours = empTimeEntries.reduce((sum, entry) => sum + entry.overtimeHours, 0);
      const empWorkingDays = empPresentDays || 1;
      const empAvgHoursPerDay = empTotalHours / empWorkingDays;

      return {
        employeeId: employee.id,
        employeeName: `${employee.firstName} ${employee.lastName}`,
        department: employee.department,
        presentDays: empPresentDays,
        absentDays: empAbsentDays,
        lateDays: empLateDays,
        halfDays: empHalfDays,
        attendanceRate: empAttendanceRate,
        totalHours: empTotalHours,
        avgHoursPerDay: empAvgHoursPerDay,
        overtimeHours: empOvertimeHours,
        sickDays: empSickDays,
        vacationDays: empVacationDays,
      };
    });

    // Calculate daily attendance data
    const dailyData: Record<string, { present: number; absent: number; late: number }> = {};

    filteredAttendanceRecords.forEach(record => {
      if (!dailyData[record.date]) {
        dailyData[record.date] = { present: 0, absent: 0, late: 0 };
      }

      if (record.status === 'present') dailyData[record.date].present++;
      else if (record.status === 'absent') dailyData[record.date].absent++;
      else if (record.status === 'late') dailyData[record.date].late++;
    });

    const dailyDataArray = Object.entries(dailyData).map(([date, counts]) => ({
      date,
      totalPresent: counts.present,
      totalAbsent: counts.absent,
      totalLate: counts.late,
      attendanceRate: (counts.present / (counts.present + counts.absent + counts.late)) * 100 || 0,
    }));

    const data: ReportData = {
      summary: {
        totalEmployees,
        totalDays,
        presentDays,
        absentDays,
        lateDays,
        attendanceRate,
        totalHours,
        avgHoursPerDay,
        overtimeHours,
      },
      employeeData,
      dailyData: dailyDataArray,
    };

    setReportData(data);
    setShowReport(true);
    onGenerateReport?.(filters);
  };

  const handleExport = (format: 'pdf' | 'excel' | 'csv') => {
    if (reportData && onExport) {
      onExport(reportData, format);
    }
  };

  const formatHours = (hours: number): string => {
    const wholeHours = Math.floor(hours);
    const minutes = Math.round((hours - wholeHours) * 60);
    return `${wholeHours}:${minutes.toString().padStart(2, '0')}`;
  };

  const getAttendanceColor = (rate: number) => {
    if (rate >= 90) return 'success';
    if (rate >= 75) return 'warning';
    return 'error';
  };

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns}>
      <Box>
        {/* Report Configuration */}
        <Card sx={{ mb: 3 }}>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Generate Attendance Report
            </Typography>

            <Grid container spacing={3}>
              {/* Employee Selection */}
              <Grid size={{ xs: 12, md: 6 }}>
                <FormControl fullWidth>
                  <InputLabel>Employees</InputLabel>
                  <Select
                    multiple
                    value={filters.employeeIds}
                    onChange={(e) => setFilters(prev => ({
                      ...prev,
                      employeeIds: e.target.value as string[]
                    }))}
                    renderValue={(selected) => {
                      if (selected.length === 0) return 'All Employees';
                      if (selected.length === 1) {
                        const employee = employees.find(e => e.id === selected[0]);
                        return employee ? `${employee.firstName} ${employee.lastName}` : '';
                      }
                      return `${selected.length} employees selected`;
                    }}
                  >
                    <MenuItem value="">
                      <em>All Employees</em>
                    </MenuItem>
                    {employees.map(employee => (
                      <MenuItem key={employee.id} value={employee.id}>
                        {employee.firstName} {employee.lastName} - {employee.department}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>

              {/* Report Type */}
              <Grid size={{ xs: 12, md: 6 }}>
                <FormControl fullWidth>
                  <InputLabel>Report Type</InputLabel>
                  <Select
                    value={filters.reportType}
                    onChange={(e) => setFilters(prev => ({
                      ...prev,
                      reportType: e.target.value as ReportFilters['reportType']
                    }))}
                  >
                    <MenuItem value="summary">Summary Report</MenuItem>
                    <MenuItem value="detailed">Detailed Report</MenuItem>
                    <MenuItem value="comparison">Comparison Report</MenuItem>
                  </Select>
                </FormControl>
              </Grid>

              {/* Date Range */}
              <Grid size={{ xs: 12, md: 6 }}>
                <DatePicker
                  label="Start Date"
                  value={filters.dateRange.start}
                  onChange={(date) => setFilters(prev => ({
                    ...prev,
                    dateRange: { ...prev.dateRange, start: date }
                  }))}
                  slotProps={{
                    textField: { fullWidth: true },
                  }}
                />
              </Grid>

              <Grid size={{ xs: 12, md: 6 }}>
                <DatePicker
                  label="End Date"
                  value={filters.dateRange.end}
                  onChange={(date) => setFilters(prev => ({
                    ...prev,
                    dateRange: { ...prev.dateRange, end: date }
                  }))}
                  slotProps={{
                    textField: { fullWidth: true },
                  }}
                />
              </Grid>

              {/* Generate Button */}
              <Grid size={{ xs: 12 }}>
                <Button
                  variant="contained"
                  onClick={generateReport}
                  disabled={loading || !filters.dateRange.start || !filters.dateRange.end}
                  startIcon={<Assessment />}
                  size="large"
                >
                  Generate Report
                </Button>
              </Grid>
            </Grid>
          </CardContent>
        </Card>

        {/* Loading */}
        {loading && (
          <Card sx={{ mb: 3 }}>
            <CardContent>
              <Typography variant="body1" gutterBottom>
                Generating report...
              </Typography>
              <LinearProgress />
            </CardContent>
          </Card>
        )}

        {/* Report Display */}
        {reportData && showReport && (
          <Box>
            {/* Summary Cards */}
            <Grid container spacing={3} sx={{ mb: 3 }}>
              <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                <Card>
                  <CardContent sx={{ textAlign: 'center' }}>
                    <Person sx={{ fontSize: 40, color: 'primary.main', mb: 1 }} />
                    <Typography variant="h4" color="primary">
                      {reportData.summary.totalEmployees}
                    </Typography>
                    <Typography variant="body2" color="textSecondary">
                      Total Employees
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>

              <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                <Card>
                  <CardContent sx={{ textAlign: 'center' }}>
                    <CheckCircle sx={{ fontSize: 40, color: 'success.main', mb: 1 }} />
                    <Typography variant="h4" color="success.main">
                      {reportData.summary.attendanceRate.toFixed(1)}%
                    </Typography>
                    <Typography variant="body2" color="textSecondary">
                      Attendance Rate
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>

              <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                <Card>
                  <CardContent sx={{ textAlign: 'center' }}>
                    <Schedule sx={{ fontSize: 40, color: 'info.main', mb: 1 }} />
                    <Typography variant="h4" color="info.main">
                      {formatHours(reportData.summary.totalHours)}
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
                    <TrendingUp sx={{ fontSize: 40, color: 'warning.main', mb: 1 }} />
                    <Typography variant="h4" color="warning.main">
                      {formatHours(reportData.summary.overtimeHours)}
                    </Typography>
                    <Typography variant="body2" color="textSecondary">
                      Overtime Hours
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>

            {/* Export Actions */}
            <Box display="flex" justifyContent="flex-end" gap={1} sx={{ mb: 3 }}>
              <Button
                variant="outlined"
                startIcon={<FileDownload />}
                onClick={() => handleExport('csv')}
              >
                Export CSV
              </Button>
              <Button
                variant="outlined"
                startIcon={<FileDownload />}
                onClick={() => handleExport('excel')}
              >
                Export Excel
              </Button>
              <Button
                variant="outlined"
                startIcon={<FileDownload />}
                onClick={() => handleExport('pdf')}
              >
                Export PDF
              </Button>
            </Box>

            {/* Detailed Report */}
            <Accordion defaultExpanded>
              <AccordionSummary expandIcon={<ExpandMore />}>
                <Typography variant="h6">Employee Details</Typography>
              </AccordionSummary>
              <AccordionDetails>
                <TableContainer component={Paper}>
                  <Table>
                    <TableHead>
                      <TableRow>
                        <TableCell>Employee</TableCell>
                        <TableCell>Department</TableCell>
                        <TableCell align="center">Present</TableCell>
                        <TableCell align="center">Absent</TableCell>
                        <TableCell align="center">Late</TableCell>
                        <TableCell align="center">Attendance Rate</TableCell>
                        <TableCell align="center">Total Hours</TableCell>
                        <TableCell align="center">Overtime</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {reportData.employeeData.map((employee) => (
                        <TableRow key={employee.employeeId} hover>
                          <TableCell>
                            <Typography variant="body2" fontWeight="medium">
                              {employee.employeeName}
                            </Typography>
                          </TableCell>
                          <TableCell>{employee.department}</TableCell>
                          <TableCell align="center">
                            <Chip
                              label={employee.presentDays}
                              color="success"
                              size="small"
                              variant="outlined"
                            />
                          </TableCell>
                          <TableCell align="center">
                            <Chip
                              label={employee.absentDays}
                              color="error"
                              size="small"
                              variant="outlined"
                            />
                          </TableCell>
                          <TableCell align="center">
                            <Chip
                              label={employee.lateDays}
                              color="warning"
                              size="small"
                              variant="outlined"
                            />
                          </TableCell>
                          <TableCell align="center">
                            <Chip
                              label={`${employee.attendanceRate.toFixed(1)}%`}
                              color={getAttendanceColor(employee.attendanceRate)}
                              size="small"
                            />
                          </TableCell>
                          <TableCell align="center">
                            {formatHours(employee.totalHours)}
                          </TableCell>
                          <TableCell align="center">
                            {employee.overtimeHours > 0 ? formatHours(employee.overtimeHours) : '-'}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              </AccordionDetails>
            </Accordion>

            {/* Daily Summary */}
            <Accordion>
              <AccordionSummary expandIcon={<ExpandMore />}>
                <Typography variant="h6">Daily Summary</Typography>
              </AccordionSummary>
              <AccordionDetails>
                <TableContainer component={Paper}>
                  <Table>
                    <TableHead>
                      <TableRow>
                        <TableCell>Date</TableCell>
                        <TableCell align="center">Present</TableCell>
                        <TableCell align="center">Absent</TableCell>
                        <TableCell align="center">Late</TableCell>
                        <TableCell align="center">Attendance Rate</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {reportData.dailyData
                        .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
                        .map((day) => (
                        <TableRow key={day.date} hover>
                          <TableCell>
                            {new Date(day.date).toLocaleDateString('en-US', {
                              weekday: 'short',
                              month: 'short',
                              day: 'numeric',
                              year: 'numeric'
                            })}
                          </TableCell>
                          <TableCell align="center">{day.totalPresent}</TableCell>
                          <TableCell align="center">{day.totalAbsent}</TableCell>
                          <TableCell align="center">{day.totalLate}</TableCell>
                          <TableCell align="center">
                            <Chip
                              label={`${day.attendanceRate.toFixed(1)}%`}
                              color={getAttendanceColor(day.attendanceRate)}
                              size="small"
                            />
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              </AccordionDetails>
            </Accordion>
          </Box>
        )}
      </Box>
    </LocalizationProvider>
  );
};

export default AttendanceReport;