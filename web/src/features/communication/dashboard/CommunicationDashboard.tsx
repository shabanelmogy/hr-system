import React from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Grid,
  useTheme,
  alpha
} from '@mui/material';
import {
  Dashboard,
  Message,
  Campaign,
  Feedback,
  Notifications,
  Assessment
} from '@mui/icons-material';

interface CommunicationDashboardProps {
  userId: string;
}

const CommunicationDashboard: React.FC<CommunicationDashboardProps> = ({ userId }) => {
  const theme = useTheme();

  const stats = [
    {
      title: 'Total Messages',
      value: '1,234',
      icon: <Message sx={{ fontSize: 32, color: theme.palette.primary.main }} />,
      color: theme.palette.primary.main
    },
    {
      title: 'Active Announcements',
      value: '12',
      icon: <Campaign sx={{ fontSize: 32, color: theme.palette.secondary.main }} />,
      color: theme.palette.secondary.main
    },
    {
      title: 'Pending Feedback',
      value: '8',
      icon: <Feedback sx={{ fontSize: 32, color: theme.palette.info.main }} />,
      color: theme.palette.info.main
    },
    {
      title: 'Unread Notifications',
      value: '5',
      icon: <Notifications sx={{ fontSize: 32, color: theme.palette.warning.main }} />,
      color: theme.palette.warning.main
    }
  ];

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
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 1 }}>
          <Dashboard sx={{ fontSize: 32, color: theme.palette.success.main }} />
          <Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Box
                sx={{
                  width: 8,
                  height: 8,
                  borderRadius: '50%',
                  bgcolor: theme.palette.success.main,
                  animation: 'pulse 2s infinite'
                }}
              />
              <Typography variant="h4" sx={{ fontWeight: 800 }}>
                Communication Dashboard
              </Typography>
            </Box>
            <Typography variant="body1" color="text.secondary">
              Overview of all communication activities and metrics
            </Typography>
          </Box>
        </Box>
      </Box>

      {/* Main Content */}
      <Box sx={{ flex: 1, p: 3, overflow: 'auto' }}>
        <Grid container spacing={3}>
          {/* Stats Cards */}
          {stats.map((stat, index) => (
            <Grid size={{ xs: 12, sm: 6, md: 3 }} key={index}>
              <Card sx={{
                borderRadius: 3,
                boxShadow: `0 4px 20px ${alpha(stat.color, 0.1)}`,
                border: `1px solid ${alpha(stat.color, 0.1)}`,
                transition: 'all 0.3s ease-in-out',
                '&:hover': {
                  transform: 'translateY(-4px)',
                  boxShadow: `0 8px 32px ${alpha(stat.color, 0.2)}`
                }
              }}>
                <CardContent sx={{ p: 3 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
                    <Box sx={{
                      p: 1.5,
                      borderRadius: 2,
                      bgcolor: alpha(stat.color, 0.1)
                    }}>
                      {stat.icon}
                    </Box>
                  </Box>
                  <Typography variant="h4" sx={{ fontWeight: 700, mb: 1 }}>
                    {stat.value}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {stat.title}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          ))}

          {/* Charts and Analytics */}
          <Grid size={{ xs: 12, md: 8 }}>
            <Card sx={{
              height: 400,
              borderRadius: 3,
              boxShadow: `0 4px 20px ${alpha(theme.palette.primary.main, 0.1)}`
            }}>
              <CardContent sx={{ p: 3, height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Box sx={{ textAlign: 'center' }}>
                  <Assessment sx={{ fontSize: 64, color: theme.palette.text.disabled, mb: 2 }} />
                  <Typography variant="h6" color="text.secondary" sx={{ mb: 1 }}>
                    Communication Analytics
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Charts and analytics will be displayed here
                  </Typography>
                </Box>
              </CardContent>
            </Card>
          </Grid>

          {/* Recent Activity */}
          <Grid size={{ xs: 12, md: 4 }}>
            <Card sx={{
              height: 400,
              borderRadius: 3,
              boxShadow: `0 4px 20px ${alpha(theme.palette.primary.main, 0.1)}`
            }}>
              <CardContent sx={{ p: 3 }}>
                <Typography variant="h6" sx={{ fontWeight: 600, mb: 3 }}>
                  Recent Activity
                </Typography>
                <Box sx={{ textAlign: 'center', py: 4 }}>
                  <Typography variant="body2" color="text.secondary">
                    Recent communication activities will be listed here
                  </Typography>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Box>
    </Box>
  );
};

export default CommunicationDashboard;