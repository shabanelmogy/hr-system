import React, { useState, useEffect } from 'react';
import {
  Box, Typography, Card, CardContent, Button, Grid, Chip, Dialog,
  DialogTitle, DialogContent, DialogActions, TextField, MenuItem,
  FormControl, InputLabel, Select, List, ListItem, ListItemText,
  ListItemSecondaryAction, IconButton, Alert, LinearProgress,
  Accordion, AccordionSummary, AccordionDetails, Checkbox, FormControlLabel
} from '@mui/material';
import {
  Download, Schedule, History, Settings, ExpandMore,
  PlayArrow
} from '@mui/icons-material';
import useApiHandler from '@/shared/hooks/useApiHandler';
import { analyticsService } from '../services/analyticsService';
import { ExportJob, ExportTemplate, AnalyticsFilters } from '../types';

const DataExportTools: React.FC = () => {
  const [templates, setTemplates] = useState<ExportTemplate[]>([]);
  const [jobs, setJobs] = useState<ExportJob[]>([]);
  const [newTemplate, setNewTemplate] = useState<Partial<ExportTemplate>>({
    name: '',
    description: '',
    format: 'csv',
    fields: [],
    includeHeaders: true,
    delimiter: ','
  });
  const [filters] = useState<AnalyticsFilters>({});
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [scheduleDialogOpen, setScheduleDialogOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const { handleApiCall } = useApiHandler();

  useEffect(() => {
    loadTemplates();
    loadJobs();
  }, []);

  const loadTemplates = async () => {
    try {
      const response = await handleApiCall(() => analyticsService.getExportTemplates());
      if (response?.success && response.data) {
        setTemplates(response.data);
      }
    } catch (error) {
      console.error('Failed to load templates:', error);
    }
  };

  const loadJobs = async () => {
    try {
      const response = await handleApiCall(() => analyticsService.getExportJobs());
      if (response?.success && response.data) {
        setJobs(response.data);
      }
    } catch (error) {
      console.error('Failed to load jobs:', error);
    }
  };

  const handleCreateTemplate = async () => {
    if (!newTemplate.name || newTemplate.fields?.length === 0) return;

    setLoading(true);
    try {
      const templateData = {
        ...newTemplate,
        createdBy: 'current-user' // In real app, get from auth context
      } as Omit<ExportTemplate, 'id' | 'createdAt'>;

      await handleApiCall(() => analyticsService.createExportTemplate(templateData));
      setCreateDialogOpen(false);
      setNewTemplate({
        name: '',
        description: '',
        format: 'csv',
        fields: [],
        includeHeaders: true,
        delimiter: ','
      });
      loadTemplates();
    } catch (error) {
      console.error('Failed to create template:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRunExport = async (template: ExportTemplate) => {
    setLoading(true);
    try {
      const response = await handleApiCall(() =>
        analyticsService.createExportJob({
          templateId: template.id,
          filters
        })
      );

      if (response?.success) {
        loadJobs();
        // In a real app, you might show a success message or redirect to job status
      }
    } catch (error) {
      console.error('Failed to run export:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadExport = async (jobId: string) => {
    try {
      const downloadUrl = await handleApiCall(() => analyticsService.downloadExport(jobId));

      if (downloadUrl) {
        // Trigger download
        const link = document.createElement('a');
        link.href = downloadUrl;
        link.download = `export_${jobId}.zip`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      }
    } catch (error) {
      console.error('Failed to download export:', error);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'success';
      case 'processing': return 'warning';
      case 'pending': return 'info';
      case 'failed': return 'error';
      default: return 'default';
    }
  };

  const availableFields = [
    'employeeId', 'firstName', 'lastName', 'email', 'department', 'position',
    'hireDate', 'salary', 'performanceRating', 'attendanceRate', 'documents'
  ];

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        Data Export Tools
      </Typography>

      <Grid container spacing={3}>
        {/* Export Templates */}
        <Grid size={{ xs: 12, md: 6 }}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="h6">
                  Export Templates
                </Typography>
                <Button
                  startIcon={<Settings />}
                  onClick={() => setCreateDialogOpen(true)}
                  variant="outlined"
                  size="small"
                >
                  Create Template
                </Button>
              </Box>

              <List>
                {templates.map((template) => (
                  <ListItem key={template.id} divider>
                    <ListItemText
                      primary={template.name}
                      secondary={
                        <Box sx={{ display: 'flex', gap: 1, mt: 1 }}>
                          <Chip label={template.format.toUpperCase()} size="small" />
                          <Chip label={`${template.fields.length} fields`} size="small" variant="outlined" />
                        </Box>
                      }
                    />
                    <ListItemSecondaryAction>
                      <Button
                        size="small"
                        startIcon={<PlayArrow />}
                        onClick={() => handleRunExport(template)}
                        disabled={loading}
                      >
                        Run
                      </Button>
                    </ListItemSecondaryAction>
                  </ListItem>
                ))}
              </List>

              {templates.length === 0 && (
                <Alert severity="info" sx={{ mt: 2 }}>
                  No export templates found. Create your first template to get started.
                </Alert>
              )}
            </CardContent>
          </Card>
        </Grid>

        {/* Export Jobs */}
        <Grid size={{ xs: 12, md: 6 }}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="h6">
                  Export Jobs
                </Typography>
                <Button
                  startIcon={<History />}
                  onClick={loadJobs}
                  variant="outlined"
                  size="small"
                >
                  Refresh
                </Button>
              </Box>

              <List>
                {jobs.slice(0, 5).map((job) => (
                  <ListItem key={job.id} divider>
                    <ListItemText
                      primary={`Job ${job.id.slice(-8)}`}
                      secondary={
                        <Box sx={{ mt: 1 }}>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                            <Chip
                              label={job.status}
                              size="small"
                              color={getStatusColor(job.status)}
                            />
                            <Typography variant="caption" color="text.secondary">
                              {new Date(job.createdAt).toLocaleString()}
                            </Typography>
                          </Box>
                          {job.status === 'processing' && (
                            <LinearProgress variant="determinate" value={job.progress} sx={{ mt: 1 }} />
                          )}
                          {job.recordCount && (
                            <Typography variant="caption" color="text.secondary">
                              {job.recordCount} records
                            </Typography>
                          )}
                        </Box>
                      }
                    />
                    <ListItemSecondaryAction>
                      {job.status === 'completed' && (
                        <IconButton
                          onClick={() => handleDownloadExport(job.id)}
                          color="primary"
                        >
                          <Download />
                        </IconButton>
                      )}
                    </ListItemSecondaryAction>
                  </ListItem>
                ))}
              </List>

              {jobs.length === 0 && (
                <Alert severity="info" sx={{ mt: 2 }}>
                  No export jobs found. Run an export to see jobs here.
                </Alert>
              )}
            </CardContent>
          </Card>
        </Grid>

        {/* Quick Export */}
        <Grid size={{ xs: 12 }}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Quick Export
              </Typography>

              <Grid container spacing={2}>
                <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                  <Button
                    fullWidth
                    variant="contained"
                    startIcon={<Download />}
                    onClick={() => handleRunExport({
                      id: 'quick-employees',
                      name: 'All Employees',
                      format: 'csv',
                      fields: ['employeeId', 'firstName', 'lastName', 'email', 'department'],
                      includeHeaders: true
                    } as ExportTemplate)}
                    disabled={loading}
                  >
                    Export Employees
                  </Button>
                </Grid>
                <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                  <Button
                    fullWidth
                    variant="contained"
                    startIcon={<Download />}
                    onClick={() => handleRunExport({
                      id: 'quick-performance',
                      name: 'Performance Data',
                      format: 'excel',
                      fields: ['employeeId', 'performanceRating', 'goalsAchieved'],
                      includeHeaders: true
                    } as ExportTemplate)}
                    disabled={loading}
                  >
                    Export Performance
                  </Button>
                </Grid>
                <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                  <Button
                    fullWidth
                    variant="contained"
                    startIcon={<Download />}
                    onClick={() => handleRunExport({
                      id: 'quick-attendance',
                      name: 'Attendance Data',
                      format: 'csv',
                      fields: ['employeeId', 'attendanceRate', 'totalHours'],
                      includeHeaders: true
                    } as ExportTemplate)}
                    disabled={loading}
                  >
                    Export Attendance
                  </Button>
                </Grid>
                <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                  <Button
                    fullWidth
                    variant="outlined"
                    startIcon={<Schedule />}
                    onClick={() => setScheduleDialogOpen(true)}
                  >
                    Schedule Export
                  </Button>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>

        {/* Advanced Options */}
        <Grid size={{ xs: 12 }}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Advanced Export Options
              </Typography>

              <Accordion>
                <AccordionSummary expandIcon={<ExpandMore />}>
                  <Typography>Data Masking</Typography>
                </AccordionSummary>
                <AccordionDetails>
                  <FormControlLabel
                    control={<Checkbox />}
                    label="Remove personally identifiable information (PII)"
                  />
                  <FormControlLabel
                    control={<Checkbox />}
                    label="Mask sensitive data fields"
                  />
                  <FormControlLabel
                    control={<Checkbox />}
                    label="Include data retention metadata"
                  />
                </AccordionDetails>
              </Accordion>

              <Accordion>
                <AccordionSummary expandIcon={<ExpandMore />}>
                  <Typography>Export Settings</Typography>
                </AccordionSummary>
                <AccordionDetails>
                  <Grid container spacing={2}>
                    <Grid size={{ xs: 12, sm: 6 }}>
                      <FormControl fullWidth>
                        <InputLabel>Compression</InputLabel>
                        <Select defaultValue="zip">
                          <MenuItem value="zip">ZIP Archive</MenuItem>
                          <MenuItem value="gzip">GZIP</MenuItem>
                          <MenuItem value="none">No Compression</MenuItem>
                        </Select>
                      </FormControl>
                    </Grid>
                    <Grid size={{ xs: 12, sm: 6 }}>
                      <FormControl fullWidth>
                        <InputLabel>Encryption</InputLabel>
                        <Select defaultValue="none">
                          <MenuItem value="none">No Encryption</MenuItem>
                          <MenuItem value="aes256">AES-256</MenuItem>
                        </Select>
                      </FormControl>
                    </Grid>
                  </Grid>
                </AccordionDetails>
              </Accordion>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Create Template Dialog */}
      <Dialog open={createDialogOpen} onClose={() => setCreateDialogOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>Create Export Template</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                fullWidth
                label="Template Name"
                value={newTemplate.name || ''}
                onChange={(e) => setNewTemplate(prev => ({ ...prev, name: e.target.value }))}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <FormControl fullWidth>
                <InputLabel>Format</InputLabel>
                <Select
                  value={newTemplate.format || 'csv'}
                  onChange={(e) => setNewTemplate(prev => ({ ...prev, format: e.target.value }))}
                >
                  <MenuItem value="csv">CSV</MenuItem>
                  <MenuItem value="excel">Excel</MenuItem>
                  <MenuItem value="json">JSON</MenuItem>
                  <MenuItem value="xml">XML</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid size={{ xs: 12 }}>
              <TextField
                fullWidth
                multiline
                rows={2}
                label="Description"
                value={newTemplate.description || ''}
                onChange={(e) => setNewTemplate(prev => ({ ...prev, description: e.target.value }))}
              />
            </Grid>
            <Grid size={{ xs: 12 }}>
              <Typography variant="subtitle2" gutterBottom>
                Select Fields to Export
              </Typography>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                {availableFields.map((field) => (
                  <FormControlLabel
                    key={field}
                    control={
                      <Checkbox
                        checked={newTemplate.fields?.includes(field) || false}
                        onChange={(e) => {
                          const fields = newTemplate.fields || [];
                          if (e.target.checked) {
                            setNewTemplate(prev => ({ ...prev, fields: [...fields, field] }));
                          } else {
                            setNewTemplate(prev => ({ ...prev, fields: fields.filter(f => f !== field) }));
                          }
                        }}
                      />
                    }
                    label={field}
                  />
                ))}
              </Box>
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setCreateDialogOpen(false)}>Cancel</Button>
          <Button
            onClick={handleCreateTemplate}
            variant="contained"
            disabled={loading || !newTemplate.name || !newTemplate.fields?.length}
          >
            Create Template
          </Button>
        </DialogActions>
      </Dialog>

      {/* Schedule Dialog */}
      <Dialog open={scheduleDialogOpen} onClose={() => setScheduleDialogOpen(false)}>
        <DialogTitle>Schedule Export</DialogTitle>
        <DialogContent>
          <TextField
            fullWidth
            label="Frequency"
            select
            defaultValue="weekly"
            sx={{ mt: 2 }}
          >
            <MenuItem value="daily">Daily</MenuItem>
            <MenuItem value="weekly">Weekly</MenuItem>
            <MenuItem value="monthly">Monthly</MenuItem>
          </TextField>
          <TextField
            fullWidth
            label="Recipients"
            placeholder="email@example.com, email2@example.com"
            sx={{ mt: 2 }}
          />
          <FormControl fullWidth sx={{ mt: 2 }}>
            <InputLabel>Template</InputLabel>
            <Select>
              {templates.map((template) => (
                <MenuItem key={template.id} value={template.id}>
                  {template.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setScheduleDialogOpen(false)}>Cancel</Button>
          <Button variant="contained">Schedule</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default DataExportTools;