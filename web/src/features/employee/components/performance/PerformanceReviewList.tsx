/* eslint-disable react/prop-types */
import React, { useState, useMemo } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Grid,
  Chip,
  Button,
  IconButton,
  Menu,
  MenuItem,
  TextField,
  FormControl,
  InputLabel,
  Select,
  Rating,
  Avatar,
  useTheme,
  alpha,
  InputAdornment,
  Divider,
  Badge,
  Tooltip,
} from '@mui/material';
import {
  Timeline,
  TimelineItem,
  TimelineSeparator,
  TimelineConnector,
  TimelineContent,
  TimelineDot,
  TimelineOppositeContent,
} from '@mui/lab';
import {
  Add,
  Search,
  FilterList,
  MoreVert,
  Edit,
  Visibility,
  CheckCircle,
  Schedule,
  Cancel,
  Assessment,
  Person,
  CalendarToday,
  TrendingUp,
  TrendingDown,
  Timeline as TimelineIcon,
} from '@mui/icons-material';
import { PerformanceReview } from '../../types/Employee';

interface PerformanceReviewListProps {
  employeeId: string;
  reviews: PerformanceReview[];
  onAddReview?: () => void;
  onEditReview?: (review: PerformanceReview) => void;
  onViewReview?: (review: PerformanceReview) => void;
  onApproveReview?: (review: PerformanceReview) => void;
  onRejectReview?: (review: PerformanceReview) => void;
  loading?: boolean;
}

type SortField = 'createdAt' | 'overallRating' | 'status' | 'reviewPeriod.startDate';
type SortDirection = 'asc' | 'desc';
type FilterStatus = 'all' | PerformanceReview['status'];

const PerformanceReviewList: React.FC<PerformanceReviewListProps> = ({
  employeeId,
  reviews,
  onAddReview,
  onEditReview,
  onViewReview,
  onApproveReview,
  onRejectReview,
  loading = false,
}) => {
  const theme = useTheme();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<FilterStatus>('all');
  const [sortField, setSortField] = useState<SortField>('createdAt');
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');
  const [viewMode, setViewMode] = useState<'timeline' | 'grid'>('timeline');
  const [menuAnchor, setMenuAnchor] = useState<null | HTMLElement>(null);
  const [selectedReview, setSelectedReview] = useState<PerformanceReview | null>(null);

  const getStatusColor = (status: PerformanceReview['status']) => {
    switch (status) {
      case 'approved': return theme.palette.success.main;
      case 'submitted': return theme.palette.info.main;
      case 'rejected': return theme.palette.error.main;
      case 'draft': return theme.palette.grey[500];
      default: return theme.palette.grey[500];
    }
  };

  const getStatusIcon = (status: PerformanceReview['status']) => {
    switch (status) {
      case 'approved': return <CheckCircle />;
      case 'submitted': return <Schedule />;
      case 'rejected': return <Cancel />;
      case 'draft': return <Edit />;
      default: return <Assessment />;
    }
  };

  const getRatingColor = (rating: number) => {
    if (rating >= 4.5) return theme.palette.success.main;
    if (rating >= 3.5) return theme.palette.warning.main;
    return theme.palette.error.main;
  };

  const filteredAndSortedReviews = useMemo(() => {
    let filtered = reviews.filter(review => {
      const matchesSearch = searchTerm === '' ||
        review.reviewerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        review.comments.toLowerCase().includes(searchTerm.toLowerCase()) ||
        review.strengths.some(strength => strength.toLowerCase().includes(searchTerm.toLowerCase())) ||
        review.areasForImprovement.some(area => area.toLowerCase().includes(searchTerm.toLowerCase()));

      const matchesStatus = statusFilter === 'all' || review.status === statusFilter;

      return matchesSearch && matchesStatus;
    });

    filtered.sort((a, b) => {
      let aValue: any, bValue: any;

      switch (sortField) {
        case 'createdAt':
          aValue = new Date(a.createdAt).getTime();
          bValue = new Date(b.createdAt).getTime();
          break;
        case 'overallRating':
          aValue = a.overallRating;
          bValue = b.overallRating;
          break;
        case 'status':
          aValue = a.status;
          bValue = b.status;
          break;
        case 'reviewPeriod.startDate':
          aValue = new Date(a.reviewPeriod.startDate).getTime();
          bValue = new Date(b.reviewPeriod.startDate).getTime();
          break;
        default:
          return 0;
      }

      if (sortDirection === 'asc') {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });

    return filtered;
  }, [reviews, searchTerm, statusFilter, sortField, sortDirection]);

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>, review: PerformanceReview) => {
    setMenuAnchor(event.currentTarget);
    setSelectedReview(review);
  };

  const handleMenuClose = () => {
    setMenuAnchor(null);
    setSelectedReview(null);
  };

  const handleAction = (action: string) => {
    if (!selectedReview) return;

    switch (action) {
      case 'view':
        onViewReview?.(selectedReview);
        break;
      case 'edit':
        onEditReview?.(selectedReview);
        break;
      case 'approve':
        onApproveReview?.(selectedReview);
        break;
      case 'reject':
        onRejectReview?.(selectedReview);
        break;
    }
    handleMenuClose();
  };

  const ReviewCard: React.FC<{ review: PerformanceReview }> = ({ review }) => (
    <Card sx={{ borderRadius: 2, mb: 2, border: `1px solid ${alpha(theme.palette.divider, 0.5)}` }}>
      <CardContent sx={{ p: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', mb: 2 }}>
          <Box sx={{ flex: 1 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 1 }}>
              <Avatar sx={{ width: 32, height: 32, bgcolor: alpha(theme.palette.primary.main, 0.1) }}>
                <Person sx={{ fontSize: 16, color: theme.palette.primary.main }} />
              </Avatar>
              <Box>
                <Typography variant="h6" sx={{ fontWeight: 600, fontSize: '1rem' }}>
                  Review Period: {new Date(review.reviewPeriod.startDate).toLocaleDateString()} - {new Date(review.reviewPeriod.endDate).toLocaleDateString()}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Reviewed by: {review.reviewerName}
                </Typography>
              </Box>
            </Box>
          </Box>
          <Box sx={{ textAlign: 'right' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
              <Rating value={review.overallRating} readOnly precision={0.1} size="small" />
              <Typography variant="body2" sx={{ fontWeight: 600, color: getRatingColor(review.overallRating) }}>
                {review.overallRating}/5.0
              </Typography>
            </Box>
            <Chip
              label={review.status}
              size="small"
              sx={{
                backgroundColor: alpha(getStatusColor(review.status), 0.1),
                color: getStatusColor(review.status),
                textTransform: 'capitalize'
              }}
              icon={getStatusIcon(review.status)}
            />
          </Box>
        </Box>

        <Grid container spacing={2}>
          {review.categories.slice(0, 3).map((category) => (
            <Grid size={{ xs: 12, sm: 4 }} key={category.id}>
              <Box sx={{ p: 2, borderRadius: 1, backgroundColor: alpha(theme.palette.grey[100], 0.5) }}>
                <Typography variant="body2" sx={{ fontWeight: 600, mb: 1 }}>
                  {category.name}
                </Typography>
                <Rating value={category.rating} readOnly size="small" />
                <Typography variant="caption" color="text.secondary">
                  {category.rating}/5.0
                </Typography>
              </Box>
            </Grid>
          ))}
        </Grid>

        <Box sx={{ mt: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="caption" color="text.secondary">
            Created: {new Date(review.createdAt).toLocaleDateString()}
          </Typography>
          <Box>
            <Button
              size="small"
              startIcon={<Visibility />}
              onClick={() => onViewReview?.(review)}
              sx={{ mr: 1 }}
            >
              View
            </Button>
            <IconButton
              size="small"
              onClick={(e) => handleMenuOpen(e, review)}
            >
              <MoreVert />
            </IconButton>
          </Box>
        </Box>
      </CardContent>
    </Card>
  );

  return (
    <Box>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h5" sx={{ fontWeight: 700 }}>
          Performance Reviews
        </Typography>
        <Button
          variant="contained"
          startIcon={<Add />}
          onClick={onAddReview}
          sx={{
            background: `linear-gradient(135deg, ${theme.palette.primary.main}, ${alpha(theme.palette.primary.main, 0.8)})`,
            '&:hover': {
              background: `linear-gradient(135deg, ${theme.palette.primary.dark}, ${alpha(theme.palette.primary.dark, 0.8)})`
            }
          }}
        >
          Add Review
        </Button>
      </Box>

      {/* Filters and Search */}
      <Card sx={{ borderRadius: 2, mb: 3 }}>
        <CardContent sx={{ p: 3 }}>
          <Grid container spacing={2} alignItems="center">
            <Grid size={{ xs: 12, md: 4 }}>
              <TextField
                fullWidth
                placeholder="Search reviews..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Search />
                    </InputAdornment>
                  ),
                }}
                size="small"
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
              <FormControl fullWidth size="small">
                <InputLabel>Status</InputLabel>
                <Select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value as FilterStatus)}
                >
                  <MenuItem value="all">All Status</MenuItem>
                  <MenuItem value="draft">Draft</MenuItem>
                  <MenuItem value="submitted">Submitted</MenuItem>
                  <MenuItem value="approved">Approved</MenuItem>
                  <MenuItem value="rejected">Rejected</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
              <FormControl fullWidth size="small">
                <InputLabel>Sort By</InputLabel>
                <Select
                  value={`${sortField}-${sortDirection}`}
                  onChange={(e) => {
                    const [field, direction] = e.target.value.split('-');
                    setSortField(field as SortField);
                    setSortDirection(direction as SortDirection);
                  }}
                >
                  <MenuItem value="createdAt-desc">Newest First</MenuItem>
                  <MenuItem value="createdAt-asc">Oldest First</MenuItem>
                  <MenuItem value="overallRating-desc">Highest Rating</MenuItem>
                  <MenuItem value="overallRating-asc">Lowest Rating</MenuItem>
                  <MenuItem value="reviewPeriod.startDate-desc">Latest Period</MenuItem>
                  <MenuItem value="reviewPeriod.startDate-asc">Earliest Period</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid size={{ xs: 12, md: 2 }}>
              <Box sx={{ display: 'flex', gap: 1 }}>
                <Button
                  variant={viewMode === 'timeline' ? 'contained' : 'outlined'}
                  size="small"
                  startIcon={<TimelineIcon />}
                  onClick={() => setViewMode('timeline')}
                  fullWidth
                >
                  Timeline
                </Button>
                <Button
                  variant={viewMode === 'grid' ? 'contained' : 'outlined'}
                  size="small"
                  startIcon={<Assessment />}
                  onClick={() => setViewMode('grid')}
                  fullWidth
                >
                  Grid
                </Button>
              </Box>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Reviews Display */}
      {loading ? (
        <Box sx={{ textAlign: 'center', py: 4 }}>
          <Typography>Loading reviews...</Typography>
        </Box>
      ) : filteredAndSortedReviews.length === 0 ? (
        <Box sx={{ textAlign: 'center', py: 8 }}>
          <Assessment sx={{ fontSize: 64, color: theme.palette.grey[300], mb: 2 }} />
          <Typography variant="h6" color="text.secondary" sx={{ mb: 2 }}>
            No performance reviews found
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            {searchTerm || statusFilter !== 'all' ? 'Try adjusting your filters' : 'Start by adding the first performance review'}
          </Typography>
          <Button
            variant="contained"
            startIcon={<Add />}
            onClick={onAddReview}
          >
            Add First Review
          </Button>
        </Box>
      ) : viewMode === 'timeline' ? (
        <Timeline sx={{ p: 0 }}>
          {filteredAndSortedReviews.map((review, index) => (
            <TimelineItem key={review.id}>
              <TimelineOppositeContent sx={{ flex: 0.2, pt: 0 }}>
                <Typography variant="body2" color="text.secondary">
                  {new Date(review.createdAt).toLocaleDateString()}
                </Typography>
              </TimelineOppositeContent>
              <TimelineSeparator>
                <TimelineDot
                  sx={{
                    bgcolor: getStatusColor(review.status),
                    boxShadow: `0 0 0 4px ${alpha(getStatusColor(review.status), 0.1)}`
                  }}
                >
                  {getStatusIcon(review.status)}
                </TimelineDot>
                {index < filteredAndSortedReviews.length - 1 && <TimelineConnector />}
              </TimelineSeparator>
              <TimelineContent sx={{ pt: 0, pb: 4 }}>
                <ReviewCard review={review} />
              </TimelineContent>
            </TimelineItem>
          ))}
        </Timeline>
      ) : (
        <Grid container spacing={2}>
          {filteredAndSortedReviews.map((review) => (
            <Grid size={{ xs: 12, md: 6 }} key={review.id}>
              <ReviewCard review={review} />
            </Grid>
          ))}
        </Grid>
      )}

      {/* Context Menu */}
      <Menu
        anchorEl={menuAnchor}
        open={Boolean(menuAnchor)}
        onClose={handleMenuClose}
      >
        <MenuItem onClick={() => handleAction('view')}>
          <Visibility sx={{ mr: 1 }} />
          View Details
        </MenuItem>
        <MenuItem onClick={() => handleAction('edit')}>
          <Edit sx={{ mr: 1 }} />
          Edit Review
        </MenuItem>
        {selectedReview?.status === 'submitted' && (
          <>
            <Divider />
            <MenuItem onClick={() => handleAction('approve')}>
              <CheckCircle sx={{ mr: 1, color: theme.palette.success.main }} />
              Approve
            </MenuItem>
            <MenuItem onClick={() => handleAction('reject')}>
              <Cancel sx={{ mr: 1, color: theme.palette.error.main }} />
              Reject
            </MenuItem>
          </>
        )}
      </Menu>
    </Box>
  );
};

export default PerformanceReviewList;