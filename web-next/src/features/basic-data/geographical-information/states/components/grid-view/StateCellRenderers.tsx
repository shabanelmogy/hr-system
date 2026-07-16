import { Typography } from "@mui/material";
import type { GridRenderCellParams } from "@mui/x-data-grid";
import type { State } from "../../types/State";

export const renderStateName =
  (isArabic = false) =>
  function StateNameCell({ row }: GridRenderCellParams<State>): React.ReactNode {
    return (
      <Typography variant="body2" sx={{ width: "100%", fontWeight: 500, textAlign: "center" }}>
        {isArabic ? row.nameAr : row.nameEn}
      </Typography>
    );
  };
