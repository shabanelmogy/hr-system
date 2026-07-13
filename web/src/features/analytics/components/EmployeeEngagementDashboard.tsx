import React, { useState, useEffect } from 'react';
import { Grid, Card, CardContent, Typography, Box, Alert, Skeleton } from '@mui/material';
import MetricCard from '@/shared/components/charts/MetricCard';
import LineChart from '@/shared/components/charts/LineChart';
import BarChart from '@/shared/components/charts/BarChart';
import PieChart from '@/shared/components/charts/PieChart';
import useApiHandler from '@/shared/hooks/useApiHandler';
import { analyticsService } from '../services/analyticsService';
import { EngagementAnalytics, AnalyticsFilters } from '../types';

const EmployeeEngagementDashboard: React.FC = () => {
  const [engagementData, setEngagementData] = useState<EngagementAnalytics | null>(null);
  const [filters] = useState<AnalyticsFilters>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const { handleApiCall } = useApiHandler();

  useEffect(() => {
    loadEngagementData();
  }, [filters]);

  const loadEngagementData = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await handleApiCall(() => analyticsService.getEngagementAnalytics(filters));

      if (response?.success && response.data) {
        setEngagementData(response.data);
      }
    } catch (err) {
      setError('Failed to load engagement analytics data');
      console.error('Engagement analytics load error:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Box sx={{ p: 3 }}>
        <Typography variant="h4" gutterBottom>
          Employee Engagement Dashboard
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

  if (!engagementData) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="info">
          No engagement data available
        </Alert>
      </Box>
    );
  }

  const sentimentData = [
    { name: 'Positive', value: engagementData.sentimentAnalysis.positive },
    { name: 'Neutral', value: engagementData.sentimentAnalysis.neutral },
    { name: 'Negative', value: engagementData.sentimentAnalysis.negative }
  ];

  const engagementTrendsData = engagementData.trends.engagement.map(trend => ({
    period: trend.period,
    value: trend.value
  }));

  const feedbackTrendsData = engagementData.trends.feedback.map(trend => ({
    period: trend.period,
    value: trend.value
  }));

  const communicationTrendsData = engagementData.trends.communication.map(trend => ({
    period: trend.period,
    value: trend.value
  }));

  const departmentEngagementData = engagementData.departments.map(dept => ({
    name: dept.department,
    value: dept.score
  }));

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        Employee Engagement Dashboard
      </Typography>

      {/* KPI Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <MetricCard
            title="Overall Engagement"
            value={`${engagementData.overallScore.toFixed(1)}%`}
            change={3.2}
            changeType="increase"
            format="percentage"
            icon="sentiment_satisfied"
            color="success"
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <MetricCard
            title="Participation Rate"
            value={`${engagementData.participationRate.toFixed(1)}%`}
            change={5.1}
            changeType="increase"
            format="percentage"
            icon="group"
            color="primary"
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <MetricCard
            title="Feedback Count"
            value={engagementData.feedbackCount.toString()}
            change={12}
            changeType="increase"
            format="number"
            icon="feedback"
            color="info"
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <MetricCard
            title="Survey Response Rate"
            value={`${engagementData.surveyResponseRate.toFixed(1)}%`}
            change={-2.3}
            changeType="decrease"
            format="percentage"
            icon="poll"
            color="warning"
          />
        </Grid>
      </Grid>

      {/* Charts */}
      <Grid container spacing={3}>
        <Grid size={{ xs: 12, md: 6 }}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Sentiment Analysis
              </Typography>
              <PieChart
                data={sentimentData}
                title="Sentiment Analysis"
                subtitle="Feedback sentiment distribution"
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
                Department Engagement
              </Typography>
              <BarChart
                data={departmentEngagementData}
                title="Department Engagement"
                subtitle="Engagement scores by department"
                xKey="name"
                yKey="value"
                height={300}
                showLegend={false}
                showTooltip={true}
              />
            </CardContent>
          </Card>
        </Grid>
        <Grid size={{ xs: 12, md: 4 }}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Engagement Trends
              </Typography>
              <LineChart
                data={engagementTrendsData}
                title="Engagement Trends"
                subtitle="Overall engagement over time"
                xKey="period"
                yKey="value"
                height={250}
                showLegend={false}
                showTooltip={true}
              />
            </CardContent>
          </Card>
        </Grid>
        <Grid size={{ xs: 12, md: 4 }}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Feedback Trends
              </Typography>
              <LineChart
                data={feedbackTrendsData}
                title="Feedback Trends"
                subtitle="Feedback volume over time"
                xKey="period"
                yKey="value"
                height={250}
                showLegend={false}
                showTooltip={true}
              />
            </CardContent>
          </Card>
        </Grid>
        <Grid size={{ xs: 12, md: 4 }}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Communication Trends
              </Typography>
              <LineChart
                data={communicationTrendsData}
                title="Communication Trends"
                subtitle="Communication activity over time"
                xKey="period"
                yKey="value"
                height={250}
                showLegend={false}
                showTooltip={true}
              />
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default EmployeeEngagementDashboard;