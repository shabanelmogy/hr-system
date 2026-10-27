import type { ReactNode } from "react";
import { Box, Typography } from "@mui/material";

export interface DetailField {
  id: string;
  label: ReactNode;
  value: ReactNode;
  fullWidth?: boolean;
  direction?: "auto" | "ltr" | "rtl";
}
/** Read-only metadata; layout/semantics stay shared, values stay with the feature. */
export function DetailFields({ items, emptyValue = "—" }: { items: readonly DetailField[]; emptyValue?: ReactNode }) {
  return <Box component="dl" sx={{ m: 0, display: "grid", gridTemplateColumns: { xs: "minmax(0, 1fr)", sm: "repeat(2, minmax(0, 1fr))" }, gap: 2 }}>
    {items.map(item => <Box key={item.id} sx={{ minWidth: 0, pb: 1.5, borderBottom: 1, borderColor: "divider", gridColumn: item.fullWidth ? "1 / -1" : undefined }}>
      <Typography component="dt" variant="caption" color="text.secondary" sx={{ mb: 0.75 }}>{item.label}</Typography>
      <Typography component="dd" variant="body2" dir={item.direction ?? "auto"}
        sx={{ m: 0, whiteSpace: "pre-wrap", overflowWrap: "anywhere", lineHeight: 1.7 }}>{item.value ?? emptyValue}</Typography>
    </Box>)}
  </Box>;
}
