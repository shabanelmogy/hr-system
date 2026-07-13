import React, { useState, useEffect } from 'react';
import {
  Box, Typography, Card, CardContent, Button, TextField, Select, MenuItem,
  FormControl, InputLabel, Grid, Chip, IconButton, Dialog, DialogTitle,
  DialogContent, DialogActions, Alert, List, ListItem, ListItemText,
  ListItemSecondaryAction
} from '@mui/material';
import { Delete, PlayArrow, Save, FilterList } from '@mui/icons-material';
import useApiHandler from '@/shared/hooks/useApiHandler';
import { analyticsService } from '../services/analyticsService';
import { CustomReport, ReportField, ReportFilter, AnalyticsFilters } from '../types';

const CustomReportBuilder: React.FC = () => {
  const [reports, setReports] = useState<CustomReport[]>([]);
  const [currentReport, setCurrentReport] = useState<Partial<CustomReport>>({
    title: '',
    description: '',
    dataSource: 'employees',
    columns: [],
    filters: [],
    groupBy: [],
    sortBy: { field: '', direction: 'asc' },
    limit: 100
  });
  const [availableFields, setAvailableFields] = useState<ReportField[]>([]);
  const [loading, setLoading] = useState(false);
  const [saveDialogOpen, setSaveDialogOpen] = useState(false);
  const [previewData, setPreviewData] = useState<any[]>([]);
  const [showPreview, setShowPreview] = useState(false);

  const { handleApiCall } = useApiHandler();

  useEffect(() => {
    loadReports();
    loadAvailableFields();
  }, []);

  const loadReports = async () => {
    try {
      const response = await handleApiCall(() => analyticsService.getReports());
      if (response?.success && response.data) {
        setReports(response.data.data);
      }
    } catch (error) {
      console.error('Failed to load reports:', error);
    }
  };

  const loadAvailableFields = () => {
    // Mock available fields - in real app, this would come from API
    const fields: ReportField[] = [
      { id: 'firstName', name: 'First Name', label: 'First Name', type: 'string', category: 'Personal' },
      { id: 'lastName', name: 'Last Name', label: 'Last Name', type: 'string', category: 'Personal' },
      { id: 'email', name: 'Email', label: 'Email', type: 'string', category: 'Contact' },
      { id: 'department', name: 'Department', label: 'Department', type: 'string', category: 'Employment' },
      { id: 'position', name: 'Position', label: 'Position', type: 'string', category: 'Employment' },
      { id: 'hireDate', name: 'Hire Date', label: 'Hire Date', type: 'date', category: 'Employment' },
      { id: 'salary', name: 'Salary', label: 'Salary', type: 'number', category: 'Compensation' },
      { id: 'performanceRating', name: 'Performance Rating', label: 'Performance Rating', type: 'number', category: 'Performance' },
      { id: 'attendanceRate', name: 'Attendance Rate', label: 'Attendance Rate', type: 'number', category: 'Attendance' }
    ];
    setAvailableFields(fields);
  };

  const addColumn = (field: ReportField) => {
    setCurrentReport(prev => ({
      ...prev,
      columns: [...(prev.columns || []), {
        field,
        aggregation: field.type === 'number' ? 'sum' : undefined,
        alias: field.label
      }]
    }));
  };

  const removeColumn = (index: number) => {
    setCurrentReport(prev => ({
      ...prev,
      columns: prev.columns?.filter((_, i) => i !== index) || []
    }));
  };

  const addFilter = () => {
    setCurrentReport(prev => ({
      ...prev,
      filters: [...(prev.filters || []), {
        field: availableFields[0],
        operator: 'equals',
        value: ''
      }]
    }));
  };

  const updateFilter = (index: number, updates: Partial<ReportFilter>) => {
    setCurrentReport(prev => ({
      ...prev,
      filters: prev.filters?.map((filter, i) =>
        i === index ? { ...filter, ...updates } : filter
      ) || []
    }));
  };

  const removeFilter = (index: number) => {
    setCurrentReport(prev => ({
      ...prev,
      filters: prev.filters?.filter((_, i) => i !== index) || []
    }));
  };

  const handleSave = async () => {
    if (!currentReport.title) return;

    setLoading(true);
    try {
      const reportData = {
        ...currentReport,
        createdBy: 'current-user', // In real app, get from auth context
        updatedAt: new Date().toISOString()
      } as Omit<CustomReport, 'id' | 'createdAt'>;

      await handleApiCall(() => analyticsService.createReport(reportData));
      setSaveDialogOpen(false);
      loadReports();
      // Reset form
      setCurrentReport({
        title: '',
        description: '',
        dataSource: 'employees',
        columns: [],
        filters: [],
        groupBy: [],
        sortBy: { field: '', direction: 'asc' },
        limit: 100
      });
    } catch (error) {
      console.error('Failed to save report:', error);
    } finally {
      setLoading(false);
    }
  };

  const handlePreview = async () => {
    setLoading(true);
    try {
      const filters: AnalyticsFilters = {};
      currentReport.filters?.forEach(filter => {
        if (filter.value) {
          (filters as any)[filter.field.id] = filter.value;
        }
      });

      const response = await handleApiCall(() =>
        analyticsService.executeReport('preview', filters)
      );

      if (response?.success && response.data) {
        setPreviewData(response.data);
        setShowPreview(true);
      }
    } catch (error) {
      console.error('Failed to preview report:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        Custom Report Builder
      </Typography>

      <Grid container spacing={3}>
        {/* Report Configuration */}
        <Grid size={{ xs: 12, md: 8 }}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Report Configuration
              </Typography>

              <Grid container spacing={2} sx={{ mb: 3 }}>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <TextField
                    fullWidth
                    label="Report Title"
                    value={currentReport.title || ''}
                    onChange={(e) => setCurrentReport(prev => ({ ...prev, title: e.target.value }))}
                  />
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <FormControl fullWidth>
                    <InputLabel>Data Source</InputLabel>
                    <Select
                      value={currentReport.dataSource || 'employees'}
                      onChange={(e) => setCurrentReport(prev => ({ ...prev, dataSource: e.target.value }))}
                    >
                      <MenuItem value="employees">Employees</MenuItem>
                      <MenuItem value="performance">Performance</MenuItem>
                      <MenuItem value="attendance">Attendance</MenuItem>
                      <MenuItem value="documents">Documents</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
                <Grid size={{ xs: 12 }}>
                  <TextField
                    fullWidth
                    multiline
                    rows={2}
                    label="Description"
                    value={currentReport.description || ''}
                    onChange={(e) => setCurrentReport(prev => ({ ...prev, description: e.target.value }))}
                  />
                </Grid>
              </Grid>

              {/* Columns Section */}
              <Typography variant="h6" gutterBottom>
                Columns
              </Typography>
              <Box sx={{ mb: 2 }}>
                {availableFields.map((field) => (
                  <Chip
                    key={field.id}
                    label={`${field.category}: ${field.label}`}
                    onClick={() => addColumn(field)}
                    sx={{ m: 0.5 }}
                    color="primary"
                    variant="outlined"
                  />
                ))}
              </Box>

              <Box sx={{ mb: 3 }}>
                {currentReport.columns?.map((column, index) => (
                  <Box key={index} sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                    <Chip
                      label={`${column.field.category}: ${column.alias}`}
                      onDelete={() => removeColumn(index)}
                      color="secondary"
                    />
                    {column.field.type === 'number' && (
                      <FormControl size="small" sx={{ minWidth: 100 }}>
                        <InputLabel>Aggregation</InputLabel>
                        <Select
                          value={column.aggregation || 'none'}
                          onChange={(e) => {
                            const newColumns = [...(currentReport.columns || [])];
                            newColumns[index].aggregation = e.target.value;
                            setCurrentReport(prev => ({ ...prev, columns: newColumns }));
                          }}
                        >
                          <MenuItem value="none">None</MenuItem>
                          <MenuItem value="sum">Sum</MenuItem>
                          <MenuItem value="avg">Average</MenuItem>
                          <MenuItem value="count">Count</MenuItem>
                          <MenuItem value="min">Min</MenuItem>
                          <MenuItem value="max">Max</MenuItem>
                        </Select>
                      </FormControl>
                    )}
                  </Box>
                ))}
              </Box>

              {/* Filters Section */}
              <Typography variant="h6" gutterBottom>
                Filters
              </Typography>
              <Button
                startIcon={<FilterList />}
                onClick={addFilter}
                variant="outlined"
                sx={{ mb: 2 }}
              >
                Add Filter
              </Button>

              {currentReport.filters?.map((filter, index) => (
                <Box key={index} sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                  <FormControl size="small" sx={{ minWidth: 150 }}>
                    <InputLabel>Field</InputLabel>
                    <Select
                      value={filter.field.id}
                      onChange={(e) => {
                        const field = availableFields.find(f => f.id === e.target.value);
                        if (field) updateFilter(index, { field });
                      }}
                    >
                      {availableFields.map((field) => (
                        <MenuItem key={field.id} value={field.id}>
                          {field.category}: {field.label}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>

                  <FormControl size="small" sx={{ minWidth: 120 }}>
                    <InputLabel>Operator</InputLabel>
                    <Select
                      value={filter.operator}
                      onChange={(e) => updateFilter(index, { operator: e.target.value as any })}
                    >
                      <MenuItem value="equals">Equals</MenuItem>
                      <MenuItem value="not_equals">Not Equals</MenuItem>
                      <MenuItem value="contains">Contains</MenuItem>
                      <MenuItem value="greater_than">Greater Than</MenuItem>
                      <MenuItem value="less_than">Less Than</MenuItem>
                    </Select>
                  </FormControl>

                  <TextField
                    size="small"
                    placeholder="Value"
                    value={filter.value || ''}
                    onChange={(e) => updateFilter(index, { value: e.target.value })}
                  />

                  <IconButton onClick={() => removeFilter(index)} color="error">
                    <Delete />
                  </IconButton>
                </Box>
              ))}

              {/* Action Buttons */}
              <Box sx={{ display: 'flex', gap: 2, mt: 3 }}>
                <Button
                  variant="contained"
                  startIcon={<PlayArrow />}
                  onClick={handlePreview}
                  disabled={loading || !currentReport.columns?.length}
                >
                  Preview
                </Button>
                <Button
                  variant="outlined"
                  startIcon={<Save />}
                  onClick={() => setSaveDialogOpen(true)}
                  disabled={loading || !currentReport.title}
                >
                  Save Report
                </Button>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Saved Reports */}
        <Grid size={{ xs: 12, md: 4 }}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Saved Reports
              </Typography>
              <List>
                {reports.map((report) => (
                  <ListItem key={report.id} divider>
                    <ListItemText
                      primary={report.title}
                      secondary={report.description}
                    />
                    <ListItemSecondaryAction>
                      <IconButton edge="end">
                        <PlayArrow />
                      </IconButton>
                    </ListItemSecondaryAction>
                  </ListItem>
                ))}
              </List>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Preview Dialog */}
      <Dialog
        open={showPreview}
        onClose={() => setShowPreview(false)}
        maxWidth="lg"
        fullWidth
      >
        <DialogTitle>Report Preview</DialogTitle>
        <DialogContent>
          {previewData.length > 0 ? (
            <Box sx={{ maxHeight: 400, overflow: 'auto' }}>
              <pre>{JSON.stringify(previewData.slice(0, 10), null, 2)}</pre>
              {previewData.length > 10 && (
                <Typography variant="body2" color="text.secondary">
                  ... and {previewData.length - 10} more records
                </Typography>
              )}
            </Box>
          ) : (
            <Alert severity="info">No data to preview</Alert>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowPreview(false)}>Close</Button>
        </DialogActions>
      </Dialog>

      {/* Save Dialog */}
      <Dialog open={saveDialogOpen} onClose={() => setSaveDialogOpen(false)}>
        <DialogTitle>Save Report</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to save this report?
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setSaveDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleSave} variant="contained" disabled={loading}>
            Save
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default CustomReportBuilder;