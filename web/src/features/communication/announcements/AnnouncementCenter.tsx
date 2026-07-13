import React, { useState } from 'react';
import {
  Box,
  Grid,
  Button,
  Typography,
  useTheme,
  alpha
} from '@mui/material';
import {
  Add,
  Campaign
} from '@mui/icons-material';
import AnnouncementList from './AnnouncementList';
import { Announcement } from '../types';

interface AnnouncementCenterProps {
  userId: string;
}

const AnnouncementCenter: React.FC<AnnouncementCenterProps> = ({ userId }) => {
  const theme = useTheme();
  const [selectedAnnouncement, setSelectedAnnouncement] = useState<Announcement | null>(null);

  const handleAnnouncementSelect = (announcement: Announcement) => {
    setSelectedAnnouncement(announcement);
  };

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
              <Campaign sx={{ fontSize: 32, color: theme.palette.secondary.main }} />
              <Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Box
                    sx={{
                      width: 8,
                      height: 8,
                      borderRadius: '50%',
                      bgcolor: theme.palette.secondary.main,
                      animation: 'pulse 2s infinite'
                    }}
                  />
                  <Typography variant="h4" sx={{ fontWeight: 800 }}>
                    Announcement Center
                  </Typography>
                </Box>
                <Typography variant="body1" color="text.secondary">
                  Company announcements and important updates
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
              bgcolor: `linear-gradient(135deg, ${theme.palette.secondary.main}, ${alpha(theme.palette.secondary.main, 0.8)})`,
              boxShadow: `0 4px 16px ${alpha(theme.palette.secondary.main, 0.3)}`,
              '&:hover': {
                bgcolor: `linear-gradient(135deg, ${theme.palette.secondary.dark}, ${alpha(theme.palette.secondary.dark, 0.8)})`,
                boxShadow: `0 6px 20px ${alpha(theme.palette.secondary.main, 0.4)}`,
                transform: 'translateY(-2px)'
              },
              transition: 'all 0.3s ease-in-out'
            }}
          >
            New Announcement
          </Button>
        </Box>
      </Box>

      {/* Main Content */}
      <Box sx={{ flex: 1, p: 3, overflow: 'hidden' }}>
        <Grid container spacing={3} sx={{ height: '100%' }}>
          {/* Announcement List */}
          <Grid size={{ xs: 12, md: 5, lg: 4 }}>
            <AnnouncementList
              onAnnouncementSelect={handleAnnouncementSelect}
              selectedAnnouncementId={selectedAnnouncement?.id}
            />
          </Grid>

          {/* Announcement Detail */}
          <Grid size={{ xs: 12, md: 7, lg: 8 }}>
            <Box sx={{
              height: '100%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <Box sx={{ textAlign: 'center', py: 8 }}>
                <Campaign sx={{ fontSize: 64, color: theme.palette.text.disabled, mb: 2 }} />
                <Typography variant="h6" color="text.secondary" sx={{ mb: 1 }}>
                  Select an announcement to view details
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Choose an announcement from the list to see its full content and details
                </Typography>
              </Box>
            </Box>
          </Grid>
        </Grid>
      </Box>
    </Box>
  );
};

export default AnnouncementCenter;