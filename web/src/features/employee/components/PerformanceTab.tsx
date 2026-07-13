/* eslint-disable react/prop-types */
import React, { useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Grid,
  Chip,
  LinearProgress,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Rating,
  Tabs,
  Tab,
  Avatar,
  IconButton,
  Tooltip,
  useTheme,
  alpha,
  Divider,
} from '@mui/material';
import {
  TrendingUp,
  TrendingDown,
  Star,
  Flag,
  Timeline,
  Add,
  Edit,
  CheckCircle,
  RadioButtonUnchecked,
  Schedule,
  Assessment,
  Comment,
} from '@mui/icons-material';
import { PerformanceReview, PerformanceGoal, PerformanceMetric, PerformanceDashboard, PerformanceFeedback } from '../types/Employee';
import {
  PerformanceReviewList,
  PerformanceReviewDetail,
  GoalManagement,
  PerformanceFeedback as PerformanceFeedbackComponent
} from './performance';

interface PerformanceTabProps {
  employeeId: string;
  performanceData?: PerformanceDashboard;
  onAddReview?: () => void;
  onEditReview?: (review: PerformanceReview) => void;
  onAddGoal?: () => void;
  onEditGoal?: (goal: PerformanceGoal) => void;
  onUpdateGoalProgress?: (goalId: string, progress: number) => void;
  employeeName?: string;
}

// Mock data for demonstration
const mockPerformanceData: PerformanceDashboard = {
  employeeId: '1',
  overallScore: 4.2,
  reviewCount: 3,
  lastReviewDate: '2024-01-15',
  nextReviewDate: '2024-07-15',
  activeGoals: 4,
  completedGoals: 2,
  metrics: [
    {
      id: '1',
      employeeId: '1',
      metricType: 'productivity',
      name: 'Tasks Completed',
      value: 95,
      target: 100,
      unit: '%',
      period: { startDate: '2024-01-01', endDate: '2024-01-31' },
      trend: 'improving',
      createdAt: '2024-01-31'
    },
    {
      id: '2',
      employeeId: '1',
      metricType: 'quality',
      name: 'Code Quality Score',
      value: 88,
      target: 90,
      unit: '/100',
      period: { startDate: '2024-01-01', endDate: '2024-01-31' },
      trend: 'stable',
      createdAt: '2024-01-31'
    }
  ],
  recentReviews: [
    {
      id: '1',
      employeeId: '1',
      reviewPeriod: { startDate: '2023-07-01', endDate: '2024-01-15' },
      reviewerId: 'manager1',
      reviewerName: 'Sarah Johnson',
      overallRating: 4.5,
      categories: [
        { id: '1', name: 'Technical Skills', rating: 4.5, weight: 30, comments: 'Excellent technical proficiency' },
        { id: '2', name: 'Communication', rating: 4.0, weight: 20, comments: 'Good communication skills' },
        { id: '3', name: 'Leadership', rating: 4.2, weight: 25, comments: 'Shows leadership potential' },
        { id: '4', name: 'Problem Solving', rating: 4.8, weight: 25, comments: 'Exceptional problem-solving abilities' }
      ],
      strengths: ['Technical expertise', 'Problem-solving skills', 'Team collaboration'],
      areasForImprovement: ['Public speaking', 'Project management'],
      goals: [],
      comments: 'Outstanding performance this quarter. John has consistently exceeded expectations.',
      status: 'approved',
      createdAt: '2024-01-15',
      updatedAt: '2024-01-15'
    }
  ],
  goalProgress: {
    total: 6,
    completed: 2,
    inProgress: 3,
    overdue: 1
  }
};

const PerformanceTab: React.FC<PerformanceTabProps> = ({
  employeeId,
  performanceData = mockPerformanceData,
  onAddReview,
  onEditReview,
  onAddGoal,
  onEditGoal,
  onUpdateGoalProgress,
}) => {
  const theme = useTheme();
  const [activeTab, setActiveTab] = useState(0);
  const [selectedReview, setSelectedReview] = useState<PerformanceReview | null>(null);

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

  const getTrendIcon = (trend: PerformanceMetric['trend']) => {
    switch (trend) {
      case 'improving': return <TrendingUp sx={{ color: theme.palette.success.main }} />;
      case 'declining': return <TrendingDown sx={{ color: theme.palette.error.main }} />;
      default: return <Timeline sx={{ color: theme.palette.grey[500] }} />;
    }
  };

  return (
    <Box>
      {/* Performance Overview Cards */}
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
                  Overall Score
                </Typography>
                <Star sx={{ color: theme.palette.primary.main, fontSize: 28 }} />
              </Box>
              <Typography variant="h3" sx={{ fontWeight: 800, color: theme.palette.primary.main, mb: 1 }}>
                {performanceData.overallScore.toFixed(1)}
              </Typography>
              <Rating value={performanceData.overallScore} readOnly precision={0.1} size="small" />
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
                  Reviews
                </Typography>
                <Assessment sx={{ color: theme.palette.success.main, fontSize: 28 }} />
              </Box>
              <Typography variant="h3" sx={{ fontWeight: 800, color: theme.palette.success.main, mb: 1 }}>
                {performanceData.reviewCount}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Total reviews completed
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
                  Active Goals
                </Typography>
                <Flag sx={{ color: theme.palette.info.main, fontSize: 28 }} />
              </Box>
              <Typography variant="h3" sx={{ fontWeight: 800, color: theme.palette.info.main, mb: 1 }}>
                {performanceData.activeGoals}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Goals in progress
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
                  Goal Progress
                </Typography>
                <CheckCircle sx={{ color: theme.palette.warning.main, fontSize: 28 }} />
              </Box>
              <Typography variant="h3" sx={{ fontWeight: 800, color: theme.palette.warning.main, mb: 1 }}>
                {Math.round((performanceData.goalProgress.completed / performanceData.goalProgress.total) * 100)}%
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {performanceData.goalProgress.completed} of {performanceData.goalProgress.total} completed
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Performance Tabs */}
      <Card sx={{ borderRadius: 3, overflow: 'hidden' }}>
        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tabs value={activeTab} onChange={(_, newValue) => setActiveTab(newValue)}>
            <Tab label="Reviews" />
            <Tab label="Goals" />
            <Tab label="Feedback" />
          </Tabs>
        </Box>

        <CardContent sx={{ p: 0 }}>
          {/* Reviews Tab */}
          {activeTab === 0 && (
            <PerformanceReviewList
              employeeId={employeeId}
              reviews={performanceData?.recentReviews || []}
              onAddReview={onAddReview}
              onEditReview={onEditReview}
            />
          )}

          {/* Goals Tab */}
          {activeTab === 1 && (
            <GoalManagement
              employeeId={employeeId}
              goals={[]} // TODO: Add goals from performanceData
            />
          )}

          {/* Feedback Tab */}
          {activeTab === 2 && (
            <PerformanceFeedbackComponent
              employeeId={employeeId}
              feedbacks={[]} // TODO: Add feedbacks from performanceData
              currentUserId="current-user"
              currentUserName="Current User"
            />
          )}
        </CardContent>
      </Card>
    </Box>
  );
};

export default PerformanceTab;