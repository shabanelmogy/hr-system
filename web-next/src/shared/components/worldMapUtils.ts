export type WorldMapCenter = [number, number];

export type WorldMapMove = {
  coordinates?: unknown;
  zoom?: unknown;
};

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

  return {
    center: [coordinates[0], coordinates[1]],
    zoom,
  };
}
