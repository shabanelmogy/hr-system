/* eslint-disable react/prop-types */
import { 
  Box, 
  Typography, 
  useTheme, 
  Rating,
  LinearProgress,
  Stack
} from '@mui/material';
import { 
  Star, 
  StarBorder, 
  Favorite, 
  FavoriteBorder,
  ThumbUp,
  ThumbUpOffAlt
} from '@mui/icons-material';
import { formatNumber, formatPercentage } from './chartUtils';
import ChartContainer from './ChartContainer';

const RatingChart = ({
  data = [],
  title,
  subtitle,
  height = 300,
  loading = false,
  error = null,
  gradient = false,
  type = 'stars', // 'stars', 'hearts', 'thumbs'
  showDistribution = true,
  showAverage = true,
  showTotal = true,
  maxRating = 5,
  precision = 0.5,
  size = 'medium',
  onRatingClick = null,
  ...props
}) => {
  const theme = useTheme();

  // Calculate statistics
  const totalRatings = data.reduce((sum, item) => sum + (item.count || 0), 0);
  const weightedSum = data.reduce((sum, item) => sum + (item.rating * (item.count || 0)), 0);
  const averageRating = totalRatings > 0 ? weightedSum / totalRatings : 0;

  // Get icon components based on type
  const getIcons = () => {
    switch (type) {
      case 'hearts':
        return { filled: Favorite, empty: FavoriteBorder };
      case 'thumbs':
        return { filled: ThumbUp, empty: ThumbUpOffAlt };
      case 'stars':
      default:
        return { filled: Star, empty: StarBorder };
    }
  };

  const icons = getIcons();

  // Get color based on rating
  const getRatingColor = (rating) => {
    const percentage = (rating / maxRating) * 100;
    if (percentage >= 80) return theme.palette.success.main;
    if (percentage >= 60) return theme.palette.warning.main;
    if (percentage >= 40) return theme.palette.orange?.main || theme.palette.warning.main;
    return theme.palette.error.main;
  };

  const handleRatingClick = (rating, count) => {
    if (onRatingClick) {
      onRatingClick(rating, count);
    }
  };

  const chartContent = (
    <Box sx={{ p: 3 }}>
      {/* Summary Section */}
      {(showAverage || showTotal) && (
        <Box sx={{ mb: 4, textAlign: 'center' }}>
          {showAverage && (
            <Box sx={{ mb: 2 }}>
              <Typography 
                variant="h3" 
                fontWeight="bold" 
                color={getRatingColor(averageRating)}
                sx={{ mb: 1 }}
              >
                {averageRating.toFixed(1)}
              </Typography>
              
              <Rating
                value={averageRating}
                precision={precision}
                max={maxRating}
                size={size === 'small' ? 'medium' : 'large'}
                icon={<icons.filled fontSize="inherit" />}
                emptyIcon={<icons.empty fontSize="inherit" />}
                readOnly
                sx={{
                  color: getRatingColor(averageRating),
                  mb: 1
                }}
              />
              
              <Typography variant="body2" color="text.secondary">
                Average Rating
              </Typography>
            </Box>
          )}

          {showTotal && (
            <Typography variant="h6" color="text.secondary">
              Based on {formatNumber(totalRatings)} reviews
            </Typography>
          )}
        </Box>
      )}

      {/* Distribution Section */}
      {showDistribution && (
        <Box>
          <Typography variant="h6" gutterBottom color="primary.main" fontWeight="bold">
            Rating Distribution
          </Typography>
          
          <Stack spacing={2}>
            {/* Sort data by rating in descending order */}
            {[...data]
              .sort((a, b) => b.rating - a.rating)
              .map((item, index) => {
                const percentage = totalRatings > 0 ? (item.count / totalRatings) * 100 : 0;
                const ratingColor = getRatingColor(item.rating);
                
                return (
                  <Box 
                    key={index}
                    sx={{
                      cursor: onRatingClick ? 'pointer' : 'default',
                      p: 1,
                      borderRadius: 1,
                      transition: 'all 0.2s ease-in-out',
                      '&:hover': onRatingClick ? {
                        backgroundColor: theme.palette.action.hover,
                        transform: 'translateX(4px)'
                      } : {}
                    }}
                    onClick={() => handleRatingClick(item.rating, item.count)}
                  >
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                      {/* Rating stars */}
                      <Rating
                        value={item.rating}
                        max={maxRating}
                        size="small"
                        icon={<icons.filled fontSize="inherit" />}
                        emptyIcon={<icons.empty fontSize="inherit" />}
                        readOnly
                        sx={{ 
                          color: ratingColor,
                          mr: 2,
                          minWidth: 120
                        }}
                      />
                      
                      {/* Count and percentage */}
                      <Box sx={{ flex: 1, mr: 2 }}>
                        <LinearProgress
                          variant="determinate"
                          value={percentage}
                          sx={{
                            height: 8,
                            borderRadius: 4,
                            backgroundColor: theme.palette.grey[200],
                            '& .MuiLinearProgress-bar': {
                              backgroundColor: ratingColor,
                              borderRadius: 4,
                            },
                          }}
                        />
                      </Box>
                      
                      <Box sx={{ minWidth: 80, textAlign: 'right' }}>
                        <Typography variant="body2" fontWeight="bold">
                          {formatNumber(item.count)}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          ({formatPercentage(percentage)})
                        </Typography>
                      </Box>
                    </Box>
                  </Box>
                );
              })}
          </Stack>
        </Box>
      )}
    </Box>
  );

  return (
    <ChartContainer
      title={title}
      subtitle={subtitle}
      height={height}
      loading={loading}
      error={error}
      gradient={gradient}
      {...props}
    >
      {chartContent}
    </ChartContainer>
  );
};

export default RatingChart;