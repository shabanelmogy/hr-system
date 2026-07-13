import { Box, Card, CardActions, CardContent, Grid, Paper, Skeleton } from "@mui/material";

export interface UnifiedLoadingStateProps {
  headerTitleWidthPct?: number; // 0-100, default 30
  headerControlHeight?: number; // default 56
  cardsCount?: number; // default 8
  cardHeight?: number; // default 320
}

const UnifiedLoadingState = ({
  headerTitleWidthPct = 30,
  headerControlHeight = 56,
  cardsCount = 8,
  cardHeight = 320,
}: UnifiedLoadingStateProps) => {
  return (
    <Box>
      {/* Loading Header */}
      <Paper sx={{ p: 3, mb: 3 }}>
        <Skeleton variant="text" width={`${headerTitleWidthPct}%`} height={40} />
        <Skeleton variant="rectangular" width="100%" height={headerControlHeight} sx={{ mt: 2 }} />
      </Paper>

      {/* Loading Cards */}
      <Grid container spacing={3}>
        {Array.from({ length: cardsCount }).map((_, index) => (
          <Grid size={{ xs: 12, sm: 6, md: 4, lg: 3 }} key={index}>
            <Card sx={{ height: cardHeight }}>
              <CardContent>
                <Skeleton variant="text" width="60%" height={32} />
                <Skeleton variant="text" width="80%" height={24} sx={{ mt: 1 }} />
                <Skeleton variant="text" width="40%" height={20} sx={{ mt: 2 }} />
                <Skeleton variant="rectangular" width="100%" height={60} sx={{ mt: 2 }} />
              </CardContent>
              <CardActions>
                <Skeleton variant="circular" width={40} height={40} />
                <Skeleton variant="circular" width={40} height={40} />
                <Skeleton variant="circular" width={40} height={40} />
              </CardActions>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
};

export default UnifiedLoadingState;
