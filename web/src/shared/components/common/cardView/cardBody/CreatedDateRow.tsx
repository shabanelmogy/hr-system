import React from "react";
import { CalendarToday } from "@mui/icons-material";
import { Stack, Typography } from "@mui/material";
import { Box } from "@mui/system";

// CreatedDateRow: date row with calendar icon
export const CreatedDateRow: React.FC<{
  date?: string | Date | null;
  formatter?: (d: Date) => string;
}> = ({ date, formatter }) => {
  const formatDate = (d?: string | Date | null) => {
    if (!d) return "N/A";
    const dd = d instanceof Date ? d : new Date(d);
    if (Number.isNaN(dd.getTime())) return "N/A";
    const f = formatter || ((x: Date) => x.toLocaleDateString(undefined, { month: "short", day: "2-digit", year: "numeric" }));
    return f(dd);
  };
  return (
    <Box sx={{ mt: "auto" }}>
      <Stack direction="row" spacing={1} sx={{ alignItems: "center" }}>
        <CalendarToday sx={{ fontSize: 14, color: "text.secondary" }} />
        <Typography variant="caption" color="text.secondary">
          {formatDate(date)}
        </Typography>
      </Stack>
    </Box>
  );
};
