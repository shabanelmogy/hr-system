import React, { useState, useEffect } from 'react';
import {
  Box, Typography, Card, CardContent, Button, Grid, Chip, Dialog,
  DialogTitle, DialogContent, DialogActions, TextField, MenuItem,
  IconButton, Alert, Skeleton, Tabs, Tab
} from '@mui/material';
import {
  Download, Share, Schedule, Visibility, Delete,
  FilterList, Search
} from '@mui/icons-material';
import useApiHandler from '@/shared/hooks/useApiHandler';
import { analyticsService } from '../services/analyticsService';
import { CustomReport, AnalyticsFilters } from '../types';

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
      id={`report-tabpanel-${index}`}
      aria-labelledby={`report-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );
}

const ReportViewer: React.FC = () => {
  const [reports, setReports] = useState<CustomReport[]>([]);
  const [selectedReport, setSelectedReport] = useState<CustomReport | null>(null);
  const [reportData, setReportData] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [scheduleDialogOpen, setScheduleDialogOpen] = useState(false);
  const [tabValue, setTabValue] = useState(0);
  const [filters] = useState<AnalyticsFilters>({});
  const [searchTerm, setSearchTerm] = useState('');

  const { handleApiCall } = useApiHandler();

  useEffect(() => {
    loadReports();
  }, []);

  const loadReports = async () => {
    setLoading(true);
    try {
      const response = await handleApiCall(() => analyticsService.getReports());
      if (response?.success && response.data) {
        setReports(response.data.data);
      }
    } catch (error) {
      console.error('Failed to load reports:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleViewReport = async (report: CustomReport) => {
    setSelectedReport(report);
    setLoading(true);

    try {
      const response = await handleApiCall(() =>
        analyticsService.executeReport(report.id, filters)
      );

      if (response?.success && response.data) {
        setReportData(response.data);
        setViewDialogOpen(true);
      }
    } catch (error) {
      console.error('Failed to execute report:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadReport = async (report: CustomReport, format: string) => {
    try {
      const downloadUrl = await handleApiCall(() =>
        analyticsService.downloadExport(`${report.id}_${format}`)
      );

      if (downloadUrl) {
        // In a real app, this would trigger a download
        window.open(downloadUrl, '_blank');
      }
    } catch (error) {
      console.error('Failed to download report:', error);
    }
  };

  const handleDeleteReport = async (reportId: string) => {
    if (window.confirm('Are you sure you want to delete this report?')) {
      try {
        await handleApiCall(() => analyticsService.deleteReport(reportId));
        loadReports();
      } catch (error) {
        console.error('Failed to delete report:', error);
      }
    }
  };

  const filteredReports = reports.filter(report =>
    report.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    report.description?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'published': return 'success';
      case 'draft': return 'warning';
      case 'archived': return 'default';
      default: return 'primary';
    }
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        Report Viewer
      </Typography>

      <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
        <Tabs value={tabValue} onChange={(_, newValue) => setTabValue(newValue)}>
          <Tab label="All Reports" />
          <Tab label="My Reports" />
          <Tab label="Shared Reports" />
          <Tab label="Scheduled Reports" />
        </Tabs>
      </Box>

      <TabPanel value={tabValue} index={0}>
        {/* Search and Filters */}
        <Box sx={{ mb: 3, display: 'flex', gap: 2 }}>
          <TextField
            placeholder="Search reports..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            InputProps={{
              startAdornment: <Search sx={{ mr: 1, color: 'text.secondary' }} />
            }}
            sx={{ flex: 1 }}
          />
          <Button startIcon={<FilterList />} variant="outlined">
            Filters
          </Button>
        </Box>

        {/* Reports List */}
        {loading ? (
          <Grid container spacing={3}>
            {Array.from({ length: 6 }).map((_, index) => (
              <Grid size={{ xs: 12, md: 6, lg: 4 }} key={index}>
                <Skeleton variant="rectangular" height={200} />
              </Grid>
            ))}
          </Grid>
        ) : (
          <Grid container spacing={3}>
            {filteredReports.map((report) => (
              <Grid size={{ xs: 12, md: 6, lg: 4 }} key={report.id}>
                <Card>
                  <CardContent>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                      <Typography variant="h6" sx={{ flex: 1, mr: 1 }}>
                        {report.title}
                      </Typography>
                      <Chip
                        label={(report as any).status || 'draft'}
                        size="small"
                        color={getStatusColor((report as any).status || 'draft')}
                        variant="outlined"
                      />
                    </Box>

                    <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                      {report.description}
                    </Typography>

                    <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
                      <Chip label={report.dataSource} size="small" variant="outlined" />
                      <Chip label={`${report.columns.length} columns`} size="small" variant="outlined" />
                    </Box>

                    <Typography variant="caption" color="text.secondary">
                      Created: {new Date(report.createdAt).toLocaleDateString()}
                    </Typography>

                    <Box sx={{ display: 'flex', gap: 1, mt: 2 }}>
                      <Button
                        size="small"
                        startIcon={<Visibility />}
                        onClick={() => handleViewReport(report)}
                        variant="outlined"
                      >
                        View
                      </Button>
                      <Button
                        size="small"
                        startIcon={<Download />}
                        onClick={() => handleDownloadReport(report, 'pdf')}
                        variant="outlined"
                      >
                        Download
                      </Button>
                      <Button
                        size="small"
                        startIcon={<Share />}
                        variant="outlined"
                      >
                        Share
                      </Button>
                    </Box>

                    <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 1 }}>
                      <IconButton size="small" onClick={() => handleDeleteReport(report.id)} color="error">
                        <Delete fontSize="small" />
                      </IconButton>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        )}

        {filteredReports.length === 0 && !loading && (
          <Box sx={{ textAlign: 'center', py: 8 }}>
            <Typography variant="h6" color="text.secondary" gutterBottom>
              No reports found
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {searchTerm ? 'Try adjusting your search terms' : 'Create your first custom report'}
            </Typography>
          </Box>
        )}
      </TabPanel>

      <TabPanel value={tabValue} index={1}>
        <Alert severity="info">
          My Reports - Shows reports created by you
        </Alert>
      </TabPanel>

      <TabPanel value={tabValue} index={2}>
        <Alert severity="info">
          Shared Reports - Shows reports shared with you
        </Alert>
      </TabPanel>

      <TabPanel value={tabValue} index={3}>
        <Alert severity="info">
          Scheduled Reports - Shows reports with automated delivery
        </Alert>
      </TabPanel>

      {/* View Report Dialog */}
      <Dialog
        open={viewDialogOpen}
        onClose={() => setViewDialogOpen(false)}
        maxWidth="lg"
        fullWidth
      >
        <DialogTitle>
          {selectedReport?.title}
          <Box sx={{ display: 'flex', gap: 1, mt: 1 }}>
            <Button
              size="small"
              startIcon={<Download />}
              onClick={() => selectedReport && handleDownloadReport(selectedReport, 'pdf')}
            >
              PDF
            </Button>
            <Button
              size="small"
              startIcon={<Download />}
              onClick={() => selectedReport && handleDownloadReport(selectedReport, 'excel')}
            >
              Excel
            </Button>
            <Button
              size="small"
              startIcon={<Schedule />}
              onClick={() => setScheduleDialogOpen(true)}
            >
              Schedule
            </Button>
          </Box>
        </DialogTitle>
        <DialogContent>
          {reportData.length > 0 ? (
            <Box sx={{ maxHeight: 600, overflow: 'auto' }}>
              <pre style={{ fontSize: '12px' }}>
                {JSON.stringify(reportData, null, 2)}
              </pre>
            </Box>
          ) : (
            <Alert severity="info">No data available for this report</Alert>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setViewDialogOpen(false)}>Close</Button>
        </DialogActions>
      </Dialog>

      {/* Schedule Dialog */}
      <Dialog open={scheduleDialogOpen} onClose={() => setScheduleDialogOpen(false)}>
        <DialogTitle>Schedule Report</DialogTitle>
        <DialogContent>
          <TextField
            fullWidth
            label="Frequency"
            select
            sx={{ mt: 2 }}
          >
            <MenuItem value="daily">Daily</MenuItem>
            <MenuItem value="weekly">Weekly</MenuItem>
            <MenuItem value="monthly">Monthly</MenuItem>
          </TextField>
          <TextField
            fullWidth
            label="Recipients"
            placeholder="email@example.com"
            sx={{ mt: 2 }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setScheduleDialogOpen(false)}>Cancel</Button>
          <Button variant="contained">Schedule</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default ReportViewer;