/* eslint-disable react/prop-types */
import React, { useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Grid,
  Chip,
  Button,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Rating,
  Avatar,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  ListItemSecondaryAction,
  Divider,
  FormControlLabel,
  Checkbox,
  useTheme,
  alpha,
  Paper,
  Tabs,
  Tab,
  Accordion,
  AccordionSummary,
  AccordionDetails,
} from '@mui/material';
import {
  Add,
  Send,
  Person,
  Group,
  SupervisorAccount,
  Comment,
  ThumbUp,
  ThumbDown,
  ExpandMore,
  Visibility,
  Edit,
  Delete,
  CheckCircle,
} from '@mui/icons-material';
import type { PerformanceFeedback as PerformanceFeedbackType, PerformanceCategory } from '../../types/Employee';

interface PerformanceFeedbackProps {
  employeeId: string;
  feedbacks: PerformanceFeedbackType[];
  onSubmitFeedback?: (feedback: Partial<PerformanceFeedbackType>) => Promise<void>;
  onUpdateFeedback?: (feedbackId: string, updates: Partial<PerformanceFeedbackType>) => Promise<void>;
  onDeleteFeedback?: (feedbackId: string) => Promise<void>;
  currentUserId?: string;
  currentUserName?: string;
  loading?: boolean;
}

const PerformanceFeedback: React.FC<PerformanceFeedbackProps> = ({
  employeeId,
  feedbacks,
  onSubmitFeedback,
  onUpdateFeedback,
  onDeleteFeedback,
  currentUserId = 'current-user',
  currentUserName = 'Current User',
  loading = false,
}) => {
  const theme = useTheme();
  const [activeTab, setActiveTab] = useState(0);
  const [feedbackDialogOpen, setFeedbackDialogOpen] = useState(false);
  const [feedbackType, setFeedbackType] = useState<PerformanceFeedbackType['type']>('peer');
  const [editingFeedback, setEditingFeedback] = useState<PerformanceFeedbackType | null>(null);

  const getFeedbackTypeColor = (type: PerformanceFeedbackType['type']) => {
    switch (type) {
      case 'self': return theme.palette.primary.main;
      case 'manager': return theme.palette.secondary.main;
      case 'peer': return theme.palette.info.main;
      case 'subordinate': return theme.palette.success.main;
      case '360': return theme.palette.warning.main;
      case 'customer': return theme.palette.error.main;
      default: return theme.palette.grey[500];
    }
  };

  const getFeedbackTypeIcon = (type: PerformanceFeedbackType['type']) => {
    switch (type) {
      case 'self': return <Person />;
      case 'manager': return <SupervisorAccount />;
      case 'peer': return <Group />;
      case 'subordinate': return <ThumbDown />;
      case '360': return <Comment />;
      case 'customer': return <ThumbUp />;
      default: return <Comment />;
    }
  };

  const getStatusColor = (status: PerformanceFeedbackType['status']) => {
    switch (status) {
      case 'approved': return theme.palette.success.main;
      case 'submitted': return theme.palette.info.main;
      case 'draft': return theme.palette.grey[500];
      default: return theme.palette.grey[500];
    }
  };

  const filteredFeedbacks = feedbacks.filter(feedback => {
    if (activeTab === 0) return true; // All
    if (activeTab === 1) return feedback.type === 'self';
    if (activeTab === 2) return feedback.type === 'manager';
    if (activeTab === 3) return feedback.type === 'peer';
    if (activeTab === 4) return feedback.type === '360';
    return true;
  });

  const handleOpenFeedbackDialog = (type: PerformanceFeedbackType['type']) => {
    setFeedbackType(type);
    setEditingFeedback(null);
    setFeedbackDialogOpen(true);
  };

  const handleEditFeedback = (feedback: PerformanceFeedbackType) => {
    setEditingFeedback(feedback);
    setFeedbackType(feedback.type);
    setFeedbackDialogOpen(true);
  };

  const handleSubmitFeedback = async (feedbackData: Partial<PerformanceFeedbackType>) => {
    if (editingFeedback) {
      await onUpdateFeedback?.(editingFeedback.id, feedbackData);
    } else {
      await onSubmitFeedback?.({
        ...feedbackData,
        employeeId,
        reviewerId: currentUserId,
        reviewerName: currentUserName,
        type: feedbackType,
        status: 'submitted',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });
    }
    setFeedbackDialogOpen(false);
    setEditingFeedback(null);
  };

  const handleDeleteFeedback = async (feedbackId: string) => {
    await onDeleteFeedback?.(feedbackId);
  };

  const FeedbackCard: React.FC<{ feedback: PerformanceFeedbackType }> = ({ feedback }) => (
    <Card sx={{ borderRadius: 2, border: `1px solid ${alpha(theme.palette.divider, 0.5)}` }}>
      <CardContent sx={{ p: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', mb: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Avatar sx={{ bgcolor: alpha(getFeedbackTypeColor(feedback.type), 0.1) }}>
              {getFeedbackTypeIcon(feedback.type)}
            </Avatar>
            <Box>
              <Typography variant="h6" sx={{ fontWeight: 600 }}>
                {feedback.reviewerName}
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Chip
                  label={feedback.type}
                  size="small"
                  sx={{
                    backgroundColor: alpha(getFeedbackTypeColor(feedback.type), 0.1),
                    color: getFeedbackTypeColor(feedback.type),
                    textTransform: 'capitalize'
                  }}
                  icon={getFeedbackTypeIcon(feedback.type)}
                />
                {feedback.anonymous && (
                  <Chip label="Anonymous" size="small" variant="outlined" />
                )}
                <Chip
                  label={feedback.status}
                  size="small"
                  sx={{
                    backgroundColor: alpha(getStatusColor(feedback.status), 0.1),
                    color: getStatusColor(feedback.status),
                    textTransform: 'capitalize'
                  }}
                />
              </Box>
            </Box>
          </Box>
          <Box sx={{ display: 'flex', gap: 1 }}>
            {feedback.reviewerId === currentUserId && (
              <>
                <IconButton size="small" onClick={() => handleEditFeedback(feedback)}>
                  <Edit fontSize="small" />
                </IconButton>
                <IconButton size="small" onClick={() => handleDeleteFeedback(feedback.id)} sx={{ color: theme.palette.error.main }}>
                  <Delete fontSize="small" />
                </IconButton>
              </>
            )}
          </Box>
        </Box>

        {feedback.rating && (
          <Box sx={{ mb: 2 }}>
            <Typography variant="body2" sx={{ fontWeight: 500, mb: 1 }}>
              Overall Rating
            </Typography>
            <Rating value={feedback.rating} readOnly precision={0.5} size="small" />
            <Typography variant="caption" color="text.secondary" sx={{ ml: 1 }}>
              {feedback.rating}/5.0
            </Typography>
          </Box>
        )}

        <Typography variant="body1" sx={{ mb: 2 }}>
          {feedback.comments}
        </Typography>

        {feedback.categories && feedback.categories.length > 0 && (
          <Box sx={{ mb: 2 }}>
            <Typography variant="body2" sx={{ fontWeight: 500, mb: 1 }}>
              Category Ratings
            </Typography>
            <Grid container spacing={1}>
              {feedback.categories.map((category) => (
                <Grid size={{ xs: 12, sm: 6 }} key={category.id}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Typography variant="caption">{category.name}</Typography>
                    <Rating value={category.rating} readOnly size="small" />
                  </Box>
                </Grid>
              ))}
            </Grid>
          </Box>
        )}

        <Typography variant="caption" color="text.secondary">
          Submitted on {new Date(feedback.createdAt).toLocaleDateString()}
        </Typography>
      </CardContent>
    </Card>
  );

  return (
    <Box>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Box>
          <Typography variant="h5" sx={{ fontWeight: 700 }}>
            Performance Feedback
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Collect and manage feedback from multiple sources
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Button
            variant="outlined"
            startIcon={<Person />}
            onClick={() => handleOpenFeedbackDialog('self')}
          >
            Self Review
          </Button>
          <Button
            variant="outlined"
            startIcon={<SupervisorAccount />}
            onClick={() => handleOpenFeedbackDialog('manager')}
          >
            Manager Feedback
          </Button>
          <Button
            variant="outlined"
            startIcon={<Group />}
            onClick={() => handleOpenFeedbackDialog('peer')}
          >
            Peer Review
          </Button>
          <Button
            variant="contained"
            startIcon={<Add />}
            onClick={() => handleOpenFeedbackDialog('360')}
            sx={{
              background: `linear-gradient(135deg, ${theme.palette.primary.main}, ${alpha(theme.palette.primary.main, 0.8)})`,
              '&:hover': {
                background: `linear-gradient(135deg, ${theme.palette.primary.dark}, ${alpha(theme.palette.primary.dark, 0.8)})`
              }
            }}
          >
            360° Feedback
          </Button>
        </Box>
      </Box>

      {/* Tabs */}
      <Card sx={{ borderRadius: 2, mb: 3 }}>
        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tabs value={activeTab} onChange={(_, newValue) => setActiveTab(newValue)}>
            <Tab label={`All (${feedbacks.length})`} />
            <Tab label={`Self (${feedbacks.filter(f => f.type === 'self').length})`} />
            <Tab label={`Manager (${feedbacks.filter(f => f.type === 'manager').length})`} />
            <Tab label={`Peer (${feedbacks.filter(f => f.type === 'peer').length})`} />
            <Tab label={`360° (${feedbacks.filter(f => f.type === '360').length})`} />
          </Tabs>
        </Box>
      </Card>

      {/* Feedback List */}
      {filteredFeedbacks.length === 0 ? (
        <Box sx={{ textAlign: 'center', py: 8 }}>
          <Comment sx={{ fontSize: 64, color: theme.palette.grey[300], mb: 2 }} />
          <Typography variant="h6" color="text.secondary" sx={{ mb: 2 }}>
            No feedback available
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            {activeTab === 0 ? 'Start by providing your first feedback' : `No ${activeTab === 1 ? 'self' : activeTab === 2 ? 'manager' : activeTab === 3 ? 'peer' : '360°'} feedback yet`}
          </Typography>
          <Box sx={{ display: 'flex', gap: 1, justifyContent: 'center' }}>
            <Button
              variant="contained"
              startIcon={<Person />}
              onClick={() => handleOpenFeedbackDialog('self')}
            >
              Add Self Review
            </Button>
            <Button
              variant="outlined"
              startIcon={<Group />}
              onClick={() => handleOpenFeedbackDialog('peer')}
            >
              Add Peer Review
            </Button>
          </Box>
        </Box>
      ) : (
        <Grid container spacing={3}>
          {filteredFeedbacks.map((feedback) => (
            <Grid size={{ xs: 12, md: 6 }} key={feedback.id}>
              <FeedbackCard feedback={feedback} />
            </Grid>
          ))}
        </Grid>
      )}

      {/* Feedback Dialog */}
      <Dialog
        open={feedbackDialogOpen}
        onClose={() => {
          setFeedbackDialogOpen(false);
          setEditingFeedback(null);
        }}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          {editingFeedback ? 'Edit Feedback' : `Provide ${feedbackType} Feedback`}
        </DialogTitle>
        <DialogContent>
          <FeedbackForm
            feedback={editingFeedback}
            feedbackType={feedbackType}
            onSubmit={handleSubmitFeedback}
            onCancel={() => {
              setFeedbackDialogOpen(false);
              setEditingFeedback(null);
            }}
          />
        </DialogContent>
      </Dialog>
    </Box>
  );
};

// Feedback Form Component
const FeedbackForm: React.FC<{
  feedback?: PerformanceFeedbackType | null;
  feedbackType: PerformanceFeedbackType['type'];
  onSubmit: (feedback: Partial<PerformanceFeedbackType>) => void;
  onCancel: () => void;
}> = ({ feedback, feedbackType, onSubmit, onCancel }) => {
  const theme = useTheme();
  const [formData, setFormData] = useState<Partial<PerformanceFeedbackType>>({
    rating: 3,
    comments: '',
    anonymous: false,
    categories: [
      { id: '1', name: 'Technical Skills', rating: 3, weight: 25, comments: '' },
      { id: '2', name: 'Communication', rating: 3, weight: 20, comments: '' },
      { id: '3', name: 'Leadership', rating: 3, weight: 20, comments: '' },
      { id: '4', name: 'Teamwork', rating: 3, weight: 20, comments: '' },
      { id: '5', name: 'Problem Solving', rating: 3, weight: 15, comments: '' },
    ],
    ...feedback,
  });

  const handleCategoryChange = (categoryId: string, rating: number) => {
    setFormData(prev => ({
      ...prev,
      categories: prev.categories?.map(cat =>
        cat.id === categoryId ? { ...cat, rating } : cat
      ),
    }));
  };

  const handleSubmit = () => {
    onSubmit(formData);
  };

  const getFeedbackTypeDescription = (type: PerformanceFeedbackType['type']) => {
    switch (type) {
      case 'self':
        return 'Provide honest self-assessment of your performance, strengths, and areas for improvement.';
      case 'manager':
        return 'As a manager, provide constructive feedback on the employee\'s performance and development.';
      case 'peer':
        return 'Share feedback on collaboration, teamwork, and professional interactions.';
      case '360':
        return 'Comprehensive feedback from all sources including managers, peers, subordinates, and others.';
      default:
        return 'Provide feedback on the employee\'s performance.';
    }
  };

  return (
    <Box sx={{ pt: 2 }}>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
        {getFeedbackTypeDescription(feedbackType)}
      </Typography>

      <Grid container spacing={3}>
        {/* Overall Rating */}
        <Grid size={{ xs: 12 }}>
          <Card sx={{ borderRadius: 2, backgroundColor: alpha(theme.palette.primary.main, 0.05) }}>
            <CardContent sx={{ p: 3 }}>
              <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
                Overall Performance Rating
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Rating
                  value={formData.rating || 3}
                  onChange={(_, value) => setFormData(prev => ({ ...prev, rating: value || 3 }))}
                  precision={0.5}
                  size="large"
                />
                <Typography variant="h6" color="primary">
                  {formData.rating}/5.0
                </Typography>
              </Box>
              <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
                1 = Poor, 3 = Satisfactory, 5 = Outstanding
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        {/* Category Ratings */}
        <Grid size={{ xs: 12 }}>
          <Card sx={{ borderRadius: 2 }}>
            <CardContent sx={{ p: 3 }}>
              <Typography variant="h6" sx={{ fontWeight: 600, mb: 3 }}>
                Category Ratings
              </Typography>
              <Grid container spacing={2}>
                {formData.categories?.map((category) => (
                  <Grid size={{ xs: 12, sm: 6 }} key={category.id}>
                    <Box sx={{ p: 2, borderRadius: 1, border: `1px solid ${alpha(theme.palette.divider, 0.5)}` }}>
                      <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>
                        {category.name}
                      </Typography>
                      <Rating
                        value={category.rating}
                        onChange={(_, value) => handleCategoryChange(category.id, value || 3)}
                        precision={0.5}
                        size="small"
                      />
                      <Typography variant="caption" color="text.secondary">
                        {category.rating}/5.0
                      </Typography>
                    </Box>
                  </Grid>
                ))}
              </Grid>
            </CardContent>
          </Card>
        </Grid>

        {/* Comments */}
        <Grid size={{ xs: 12 }}>
          <Card sx={{ borderRadius: 2 }}>
            <CardContent sx={{ p: 3 }}>
              <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
                Detailed Comments
              </Typography>
              <TextField
                fullWidth
                multiline
                rows={6}
                placeholder="Provide detailed feedback, including specific examples of strengths and areas for improvement..."
                value={formData.comments || ''}
                onChange={(e) => setFormData(prev => ({ ...prev, comments: e.target.value }))}
              />
            </CardContent>
          </Card>
        </Grid>

        {/* Anonymous Option */}
        <Grid size={{ xs: 12 }}>
          <FormControlLabel
            control={
              <Checkbox
                checked={formData.anonymous || false}
                onChange={(e) => setFormData(prev => ({ ...prev, anonymous: e.target.checked }))}
              />
            }
            label="Submit anonymously (your identity will be hidden from the recipient)"
          />
        </Grid>
      </Grid>

      <DialogActions sx={{ mt: 3 }}>
        <Button onClick={onCancel}>Cancel</Button>
        <Button
          onClick={handleSubmit}
          variant="contained"
          disabled={!formData.comments?.trim()}
          startIcon={<Send />}
        >
          {feedback ? 'Update Feedback' : 'Submit Feedback'}
        </Button>
      </DialogActions>
    </Box>
  );
};

export default PerformanceFeedback;