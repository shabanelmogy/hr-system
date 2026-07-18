import { byIso } from "country-code-lookup";

export type WorldMapCenter = [number, number];

export const MIN_WORLD_MAP_ZOOM = 0.6;
export const MAX_WORLD_MAP_ZOOM = 4;

export type WorldMapMove = {
  coordinates?: unknown;
  zoom?: unknown;
};

export function normalizeWorldMapCountryId(value: unknown): string | null {
  if (typeof value !== "string" && typeof value !== "number") return null;

  const rawValue = String(value).trim();
  if (!/^\d{1,3}$/.test(rawValue) && !/^[a-z]{2,3}$/i.test(rawValue)) {
    return null;
  }

  try {
    return byIso(rawValue)?.iso2.toUpperCase() ?? null;
  } catch {
    return null;
  }
}

export function normalizeWorldMapMove(
  position: unknown,
): { center: WorldMapCenter; zoom: number } | null {
  if (!position || typeof position !== "object") return null;

  const move = position as WorldMapMove;
  const coordinates = move.coordinates;
  const zoom = move.zoom;

  if (
    !Array.isArray(coordinates) ||
    coordinates.length < 2 ||
    typeof coordinates[0] !== "number" ||
    typeof coordinates[1] !== "number" ||
    !Number.isFinite(coordinates[0]) ||
    !Number.isFinite(coordinates[1]) ||
    typeof zoom !== "number" ||
    !Number.isFinite(zoom)
  ) {
    return null;
  }

  const longitude = Math.max(-180, Math.min(180, coordinates[0]));
  const latitude = Math.max(-90, Math.min(90, coordinates[1]));
  const normalizedZoom = Math.max(
    MIN_WORLD_MAP_ZOOM,
    Math.min(MAX_WORLD_MAP_ZOOM, zoom),
  );

  return {
    center: [longitude, latitude],
    zoom: normalizedZoom,
  };
}
