import React, { useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Avatar,
  Chip,
  Button,
  Divider,
  IconButton,
  Tooltip,
  useTheme,
  alpha,
  Paper,
  Grid
} from '@mui/material';
import {
  Reply,
  ReplyAll,
  Forward,
  Download,
  AttachFile,
  Person,
  Group,
  Message as MessageIcon,
  AccessTime,
  CheckCircle,
  RadioButtonUnchecked
} from '@mui/icons-material';
import { Message } from '../types';

interface MessageDetailProps {
  message: Message | null;
  onReply?: (message: Message) => void;
  onReplyAll?: (message: Message) => void;
  onForward?: (message: Message) => void;
}

const MessageDetail: React.FC<MessageDetailProps> = ({
  message,
  onReply,
  onReplyAll,
  onForward
}) => {
  const theme = useTheme();

  const getStatusIcon = (status: Message['status']) => {
    switch (status) {
      case 'read':
        return <CheckCircle sx={{ fontSize: 16, color: theme.palette.success.main }} />;
      case 'delivered':
        return <CheckCircle sx={{ fontSize: 16, color: theme.palette.info.main }} />;
      case 'sent':
        return <RadioButtonUnchecked sx={{ fontSize: 16, color: theme.palette.warning.main }} />;
      default:
        return <AccessTime sx={{ fontSize: 16, color: theme.palette.grey[500] }} />;
    }
  };

  const getMessageTypeIcon = (type: Message['type']) => {
    switch (type) {
      case 'group':
        return <Group sx={{ fontSize: 20, color: theme.palette.primary.main }} />;
      case 'broadcast':
        return <MessageIcon sx={{ fontSize: 20, color: theme.palette.secondary.main }} />;
      default:
        return <Person sx={{ fontSize: 20, color: theme.palette.success.main }} />;
    }
  };

  const getMessageTypeLabel = (type: Message['type']) => {
    switch (type) {
      case 'group':
        return 'Group Message';
      case 'broadcast':
        return 'Broadcast Message';
      default:
        return 'Direct Message';
    }
  };

  const formatDateTime = (dateString: string) => {
    const date = new Date(dateString);
    return {
      date: date.toLocaleDateString([], {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      }),
      time: date.toLocaleTimeString([], {
        hour: '2-digit',
        minute: '2-digit'
      })
    };
  };

  const handleDownloadAttachment = async (attachmentUrl: string, fileName: string) => {
    try {
      // In a real implementation, this would download the file
      console.log('Downloading attachment:', attachmentUrl, fileName);
    } catch (error) {
      console.error('Error downloading attachment:', error);
    }
  };

  if (!message) {
    return (
      <Card sx={{
        height: '100%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: 3,
        boxShadow: `0 4px 20px ${alpha(theme.palette.primary.main, 0.1)}`
      }}>
        <CardContent sx={{ textAlign: 'center', py: 8 }}>
          <MessageIcon sx={{ fontSize: 64, color: theme.palette.text.disabled, mb: 2 }} />
          <Typography variant="h6" color="text.secondary" sx={{ mb: 1 }}>
            Select a message to view
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Choose a message from the list to see its details
          </Typography>
        </CardContent>
      </Card>
    );
  }

  const { date, time } = formatDateTime(message.createdAt);

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
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
            <Avatar
              sx={{
                bgcolor: alpha(theme.palette.primary.main, 0.1),
                color: theme.palette.primary.main,
                width: 48,
                height: 48
              }}
            >
              {message.senderName.charAt(0).toUpperCase()}
            </Avatar>

            <Box sx={{ flex: 1 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                <Typography variant="h6" sx={{ fontWeight: 600 }}>
                  {message.senderName}
                </Typography>
                {getMessageTypeIcon(message.type)}
                <Chip
                  label={getMessageTypeLabel(message.type)}
                  size="small"
                  variant="outlined"
                  sx={{ fontSize: '0.7rem' }}
                />
              </Box>

              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Typography variant="body2" color="text.secondary">
                  {date} at {time}
                </Typography>
                {getStatusIcon(message.status)}
              </Box>
            </Box>
          </Box>

          {/* Recipients */}
          {message.recipientIds.length > 0 && (
            <Box sx={{ mb: 2 }}>
              <Typography variant="body2" sx={{ fontWeight: 500, mb: 1 }}>
                To: {message.recipientIds.length} recipient{message.recipientIds.length > 1 ? 's' : ''}
              </Typography>
            </Box>
          )}

          {/* Subject */}
          <Typography variant="h5" sx={{ fontWeight: 600, mb: 2 }}>
            {message.subject}
          </Typography>

          {/* Priority */}
          {message.priority !== 'normal' && (
            <Chip
              label={message.priority.toUpperCase()}
              size="small"
              color={
                message.priority === 'urgent' ? 'error' :
                message.priority === 'high' ? 'warning' : 'info'
              }
              sx={{ mb: 2 }}
            />
          )}
        </Box>

        <Divider />

        {/* Action Buttons */}
        <Box sx={{ p: 2, display: 'flex', gap: 1 }}>
          <Tooltip title="Reply">
            <IconButton
              onClick={() => onReply?.(message)}
              sx={{
                bgcolor: alpha(theme.palette.primary.main, 0.1),
                '&:hover': {
                  bgcolor: alpha(theme.palette.primary.main, 0.2),
                }
              }}
            >
              <Reply />
            </IconButton>
          </Tooltip>

          <Tooltip title="Reply All">
            <IconButton
              onClick={() => onReplyAll?.(message)}
              sx={{
                bgcolor: alpha(theme.palette.primary.main, 0.1),
                '&:hover': {
                  bgcolor: alpha(theme.palette.primary.main, 0.2),
                }
              }}
            >
              <ReplyAll />
            </IconButton>
          </Tooltip>

          <Tooltip title="Forward">
            <IconButton
              onClick={() => onForward?.(message)}
              sx={{
                bgcolor: alpha(theme.palette.primary.main, 0.1),
                '&:hover': {
                  bgcolor: alpha(theme.palette.primary.main, 0.2),
                }
              }}
            >
              <Forward />
            </IconButton>
          </Tooltip>
        </Box>

        <Divider />

        {/* Message Content */}
        <Box sx={{ p: 3, flex: 1, overflow: 'auto' }}>
          <Typography variant="body1" sx={{ lineHeight: 1.6, whiteSpace: 'pre-wrap' }}>
            {message.content}
          </Typography>
        </Box>

        {/* Attachments */}
        {message.attachments && message.attachments.length > 0 && (
          <>
            <Divider />
            <Box sx={{ p: 3 }}>
              <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 2 }}>
                Attachments ({message.attachments.length})
              </Typography>

              <Grid container spacing={2}>
                {message.attachments.map((attachment, index) => (
                  <Grid size={{ xs: 12, sm: 6, md: 4 }} key={index}>
                    <Paper
                      sx={{
                        p: 2,
                        display: 'flex',
                        alignItems: 'center',
                        gap: 2,
                        borderRadius: 2,
                        border: `1px solid ${alpha(theme.palette.divider, 0.5)}`,
                        '&:hover': {
                          bgcolor: alpha(theme.palette.action.hover, 0.5),
                          cursor: 'pointer'
                        }
                      }}
                      onClick={() => handleDownloadAttachment(attachment, attachment)}
                    >
                      <AttachFile sx={{ color: theme.palette.primary.main }} />
                      <Box sx={{ flex: 1, minWidth: 0 }}>
                        <Typography
                          variant="body2"
                          sx={{
                            fontWeight: 500,
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap'
                          }}
                        >
                          {attachment}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          Click to download
                        </Typography>
                      </Box>
                      <IconButton size="small">
                        <Download sx={{ fontSize: 18 }} />
                      </IconButton>
                    </Paper>
                  </Grid>
                ))}
              </Grid>
            </Box>
          </>
        )}
      </CardContent>
    </Card>
  );
};

export default MessageDetail;