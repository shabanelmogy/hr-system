import { Timeline } from "@/shared/components/timeline";
import WorldMap from "@/shared/components/maps/WorldMap";
import { Grid, Stack, Button, Typography } from "@mui/material";
import { hrTimeline, worldData } from "./data";
import Link from "next/link";
import { appRoutes } from "@/config";

type GlobalPresenceRowProps = { showViewAll?: boolean };

const GlobalPresenceRow = ({ showViewAll = true }: GlobalPresenceRowProps) => {
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
              component={Link}
              href={appRoutes.basicData.globalPresence}
              prefetch
              size="small"
              variant="outlined"
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
        <Timeline
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
