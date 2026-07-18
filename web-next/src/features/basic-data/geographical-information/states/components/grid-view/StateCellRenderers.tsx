import { Box, Typography } from "@mui/material";
import type { GridRenderCellParams } from "@mui/x-data-grid";
import type { State } from "../../types/State";

export const renderStateName =
  (isArabic = false) =>
  function StateNameCell({ row }: GridRenderCellParams<State>): React.ReactNode {
    return (
      <Box
        sx={{
          display: "flex",
          width: "100%",
          height: "100%",
          minWidth: 0,
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Typography
          variant="body2"
          noWrap
          sx={{
            maxWidth: "100%",
            fontWeight: 500,
            textAlign: "center",
            lineHeight: 1.4,
          }}
        >
          {isArabic ? row.nameAr : row.nameEn}
        </Typography>
      </Box>
    );
  };
