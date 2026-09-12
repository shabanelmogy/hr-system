import { Timeline } from "@/shared/components/timeline";
import { Grid, Stack, Button, Typography } from "@mui/material";
import { hrTimeline, worldData } from "./data";
import GlobalPresenceMap from "./GlobalPresenceMap";
import Link from "next/link";
import { appRoutes } from "@/config";
import { useTranslation } from "react-i18next";

type GlobalPresenceRowProps = { showViewAll?: boolean };

const GlobalPresenceRow = ({ showViewAll = true }: GlobalPresenceRowProps) => {
  const { t } = useTranslation();

  return (
    <Grid container spacing={2}>
      <Grid size={{ xs: 12 }}>
        <Stack
          direction="row"
          sx={{ alignItems: "center", justifyContent: "space-between", mb: 1 }}
        >
          <Typography variant="subtitle1">{t("globalPresence.overview")}</Typography>
          {showViewAll && (
            <Button
              component={Link}
              href={appRoutes.basicData.globalPresence}
              prefetch
              size="small"
              variant="outlined"
            >
              {t("globalPresence.viewAll")}
            </Button>
          )}
        </Stack>
      </Grid>

      <Grid size={{ xs: 12, lg: 7 }}>
        <GlobalPresenceMap data={worldData} height={460} />
      </Grid>

      <Grid size={{ xs: 12, lg: 5 }}>
        <Timeline
          data={hrTimeline}
          title={t("globalPresence.recentActivity")}
          subtitle={t("globalPresence.latestMilestones")}
          height={507}
          gradient
        />
      </Grid>
    </Grid>
  );
};

export default GlobalPresenceRow;
