export const stateManagementViews = ["grid", "cards", "chart", "report", "import"] as const;

export type StateManagementView = (typeof stateManagementViews)[number];

export const isStateManagementView = (value: string): value is StateManagementView =>
  stateManagementViews.some((view) => view === value);
