import React, { useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Tabs,
  Tab,
  Button,
  Grid,
  Avatar,
  Chip,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  ListItemSecondaryAction,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  useTheme,
  alpha,
} from '@mui/material';
import {
  Chat,
  Notifications,
  Announcement,
  Feedback,
  Send,
  Reply,
  ThumbUp,
  ThumbDown,
  Add,
  Message,
} from '@mui/icons-material';
import { Employee } from '../types/Employee';

interface CommunicationTabProps {
  employee: Employee;
}

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

const TabPanel: React.FC<TabPanelProps> = ({ children, value, index }) => (
  <div role="tabpanel" hidden={value !== index}>
    {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
  </div>
);

// Mock data for demonstration
const mockMessages = [
  {
    id: '1',
    from: 'Manager',
    subject: 'Performance Review Discussion',
    content: 'Let\'s schedule a time to discuss your recent performance review.',
    timestamp: '2024-01-15T10:00:00Z',
    read: false,
    type: 'message',
  },
  {
    id: '2',
    from: 'HR Department',
    subject: 'New Benefits Package',
    content: 'We\'ve updated our benefits package. Please review the attached document.',
    timestamp: '2024-01-14T14:30:00Z',
    read: true,
    type: 'announcement',
  },
];

const mockFeedback = [
  {
    id: '1',
    from: 'Sarah Johnson',
    type: 'positive',
    content: 'Great work on the recent project! Your attention to detail was outstanding.',
    timestamp: '2024-01-13T09:15:00Z',
    category: 'performance',
  },
  {
    id: '2',
    from: 'Mike Chen',
    type: 'constructive',
    content: 'Consider improving communication during team meetings.',
    timestamp: '2024-01-12T16:45:00Z',
    category: 'communication',
  },
];

const CommunicationTab: React.FC<CommunicationTabProps> = ({ employee }) => {
  const theme = useTheme();
  const [activeTab, setActiveTab] = useState(0);
  const [messageDialog, setMessageDialog] = useState(false);
  const [feedbackDialog, setFeedbackDialog] = useState(false);

  const handleSendMessage = () => {
    setMessageDialog(true);
  };

  const handleGiveFeedback = () => {
    setFeedbackDialog(true);
  };

  return (
    <Box>
      {/* Header */}
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h5" fontWeight="bold">
          Communication & Feedback
        </Typography>
        <Box sx={{ display: 'flex', gap: 2 }}>
          <Button
            variant="outlined"
            startIcon={<Feedback />}
            onClick={handleGiveFeedback}
            sx={{ borderRadius: 2 }}
          >
            Give Feedback
          </Button>
          <Button
            variant="contained"
            startIcon={<Send />}
            onClick={handleSendMessage}
            sx={{ borderRadius: 2 }}
          >
            Send Message
          </Button>
        </Box>
      </Box>

      {/* Communication Overview Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <Card
            sx={{
              background: `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.1)}, ${alpha(theme.palette.primary.light, 0.05)})`,
              border: `1px solid ${alpha(theme.palette.primary.main, 0.2)}`,
              borderRadius: 3
            }}
          >
            <CardContent sx={{ p: 3 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
                <Typography variant="h6" sx={{ fontWeight: 700, color: theme.palette.primary.main }}>
                  Messages
                </Typography>
                <Chat sx={{ color: theme.palette.primary.main, fontSize: 28 }} />
              </Box>
              <Typography variant="h3" sx={{ fontWeight: 800, color: theme.palette.primary.main, mb: 1 }}>
                {mockMessages.filter(m => !m.read).length}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Unread messages
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <Card
            sx={{
              background: `linear-gradient(135deg, ${alpha(theme.palette.success.main, 0.1)}, ${alpha(theme.palette.success.light, 0.05)})`,
              border: `1px solid ${alpha(theme.palette.success.main, 0.2)}`,
              borderRadius: 3
            }}
          >
            <CardContent sx={{ p: 3 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
                <Typography variant="h6" sx={{ fontWeight: 700, color: theme.palette.success.main }}>
                  Announcements
                </Typography>
                <Announcement sx={{ color: theme.palette.success.main, fontSize: 28 }} />
              </Box>
              <Typography variant="h3" sx={{ fontWeight: 800, color: theme.palette.success.main, mb: 1 }}>
                {mockMessages.filter(m => m.type === 'announcement').length}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Active announcements
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <Card
            sx={{
              background: `linear-gradient(135deg, ${alpha(theme.palette.info.main, 0.1)}, ${alpha(theme.palette.info.light, 0.05)})`,
              border: `1px solid ${alpha(theme.palette.info.main, 0.2)}`,
              borderRadius: 3
            }}
          >
            <CardContent sx={{ p: 3 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
                <Typography variant="h6" sx={{ fontWeight: 700, color: theme.palette.info.main }}>
                  Feedback Given
                </Typography>
                <ThumbUp sx={{ color: theme.palette.info.main, fontSize: 28 }} />
              </Box>
              <Typography variant="h3" sx={{ fontWeight: 800, color: theme.palette.info.main, mb: 1 }}>
                {mockFeedback.filter(f => f.type === 'positive').length}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Positive feedback received
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <Card
            sx={{
              background: `linear-gradient(135deg, ${alpha(theme.palette.warning.main, 0.1)}, ${alpha(theme.palette.warning.light, 0.05)})`,
              border: `1px solid ${alpha(theme.palette.warning.main, 0.2)}`,
              borderRadius: 3
            }}
          >
            <CardContent sx={{ p: 3 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
                <Typography variant="h6" sx={{ fontWeight: 700, color: theme.palette.warning.main }}>
                  Response Rate
                </Typography>
                <Reply sx={{ color: theme.palette.warning.main, fontSize: 28 }} />
              </Box>
              <Typography variant="h3" sx={{ fontWeight: 800, color: theme.palette.warning.main, mb: 1 }}>
                95%
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Messages responded to
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Communication Tabs */}
      <Card sx={{ borderRadius: 3, overflow: 'hidden' }}>
        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tabs value={activeTab} onChange={(_, newValue) => setActiveTab(newValue)}>
            <Tab label="Messages" icon={<Chat />} iconPosition="start" />
            <Tab label="Announcements" icon={<Announcement />} iconPosition="start" />
            <Tab label="Feedback" icon={<Feedback />} iconPosition="start" />
          </Tabs>
        </Box>

        <CardContent sx={{ p: 0 }}>
          {/* Messages Tab */}
          <TabPanel value={activeTab} index={0}>
            <List>
              {mockMessages.map((message) => (
                <ListItem key={message.id} sx={{ borderBottom: '1px solid', borderColor: 'divider' }}>
                  <ListItemAvatar>
                    <Avatar sx={{ bgcolor: message.read ? theme.palette.grey[300] : theme.palette.primary.main }}>
                      <Message />
                    </Avatar>
                  </ListItemAvatar>
                  <ListItemText
                    primary={
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Typography variant="subtitle1" fontWeight={message.read ? 400 : 600}>
                          {message.subject}
                        </Typography>
                        {!message.read && <Chip label="New" size="small" color="primary" />}
                      </Box>
                    }
                    secondary={
                      <Box>
                        <Typography variant="body2" color="text.secondary">
                          From: {message.from} • {new Date(message.timestamp).toLocaleDateString()}
                        </Typography>
                        <Typography variant="body2" sx={{ mt: 0.5 }}>
                          {message.content}
                        </Typography>
                      </Box>
                    }
                  />
                  <ListItemSecondaryAction>
                    <IconButton edge="end">
                      <Reply />
                    </IconButton>
                  </ListItemSecondaryAction>
                </ListItem>
              ))}
            </List>
          </TabPanel>

          {/* Announcements Tab */}
          <TabPanel value={activeTab} index={1}>
            <List>
              {mockMessages.filter(m => m.type === 'announcement').map((announcement) => (
                <ListItem key={announcement.id} sx={{ borderBottom: '1px solid', borderColor: 'divider' }}>
                  <ListItemAvatar>
                    <Avatar sx={{ bgcolor: theme.palette.success.main }}>
                      <Announcement />
                    </Avatar>
                  </ListItemAvatar>
                  <ListItemText
                    primary={
                      <Typography variant="subtitle1" fontWeight={600}>
                        {announcement.subject}
                      </Typography>
                    }
                    secondary={
                      <Box>
                        <Typography variant="body2" color="text.secondary">
                          From: {announcement.from} • {new Date(announcement.timestamp).toLocaleDateString()}
                        </Typography>
                        <Typography variant="body2" sx={{ mt: 0.5 }}>
                          {announcement.content}
                        </Typography>
                      </Box>
                    }
                  />
                </ListItem>
              ))}
            </List>
          </TabPanel>

          {/* Feedback Tab */}
          <TabPanel value={activeTab} index={2}>
            <List>
              {mockFeedback.map((feedback) => (
                <ListItem key={feedback.id} sx={{ borderBottom: '1px solid', borderColor: 'divider' }}>
                  <ListItemAvatar>
                    <Avatar sx={{
                      bgcolor: feedback.type === 'positive' ? theme.palette.success.main : theme.palette.warning.main
                    }}>
                      {feedback.type === 'positive' ? <ThumbUp /> : <ThumbDown />}
                    </Avatar>
                  </ListItemAvatar>
                  <ListItemText
                    primary={
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Typography variant="subtitle1" fontWeight={600}>
                          {feedback.from}
                        </Typography>
                        <Chip
                          label={feedback.category}
                          size="small"
                          variant="outlined"
                          color={feedback.type === 'positive' ? 'success' : 'warning'}
                        />
                      </Box>
                    }
                    secondary={
                      <Box>
                        <Typography variant="body2" color="text.secondary">
                          {new Date(feedback.timestamp).toLocaleDateString()}
                        </Typography>
                        <Typography variant="body2" sx={{ mt: 0.5 }}>
                          {feedback.content}
                        </Typography>
                      </Box>
                    }
                  />
                </ListItem>
              ))}
            </List>
          </TabPanel>
        </CardContent>
      </Card>

      {/* Send Message Dialog */}
      <Dialog open={messageDialog} onClose={() => setMessageDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Send Message</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Subject"
            fullWidth
            variant="outlined"
            sx={{ mb: 2 }}
          />
          <TextField
            margin="dense"
            label="Message"
            fullWidth
            multiline
            rows={4}
            variant="outlined"
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setMessageDialog(false)}>Cancel</Button>
          <Button onClick={() => setMessageDialog(false)} variant="contained">
            Send
          </Button>
        </DialogActions>
      </Dialog>

      {/* Give Feedback Dialog */}
      <Dialog open={feedbackDialog} onClose={() => setFeedbackDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Give Feedback</DialogTitle>
        <DialogContent>
          <TextField
            select
            margin="dense"
            label="Feedback Type"
            fullWidth
            variant="outlined"
            sx={{ mb: 2 }}
            SelectProps={{
              native: true,
            }}
          >
            <option value="positive">Positive Feedback</option>
            <option value="constructive">Constructive Feedback</option>
          </TextField>
          <TextField
            select
            margin="dense"
            label="Category"
            fullWidth
            variant="outlined"
            sx={{ mb: 2 }}
            SelectProps={{
              native: true,
            }}
          >
            <option value="performance">Performance</option>
            <option value="communication">Communication</option>
            <option value="teamwork">Teamwork</option>
            <option value="leadership">Leadership</option>
          </TextField>
          <TextField
            margin="dense"
            label="Feedback"
            fullWidth
            multiline
            rows={4}
            variant="outlined"
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setFeedbackDialog(false)}>Cancel</Button>
          <Button onClick={() => setFeedbackDialog(false)} variant="contained">
            Submit Feedback
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default CommunicationTab;