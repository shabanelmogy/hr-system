import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Avatar,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  ListItemButton,
  Chip,
  Badge,
  TextField,
  InputAdornment,
  IconButton,
  Divider,
  useTheme,
  alpha,
  CircularProgress
} from '@mui/material';
import {
  Search,
  Message,
  Group,
  Person,
  CheckCircle,
  RadioButtonUnchecked,
  AccessTime
} from '@mui/icons-material';
import { useMessages } from '../hooks';
import { Message as MessageType } from '../types';

interface MessageListProps {
  userId: string;
  onMessageSelect: (message: MessageType) => void;
  selectedMessageId?: string;
}

const MessageList: React.FC<MessageListProps> = ({
  userId,
  onMessageSelect,
  selectedMessageId
}) => {
  const theme = useTheme();
  const [searchTerm, setSearchTerm] = useState('');
  const { messages, loading, markAsRead } = useMessages(userId);

  const filteredMessages = messages.filter(message =>
    message.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
    message.senderName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    message.content.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleMessageClick = async (message: MessageType) => {
    if (message.status !== 'read') {
      await markAsRead(message.id);
    }
    onMessageSelect(message);
  };

  const getStatusIcon = (status: MessageType['status']) => {
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

  const getMessageTypeIcon = (type: MessageType['type']) => {
    switch (type) {
      case 'group':
        return <Group sx={{ fontSize: 18, color: theme.palette.primary.main }} />;
      case 'broadcast':
        return <Message sx={{ fontSize: 18, color: theme.palette.secondary.main }} />;
      default:
        return <Person sx={{ fontSize: 18, color: theme.palette.success.main }} />;
    }
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
            Messages
          </Typography>

          {/* Search */}
          <TextField
            fullWidth
            placeholder="Search messages..."
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
        </Box>

        <Divider />

        {/* Message List */}
        <Box sx={{ flex: 1, overflow: 'auto' }}>
          {filteredMessages.length === 0 ? (
            <Box sx={{ p: 4, textAlign: 'center' }}>
              <Message sx={{ fontSize: 48, color: theme.palette.text.disabled, mb: 2 }} />
              <Typography variant="body2" color="text.secondary">
                {searchTerm ? 'No messages found' : 'No messages yet'}
              </Typography>
            </Box>
          ) : (
            <List sx={{ py: 0 }}>
              {filteredMessages.map((message, index) => (
                <React.Fragment key={message.id}>
                  <ListItemButton
                    onClick={() => handleMessageClick(message)}
                    selected={selectedMessageId === message.id}
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
                        badgeContent={getMessageTypeIcon(message.type)}
                      >
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
                      </Badge>
                    </ListItemAvatar>

                    <ListItemText
                      primary={
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                          <Typography
                            variant="subtitle2"
                            sx={{
                              fontWeight: message.status === 'read' ? 500 : 700,
                              flex: 1,
                              overflow: 'hidden',
                              textOverflow: 'ellipsis',
                              whiteSpace: 'nowrap'
                            }}
                          >
                            {message.senderName}
                          </Typography>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                            {getStatusIcon(message.status)}
                            <Typography variant="caption" color="text.secondary">
                              {formatTime(message.createdAt)}
                            </Typography>
                          </Box>
                        </Box>
                      }
                      secondary={
                        <Box>
                          <Typography
                            variant="body2"
                            sx={{
                              fontWeight: message.status === 'read' ? 400 : 600,
                              color: message.status === 'read' ? 'text.secondary' : 'text.primary',
                              overflow: 'hidden',
                              textOverflow: 'ellipsis',
                              whiteSpace: 'nowrap',
                              mb: 0.5
                            }}
                          >
                            {message.subject}
                          </Typography>
                          <Typography
                            variant="caption"
                            sx={{
                              overflow: 'hidden',
                              textOverflow: 'ellipsis',
                              whiteSpace: 'nowrap',
                              color: 'text.secondary'
                            }}
                          >
                            {message.content}
                          </Typography>
                        </Box>
                      }
                    />

                    {message.attachments && message.attachments.length > 0 && (
                      <Chip
                        label={`${message.attachments.length} file${message.attachments.length > 1 ? 's' : ''}`}
                        size="small"
                        variant="outlined"
                        sx={{ ml: 1, fontSize: '0.7rem' }}
                      />
                    )}
                  </ListItemButton>

                  {index < filteredMessages.length - 1 && <Divider />}
                </React.Fragment>
              ))}
            </List>
          )}
        </Box>
      </CardContent>
    </Card>
  );
};

export default MessageList;