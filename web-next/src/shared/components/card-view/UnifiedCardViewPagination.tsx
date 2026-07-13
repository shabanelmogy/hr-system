import {
  Box,
  MenuItem,
  Pagination,
  Paper,
  Select,
  Stack,
  Typography,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import type { SelectChangeEvent } from "@mui/material/Select";
import { useTranslation } from "react-i18next";

export interface UnifiedCardViewPaginationProps {
  page: number; // zero-based page index
  rowsPerPage: number;
  totalItems: number;
  itemsPerPageOptions: number[];
  itemsLabel?: string; // e.g., "countries", "states". Defaults to "items"
  onPageChange: (event: unknown, newPage: number) => void;
  onRowsPerPageChange: (event: SelectChangeEvent<number>) => void;
}

const UnifiedCardViewPagination = ({
  page,
  rowsPerPage,
  totalItems,
  itemsPerPageOptions,
  itemsLabel = "items",
  onPageChange,
  onRowsPerPageChange,
}: UnifiedCardViewPaginationProps) => {
  const theme = useTheme();
  const isXs = useMediaQuery(theme.breakpoints.down("sm"));
  const isNarrow = useMediaQuery("(max-width:724px)");
  const isCompact = useMediaQuery("(max-width:660px)");
  const {t} = useTranslation();

  const start = totalItems === 0 ? 0 : page * rowsPerPage + 1;
  const end = Math.min((page + 1) * rowsPerPage, totalItems);

  return (
    <Paper sx={{ mt: 3, p: 3 }}>
      <Stack
        direction={isCompact ? "column" : "row"}
        spacing={2}
        sx={{ justifyContent: "space-between", alignItems: "center" }}
      >
        {/* Left side - Showing info and items per page */}
        <Stack
          direction={{ xs: "column", sm: "row" }}
          spacing={2}
          sx={{
            alignItems: "center",
            order: isCompact ? 1 : 1,
            flexDirection: isCompact ? "row" : undefined,
            justifyContent: isXs ? "center" : isCompact ? "space-between" : undefined,
            width: isCompact ? "100%" : undefined,
          }}
        >
          <Typography
            variant="body2"
            sx={{
              color: "text.secondary",
              textAlign: isXs ? "center" : "inherit"
            }}>
            {totalItems === 0
              ? `${t("pagination.showing")} 0 of 0 ${itemsLabel}`
              : `${t("pagination.showing")} ${start}-${end} ${t("pagination.of")} ${totalItems} ${itemsLabel}`}
          </Typography>

          <Stack direction="row" spacing={1} sx={{ alignItems: "center" }}>
            <Typography
              variant="body2"
              sx={{
                color: "text.secondary",
                whiteSpace: "nowrap"
              }}>            
              {t("pagination.itemsPerPage")}
            </Typography>
            <Select size="small" value={rowsPerPage} onChange={onRowsPerPageChange} sx={{ minWidth: 80 }}>
              {itemsPerPageOptions.map((option) => (
                <MenuItem key={option} value={option}>
                  {option}
                </MenuItem>
              ))}
            </Select>
          </Stack>
        </Stack>

        {/* Right side - Pagination controls */}
        {totalItems > 0 && (
          <Box
            sx={{
              order: isCompact ? 2 : 2,
              maxWidth: "100%",
              display: "flex",
              justifyContent: isXs ? "center" : "flex-start",
              overflowX: isNarrow ? "auto" : "visible",
              whiteSpace: isNarrow ? "nowrap" : "normal",
              "& .MuiPagination-ul": { flexWrap: "nowrap" },
            }}
          >
            <Pagination
              count={Math.max(1, Math.ceil(totalItems / rowsPerPage))}
              page={Math.min(page + 1, Math.max(1, Math.ceil(totalItems / rowsPerPage)))}
              onChange={(event, value) => onPageChange(event, value - 1)}
              color="primary"
              showFirstButton={!isNarrow}
              showLastButton={!isNarrow}
              siblingCount={isNarrow ? 0 : 1}
              boundaryCount={isNarrow ? 0 : 1}
              size={isXs || isNarrow ? "small" : "medium"}
              sx={{ display: "inline-flex", "& .MuiPagination-ul": { flexWrap: "nowrap" } }}
            />
          </Box>
        )}
      </Stack>
    </Paper>
  );
};

export default UnifiedCardViewPagination;
