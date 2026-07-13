import React, { useState } from 'react';
import {
  Box,
  Grid,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  Typography,
  useTheme,
  alpha,
  Fab
} from '@mui/material';
import {
  Add,
  Message as MessageIcon
} from '@mui/icons-material';
import MessageList from './MessageList';
import MessageDetail from './MessageDetail';
import MessageCompose from './MessageCompose';
import { Message } from '../types';

interface MessagingSystemProps {
  userId: string;
}

const MessagingSystem: React.FC<MessagingSystemProps> = ({ userId }) => {
  const theme = useTheme();
  const [selectedMessage, setSelectedMessage] = useState<Message | null>(null);
  const [composeOpen, setComposeOpen] = useState(false);
  const [replyTo, setReplyTo] = useState<Message | null>(null);

  const handleMessageSelect = (message: Message) => {
    setSelectedMessage(message);
  };

  const handleCompose = () => {
    setReplyTo(null);
    setComposeOpen(true);
  };

  const handleReply = (message: Message) => {
    setReplyTo(message);
    setComposeOpen(true);
  };

  const handleReplyAll = (message: Message) => {
    // For reply all, we would include all recipients
    setReplyTo(message);
    setComposeOpen(true);
  };

  const handleForward = (message: Message) => {
    // For forward, we would create a new message with the original content
    setReplyTo(message);
    setComposeOpen(true);
  };

  const handleComposeClose = () => {
    setComposeOpen(false);
    setReplyTo(null);
  };

  const handleMessageSent = () => {
    // Refresh messages or update state
    setSelectedMessage(null);
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
              <MessageIcon sx={{ fontSize: 32, color: theme.palette.primary.main }} />
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
                    Messaging
                  </Typography>
                </Box>
                <Typography variant="body1" color="text.secondary">
                  Communicate with your team members
                </Typography>
              </Box>
            </Box>
          </Box>

          <Button
            variant="contained"
            startIcon={<Add />}
            onClick={handleCompose}
            sx={{
              px: 3,
              py: 1.5,
              borderRadius: 3,
              fontWeight: 600,
              bgcolor: `linear-gradient(135deg, ${theme.palette.primary.main}, ${alpha(theme.palette.primary.main, 0.8)})`,
              boxShadow: `0 4px 16px ${alpha(theme.palette.primary.main, 0.3)}`,
              '&:hover': {
                bgcolor: `linear-gradient(135deg, ${theme.palette.primary.dark}, ${alpha(theme.palette.primary.dark, 0.8)})`,
                boxShadow: `0 6px 20px ${alpha(theme.palette.primary.main, 0.4)}`,
                transform: 'translateY(-2px)'
              },
              transition: 'all 0.3s ease-in-out'
            }}
          >
            New Message
          </Button>
        </Box>
      </Box>

      {/* Main Content */}
      <Box sx={{ flex: 1, p: 3, overflow: 'hidden' }}>
        <Grid container spacing={3} sx={{ height: '100%' }}>
          {/* Message List */}
          <Grid size={{ xs: 12, md: 5, lg: 4 }}>
            <MessageList
              userId={userId}
              onMessageSelect={handleMessageSelect}
              selectedMessageId={selectedMessage?.id}
            />
          </Grid>

          {/* Message Detail */}
          <Grid size={{ xs: 12, md: 7, lg: 8 }}>
            <MessageDetail
              message={selectedMessage}
              onReply={handleReply}
              onReplyAll={handleReplyAll}
              onForward={handleForward}
            />
          </Grid>
        </Grid>
      </Box>

      {/* Compose Dialog */}
      <Dialog
        open={composeOpen}
        onClose={handleComposeClose}
        maxWidth="md"
        fullWidth
        sx={{
          '& .MuiDialog-paper': {
            borderRadius: 3,
            maxHeight: '90vh'
          }
        }}
      >
        <DialogContent sx={{ p: 0 }}>
          <MessageCompose
            userId={userId}
            replyTo={replyTo || undefined}
            onClose={handleComposeClose}
            onSent={handleMessageSent}
          />
        </DialogContent>
      </Dialog>

      {/* Floating Action Button for Mobile */}
      <Fab
        color="primary"
        sx={{
          position: 'fixed',
          bottom: 24,
          right: 24,
          display: { xs: 'flex', md: 'none' },
          bgcolor: `linear-gradient(135deg, ${theme.palette.primary.main}, ${alpha(theme.palette.primary.main, 0.8)})`,
          '&:hover': {
            bgcolor: `linear-gradient(135deg, ${theme.palette.primary.dark}, ${alpha(theme.palette.primary.dark, 0.8)})`,
          }
        }}
        onClick={handleCompose}
      >
        <Add />
      </Fab>
    </Box>
  );
};

export default MessagingSystem;