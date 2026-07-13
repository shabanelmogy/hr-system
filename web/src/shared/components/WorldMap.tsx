/* eslint-disable react/prop-types */
import React, { useMemo, useState } from "react";
import {
  ComposableMap,
  Geographies,
  Geography,
  Marker,
  ZoomableGroup,
} from "react-simple-maps";
import {
  Box,
  Typography,
  Paper,
  useTheme,
  alpha,
  Tooltip,
  IconButton,
  Grid,
} from "@mui/material";
import {
  Public,
  People,
  Business,
  ZoomIn,
  ZoomOut,
  CenterFocusStrong,
} from "@mui/icons-material";

// Source topology (no token required)
const GEO_URL =
  "https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json";

// Minimal A3->A2 code mapping for countries used by this app
const A3_TO_A2: Record<string, string> = {
  USA: "US",
  CAN: "CA",
  MEX: "MX",
  BRA: "BR",
  ARG: "AR",
  GBR: "GB",
  DEU: "DE",
  FRA: "FR",
  ITA: "IT",
  ESP: "ES",
  CHN: "CN",
  JPN: "JP",
  IND: "IN",
  KOR: "KR",
  ZAF: "ZA",
  EGY: "EG",
  NGA: "NG",
  AUS: "AU",
};

// Approximate country centroids for office markers
const COUNTRY_COORDS: Record<string, [number, number]> = {
  US: [-98.5, 39.8],
  CA: [-106.3, 56.1],
  MX: [-102.6, 23.6],
  BR: [-51.9, -10.8],
  AR: [-64.3, -34.6],
  GB: [-3.4, 55.4],
  DE: [10.4, 51.1],
  FR: [2.2, 46.2],
  IT: [12.6, 42.8],
  ES: [-3.7, 40.3],
  CN: [104.1, 35.8],
  JP: [138.3, 36.2],
  IN: [78.9, 22.1],
  KR: [127.8, 36.3],
  ZA: [24.7, -29.0],
  EG: [30.8, 26.8],
  NG: [8.7, 9.1],
  AU: [134.5, -25.7],
};

interface CountryData {
  id: string; // ISO A2 (e.g., 'US')
  name: string;
  employees: number;
  offices: number;
  revenue: number;
  currency: string;
  timezone: string;
  flag: string;
}

interface WorldMapProps {
  data: CountryData[];
  onCountryClick?: (country: CountryData) => void;
  height?: number;
  showStats?: boolean;
}

const WorldMap: React.FC<WorldMapProps> = ({
  data,
  onCountryClick,
  height = 500,
  showStats = true,
}) => {
  const theme = useTheme();
  const [zoom, setZoom] = useState(1);
  const [center, setCenter] = useState<[number, number]>([0, 15]);
  // const [hoverId, setHoverId] = useState<string | null>(null); // Unused variable

  const dataMap = useMemo(
    () => new Map<string, CountryData>(data.map((d) => [d.id, d])),
    [data]
  );

  // Stats
  const stats = useMemo(
    () => ({
      totalEmployees: data.reduce((s, d) => s + d.employees, 0),
      totalOffices: data.reduce((s, d) => s + d.offices, 0),
      countriesWithPresence: data.length,
    }),
    [data]
  );

  // Color scale based on employees (theme-aware, smooth, log-normalized)
  const [minEmployees, maxEmployees] = useMemo(() => {
    const vals = data.map((d) => d.employees);
    const min = Math.min(...vals, 0);
    const max = Math.max(1, ...vals);
    return [min, max] as [number, number];
  }, [data]);

  const hexToRgb = (hex: string) => {
    const c = hex.replace("#", "");
    const r = parseInt(c.substring(0, 2), 16);
    const g = parseInt(c.substring(2, 4), 16);
    const b = parseInt(c.substring(4, 6), 16);
    return { r, g, b };
  };
  const rgbToHex = (r: number, g: number, b: number) =>
    `#${[r, g, b]
      .map((x) =>
        Math.max(0, Math.min(255, Math.round(x)))
          .toString(16)
          .padStart(2, "0")
      )
      .join("")}`;
  const mixColors = (hex1: string, hex2: string, t: number) => {
    const a = hexToRgb(hex1);
    const b = hexToRgb(hex2);
    return rgbToHex(
      a.r + (b.r - a.r) * t,
      a.g + (b.g - a.g) * t,
      a.b + (b.b - a.b) * t
    );
  };

  const startHex =
    theme.palette.mode === "dark"
      ? theme.palette.info.light
      : theme.palette.info.light;
  const endHex =
    theme.palette.mode === "dark"
      ? theme.palette.primary.light
      : theme.palette.primary.dark;

  const normalize = (v: number) => {
    const ln = (x: number) => Math.log(1 + x);
    const denom = Math.max(
      ln(maxEmployees) - ln(Math.max(0, minEmployees)),
      1e-6
    );
    return Math.min(
      Math.max((ln(v) - ln(Math.max(0, minEmployees))) / denom, 0),
      1
    );
  };

  const colorForEmployees = (employees: number) => {
    const t = normalize(employees);
    return mixColors(startHex, endHex, t);
  };

  const countryFill = (a2: string) => {
    const c = dataMap.get(a2);
    if (!c)
      return theme.palette.mode === "dark"
        ? theme.palette.grey[700]
        : theme.palette.grey[300];
    return colorForEmployees(c.employees);
  };

  const handleZoomIn = () => setZoom((z) => Math.min(z * 1.25, 4));
  const handleZoomOut = () => setZoom((z) => Math.max(z / 1.25, 0.6));
  const handleReset = () => {
    setZoom(1);
    setCenter([0, 15]);
  };

  return (
    <Paper sx={{ p: 3 }}>
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          mb: 2,
        }}
      >
        <Typography
          variant="h5"
          sx={{
            fontWeight: 700,
            display: "flex",
            alignItems: "center",
            gap: 1,
          }}
        >
          <Public /> Global Presence
        </Typography>
        <Box sx={{ display: "flex", gap: 1 }}>
          <IconButton onClick={handleZoomIn} size="small">
            <ZoomIn />
          </IconButton>
          <IconButton onClick={handleZoomOut} size="small">
            <ZoomOut />
          </IconButton>
          <IconButton onClick={handleReset} size="small">
            <CenterFocusStrong />
          </IconButton>
        </Box>
      </Box>

      {showStats && (
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
              <People sx={{ mr: 1, color: theme.palette.primary.main }} />
              <Box>
                <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
                  {stats.totalEmployees.toLocaleString()}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Total Employees
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
              <Business sx={{ mr: 1, color: theme.palette.success.main }} />
              <Box>
                <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
                  {stats.totalOffices}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Office Locations
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
              <Public sx={{ mr: 1, color: theme.palette.info.main }} />
              <Box>
                <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
                  {stats.countriesWithPresence}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Countries
                </Typography>
              </Box>
            </Paper>
          </Grid>
        </Grid>
      )}

      <Box
        sx={{
          height,
          borderRadius: 2,
          overflow: "hidden",
          border: `1px solid ${theme.palette.divider}`,
          background:
            theme.palette.mode === "dark"
              ? `radial-gradient(800px 300px at 50% 0%, ${alpha(
                  theme.palette.primary.main,
                  0.08
                )} 0%, transparent 60%), ${theme.palette.background.default}`
              : theme.palette.grey[50],
        }}
      >
        <ComposableMap
          projectionConfig={{ scale: 145 }}
          style={{ width: "100%", height: "100%" }}
        >
          <ZoomableGroup
            center={center}
            zoom={zoom}
            onMoveEnd={(pos) => {
              setCenter(pos.coordinates as [number, number]);
              setZoom(pos.zoom);
            }}
          >
            <Geographies geography={GEO_URL}>
              {({ geographies }) =>
                geographies.map((geo) => {
                  const a3 = geo.properties.ISO_A3 as string;
                  const a2 = A3_TO_A2[a3] || "";
                  const hasData = dataMap.has(a2);

                  const fill = hasData
                    ? countryFill(a2)
                    : theme.palette.mode === "dark"
                    ? theme.palette.grey[700]
                    : theme.palette.grey[300];

                  const node = (
                    <Geography
                      key={geo.rsmKey}
                      geography={geo}
                      onMouseEnter={() => setHoverId(a2)}
                      onMouseLeave={() => setHoverId(null)}
                      onClick={() => {
                        const cd = dataMap.get(a2);
                        if (cd && onCountryClick) onCountryClick(cd);
                      }}
                      style={{
                        default: {
                          fill,
                          outline: "none",
                          stroke: theme.palette.divider,
                          strokeWidth: 0.7,
                        },
                        hover: {
                          fill,
                          outline: "none",
                          stroke: theme.palette.primary.main,
                          strokeWidth: 1.2,
                          filter: "brightness(1.05)",
                        },
                        pressed: {
                          fill,
                          outline: "none",
                          stroke: theme.palette.primary.main,
                          strokeWidth: 1.2,
                        },
                      }}
                    />
                  );

                  const cd = dataMap.get(a2);
                  return (
                    <Tooltip
                      key={geo.rsmKey}
                      title={
                        cd ? (
                          <Box sx={{ p: 0.5 }}>
                            <Typography
                              variant="subtitle2"
                              sx={{ fontWeight: 600 }}
                            >
                              {cd.flag} {cd.name}
                            </Typography>
                            <Typography
                              variant="caption"
                              color="text.secondary"
                            >
                              Employees: {cd.employees.toLocaleString()}
                            </Typography>
                            <br />
                            <Typography
                              variant="caption"
                              color="text.secondary"
                            >
                              Offices: {cd.offices}
                            </Typography>
                          </Box>
                        ) : (
                          <Typography variant="caption">
                            {geo.properties.NAME}
                          </Typography>
                        )
                      }
                      arrow
                      placement="top"
                      disableInteractive
                    >
                      {node as any}
                    </Tooltip>
                  );
                })
              }
            </Geographies>

            {/* Office markers */}
            {data
              .filter((d) => COUNTRY_COORDS[d.id] && d.offices > 0)
              .map((d) => {
                const [lon, lat] = COUNTRY_COORDS[d.id];
                return (
                  <Marker key={`m-${d.id}`} coordinates={[lon, lat]}>
                    <circle
                      r={Math.min(d.offices * 1.5 + 3, 8)}
                      fill={theme.palette.success.main}
                      stroke={theme.palette.common.white}
                      strokeWidth={1.5}
                    />
                  </Marker>
                );
              })}
          </ZoomableGroup>
        </ComposableMap>
      </Box>
    </Paper>
  );
};

export default WorldMap;
