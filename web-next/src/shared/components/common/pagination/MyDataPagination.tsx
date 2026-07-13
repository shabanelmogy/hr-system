import { useState, useEffect } from "react";
import {
  Box,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Pagination,
} from "@mui/material";
import { useTranslation } from "react-i18next";

const MyDataPagination = ({
  totalItems,
  page,
  setPage,
  rowsPerPage,
  setRowsPerPage,
}) => {
  const { t } = useTranslation();

  // Calculate pagination values
  const startIndex = (page - 1) * rowsPerPage;
  const endIndex = Math.min(startIndex + rowsPerPage, totalItems);
  const totalPages = Math.max(1, Math.ceil(totalItems / rowsPerPage));

  // Handler for rows per page change
  const handleRowsPerPageChange = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(1); // Reset to first page when changing items per page
  };

  // Handler for page change
  const handlePageChange = (event, newPage) => {
    setPage(newPage);
  };

  // Ensure current page is valid when item count changes
  useEffect(() => {
    if (totalItems === 0) {
      if (page !== 1) setPage(1);
      return;
    }

    const maxValidPage = Math.max(1, Math.ceil(totalItems / rowsPerPage));
    if (page > maxValidPage) {
      setPage(maxValidPage);
    }
  }, [totalItems, page, rowsPerPage, setPage]);

  return (
    <Box
      sx={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        mt: 2,
        mb: 2,
      }}
    >
      {/* Rows per page selector */}
      <FormControl sx={{ minWidth: 120 }} size="small">
        <InputLabel id="rows-per-page-select-label">
          {t("pagination.rowsPerPage")}
        </InputLabel>
        <Select
          labelId="rows-per-page-select-label"
          id="rows-per-page-select"
          value={rowsPerPage}
          label={t("pagination.rowsPerPage")}
          onChange={handleRowsPerPageChange}
        >
          {[5, 10, 25].map((option) => (
            <MenuItem key={option} value={option}>
              {option}
            </MenuItem>
          ))}
        </Select>
      </FormControl>

      {/* Page navigation */}
      <Pagination
        count={totalPages}
        page={page}
        onChange={handlePageChange}
        color="primary"
        showFirstButton
        showLastButton
        size="medium"
        sx={{ "& .MuiPaginationItem-root": { fontWeight: "medium" } }}
      />

      {/* Page info */}
      <Box sx={{ typography: "body2", fontWeight: "medium" }}>
        {t("pagination.showing")} {startIndex + 1}-{endIndex} {t("of")}{" "}
        {totalItems}
      </Box>
    </Box>
  );
};

export default MyDataPagination;
