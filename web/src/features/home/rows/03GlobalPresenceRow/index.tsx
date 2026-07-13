import { SimpleTimelineChart } from "@/shared/components/charts";
import WorldMap from "@/shared/components/WorldMap";
import { Grid, Stack, Button, Typography } from "@mui/material";
import { hrTimeline, worldData } from "./data";
import { useNavigate } from "react-router-dom";
import { appRoutes } from "@/routes";

type GlobalPresenceRowProps = { showViewAll?: boolean };

const GlobalPresenceRow = ({ showViewAll = true }: GlobalPresenceRowProps) => {
  const navigate = useNavigate();

  return (
    <Grid container spacing={2}>
      <Grid size={{ xs: 12 }}>
        <Stack
          direction="row"
          sx={{ alignItems: "center", justifyContent: "space-between", mb: 1 }}
        >
          <Typography variant="subtitle1">Global Presence Overview</Typography>
          {showViewAll && (
            <Button
              size="small"
              variant="outlined"
              onClick={() => navigate(appRoutes.globalPresence)}
            >
              View All
            </Button>
          )}
        </Stack>
      </Grid>

      <Grid size={{ xs: 12, lg: 7 }}>
        <WorldMap data={worldData} height={460} showStats />
      </Grid>

      <Grid size={{ xs: 12, lg: 5 }}>
        <SimpleTimelineChart
          data={hrTimeline}
          title="Recent HR Activity"
          subtitle="Latest milestones and changes"
          height={507}
          gradient
        />
      </Grid>
    </Grid>
  );
};

export default GlobalPresenceRow;
