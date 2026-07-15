import type { Chip, Paper } from "@mui/material";
import type { ComponentProps, ComponentType, ReactElement, ReactNode } from "react";
import type { ExportMenuOption } from "@/shared/export/types";

export type ViewType = string;

export type ViewOption = {
  value: ViewType;
  label: string;
  icon: ReactElement<{ fontSize?: "inherit" | "small" | "medium" | "large" }>;
};

export type HeaderActions = {
  add?: boolean;
  refresh?: boolean;
  export?: boolean;
  filter?: boolean;
};

export type HeaderExportOption = ExportMenuOption;

export interface MultiViewHeaderProps {
  title: ReactNode;
  titleIcon?: ReactNode;
  onBack?: () => void;
  showBackButton?: boolean;
  onAdd?: () => void;
  storageKey: string;
  defaultView?: ViewType;
  availableViews?: ViewType[];
  viewLabels?: Record<string, string>;
  dataCount?: number;
  totalLabel?: string;
  onRefresh?: () => void;
  exportOptions?: HeaderExportOption[];
  onFilter?: () => void;
  showActions?: HeaderActions;
  additionalChips?: ComponentProps<typeof Chip>[];
  sx?: ComponentProps<typeof Paper>["sx"];
  onViewTypeChange?: (viewType: ViewType) => void;
  viewComponents?: Record<string, ComponentType>;
  enableActivity?: boolean;
  t?: unknown;
}
