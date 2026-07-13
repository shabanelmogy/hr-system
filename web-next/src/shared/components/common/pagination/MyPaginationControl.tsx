/* eslint-disable react/prop-types */
import {
  Box,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Pagination,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import { useTranslation } from "react-i18next";
import { useEffect } from "react";

const MyPaginationControl = ({
  page = 1,
  setPage,
  rowsPerPage = 10,
  setRowsPerPage,
  totalItems = 0,
  rowsPerPageOptions = [5, 10, 25], // Add this prop with default values
}) => {
  const { t } = useTranslation();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm")); // Checks if screen is smaller than 600px

  // Ensure we have valid initial values
  useEffect(() => {
    if (!rowsPerPage || !rowsPerPageOptions.includes(rowsPerPage)) {
      setRowsPerPage(rowsPerPageOptions[0] || 10);
    }
    if (!page || page < 1) {
      setPage(1);
    }
  }, []);

  // Calculate pagination values
  const startIndex = (page - 1) * rowsPerPage;
  const endIndex = Math.min(startIndex + rowsPerPage, totalItems);
  const totalPages = Math.max(1, Math.ceil(totalItems / rowsPerPage));

  // Handler for rows per page change
  const handleRowsPerPageChange = (event) => {
    const newRowsPerPage = parseInt(event.target.value, 10);
    setRowsPerPage(newRowsPerPage);
    setPage(1); // Reset to first page when changing items per page
  };

  // Handler for page change
  const handlePageChange = (event, newPage) => {
    setPage(newPage);
  };

  // For mobile layout (under 600px)
  if (isMobile) {
    return (
      <Box
        sx={{
          width: "100%",
          mt: 2,
          mb: 2,
        }}
      >
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            width: "100%",
          }}
        >
          {/* Rows per page selector */}
          <FormControl size="small" variant="outlined" sx={{ minWidth: 120 }}>
            <InputLabel id="rows-per-page-label">
              {t("pagination.rowsPerPage")}
            </InputLabel>
            <Select
              labelId="rows-per-page-label"
              id="rows-per-page-select"
              value={rowsPerPage || rowsPerPageOptions[0]}
              label={t("pagination.rowsPerPage")}
              onChange={handleRowsPerPageChange}
              MenuProps={{
                sx: { zIndex: 9999 },
              }}
            >
              {rowsPerPageOptions.map((option) => (
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
            size="small"
            siblingCount={0}
            sx={{
              "& .MuiPaginationItem-root": { fontWeight: "medium" },
            }}
          />
        </Box>
      </Box>
    );
  }

  // For regular layout (600px and above)
  return (
    <Box
      sx={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        mt: 2,
        mb: 2,
        width: "100%",
      }}
    >
      {/* Rows per page selector */}
      <FormControl size="small" variant="outlined" sx={{ minWidth: 120 }}>
        <InputLabel id="rows-per-page-label">
          {t("pagination.rowsPerPage")}
        </InputLabel>
        <Select
          labelId="rows-per-page-label"
          id="rows-per-page-select"
          value={rowsPerPage || rowsPerPageOptions[0]}
          label={t("pagination.rowsPerPage")}
          onChange={handleRowsPerPageChange}
          MenuProps={{
            sx: { zIndex: 9999 },
          }}
        >
          {rowsPerPageOptions.map((option) => (
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
        {t("pagination.showing")} {totalItems > 0 ? startIndex + 1 : 0}-
        {endIndex} {t("pagination.of")} {totalItems}
      </Box>
    </Box>
  );
};

export default MyPaginationControl;
