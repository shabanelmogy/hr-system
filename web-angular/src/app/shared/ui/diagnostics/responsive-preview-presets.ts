export const viewportPresets = [
  { id: 'phone-small', width: 320, height: 720 },
  { id: 'phone', width: 390, height: 844 },
  { id: 'tablet', width: 768, height: 1024 },
  { id: 'boundary', width: 900, height: 820 },
  { id: 'laptop', width: 1280, height: 800 },
  { id: 'desktop', width: 1440, height: 900 },
] as const;
export type ViewportPreset = (typeof viewportPresets)[number];
export function viewportPreset(id: unknown): ViewportPreset | undefined {
  return typeof id === 'string' ? viewportPresets.find((preset) => preset.id === id) : undefined;
}
