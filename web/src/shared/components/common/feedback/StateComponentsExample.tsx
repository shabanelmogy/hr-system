import React, { useState } from 'react';
import {
  Box,
  Container,
  Typography,
  Divider,
  Grid,
  Card,
  CardContent,
  Button
} from '@mui/material';
import {
  People,
  Assignment,
  Folder,
  LocationOn,
  Business
} from '@mui/icons-material';
import EmptyState from './EmptyState';
import NoResultsState from './NoResultsState';

/**
 * Example component demonstrating usage of EmptyState and NoResultsState components
 * 
 * EmptyState Usage Examples:
 * 1. Basic empty state with default icon
 * 2. Custom icon and actions
 * 3. Without paper container
 * 4. With refresh functionality
 * 
 * NoResultsState Usage Examples:
 * 1. Search results empty
 * 2. Filter results empty
 * 3. Custom message and actions
 * 4. Multiple action buttons
 */
const StateComponentsExample: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('nonexistent item');

  const handleAddEmployee = () => {
    console.log('Add employee clicked');
  };

  const handleClearSearch = () => {
    setSearchTerm('');
    console.log('Search cleared');
  };

  const handleClearFilters = () => {
    console.log('Filters cleared');
  };

  const handleRefresh = () => {
    console.log('Data refreshed');
  };

  const handleImportData = () => {
    console.log('Import data clicked');
  };

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Typography variant="h4" gutterBottom>
        State Components Examples
      </Typography>
      
      <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
        Reusable EmptyState and NoResultsState components for consistent UX across the application.
      </Typography>

      <Divider sx={{ mb: 4 }} />

      {/* EmptyState Examples */}
      <Typography variant="h5" gutterBottom>
        EmptyState Component Examples
      </Typography>

      <Grid container spacing={3} sx={{ mb: 6 }}>
        {/* Basic Empty State */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Basic Empty State
              </Typography>
              <EmptyState
                title="No Employees Found"
                subtitle="Get started by adding your first employee to the system."
                actionText="Add Employee"
                onAction={handleAddEmployee}
              />
            </CardContent>
          </Card>
        </Grid>

        {/* Custom Icon Empty State */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Custom Icon & Actions
              </Typography>
              <EmptyState
                icon={Assignment}
                title="No Projects Available"
                subtitle="Create your first project or import existing data."
                actionText="New Project"
                onAction={() => console.log('New project')}
                secondaryActionText="Import Data"
                onSecondaryAction={handleImportData}
                iconSize="medium"
              />
            </CardContent>
          </Card>
        </Grid>

        {/* Without Paper Container */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Without Paper Container
              </Typography>
              <EmptyState
                icon={Folder}
                title="Empty Folder"
                subtitle="This folder contains no files."
                withPaper={false}
                iconSize="small"
                sx={{ py: 3 }}
              />
            </CardContent>
          </Card>
        </Grid>

        {/* With Refresh */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                With Refresh Option
              </Typography>
              <EmptyState
                icon={Business}
                title="No Data Available"
                subtitle="Unable to load data. Try refreshing or check your connection."
                showRefresh={true}
                onRefresh={handleRefresh}
                actionText="Retry"
                onAction={handleRefresh}
              />
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Divider sx={{ mb: 4 }} />

      {/* NoResultsState Examples */}
      <Typography variant="h5" gutterBottom>
        NoResultsState Component Examples
      </Typography>

      <Grid container spacing={3}>
        {/* Search No Results */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Search No Results
              </Typography>
              <NoResultsState
                searchTerm={searchTerm}
                onClearSearch={handleClearSearch}
                onRefresh={handleRefresh}
              />
            </CardContent>
          </Card>
        </Grid>

        {/* Filter No Results */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Filter No Results
              </Typography>
              <NoResultsState
                message="No states match your filters"
                subtitle="Try removing some filters or adjusting your criteria."
                onClearFilters={handleClearFilters}
                onRefresh={handleRefresh}
              />
            </CardContent>
          </Card>
        </Grid>

        {/* Custom Message & Actions */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Custom Message & Actions
              </Typography>
              <NoResultsState
                icon={LocationOn}
                message="No locations in this region"
                subtitle="This region doesn't have any registered locations yet."
                customAction={{
                  text: "Add Location",
                  handler: () => console.log('Add location'),
                  variant: "contained"
                }}
                onRefresh={handleRefresh}
                iconSize="medium"
              />
            </CardContent>
          </Card>
        </Grid>

        {/* Multiple Actions */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Multiple Actions
              </Typography>
              <NoResultsState
                icon={People}
                message="No team members found"
                subtitle="No team members match your current search and filter criteria."
                searchTerm="john doe"
                onClearSearch={handleClearSearch}
                onClearFilters={handleClearFilters}
                onRefresh={handleRefresh}
                customAction={{
                  text: "Invite Member",
                  handler: () => console.log('Invite member'),
                  variant: "outlined"
                }}
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
            <li><strong>EmptyState:</strong> Use when there's no data at all (empty lists, new features, etc.)</li>
            <li><strong>NoResultsState:</strong> Use when data exists but current filters/search return no results</li>
            <li><strong>Icons:</strong> Choose contextually appropriate icons from Material-UI icons</li>
            <li><strong>Actions:</strong> Provide clear next steps for users (add, import, clear filters, etc.)</li>
            <li><strong>Paper:</strong> Use withPaper={false} when the component is already inside a container</li>
          </ul>
        </Typography>
      </Box>
    </Container>
  );
};

export default StateComponentsExample;