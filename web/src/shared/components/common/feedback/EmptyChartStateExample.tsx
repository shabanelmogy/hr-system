import React from 'react';
import {
  Box,
  Container,
  Typography,
  Divider,
  Grid,
  Card,
  CardContent
} from '@mui/material';
import {
  BarChart,
  PieChart,
  TrendingUp,
  Assessment,
  Analytics,
  ShowChart
} from '@mui/icons-material';
import EmptyChartState from './EmptyChartState';

/**
 * Example component demonstrating usage of EmptyChartState component
 * 
 * EmptyChartState Usage Examples:
 * 1. Basic chart empty state
 * 2. Custom icons and actions
 * 3. Different chart types
 * 4. With and without actions
 */
const EmptyChartStateExample: React.FC = () => {
  const handleAddData = () => {
    console.log('Add data clicked');
  };

  const handleImportData = () => {
    console.log('Import data clicked');
  };

  const handleRefresh = () => {
    console.log('Refresh clicked');
  };

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Typography variant="h4" gutterBottom>
        EmptyChartState Component Examples
      </Typography>
      
      <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
        Reusable EmptyChartState component for consistent chart empty states across the application.
      </Typography>

      <Divider sx={{ mb: 4 }} />

      <Grid container spacing={3}>
        {/* Basic Chart Empty State */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Basic Chart Empty State
              </Typography>
              <EmptyChartState
                title="Sales Analytics"
                message="No Sales Data Available"
                subtitle="Start by adding your first sale to see analytics"
                actionText="Add Sale"
                onAction={handleAddData}
                height={300}
              />
            </CardContent>
          </Card>
        </Grid>

        {/* Custom Icons */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Custom Icons
              </Typography>
              <EmptyChartState
                title="Performance Dashboard"
                message="No Performance Data"
                subtitle="Import data or add entries to view performance metrics"
                chartIcon={Assessment}
                emptyIcon={Analytics}
                actionText="Import Data"
                onAction={handleImportData}
                secondaryActionText="Add Entry"
                onSecondaryAction={handleAddData}
                height={300}
              />
            </CardContent>
          </Card>
        </Grid>

        {/* Bar Chart Style */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Bar Chart Style
              </Typography>
              <EmptyChartState
                title="Revenue by Region"
                message="No Revenue Data"
                subtitle="Add revenue data to see regional breakdown"
                chartIcon={BarChart}
                emptyIcon={BarChart}
                actionText="Add Revenue"
                onAction={handleAddData}
                showRefresh={true}
                onRefresh={handleRefresh}
                height={300}
              />
            </CardContent>
          </Card>
        </Grid>

        {/* Pie Chart Style */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Pie Chart Style
              </Typography>
              <EmptyChartState
                title="Market Share"
                message="No Market Data"
                subtitle="Analyze market distribution by adding data points"
                chartIcon={PieChart}
                emptyIcon={PieChart}
                actionText="Add Data"
                onAction={handleAddData}
                height={300}
                gradient={true}
              />
            </CardContent>
          </Card>
        </Grid>

        {/* Without Actions */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Without Actions
              </Typography>
              <EmptyChartState
                title="Trend Analysis"
                message="No Trend Data Available"
                subtitle="Data will appear here when available"
                chartIcon={ShowChart}
                emptyIcon={TrendingUp}
                height={300}
              />
            </CardContent>
          </Card>
        </Grid>

        {/* Full Featured */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Full Featured
              </Typography>
              <EmptyChartState
                title="Comprehensive Analytics"
                message="No Analytics Data"
                subtitle="Get started by adding data or importing from external sources"
                chartIcon={Assessment}
                emptyIcon={Analytics}
                actionText="Add Data"
                onAction={handleAddData}
                secondaryActionText="Import"
                onSecondaryAction={handleImportData}
                showRefresh={true}
                onRefresh={handleRefresh}
                height={300}
                gradient={true}
                elevation={3}
              />
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Box sx={{ mt: 4, p: 3, bgcolor: 'grey.50', borderRadius: 2 }}>
        <Typography variant="h6" gutterBottom>
          Usage Tips:
        </Typography>
        <Typography variant="body2" component="div">
          <ul>
            <li><strong>Chart Integration:</strong> Uses ChartContainer for consistent styling with other charts</li>
            <li><strong>Contextual Icons:</strong> Use chart-specific icons (BarChart, PieChart, etc.) for better UX</li>
            <li><strong>Actions:</strong> Provide clear next steps (add data, import, refresh)</li>
            <li><strong>Height:</strong> Match the height of your actual charts for consistent layout</li>
            <li><strong>Gradient:</strong> Use gradient backgrounds for premium feel</li>
            <li><strong>Elevation:</strong> Adjust paper elevation to match your design system</li>
          </ul>
        </Typography>
      </Box>
    </Container>
  );
};

export default EmptyChartStateExample;