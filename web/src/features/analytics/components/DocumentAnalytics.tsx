import React, { useState, useEffect } from 'react';
import { Grid, Card, CardContent, Typography, Box, Alert, Skeleton, LinearProgress } from '@mui/material';
import MetricCard from '@/shared/components/charts/MetricCard';
import BarChart from '@/shared/components/charts/BarChart';
import LineChart from '@/shared/components/charts/LineChart';
import PieChart from '@/shared/components/charts/PieChart';
import useApiHandler from '@/shared/hooks/useApiHandler';
import { analyticsService } from '../services/analyticsService';
import { DocumentAnalytics as DocumentAnalyticsType, AnalyticsFilters } from '../types';

const DocumentAnalytics: React.FC = () => {
  const [documentData, setDocumentData] = useState<DocumentAnalyticsType | null>(null);
  const [filters] = useState<AnalyticsFilters>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const { handleApiCall } = useApiHandler();

  useEffect(() => {
    loadDocumentData();
  }, [filters]);

  const loadDocumentData = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await handleApiCall(() => analyticsService.getDocumentAnalytics(filters));

      if (response?.success && response.data) {
        setDocumentData(response.data);
      }
    } catch (err) {
      setError('Failed to load document analytics data');
      console.error('Document analytics load error:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Box sx={{ p: 3 }}>
        <Typography variant="h4" gutterBottom>
          Document Analytics
        </Typography>
        <Grid container spacing={3}>
          {Array.from({ length: 6 }).map((_, index) => (
            <Grid size={{ xs: 12, sm: 6, md: 4 }} key={index}>
              <Skeleton variant="rectangular" height={120} />
            </Grid>
          ))}
        </Grid>
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      </Box>
    );
  }

  if (!documentData) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="info">
          No document data available
        </Alert>
      </Box>
    );
  }

  const documentTypeData = documentData.documentsByType.map(type => ({
    name: type.type,
    value: type.count
  }));

  const uploadTrendsData = documentData.uploadTrends.map(trend => ({
    period: trend.period,
    value: trend.value
  }));

  const accessByDepartmentData = documentData.accessPatterns.accessByDepartment.map(dept => ({
    name: dept.department,
    value: dept.count
  }));

  const storageUsedPercentage = (documentData.storageUsed / (100 * 1024 * 1024)) * 100; // Assuming 100MB limit

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        Document Analytics
      </Typography>

      {/* KPI Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <MetricCard
            title="Total Documents"
            value={documentData.totalDocuments.toString()}
            change={8.5}
            changeType="increase"
            format="number"
            icon="description"
            color="primary"
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <MetricCard
            title="Expiring Soon"
            value={documentData.expiringSoon.toString()}
            change={-15}
            changeType="decrease"
            format="number"
            icon="schedule"
            color="warning"
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <MetricCard
            title="Expired Documents"
            value={documentData.expiredDocuments.toString()}
            change={0}
            changeType="neutral"
            format="number"
            icon="error"
            color="error"
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <MetricCard
            title="Avg File Size"
            value={`${(documentData.averageFileSize / 1024 / 1024).toFixed(1)} MB`}
            change={2.1}
            changeType="increase"
            format="text"
            icon="storage"
            color="info"
          />
        </Grid>
      </Grid>

      {/* Storage Usage */}
      <Card sx={{ mb: 4 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Storage Usage
          </Typography>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 1 }}>
            <Typography variant="body2">
              {(documentData.storageUsed / 1024 / 1024).toFixed(1)} MB used
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {storageUsedPercentage.toFixed(1)}% of capacity
            </Typography>
          </Box>
          <LinearProgress
            variant="determinate"
            value={Math.min(storageUsedPercentage, 100)}
            color={storageUsedPercentage > 90 ? "error" : storageUsedPercentage > 70 ? "warning" : "primary"}
            sx={{ height: 8, borderRadius: 4 }}
          />
        </CardContent>
      </Card>

      {/* Charts */}
      <Grid container spacing={3}>
        <Grid size={{ xs: 12, md: 6 }}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Documents by Type
              </Typography>
              <PieChart
                data={documentTypeData}
                title="Document Types"
                subtitle="Distribution of document types"
                nameKey="name"
                valueKey="value"
                height={300}
                showLegend={true}
                showTooltip={true}
              />
            </CardContent>
          </Card>
        </Grid>
        <Grid size={{ xs: 12, md: 6 }}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Upload Trends
              </Typography>
              <LineChart
                data={uploadTrendsData}
                title="Upload Trends"
                subtitle="Document uploads over time"
                xKey="period"
                yKey="value"
                height={300}
                showLegend={false}
                showTooltip={true}
              />
            </CardContent>
          </Card>
        </Grid>
        <Grid size={{ xs: 12 }}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Access by Department
              </Typography>
              <BarChart
                data={accessByDepartmentData}
                title="Department Access"
                subtitle="Document access patterns by department"
                xKey="name"
                yKey="value"
                height={300}
                showLegend={false}
                showTooltip={true}
              />
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Top Performers */}
      <Grid container spacing={3} sx={{ mt: 2 }}>
        <Grid size={{ xs: 12, md: 6 }}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Most Accessed Documents
              </Typography>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                {documentData.accessPatterns.mostAccessed.slice(0, 5).map((doc, index) => (
                  <Box key={index} sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Typography variant="body2">{doc}</Typography>
                    <Typography variant="caption" color="text.secondary">
                      High activity
                    </Typography>
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
                Least Accessed Documents
              </Typography>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                {documentData.accessPatterns.leastAccessed.slice(0, 5).map((doc, index) => (
                  <Box key={index} sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Typography variant="body2">{doc}</Typography>
                    <Typography variant="caption" color="text.secondary">
                      Low activity
                    </Typography>
                  </Box>
                ))}
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default DocumentAnalytics;