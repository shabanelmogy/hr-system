export const districtManagementViews = ["grid", "cards", "chart", "report", "import"] as const;

export type DistrictManagementView = (typeof districtManagementViews)[number];

export const isDistrictManagementView = (value: string): value is DistrictManagementView =>
  districtManagementViews.some((view) => view === value);
