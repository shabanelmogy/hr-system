import React, { useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  Grid,
  useTheme,
  alpha
} from '@mui/material';
import {
  Feedback,
  Add
} from '@mui/icons-material';

interface FeedbackCollectionProps {
  userId: string;
}

const FeedbackCollection: React.FC<FeedbackCollectionProps> = ({ userId }) => {
  const theme = useTheme();

  return (
    <Box sx={{
      height: '100vh',
      display: 'flex',
      flexDirection: 'column',
      bgcolor: alpha(theme.palette.background.default, 0.5)
    }}>
      {/* Header */}
      <Box sx={{
        p: 3,
        pb: 2,
        bgcolor: `linear-gradient(135deg, ${alpha(theme.palette.background.paper, 0.95)} 0%, ${alpha(theme.palette.background.default, 0.95)} 100%)`,
        backdropFilter: 'blur(10px)',
        borderBottom: `1px solid ${alpha(theme.palette.divider, 0.1)}`
      }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 1 }}>
              <Feedback sx={{ fontSize: 32, color: theme.palette.info.main }} />
              <Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Box
                    sx={{
                      width: 8,
                      height: 8,
                      borderRadius: '50%',
                      bgcolor: theme.palette.info.main,
                      animation: 'pulse 2s infinite'
                    }}
                  />
                  <Typography variant="h4" sx={{ fontWeight: 800 }}>
                    Feedback Collection
                  </Typography>
                </Box>
                <Typography variant="body1" color="text.secondary">
                  Collect and manage employee feedback
                </Typography>
              </Box>
            </Box>
          </Box>

          <Button
            variant="contained"
            startIcon={<Add />}
            sx={{
              px: 3,
              py: 1.5,
              borderRadius: 3,
              fontWeight: 600,
              bgcolor: `linear-gradient(135deg, ${theme.palette.info.main}, ${alpha(theme.palette.info.main, 0.8)})`,
              boxShadow: `0 4px 16px ${alpha(theme.palette.info.main, 0.3)}`,
              '&:hover': {
                bgcolor: `linear-gradient(135deg, ${theme.palette.info.dark}, ${alpha(theme.palette.info.dark, 0.8)})`,
                boxShadow: `0 6px 20px ${alpha(theme.palette.info.main, 0.4)}`,
                transform: 'translateY(-2px)'
              },
              transition: 'all 0.3s ease-in-out'
            }}
          >
            Submit Feedback
          </Button>
        </Box>
      </Box>

      {/* Main Content */}
      <Box sx={{ flex: 1, p: 3, overflow: 'hidden' }}>
        <Grid container spacing={3} sx={{ height: '100%' }}>
          <Grid size={{ xs: 12 }}>
            <Card sx={{
              height: '100%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              borderRadius: 3,
              boxShadow: `0 4px 20px ${alpha(theme.palette.primary.main, 0.1)}`
            }}>
              <CardContent sx={{ textAlign: 'center', py: 8 }}>
                <Feedback sx={{ fontSize: 64, color: theme.palette.text.disabled, mb: 2 }} />
                <Typography variant="h6" color="text.secondary" sx={{ mb: 1 }}>
                  Feedback Collection System
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Components for collecting and managing employee feedback will be implemented here
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Box>
    </Box>
  );
};

export default FeedbackCollection;