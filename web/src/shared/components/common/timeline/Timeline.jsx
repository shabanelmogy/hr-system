import React from 'react';
import {
  Timeline as MuiTimeline,
  TimelineItem,
  TimelineSeparator,
  TimelineConnector,
  TimelineContent,
  TimelineDot,
  TimelineOppositeContent
} from '@mui/lab';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Chip,
  useTheme,
  alpha,
  Fade,
  Zoom
} from '@mui/material';
import {
  Work,
  School,
  Star,
  TrendingUp,
  Assignment,
  Event,
  CheckCircle,
  Timeline as TimelineIcon,
  Celebration,
  BusinessCenter,
  EmojiEvents,
  LocalHospital,
  Flight,
  PersonAdd,
  Update
} from '@mui/icons-material';

const Timeline = ({ items = [], title, showOppositeContent = true, variant = 'default' }) => {
  const theme = useTheme();

  const getEventIcon = (type) => {
    const iconMap = {
      'hire': <PersonAdd />,
      'promotion': <TrendingUp />,
      'performance': <Star />,
      'training': <School />,
      'project': <Assignment />,
      'achievement': <EmojiEvents />,
      'review': <CheckCircle />,
      'leave': <Flight />,
      'medical': <LocalHospital />,
      'milestone': <Celebration />,
      'update': <Update />,
      'default': <Event />
    };
    return iconMap[type] || iconMap['default'];
  };

  const getEventColor = (type, status = 'completed') => {
    const colorMap = {
      'hire': theme.palette.success.main,
      'promotion': theme.palette.primary.main,
      'performance': theme.palette.warning.main,
      'training': theme.palette.info.main,
      'project': theme.palette.secondary.main,
      'achievement': theme.palette.success.main,
      'review': theme.palette.primary.main,
      'leave': theme.palette.grey[500],
      'medical': theme.palette.error.main,
      'milestone': theme.palette.success.main,
      'update': theme.palette.info.main,
      'default': theme.palette.grey[400]
    };

    if (status === 'pending') {
      return theme.palette.grey[400];
    } else if (status === 'in-progress') {
      return theme.palette.warning.main;
    }

    return colorMap[type] || colorMap['default'];
  };

  const getStatusChip = (status) => {
    const statusConfig = {
      'completed': { color: 'success', label: 'Completed' },
      'pending': { color: 'default', label: 'Pending' },
      'in-progress': { color: 'warning', label: 'In Progress' },
      'cancelled': { color: 'error', label: 'Cancelled' }
    };

    const config = statusConfig[status] || statusConfig['completed'];
    return (
      <Chip 
        label={config.label} 
        color={config.color} 
        size="small" 
        sx={{ ml: 1 }}
      />
    );
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  if (!items || items.length === 0) {
    return (
      <Box sx={{ textAlign: 'center', py: 4 }}>
        <TimelineIcon sx={{ fontSize: 48, color: 'text.secondary', mb: 2 }} />
        <Typography variant="h6" color="text.secondary">
          No timeline events available
        </Typography>
      </Box>
    );
  }

  return (
    <Box>
      {title && (
        <Typography variant="h6" gutterBottom sx={{ mb: 3, fontWeight: 'bold' }}>
          {title}
        </Typography>
      )}
      
      <MuiTimeline position={showOppositeContent ? 'alternate' : 'right'}>
        {items.map((item, index) => (
          <Fade in timeout={300 + index * 100} key={item.id || index}>
            <TimelineItem>
              {showOppositeContent && (
                <TimelineOppositeContent
                  sx={{ 
                    m: 'auto 0',
                    minWidth: 120,
                    textAlign: index % 2 === 0 ? 'right' : 'left'
                  }}
                  align={index % 2 === 0 ? 'right' : 'left'}
                  variant="body2"
                  color="text.secondary"
                >
                  {formatDate(item.date)}
                </TimelineOppositeContent>
              )}
              
              <TimelineSeparator>
                <Zoom in timeout={400 + index * 100}>
                  <TimelineDot
                    sx={{
                      bgcolor: getEventColor(item.type, item.status),
                      color: 'white',
                      width: 48,
                      height: 48,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      boxShadow: `0 4px 12px ${alpha(getEventColor(item.type, item.status), 0.3)}`,
                      transition: 'all 0.3s ease',
                      '&:hover': {
                        transform: 'scale(1.1)',
                        boxShadow: `0 6px 20px ${alpha(getEventColor(item.type, item.status), 0.4)}`
                      }
                    }}
                  >
                    {getEventIcon(item.type)}
                  </TimelineDot>
                </Zoom>
                {index < items.length - 1 && (
                  <TimelineConnector 
                    sx={{ 
                      bgcolor: alpha(theme.palette.primary.main, 0.2),
                      width: 2
                    }} 
                  />
                )}
              </TimelineSeparator>
              
              <TimelineContent sx={{ py: '12px', px: 2 }}>
                <Card
                  sx={{
                    background: `linear-gradient(135deg, ${alpha(getEventColor(item.type, item.status), 0.05)} 0%, ${alpha(getEventColor(item.type, item.status), 0.02)} 100%)`,
                    border: `1px solid ${alpha(getEventColor(item.type, item.status), 0.1)}`,
                    transition: 'all 0.3s ease',
                    '&:hover': {
                      transform: 'translateY(-2px)',
                      boxShadow: `0 8px 25px ${alpha(getEventColor(item.type, item.status), 0.15)}`,
                      border: `1px solid ${alpha(getEventColor(item.type, item.status), 0.2)}`
                    }
                  }}
                >
                  <CardContent sx={{ pb: '16px !important' }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                      <Typography variant="h6" component="span" sx={{ fontWeight: 'bold' }}>
                        {item.title}
                      </Typography>
                      {item.status && getStatusChip(item.status)}
                    </Box>
                    
                    {!showOppositeContent && (
                      <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 1 }}>
                        {formatDate(item.date)}
                      </Typography>
                    )}
                    
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                      {item.description}
                    </Typography>
                    
                    {item.details && (
                      <Box sx={{ mt: 2 }}>
                        {Array.isArray(item.details) ? (
                          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                            {item.details.map((detail, idx) => (
                              <Chip
                                key={idx}
                                label={detail}
                                size="small"
                                variant="outlined"
                                sx={{ 
                                  borderColor: alpha(getEventColor(item.type, item.status), 0.3),
                                  color: getEventColor(item.type, item.status)
                                }}
                              />
                            ))}
                          </Box>
                        ) : (
                          <Typography variant="caption" color="text.secondary">
                            {item.details}
                          </Typography>
                        )}
                      </Box>
                    )}
                    
                    {item.impact && (
                      <Box sx={{ 
                        mt: 2, 
                        p: 1, 
                        bgcolor: alpha(getEventColor(item.type, item.status), 0.1),
                        borderRadius: 1,
                        borderLeft: `3px solid ${getEventColor(item.type, item.status)}`
                      }}>
                        <Typography variant="caption" sx={{ fontWeight: 'medium' }}>
                          Impact: {item.impact}
                        </Typography>
                      </Box>
                    )}
                  </CardContent>
                </Card>
              </TimelineContent>
            </TimelineItem>
          </Fade>
        ))}
      </MuiTimeline>
    </Box>
  );
};

export default Timeline;