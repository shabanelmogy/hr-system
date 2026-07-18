"use client";

import {
  Alert,
  alpha,
  Box,
  Button,
  CircularProgress,
  IconButton,
  Paper,
  Skeleton,
  Tooltip,
  Typography,
  useTheme,
} from "@mui/material";
import {
  CenterFocusStrong,
  ZoomIn,
  ZoomOut,
} from "@mui/icons-material";
import type { KeyboardEvent, ReactNode } from "react";
import { useEffect, useMemo, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  ComposableMap,
  Geographies,
  Geography,
  Marker,
  ZoomableGroup,
} from "react-simple-maps";
import {
  MAX_WORLD_MAP_ZOOM,
  MIN_WORLD_MAP_ZOOM,
  normalizeWorldMapCountryId,
  normalizeWorldMapMove,
  type WorldMapCenter,
} from "./worldMapUtils";

const GEO_URL = "/maps/world-countries-110m.json";

export interface WorldMapMarker {
  coordinates: WorldMapCenter;
  value?: number;
}

export interface WorldMapCountry {
  id: string;
  name: string;
  value: number;
  flag?: ReactNode;
  marker?: WorldMapMarker;
}

export interface WorldMapProps {
  data: WorldMapCountry[];
  onCountryClick?: (country: WorldMapCountry) => void;
  onUnmatchedData?: (ids: string[]) => void;
  beforeMap?: ReactNode;
  title?: ReactNode;
  height?: number;
}

type WorldTopology = Record<string, unknown>;

interface WorldGeography {
  id?: string | number;
  properties?: Record<string, unknown>;
  rsmKey?: string;
}

type TopologyStatus = "loading" | "ready" | "error";

function isWorldTopology(value: unknown): value is WorldTopology {
  if (!value || typeof value !== "object") return false;

  const topology = value as Record<string, unknown>;
  return (
    topology.type === "Topology" &&
    Boolean(topology.objects) &&
    typeof topology.objects === "object"
  );
}

function getStringProperty(
  properties: Record<string, unknown> | undefined,
  key: string,
): string | null {
  const value = properties?.[key];
  return typeof value === "string" ? value : null;
}

function resolveGeographyIso2(geography: WorldGeography): string | null {
  return (
    normalizeWorldMapCountryId(geography.id) ??
    normalizeWorldMapCountryId(getStringProperty(geography.properties, "ISO_A2")) ??
    normalizeWorldMapCountryId(getStringProperty(geography.properties, "ISO_A3"))
  );
}

function isValidCoordinate(value: unknown): value is WorldMapCenter {
  return (
    Array.isArray(value) &&
    value.length >= 2 &&
    typeof value[0] === "number" &&
    typeof value[1] === "number" &&
    Number.isFinite(value[0]) &&
    Number.isFinite(value[1]) &&
    value[0] >= -180 &&
    value[0] <= 180 &&
    value[1] >= -90 &&
    value[1] <= 90
  );
}

function toSafeValue(value: number): number {
  return Number.isFinite(value) && value >= 0 ? value : 0;
}

function hexToRgb(hex: string): { r: number; g: number; b: number } {
  const color = hex.replace("#", "");
  return {
    r: parseInt(color.substring(0, 2), 16),
    g: parseInt(color.substring(2, 4), 16),
    b: parseInt(color.substring(4, 6), 16),
  };
}

function rgbToHex(r: number, g: number, b: number): string {
  return `#${[r, g, b]
    .map((value) =>
      Math.max(0, Math.min(255, Math.round(value)))
        .toString(16)
        .padStart(2, "0"),
    )
    .join("")}`;
}

function mixColors(hex1: string, hex2: string, t: number): string {
  const first = hexToRgb(hex1);
  const second = hexToRgb(hex2);
  return rgbToHex(
    first.r + (second.r - first.r) * t,
    first.g + (second.g - first.g) * t,
    first.b + (second.b - first.b) * t,
  );
}

function MapLoadingState({ label }: { label: string }) {
  return (
    <Box
      role="status"
      aria-live="polite"
      sx={{
        height: "100%",
        minHeight: 220,
        p: 3,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: 1.5,
      }}
    >
      <CircularProgress size={28} aria-label={label} />
      <Typography variant="body2" color="text.secondary">
        {label}
      </Typography>
      <Skeleton variant="rounded" width="70%" height={8} />
    </Box>
  );
}

const WorldMap = ({
  data,
  onCountryClick,
  onUnmatchedData,
  beforeMap,
  title,
  height = 500,
}: WorldMapProps) => {
  const theme = useTheme();
  const { t, i18n } = useTranslation();
  const [zoom, setZoom] = useState(1);
  const [center, setCenter] = useState<WorldMapCenter>([0, 15]);
  const [focusedCountryId, setFocusedCountryId] = useState<string | null>(null);
  const [topology, setTopology] = useState<WorldTopology | null>(null);
  const [topologyStatus, setTopologyStatus] = useState<TopologyStatus>("loading");
  const [loadAttempt, setLoadAttempt] = useState(0);
  const moveEndFrame = useRef<number | null>(null);

  useEffect(() => {
    const controller = new AbortController();

    fetch(GEO_URL, { signal: controller.signal })
      .then(async (response) => {
        if (!response.ok) {
          throw new Error(`Map topology request failed with status ${response.status}.`);
        }

        const payload: unknown = await response.json();
        if (!isWorldTopology(payload)) {
          throw new Error("Map topology response is invalid.");
        }

        return payload;
      })
      .then((payload) => {
        setTopology(payload);
        setTopologyStatus("ready");
      })
      .catch((error: unknown) => {
        if (error instanceof DOMException && error.name === "AbortError") return;
        setTopologyStatus("error");
      });

    return () => controller.abort();
  }, [loadAttempt]);

  useEffect(() => {
    return () => {
      if (moveEndFrame.current !== null) {
        cancelAnimationFrame(moveEndFrame.current);
      }
    };
  }, []);

  const normalizedData = useMemo(() => {
    const map = new Map<string, WorldMapCountry>();
    const unmatchedIds: string[] = [];

    data.forEach((country) => {
      const iso2 = normalizeWorldMapCountryId(country.id);
      if (!iso2) {
        unmatchedIds.push(country.id);
        return;
      }

      const marker = isValidCoordinate(country.marker?.coordinates)
        ? {
            coordinates: country.marker.coordinates,
            value: toSafeValue(country.marker.value ?? 0),
          }
        : undefined;

      map.set(iso2, {
        ...country,
        id: iso2,
        value: toSafeValue(country.value),
        marker,
      });
    });

    return { map, unmatchedIds };
  }, [data]);

  useEffect(() => {
    onUnmatchedData?.(normalizedData.unmatchedIds);
  }, [normalizedData.unmatchedIds, onUnmatchedData]);

  const [minValue, maxValue] = useMemo(() => {
    const values = [...normalizedData.map.values()].map((country) => country.value);
    return [Math.min(...values, 0), Math.max(1, ...values)] as [number, number];
  }, [normalizedData.map]);

  const dataMap = normalizedData.map;
  const locale = i18n.resolvedLanguage ?? i18n.language ?? "en-US";
  const mapHeight = Number.isFinite(height) && height > 0 ? height : 500;
  const startHex = theme.palette.info.light;
  const endHex =
    theme.palette.mode === "dark"
      ? theme.palette.primary.light
      : theme.palette.primary.dark;

  const normalizeValue = (value: number): number => {
    const safeValue = toSafeValue(value);
    const logarithm = (input: number) => Math.log(1 + input);
    const denominator = Math.max(
      logarithm(maxValue) - logarithm(Math.max(0, minValue)),
      1e-6,
    );

    return Math.min(
      Math.max(
        (logarithm(safeValue) - logarithm(Math.max(0, minValue))) / denominator,
        0,
      ),
      1,
    );
  };

  const colorForValue = (value: number) =>
    mixColors(startHex, endHex, normalizeValue(value));

  const handleRetry = () => {
    setTopology(null);
    setTopologyStatus("loading");
    setLoadAttempt((attempt) => attempt + 1);
  };

  const handleZoomIn = () =>
    setZoom((value) => Math.min(value * 1.25, MAX_WORLD_MAP_ZOOM));
  const handleZoomOut = () =>
    setZoom((value) => Math.max(value / 1.25, MIN_WORLD_MAP_ZOOM));
  const handleReset = () => {
    setZoom(1);
    setCenter([0, 15]);
  };

  const handleCountryKeyDown = (
    event: KeyboardEvent<SVGGElement>,
    country: WorldMapCountry | undefined,
  ) => {
    if (!country || !onCountryClick) return;
    if (event.key !== "Enter" && event.key !== " ") return;

    event.preventDefault();
    onCountryClick(country);
  };

  return (
    <Paper sx={{ p: 3 }}>
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          mb: 2,
          gap: 2,
        }}
      >
        <Typography
          component="h2"
          variant="h5"
          sx={{
            fontWeight: 700,
            display: "flex",
            alignItems: "center",
            gap: 1,
            minWidth: 0,
          }}
        >
          {title ?? t("maps.title")}
        </Typography>
        <Box sx={{ display: "flex", gap: 1, flexShrink: 0 }}>
          <Tooltip title={t("maps.zoomIn")}>
            <IconButton
              onClick={handleZoomIn}
              size="small"
              aria-label={t("maps.zoomIn")}
            >
              <ZoomIn />
            </IconButton>
          </Tooltip>
          <Tooltip title={t("maps.zoomOut")}>
            <IconButton
              onClick={handleZoomOut}
              size="small"
              aria-label={t("maps.zoomOut")}
            >
              <ZoomOut />
            </IconButton>
          </Tooltip>
          <Tooltip title={t("maps.resetView")}>
            <IconButton
              onClick={handleReset}
              size="small"
              aria-label={t("maps.resetView")}
            >
              <CenterFocusStrong />
            </IconButton>
          </Tooltip>
        </Box>
      </Box>

      {beforeMap}

      <Box
        role="region"
        aria-label={t("maps.regionLabel")}
        aria-busy={topologyStatus === "loading"}
        sx={{
          height: mapHeight,
          borderRadius: 2,
          overflow: "hidden",
          border: `1px solid ${theme.palette.divider}`,
          background:
            theme.palette.mode === "dark"
              ? `radial-gradient(800px 300px at 50% 0%, ${alpha(
                  theme.palette.primary.main,
                  0.08,
                )} 0%, transparent 60%), ${theme.palette.background.default}`
              : theme.palette.grey[50],
        }}
      >
        {topologyStatus === "loading" && (
          <MapLoadingState label={t("maps.loading")} />
        )}

        {topologyStatus === "error" && (
          <Box
            role="alert"
            sx={{
              height: "100%",
              minHeight: 220,
              p: 3,
              textAlign: "center",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              gap: 1.5,
            }}
          >
            <Alert severity="error">{t("maps.loadError")}</Alert>
            <Button variant="outlined" onClick={handleRetry}>
              {t("maps.retry")}
            </Button>
          </Box>
        )}

        {topologyStatus === "ready" && topology && (
          <ComposableMap
            projectionConfig={{ scale: 145 }}
            style={{ width: "100%", height: "100%" }}
            aria-label={t("maps.svgLabel")}
          >
            <ZoomableGroup
              center={center}
              zoom={zoom}
              onMoveEnd={(position) => {
                const nextMove = normalizeWorldMapMove(position);
                if (!nextMove) return;

                const { center: nextCenter, zoom: nextZoom } = nextMove;

                if (moveEndFrame.current !== null) {
                  cancelAnimationFrame(moveEndFrame.current);
                }

                moveEndFrame.current = requestAnimationFrame(() => {
                  moveEndFrame.current = null;
                  setCenter((currentCenter) =>
                    currentCenter[0] === nextCenter[0] &&
                    currentCenter[1] === nextCenter[1]
                      ? currentCenter
                      : nextCenter,
                  );
                  setZoom((currentZoom) =>
                    currentZoom === nextZoom ? currentZoom : nextZoom,
                  );
                });
              }}
            >
              <Geographies geography={topology}>
                {({ geographies }) =>
                  geographies.map((geo, index) => {
                    const geography = geo as WorldGeography;
                    const iso2 = resolveGeographyIso2(geography);
                    const country = iso2 ? dataMap.get(iso2) : undefined;
                    const countryName =
                      country?.name ??
                      getStringProperty(geography.properties, "name") ??
                      t("maps.unknownCountry");
                    const isInteractive = Boolean(country && onCountryClick);
                    const geographyKey =
                      geography.rsmKey ?? String(geography.id ?? index);
                    const fill = country
                      ? colorForValue(country.value)
                      : theme.palette.mode === "dark"
                        ? theme.palette.grey[700]
                        : theme.palette.grey[300];
                    const isFocused = focusedCountryId === geographyKey;

                    const tooltipTitle = country ? (
                      <Box sx={{ p: 0.5 }}>
                        <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                          {country.flag} {country.name}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {t("maps.value")}: {country.value.toLocaleString(locale)}
                        </Typography>
                        {country.marker && (
                          <Typography
                            variant="caption"
                            sx={{ display: "block" }}
                            color="text.secondary"
                          >
                            {t("maps.markerValue")}: {country.marker.value?.toLocaleString(locale) ?? 0}
                          </Typography>
                        )}
                      </Box>
                    ) : (
                      <Typography variant="caption">{countryName}</Typography>
                    );

                    const geographyNode = (
                      <g
                        key={geographyKey}
                        role={isInteractive ? "button" : "img"}
                        tabIndex={isInteractive ? 0 : undefined}
                        aria-label={
                          isInteractive
                            ? t("maps.selectCountry", { country: countryName })
                            : countryName
                        }
                        onClick={() => {
                          if (country && onCountryClick) onCountryClick(country);
                        }}
                        onKeyDown={(event) => handleCountryKeyDown(event, country)}
                        onFocus={() => setFocusedCountryId(geographyKey)}
                        onBlur={() => setFocusedCountryId(null)}
                      >
                        <Geography
                          geography={geo}
                          style={{
                            default: {
                              fill,
                              outline: "none",
                              stroke: isFocused
                                ? theme.palette.primary.main
                                : theme.palette.divider,
                              strokeWidth: isFocused ? 1.8 : 0.7,
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
                      </g>
                    );

                    return country ? (
                      <Tooltip
                        key={geographyKey}
                        title={tooltipTitle}
                        arrow
                        placement="top"
                        disableInteractive
                      >
                        {geographyNode}
                      </Tooltip>
                    ) : (
                      geographyNode
                    );
                  })
                }
              </Geographies>

              {Array.from(dataMap.values())
                .filter((country) => country.marker && (country.marker.value ?? 0) > 0)
                .map((country) => {
                  const marker = country.marker;
                  if (!marker) return null;

                  return (
                    <Marker
                      key={`m-${country.id}`}
                      coordinates={marker.coordinates}
                      aria-hidden="true"
                    >
                      <circle
                        r={Math.min((marker.value ?? 0) * 1.5 + 3, 8)}
                        fill={theme.palette.success.main}
                        stroke={theme.palette.common.white}
                        strokeWidth={1.5}
                      />
                    </Marker>
                  );
                })}
            </ZoomableGroup>
          </ComposableMap>
        )}
      </Box>
    </Paper>
  );
};

export default WorldMap;
