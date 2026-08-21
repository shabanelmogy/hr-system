import {
  Box,
  FormControl,
  InputLabel,
  MenuItem,
  Pagination,
  Paper,
  Select,
  Stack,
  Typography,
  alpha,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import { useEffect, useId } from "react";
import { useTranslation } from "react-i18next";
import { getCardPageCorrection, getCardPaginationState } from "./pagination";

export interface CardViewPaginationProps {
  page: number;
  rowsPerPage: number;
  totalItems: number;
  itemsPerPageOptions: number[];
  itemsLabel?: string;
  pinned?: boolean;
  onPageChange: (newPage: number) => void;
  onRowsPerPageChange: (rowsPerPage: number) => void;
}

const CardViewPagination = ({
  page,
  rowsPerPage,
  totalItems,
  itemsPerPageOptions,
  itemsLabel: itemsLabelProp,
  pinned = false,
  onPageChange,
  onRowsPerPageChange,
}: CardViewPaginationProps) => {
  const { t } = useTranslation();
  const theme = useTheme();
  const isCompact = useMediaQuery(theme.breakpoints.down("sm"));
  const rowsPerPageLabelId = useId();
  const pagination = getCardPaginationState(page, rowsPerPage, totalItems);
  const itemsLabel = itemsLabelProp ?? t("pagination.items", { defaultValue: "items" });

  useEffect(() => {
    const correctedPage = getCardPageCorrection(page, pagination.page);
    if (correctedPage !== null) {
      onPageChange(correctedPage);
    }
  }, [onPageChange, page, pagination.page]);

  return (
    <Paper
      component="nav"
      aria-label={t("pagination.pages")}
      variant="outlined"
      sx={{
        mt: pinned ? 0 : 3,
        p: { xs: 1.5, sm: 2 },
        borderColor: alpha(theme.palette.primary.main, 0.16),
        background: `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.04)}, ${theme.palette.background.paper})`,
        boxShadow: pinned ? `0 -8px 20px ${alpha(theme.palette.common.black, 0.06)}` : undefined,
      }}
    >
      <Stack
        direction={{ xs: "column", lg: "row" }}
        spacing={{ xs: 1.5, sm: 2 }}
        sx={{
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <Stack
          direction={{ xs: "column", sm: "row" }}
          spacing={1.5}
          sx={{
            alignItems: "center",
            width: { xs: "100%", lg: "auto" },
            justifyContent: { xs: "space-between", sm: "flex-start" },
          }}
        >
          <Typography
            variant="body2"
            sx={{
              color: "text.secondary",
              fontWeight: 500,
              textAlign: { xs: "center", sm: "start" },
            }}
            aria-live="polite"
          >
            {totalItems === 0
              ? `${t("pagination.showing")} 0 of 0 ${itemsLabel}`
              : `${t("pagination.showing")} ${pagination.start}-${pagination.end} ${t("pagination.of")} ${totalItems} ${itemsLabel}`}
          </Typography>

          <FormControl size="small" sx={{ minWidth: 148 }}>
            <InputLabel id={rowsPerPageLabelId}>{t("pagination.itemsPerPage")}</InputLabel>
            <Select
              label={t("pagination.itemsPerPage")}
              labelId={rowsPerPageLabelId}
              onChange={(event) => onRowsPerPageChange(Number(event.target.value))}
              value={rowsPerPage}
            >
              {itemsPerPageOptions.map((option) => (
                <MenuItem key={option} value={option}>
                  {option}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Stack>

        {totalItems > 0 && (
          <Box
            sx={{
              display: "flex",
              justifyContent: { xs: "center", lg: "flex-end" },
              maxWidth: "100%",
              overflowX: "auto",
              pb: { xs: 0.25, sm: 0 },
              width: { xs: "100%", lg: "auto" },
              "& .MuiPagination-ul": { flexWrap: "nowrap" },
            }}
          >
            <Pagination
              aria-label={t("pagination.pages")}
              boundaryCount={isCompact ? 0 : 1}
              color="primary"
              count={pagination.pageCount}
              onChange={(_, value) => onPageChange(value - 1)}
              page={pagination.page + 1}
              showFirstButton
              showLastButton
              siblingCount={isCompact ? 0 : 1}
              size={isCompact ? "small" : "medium"}
              sx={{ display: "inline-flex", flexShrink: 0 }}
            />
          </Box>
        )}
      </Stack>
    </Paper>
  );
};

export default CardViewPagination;
