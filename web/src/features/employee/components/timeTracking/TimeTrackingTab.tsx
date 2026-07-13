import React, { useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Tabs,
  Tab,
  Button,
  Dialog,
} from '@mui/material';
import {
  AccessTime,
  List,
  CalendarToday,
  Assessment,
  Add,
} from '@mui/icons-material';
import { Employee } from '../../types/Employee';
import TimeClock from './TimeClock';
import TimeEntryForm from './TimeEntryForm';
import TimeEntryList from './TimeEntryList';
import AttendanceCalendar from './AttendanceCalendar';
import TimeTrackingDashboard from './TimeTrackingDashboard';

interface TimeTrackingTabProps {
  employee: Employee;
}

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

const TabPanel: React.FC<TabPanelProps> = ({ children, value, index }) => (
  <div role="tabpanel" hidden={value !== index}>
    {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
  </div>
);

const TimeTrackingTab: React.FC<TimeTrackingTabProps> = ({ employee }) => {
  const [activeTab, setActiveTab] = useState(0);
  const [timeEntryDialog, setTimeEntryDialog] = useState(false);

  // Mock data - in a real app, this would come from API calls
  const mockTimeEntries: any[] = [
    {
      id: '1',
      employeeId: employee.id,
      date: '2024-01-15',
      clockIn: '2024-01-15T09:00:00Z',
      clockOut: '2024-01-15T17:30:00Z',
      breaks: [],
      totalHours: 8,
      overtimeHours: 0.5,
      status: 'approved' as const,
      notes: 'Regular workday',
      createdAt: '2024-01-15T09:00:00Z',
      updatedAt: '2024-01-15T17:30:00Z',
    },
  ];

  const mockAttendanceRecords: any[] = [
    {
      id: '1',
      employeeId: employee.id,
      date: '2024-01-15',
      status: 'present' as const,
      checkInTime: '09:00',
      checkOutTime: '17:30',
      hoursWorked: 8,
      lateMinutes: 0,
      earlyDepartureMinutes: 0,
      notes: 'On time',
      approved: true,
      createdAt: '2024-01-15T09:00:00Z',
    },
  ];

  const handleAddTimeEntry = () => {
    setTimeEntryDialog(true);
  };

  return (
    <Box>
      {/* Header */}
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h5" fontWeight="bold">
          Time Tracking & Attendance
        </Typography>
        <Button
          variant="contained"
          startIcon={<Add />}
          onClick={handleAddTimeEntry}
          sx={{ borderRadius: 2 }}
        >
          Add Time Entry
        </Button>
      </Box>

      {/* Tabs */}
      <Card sx={{ mb: 3 }}>
        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tabs
            value={activeTab}
            onChange={(_, newValue) => setActiveTab(newValue)}
            variant="scrollable"
            scrollButtons="auto"
          >
            <Tab
              label="Time Clock"
              icon={<AccessTime />}
              iconPosition="start"
            />
            <Tab
              label="Time Entries"
              icon={<List />}
              iconPosition="start"
            />
            <Tab
              label="Attendance Calendar"
              icon={<CalendarToday />}
              iconPosition="start"
            />
            <Tab
              label="Dashboard"
              icon={<Assessment />}
              iconPosition="start"
            />
          </Tabs>
        </Box>

        {/* Tab Content */}
        <TabPanel value={activeTab} index={0}>
          <TimeClock
            employeeId={employee.id}
            onClockIn={(entry) => console.log('Clock in:', entry)}
            onClockOut={(entry) => console.log('Clock out:', entry)}
            onBreakStart={(breakEntry) => console.log('Break start:', breakEntry)}
            onBreakEnd={(breakEntry) => console.log('Break end:', breakEntry)}
          />
        </TabPanel>

        <TabPanel value={activeTab} index={1}>
          <TimeEntryList
            entries={mockTimeEntries}
            employeeId={employee.id}
            onEditEntry={(entry) => console.log('Edit:', entry)}
            onDeleteEntry={(entry) => console.log('Delete:', entry)}
            onApproveEntry={(entry) => console.log('Approve:', entry)}
            onExport={(entries, format) => console.log('Export:', entries, format)}
            canEdit={true}
            canApprove={true}
          />
        </TabPanel>

        <TabPanel value={activeTab} index={2}>
          <AttendanceCalendar
            records={mockAttendanceRecords}
            employeeId={employee.id}
            currentMonth={new Date()}
          />
        </TabPanel>

        <TabPanel value={activeTab} index={3}>
          <TimeTrackingDashboard
            timeEntries={mockTimeEntries}
            attendanceRecords={mockAttendanceRecords}
            employeeId={employee.id}
            period="week"
          />
        </TabPanel>
      </Card>

      {/* Time Entry Dialog */}
      <TimeEntryForm
        employeeId={employee.id}
        projects={[
          {
            id: 'proj1',
            name: 'Project Alpha',
            tasks: [
              { id: 'task1', name: 'Development' },
              { id: 'task2', name: 'Testing' },
            ],
          },
        ]}
        onSubmit={(entry) => {
          console.log('Time entry submit:', entry);
          setTimeEntryDialog(false);
        }}
        onCancel={() => setTimeEntryDialog(false)}
        open={timeEntryDialog}
      />
    </Box>
  );
};

export default TimeTrackingTab;