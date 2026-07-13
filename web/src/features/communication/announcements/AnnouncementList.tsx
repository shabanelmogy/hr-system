import React, { useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  ListItemButton,
  Chip,
  Avatar,
  Badge,
  TextField,
  InputAdornment,
  IconButton,
  Divider,
  useTheme,
  alpha,
  CircularProgress,
  FormControl,
  InputLabel,
  Select,
  MenuItem
} from '@mui/material';
import {
  Search,
  Campaign,
  Person,
  Group,
  Business,
  AccessTime,
  CheckCircle,
  RadioButtonUnchecked,
  PriorityHigh,
  Schedule
} from '@mui/icons-material';
import { useAnnouncements } from '../hooks';
import { Announcement } from '../types';

interface AnnouncementListProps {
  onAnnouncementSelect: (announcement: Announcement) => void;
  selectedAnnouncementId?: string;
}

const AnnouncementList: React.FC<AnnouncementListProps> = ({
  onAnnouncementSelect,
  selectedAnnouncementId
}) => {
  const theme = useTheme();
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [priorityFilter, setPriorityFilter] = useState<string>('all');
  const { announcements, loading } = useAnnouncements();

  const categories = [
    { value: 'policy', label: 'Policy', color: 'primary' },
    { value: 'news', label: 'News', color: 'info' },
    { value: 'events', label: 'Events', color: 'success' },
    { value: 'training', label: 'Training', color: 'warning' },
    { value: 'other', label: 'Other', color: 'default' }
  ];

  const filteredAnnouncements = announcements.filter(announcement => {
    const matchesSearch = announcement.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         announcement.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         announcement.authorName.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesCategory = categoryFilter === 'all' || announcement.category === categoryFilter;
    const matchesPriority = priorityFilter === 'all' || announcement.priority === priorityFilter;

    return matchesSearch && matchesCategory && matchesPriority;
  });

  const handleAnnouncementClick = (announcement: Announcement) => {
    onAnnouncementSelect(announcement);
  };

  const getPriorityIcon = (priority: Announcement['priority']) => {
    switch (priority) {
      case 'urgent':
        return <PriorityHigh sx={{ fontSize: 16, color: theme.palette.error.main }} />;
      case 'high':
        return <PriorityHigh sx={{ fontSize: 16, color: theme.palette.warning.main }} />;
      default:
        return null;
    }
  };

  const getPriorityColor = (priority: Announcement['priority']) => {
    switch (priority) {
      case 'urgent': return 'error';
      case 'high': return 'warning';
      case 'normal': return 'info';
      case 'low': return 'default';
      default: return 'default';
    }
  };

  const getTargetAudienceIcon = (targetAudience: Announcement['targetAudience']) => {
    switch (targetAudience) {
      case 'all':
        return <Campaign sx={{ fontSize: 18, color: theme.palette.primary.main }} />;
      case 'department':
        return <Business sx={{ fontSize: 18, color: theme.palette.secondary.main }} />;
      case 'team':
        return <Group sx={{ fontSize: 18, color: theme.palette.success.main }} />;
      case 'individual':
        return <Person sx={{ fontSize: 18, color: theme.palette.warning.main }} />;
      default:
        return <Campaign sx={{ fontSize: 18, color: theme.palette.primary.main }} />;
    }
  };

  const getCategoryInfo = (category: string) => {
    return categories.find(cat => cat.value === category) || categories[categories.length - 1];
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);

    if (diffInHours < 24) {
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } else if (diffInHours < 168) { // 7 days
      return date.toLocaleDateString([], { weekday: 'short' });
    } else {
      return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
    }
  };

  const getReadStatus = (announcement: Announcement) => {
    // In a real app, this would check if the current user has read it
    return announcement.readBy && announcement.readBy.length > 0;
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Card sx={{
      height: '100%',
      display: 'flex',
      flexDirection: 'column',
      borderRadius: 3,
      boxShadow: `0 4px 20px ${alpha(theme.palette.primary.main, 0.1)}`
    }}>
      <CardContent sx={{ p: 0, flex: 1, display: 'flex', flexDirection: 'column' }}>
        {/* Header */}
        <Box sx={{ p: 3, pb: 2 }}>
          <Typography variant="h6" sx={{ fontWeight: 700, mb: 2 }}>
            Announcements
          </Typography>

          {/* Search */}
          <TextField
            fullWidth
            placeholder="Search announcements..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Search sx={{ color: theme.palette.text.secondary }} />
                </InputAdornment>
              ),
            }}
            sx={{
              mb: 2,
              '& .MuiOutlinedInput-root': {
                borderRadius: 2,
                backgroundColor: alpha(theme.palette.background.paper, 0.8),
                '&:hover': {
                  backgroundColor: theme.palette.background.paper,
                },
                '&.Mui-focused': {
                  backgroundColor: theme.palette.background.paper,
                  boxShadow: `0 0 0 2px ${alpha(theme.palette.primary.main, 0.2)}`
                }
              }
            }}
          />

          {/* Filters */}
          <Box sx={{ display: 'flex', gap: 2 }}>
            <FormControl size="small" sx={{ minWidth: 120, flex: 1 }}>
              <InputLabel>Category</InputLabel>
              <Select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                label="Category"
              >
                <MenuItem value="all">All Categories</MenuItem>
                {categories.map(cat => (
                  <MenuItem key={cat.value} value={cat.value}>{cat.label}</MenuItem>
                ))}
              </Select>
            </FormControl>

            <FormControl size="small" sx={{ minWidth: 120, flex: 1 }}>
              <InputLabel>Priority</InputLabel>
              <Select
                value={priorityFilter}
                onChange={(e) => setPriorityFilter(e.target.value)}
                label="Priority"
              >
                <MenuItem value="all">All Priorities</MenuItem>
                <MenuItem value="low">Low</MenuItem>
                <MenuItem value="normal">Normal</MenuItem>
                <MenuItem value="high">High</MenuItem>
                <MenuItem value="urgent">Urgent</MenuItem>
              </Select>
            </FormControl>
          </Box>
        </Box>

        <Divider />

        {/* Announcement List */}
        <Box sx={{ flex: 1, overflow: 'auto' }}>
          {filteredAnnouncements.length === 0 ? (
            <Box sx={{ p: 4, textAlign: 'center' }}>
              <Campaign sx={{ fontSize: 48, color: theme.palette.text.disabled, mb: 2 }} />
              <Typography variant="body2" color="text.secondary">
                {searchTerm || categoryFilter !== 'all' || priorityFilter !== 'all'
                  ? 'No announcements found'
                  : 'No announcements yet'}
              </Typography>
            </Box>
          ) : (
            <List sx={{ py: 0 }}>
              {filteredAnnouncements.map((announcement, index) => {
                const categoryInfo = getCategoryInfo(announcement.category || 'other');
                const isRead = getReadStatus(announcement);

                return (
                  <React.Fragment key={announcement.id}>
                    <ListItemButton
                      onClick={() => handleAnnouncementClick(announcement)}
                      selected={selectedAnnouncementId === announcement.id}
                      sx={{
                        py: 2,
                        px: 3,
                        '&.Mui-selected': {
                          backgroundColor: alpha(theme.palette.primary.main, 0.08),
                          '&:hover': {
                            backgroundColor: alpha(theme.palette.primary.main, 0.12),
                          }
                        },
                        '&:hover': {
                          backgroundColor: alpha(theme.palette.action.hover, 0.5),
                        }
                      }}
                    >
                      <ListItemAvatar>
                        <Badge
                          overlap="circular"
                          anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                          badgeContent={getTargetAudienceIcon(announcement.targetAudience)}
                        >
                          <Avatar
                            sx={{
                              bgcolor: alpha(theme.palette.primary.main, 0.1),
                              color: theme.palette.primary.main,
                              width: 48,
                              height: 48
                            }}
                          >
                            {announcement.authorName.charAt(0).toUpperCase()}
                          </Avatar>
                        </Badge>
                      </ListItemAvatar>

                      <ListItemText
                        primary={
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                            <Typography
                              variant="subtitle2"
                              sx={{
                                fontWeight: isRead ? 500 : 700,
                                flex: 1,
                                overflow: 'hidden',
                                textOverflow: 'ellipsis',
                                whiteSpace: 'nowrap'
                              }}
                            >
                              {announcement.title}
                            </Typography>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                              {getPriorityIcon(announcement.priority)}
                              <Typography variant="caption" color="text.secondary">
                                {formatTime(announcement.createdAt)}
                              </Typography>
                            </Box>
                          </Box>
                        }
                        secondary={
                          <Box>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                              <Chip
                                label={categoryInfo.label}
                                size="small"
                                color={categoryInfo.color as any}
                                variant="outlined"
                                sx={{ fontSize: '0.7rem', height: 20 }}
                              />
                              <Chip
                                label={announcement.priority.toUpperCase()}
                                size="small"
                                color={getPriorityColor(announcement.priority)}
                                variant="outlined"
                                sx={{ fontSize: '0.7rem', height: 20 }}
                              />
                              {announcement.published && (
                                <Chip
                                  label="Published"
                                  size="small"
                                  color="success"
                                  variant="outlined"
                                  sx={{ fontSize: '0.7rem', height: 20 }}
                                />
                              )}
                            </Box>
                            <Typography
                              variant="caption"
                              sx={{
                                overflow: 'hidden',
                                textOverflow: 'ellipsis',
                                whiteSpace: 'nowrap',
                                color: 'text.secondary'
                              }}
                            >
                              {announcement.summary || announcement.content.substring(0, 100) + '...'}
                            </Typography>
                          </Box>
                        }
                      />
                    </ListItemButton>

                    {index < filteredAnnouncements.length - 1 && <Divider />}
                  </React.Fragment>
                );
              })}
            </List>
          )}
        </Box>
      </CardContent>
    </Card>
  );
};

export default AnnouncementList;