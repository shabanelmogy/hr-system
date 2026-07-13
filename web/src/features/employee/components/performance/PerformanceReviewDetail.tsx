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
  Rating,
  Avatar,
  Divider,
  LinearProgress,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  useTheme,
  alpha,
  Tabs,
  Tab,
  Paper,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Accordion,
  AccordionSummary,
  AccordionDetails,
} from '@mui/material';
import {
  Edit,
  CheckCircle,
  Cancel,
  Person,
  CalendarToday,
  Assessment,
  Flag,
  Comment,
  ExpandMore,
  TrendingUp,
  TrendingDown,
  Timeline,
  Star,
  ThumbUp,
  ThumbDown,
} from '@mui/icons-material';
import { PerformanceReview, PerformanceCategory, PerformanceGoal, PerformanceFeedback } from '../../types/Employee';

interface PerformanceReviewDetailProps {
  review: PerformanceReview;
  feedbacks?: PerformanceFeedback[];
  onEdit?: (review: PerformanceReview) => void;
  onApprove?: (review: PerformanceReview) => void;
  onReject?: (review: PerformanceReview, reason: string) => void;
  onClose?: () => void;
  loading?: boolean;
}

const PerformanceReviewDetail: React.FC<PerformanceReviewDetailProps> = ({
  review,
  feedbacks = [],
  onEdit,
  onApprove,
  onReject,
  onClose,
  loading = false,
}) => {
  const theme = useTheme();
  const [activeTab, setActiveTab] = useState(0);
  const [rejectDialogOpen, setRejectDialogOpen] = useState(false);
  const [rejectReason, setRejectReason] = useState('');

  const getStatusColor = (status: PerformanceReview['status']) => {
    switch (status) {
      case 'approved': return theme.palette.success.main;
      case 'submitted': return theme.palette.info.main;
      case 'rejected': return theme.palette.error.main;
      case 'draft': return theme.palette.grey[500];
      default: return theme.palette.grey[500];
    }
  };

  const getRatingColor = (rating: number) => {
    if (rating >= 4.5) return theme.palette.success.main;
    if (rating >= 3.5) return theme.palette.warning.main;
    return theme.palette.error.main;
  };

  const getGoalStatusColor = (status: PerformanceGoal['status']) => {
    switch (status) {
      case 'completed': return theme.palette.success.main;
      case 'in-progress': return theme.palette.info.main;
      case 'not-started': return theme.palette.grey[500];
      case 'cancelled': return theme.palette.error.main;
      default: return theme.palette.grey[500];
    }
  };

  const calculateWeightedRating = () => {
    if (!review.categories?.length) return 0;
    const weightedSum = review.categories.reduce((sum, cat) => sum + (cat.rating * cat.weight), 0);
    const totalWeight = review.categories.reduce((sum, cat) => sum + cat.weight, 0);
    return totalWeight > 0 ? weightedSum / totalWeight : 0;
  };

  const handleReject = () => {
    if (rejectReason.trim()) {
      onReject?.(review, rejectReason);
      setRejectDialogOpen(false);
      setRejectReason('');
    }
  };

  const CategoryBreakdown: React.FC<{ categories: PerformanceCategory[] }> = ({ categories }) => (
    <Grid container spacing={2}>
      {categories.map((category) => (
        <Grid size={{ xs: 12, md: 6 }} key={category.id}>
          <Card sx={{ borderRadius: 2, border: `1px solid ${alpha(theme.palette.divider, 0.5)}` }}>
            <CardContent sx={{ p: 3 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="h6" sx={{ fontWeight: 600 }}>
                  {category.name}
                </Typography>
                <Chip
                  label={`${category.weight}%`}
                  size="small"
                  sx={{ backgroundColor: alpha(theme.palette.primary.main, 0.1), color: theme.palette.primary.main }}
                />
              </Box>

              <Box sx={{ mb: 2 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                  <Rating value={category.rating} readOnly precision={0.5} size="small" />
                  <Typography variant="body2" sx={{ fontWeight: 600 }}>
                    {category.rating}/5.0
                  </Typography>
                </Box>
                <LinearProgress
                  variant="determinate"
                  value={(category.rating / 5) * 100}
                  sx={{
                    height: 6,
                    borderRadius: 3,
                    backgroundColor: alpha(theme.palette.grey[300], 0.3),
                    '& .MuiLinearProgress-bar': {
                      borderRadius: 3,
                      backgroundColor: getRatingColor(category.rating)
                    }
                  }}
                />
              </Box>

              {category.comments && (
                <Typography variant="body2" color="text.secondary" sx={{ fontStyle: 'italic' }}>
                  "{category.comments}"
                </Typography>
              )}
            </CardContent>
          </Card>
        </Grid>
      ))}
    </Grid>
  );

  const GoalsProgress: React.FC<{ goals: PerformanceGoal[] }> = ({ goals }) => (
    <Box>
      {goals.length === 0 ? (
        <Box sx={{ textAlign: 'center', py: 4 }}>
          <Flag sx={{ fontSize: 48, color: theme.palette.grey[300], mb: 2 }} />
          <Typography variant="body1" color="text.secondary">
            No goals were set for this review period
          </Typography>
        </Box>
      ) : (
        <Grid container spacing={2}>
          {goals.map((goal) => (
            <Grid size={{ xs: 12, md: 6 }} key={goal.id}>
              <Card sx={{ borderRadius: 2, border: `1px solid ${alpha(theme.palette.divider, 0.5)}` }}>
                <CardContent sx={{ p: 3 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', mb: 2 }}>
                    <Box sx={{ flex: 1 }}>
                      <Typography variant="h6" sx={{ fontWeight: 600, mb: 1 }}>
                        {goal.title}
                      </Typography>
                      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                        {goal.description}
                      </Typography>
                    </Box>
                    <Chip
                      label={goal.status.replace('-', ' ')}
                      size="small"
                      sx={{
                        backgroundColor: alpha(getGoalStatusColor(goal.status), 0.1),
                        color: getGoalStatusColor(goal.status),
                        textTransform: 'capitalize'
                      }}
                    />
                  </Box>

                  <Box sx={{ mb: 2 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                      <Typography variant="body2" sx={{ fontWeight: 500 }}>
                        Progress
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {goal.progress}%
                      </Typography>
                    </Box>
                    <LinearProgress
                      variant="determinate"
                      value={goal.progress}
                      sx={{
                        height: 8,
                        borderRadius: 4,
                        backgroundColor: alpha(theme.palette.grey[300], 0.3),
                        '& .MuiLinearProgress-bar': {
                          borderRadius: 4,
                          backgroundColor: getGoalStatusColor(goal.status)
                        }
                      }}
                    />
                  </Box>

                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Box>
                      <Typography variant="caption" color="text.secondary">
                        Priority: <Chip label={goal.priority} size="small" variant="outlined" />
                      </Typography>
                      <Typography variant="caption" sx={{ display: 'block', mt: 0.5 }}>
                        Due: {new Date(goal.targetDate).toLocaleDateString()}
                      </Typography>
                    </Box>
                    {goal.milestones && goal.milestones.length > 0 && (
                      <Typography variant="caption" color="text.secondary">
                        {goal.milestones.filter(m => m.status === 'completed').length}/{goal.milestones.length} milestones
                      </Typography>
                    )}
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}
    </Box>
  );

  const FeedbackSection: React.FC<{ feedbacks: PerformanceFeedback[] }> = ({ feedbacks }) => (
    <Box>
      {feedbacks.length === 0 ? (
        <Box sx={{ textAlign: 'center', py: 4 }}>
          <Comment sx={{ fontSize: 48, color: theme.palette.grey[300], mb: 2 }} />
          <Typography variant="body1" color="text.secondary">
            No additional feedback provided
          </Typography>
        </Box>
      ) : (
        <List>
          {feedbacks.map((feedback) => (
            <ListItem key={feedback.id} sx={{ px: 0 }}>
              <ListItemAvatar>
                <Avatar sx={{ bgcolor: alpha(theme.palette.secondary.main, 0.1) }}>
                  <Person sx={{ color: theme.palette.secondary.main }} />
                </Avatar>
              </ListItemAvatar>
              <ListItemText
                primary={
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                    <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                      {feedback.reviewerName}
                    </Typography>
                    <Chip
                      label={feedback.type}
                      size="small"
                      variant="outlined"
                      sx={{ textTransform: 'capitalize' }}
                    />
                    {feedback.anonymous && (
                      <Chip label="Anonymous" size="small" variant="outlined" />
                    )}
                  </Box>
                }
                secondary={
                  <Box>
                    {feedback.rating && (
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                        <Rating value={feedback.rating} readOnly size="small" />
                        <Typography variant="body2">
                          {feedback.rating}/5.0
                        </Typography>
                      </Box>
                    )}
                    <Typography variant="body2" sx={{ mb: 1 }}>
                      {feedback.comments}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {new Date(feedback.createdAt).toLocaleDateString()}
                    </Typography>
                  </Box>
                }
              />
            </ListItem>
          ))}
        </List>
      )}
    </Box>
  );

  return (
    <Box>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', mb: 3 }}>
          <Box>
            <Typography variant="h4" sx={{ fontWeight: 700, mb: 1 }}>
              Performance Review Details
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Review Period: {new Date(review.reviewPeriod.startDate).toLocaleDateString()} - {new Date(review.reviewPeriod.endDate).toLocaleDateString()}
            </Typography>
          </Box>
          <Box sx={{ display: 'flex', gap: 2 }}>
            {onClose && (
              <Button variant="outlined" onClick={onClose}>
                Close
              </Button>
            )}
            {review.status === 'draft' && onEdit && (
              <Button
                variant="contained"
                startIcon={<Edit />}
                onClick={() => onEdit(review)}
                sx={{
                  background: `linear-gradient(135deg, ${theme.palette.primary.main}, ${alpha(theme.palette.primary.main, 0.8)})`,
                  '&:hover': {
                    background: `linear-gradient(135deg, ${theme.palette.primary.dark}, ${alpha(theme.palette.primary.dark, 0.8)})`
                  }
                }}
              >
                Edit Review
              </Button>
            )}
            {review.status === 'submitted' && (
              <>
                <Button
                  variant="outlined"
                  startIcon={<Cancel />}
                  color="error"
                  onClick={() => setRejectDialogOpen(true)}
                >
                  Reject
                </Button>
                <Button
                  variant="contained"
                  startIcon={<CheckCircle />}
                  color="success"
                  onClick={() => onApprove?.(review)}
                  sx={{
                    background: `linear-gradient(135deg, ${theme.palette.success.main}, ${alpha(theme.palette.success.main, 0.8)})`,
                    '&:hover': {
                      background: `linear-gradient(135deg, ${theme.palette.success.dark}, ${alpha(theme.palette.success.dark, 0.8)})`
                    }
                  }}
                >
                  Approve
                </Button>
              </>
            )}
          </Box>
        </Box>

        {/* Status and Overall Rating */}
        <Grid container spacing={3}>
          <Grid size={{ xs: 12, md: 6 }}>
            <Card sx={{ borderRadius: 2, backgroundColor: alpha(theme.palette.primary.main, 0.05) }}>
              <CardContent sx={{ p: 3 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                  <Avatar sx={{ bgcolor: theme.palette.primary.main }}>
                    <Person />
                  </Avatar>
                  <Box>
                    <Typography variant="h6" sx={{ fontWeight: 600 }}>
                      {review.reviewerName}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Reviewer
                    </Typography>
                  </Box>
                </Box>
                <Chip
                  label={review.status}
                  sx={{
                    backgroundColor: alpha(getStatusColor(review.status), 0.1),
                    color: getStatusColor(review.status),
                    textTransform: 'capitalize'
                  }}
                />
              </CardContent>
            </Card>
          </Grid>
          <Grid size={{ xs: 12, md: 6 }}>
            <Card sx={{ borderRadius: 2, backgroundColor: alpha(theme.palette.secondary.main, 0.05) }}>
              <CardContent sx={{ p: 3 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
                  <Typography variant="h6" sx={{ fontWeight: 600 }}>
                    Overall Rating
                  </Typography>
                  <Star sx={{ color: theme.palette.secondary.main, fontSize: 28 }} />
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 1 }}>
                  <Rating value={review.overallRating} readOnly precision={0.1} size="large" />
                  <Typography variant="h4" sx={{ fontWeight: 700, color: getRatingColor(review.overallRating) }}>
                    {review.overallRating}/5.0
                  </Typography>
                </Box>
                <Typography variant="body2" color="text.secondary">
                  Calculated: {calculateWeightedRating().toFixed(1)}/5.0
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Box>

      {/* Tabs */}
      <Card sx={{ borderRadius: 2 }}>
        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tabs value={activeTab} onChange={(_, newValue) => setActiveTab(newValue)}>
            <Tab label="Categories" />
            <Tab label="Goals" />
            <Tab label="Feedback" />
            <Tab label="Comments" />
          </Tabs>
        </Box>

        <CardContent sx={{ p: 0 }}>
          {/* Categories Tab */}
          {activeTab === 0 && (
            <Box sx={{ p: 3 }}>
              <Typography variant="h6" sx={{ fontWeight: 600, mb: 3 }}>
                Performance Categories
              </Typography>
              <CategoryBreakdown categories={review.categories} />
            </Box>
          )}

          {/* Goals Tab */}
          {activeTab === 1 && (
            <Box sx={{ p: 3 }}>
              <Typography variant="h6" sx={{ fontWeight: 600, mb: 3 }}>
                Performance Goals
              </Typography>
              <GoalsProgress goals={review.goals} />
            </Box>
          )}

          {/* Feedback Tab */}
          {activeTab === 2 && (
            <Box sx={{ p: 3 }}>
              <Typography variant="h6" sx={{ fontWeight: 600, mb: 3 }}>
                Additional Feedback
              </Typography>
              <FeedbackSection feedbacks={feedbacks} />
            </Box>
          )}

          {/* Comments Tab */}
          {activeTab === 3 && (
            <Box sx={{ p: 3 }}>
              <Typography variant="h6" sx={{ fontWeight: 600, mb: 3 }}>
                Review Comments
              </Typography>

              {/* Strengths */}
              {review.strengths.length > 0 && (
                <Box sx={{ mb: 3 }}>
                  <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 2, color: theme.palette.success.main }}>
                    Strengths
                  </Typography>
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                    {review.strengths.map((strength, index) => (
                      <Chip
                        key={index}
                        label={strength}
                        sx={{
                          backgroundColor: alpha(theme.palette.success.main, 0.1),
                          color: theme.palette.success.main,
                        }}
                      />
                    ))}
                  </Box>
                </Box>
              )}

              {/* Areas for Improvement */}
              {review.areasForImprovement.length > 0 && (
                <Box sx={{ mb: 3 }}>
                  <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 2, color: theme.palette.warning.main }}>
                    Areas for Improvement
                  </Typography>
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                    {review.areasForImprovement.map((area, index) => (
                      <Chip
                        key={index}
                        label={area}
                        sx={{
                          backgroundColor: alpha(theme.palette.warning.main, 0.1),
                          color: theme.palette.warning.main,
                        }}
                      />
                    ))}
                  </Box>
                </Box>
              )}

              {/* Overall Comments */}
              <Box>
                <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 2 }}>
                  Overall Comments
                </Typography>
                <Paper sx={{ p: 2, backgroundColor: alpha(theme.palette.grey[50], 0.5) }}>
                  <Typography variant="body1" sx={{ fontStyle: 'italic' }}>
                    {review.comments || 'No additional comments provided.'}
                  </Typography>
                </Paper>
              </Box>
            </Box>
          )}
        </CardContent>
      </Card>

      {/* Reject Dialog */}
      <Dialog
        open={rejectDialogOpen}
        onClose={() => setRejectDialogOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Reject Performance Review</DialogTitle>
        <DialogContent>
          <Typography variant="body2" sx={{ mb: 2 }}>
            Please provide a reason for rejecting this performance review.
          </Typography>
          <TextField
            fullWidth
            multiline
            rows={4}
            label="Rejection Reason"
            value={rejectReason}
            onChange={(e) => setRejectReason(e.target.value)}
            placeholder="Explain why this review is being rejected..."
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setRejectDialogOpen(false)}>Cancel</Button>
          <Button
            onClick={handleReject}
            color="error"
            variant="contained"
            disabled={!rejectReason.trim()}
          >
            Reject Review
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default PerformanceReviewDetail;