import { Add as AddIcon, Edit as EditIcon } from "@mui/icons-material";
import type { ReactNode } from "react";

export function getFormModeIcon(icon: ReactNode, isViewMode: boolean) {
  if (icon) return icon;
  return isViewMode ? <EditIcon /> : <AddIcon />;
}
