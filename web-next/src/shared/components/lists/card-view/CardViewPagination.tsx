import {
  Box,
  MenuItem,
  Pagination,
  Paper,
  Select,
  Stack,
  Typography,
} from "@mui/material";
import type { SelectChangeEvent } from "@mui/material/Select";
import { useEffect } from "react";
import { useTranslation } from "react-i18next";
import { getCardPageCorrection, getCardPaginationState } from "./pagination";

export interface CardViewPaginationProps {
  page: number;
  rowsPerPage: number;
  totalItems: number;
  itemsPerPageOptions: number[];
  itemsLabel?: string;
  onPageChange: (event: unknown, newPage: number) => void;
  onRowsPerPageChange: (event: SelectChangeEvent<number>) => void;
}

const CardViewPagination = ({
  page,
  rowsPerPage,
  totalItems,
  itemsPerPageOptions,
  itemsLabel: itemsLabelProp,
  onPageChange,
  onRowsPerPageChange,
}: CardViewPaginationProps) => {
  const { t } = useTranslation();
  const pagination = getCardPaginationState(page, rowsPerPage, totalItems);
  const itemsLabel = itemsLabelProp ?? t("pagination.items", { defaultValue: "items" });

  useEffect(() => {
    const correctedPage = getCardPageCorrection(page, pagination.page);
    if (correctedPage !== null) {
      onPageChange(undefined, correctedPage);
    }
  }, [onPageChange, page, pagination.page]);

  return (
    <Paper sx={{ mt: 3, p: { xs: 2, sm: 3 } }}>
      <Stack
        direction="row"
        spacing={2}
        sx={{
          justifyContent: "space-between",
          alignItems: "center",
          "@media (max-width:660px)": {
            flexDirection: "column",
          },
        }}
      >
        {/* Left side - Showing info and items per page */}
        <Stack
          direction="row"
          spacing={2}
          sx={{
            alignItems: "center",
            order: 1,
            "@media (max-width:660px)": {
              justifyContent: "space-between",
              width: "100%",
            },
            "@media (max-width:599.95px)": {
              justifyContent: "center",
            },
          }}
        >
          <Typography
            variant="body2"
            sx={{
              color: "text.secondary",
              textAlign: "center",
            }}>
            {totalItems === 0
              ? `${t("pagination.showing")} 0 of 0 ${itemsLabel}`
              : `${t("pagination.showing")} ${pagination.start}-${pagination.end} ${t("pagination.of")} ${totalItems} ${itemsLabel}`}
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
              order: 2,
              maxWidth: "100%",
              display: "flex",
              justifyContent: "flex-start",
              overflowX: "visible",
              whiteSpace: "normal",
              "& .MuiPagination-ul": { flexWrap: "nowrap" },
              "@media (max-width:724px)": {
                justifyContent: "center",
                overflowX: "auto",
                whiteSpace: "nowrap",
                width: "100%",
                "& .MuiPaginationItem-firstLast": {
                  display: "none",
                },
              },
            }}
          >
            <Pagination
              count={pagination.pageCount}
              page={pagination.page + 1}
              onChange={(event, value) => onPageChange(event, value - 1)}
              color="primary"
              showFirstButton
              showLastButton
              siblingCount={1}
              boundaryCount={1}
              size="medium"
              sx={{ display: "inline-flex", "& .MuiPagination-ul": { flexWrap: "nowrap" } }}
            />
          </Box>
        )}
      </Stack>
    </Paper>
  );
};

export default CardViewPagination;
