"use client";

import { Business, People, Public } from "@mui/icons-material";
import {
  alpha,
  Box,
  Grid,
  Paper,
  Typography,
  useTheme,
} from "@mui/material";
import { useMemo } from "react";
import { useTranslation } from "react-i18next";
import WorldMap, {
  type WorldMapCountry,
} from "@/shared/components/maps/WorldMap";
import type { GlobalPresenceCountry } from "./data";

interface GlobalPresenceMapProps {
  data: GlobalPresenceCountry[];
  height?: number;
}

const GlobalPresenceMap = ({
  data,
  height = 460,
}: GlobalPresenceMapProps) => {
  const theme = useTheme();
  const { t, i18n } = useTranslation();
  const locale = i18n.resolvedLanguage ?? i18n.language ?? "en-US";

  const mapData = useMemo<WorldMapCountry[]>(
    () =>
      data.map((country) => ({
        id: country.id,
        name: country.name,
        value: country.employees,
        flag: country.flag,
        marker: {
          coordinates: country.coordinates,
          value: country.offices,
        },
      })),
    [data],
  );

  const stats = useMemo(
    () => ({
      totalEmployees: data.reduce(
        (total, country) =>
          total + (Number.isFinite(country.employees) ? country.employees : 0),
        0,
      ),
      totalOffices: data.reduce(
        (total, country) =>
          total + (Number.isFinite(country.offices) ? country.offices : 0),
        0,
      ),
      countries: data.length,
    }),
    [data],
  );

  const statsContent = (
    <Grid container spacing={2} sx={{ mb: 2 }}>
      <Grid size={{ xs: 12, md: 4 }}>
        <Paper
          sx={{
            display: "flex",
            alignItems: "center",
            p: 1.5,
            borderRadius: 2,
            height: "100%",
            backgroundColor: alpha(theme.palette.primary.main, 0.08),
            border: `1px solid ${alpha(theme.palette.primary.main, 0.2)}`,
          }}
        >
          <People
            sx={{ marginInlineEnd: 1, color: theme.palette.primary.main }}
            aria-hidden="true"
          />
          <Box>
            <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
              {stats.totalEmployees.toLocaleString(locale)}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              {t("maps.totalEmployees")}
            </Typography>
          </Box>
        </Paper>
      </Grid>
      <Grid size={{ xs: 12, md: 4 }}>
        <Paper
          sx={{
            display: "flex",
            alignItems: "center",
            p: 1.5,
            borderRadius: 2,
            height: "100%",
            backgroundColor: alpha(theme.palette.success.main, 0.08),
            border: `1px solid ${alpha(theme.palette.success.main, 0.2)}`,
          }}
        >
          <Business
            sx={{ marginInlineEnd: 1, color: theme.palette.success.main }}
            aria-hidden="true"
          />
          <Box>
            <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
              {stats.totalOffices.toLocaleString(locale)}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              {t("maps.officeLocations")}
            </Typography>
          </Box>
        </Paper>
      </Grid>
      <Grid size={{ xs: 12, md: 4 }}>
        <Paper
          sx={{
            display: "flex",
            alignItems: "center",
            p: 1.5,
            borderRadius: 2,
            height: "100%",
            backgroundColor: alpha(theme.palette.info.main, 0.08),
            border: `1px solid ${alpha(theme.palette.info.main, 0.2)}`,
          }}
        >
          <Public
            sx={{ marginInlineEnd: 1, color: theme.palette.info.main }}
            aria-hidden="true"
          />
          <Box>
            <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
              {stats.countries.toLocaleString(locale)}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              {t("maps.countries")}
            </Typography>
          </Box>
        </Paper>
      </Grid>
    </Grid>
  );

  return (
    <WorldMap
      data={mapData}
      height={height}
      title={
        <>
          <Public fontSize="small" aria-hidden="true" />
          {t("maps.globalPresence")}
        </>
      }
      beforeMap={statsContent}
    />
  );
};

export default GlobalPresenceMap;
