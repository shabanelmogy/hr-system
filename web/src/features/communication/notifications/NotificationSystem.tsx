import React from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  useTheme,
  alpha
} from '@mui/material';
import { Notifications } from '@mui/icons-material';

interface NotificationSystemProps {
  userId: string;
}

const NotificationSystem: React.FC<NotificationSystemProps> = ({ userId }) => {
  const theme = useTheme();

  return (
    <Box sx={{
      height: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      bgcolor: alpha(theme.palette.background.default, 0.5)
    }}>
      <Card sx={{
        maxWidth: 600,
        borderRadius: 3,
        boxShadow: `0 8px 32px ${alpha(theme.palette.primary.main, 0.15)}`
      }}>
        <CardContent sx={{ textAlign: 'center', py: 8 }}>
          <Notifications sx={{ fontSize: 64, color: theme.palette.text.disabled, mb: 2 }} />
          <Typography variant="h6" color="text.secondary" sx={{ mb: 1 }}>
            Notification System
          </Typography>
          <Typography variant="body2" color="text.secondary">
            In-app notifications, settings, and history management will be implemented here
          </Typography>
        </CardContent>
      </Card>
    </Box>
  );
};

export default NotificationSystem;