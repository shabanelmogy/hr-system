import {
  Box,
  CircularProgress,
  FormControl,
  IconButton,
  InputLabel,
  MenuItem,
  Pagination,
  Paper,
  Select,
  Tooltip,
} from "@mui/material";
import { useRef } from "react";
import Edit from "@mui/icons-material/Edit";
import Delete from "@mui/icons-material/Delete";

/* eslint-disable react/prop-types */
const MyGenericListView = ({
  items,
  loading,
  page,
  rowsPerPage,
  totalItems,
  lastAddedId,
  lastEditedId,
  lastDeletedIndex,
  onPageChange,
  onRowsPerPageChange,
  onEdit,
  onDelete,
  renderItemFields,
  translations,
  theme,
  newItemAdded = false,
  itemEdited = false,
  itemDeleted = false,
}) => {
  // Calculate pagination
  const startIndex = (page - 1) * rowsPerPage;
  const endIndex = startIndex + rowsPerPage;
  const totalPages = Math.ceil(totalItems / rowsPerPage);

  // Create refs for list items
  const listViewRef = useRef({});

  return (
    <Box sx={{ width: "100%" }}>
      {loading ? (
        <Box sx={{ display: "flex", justifyContent: "center", p: 3 }}>
          <CircularProgress size={24} />
        </Box>
      ) : items.length > 0 ? (
        <>
          {items.map((item, index) => {
            // Calculate if this item was recently affected
            const isHighlighted =
              (newItemAdded && item.id === lastAddedId) ||
              (itemEdited && item.id === lastEditedId) ||
              (itemDeleted && index === (lastDeletedIndex % rowsPerPage) - 1);

            return (
              <Paper
                key={item.id}
                elevation={isHighlighted ? 4 : 2}
                ref={(el) => (listViewRef.current[item.id] = el)}
                sx={{
                  mb: 2,
                  overflow: "hidden",
                  borderRadius: 2,
                  transition:
                    "transform 0.2s, box-shadow 0.2s, background-color 0.3s",
                  transform: isHighlighted ? "translateY(-2px)" : "none",
                  "&:hover": {
                    transform: "translateY(-2px)",
                    boxShadow: 4,
                  },
                  bgcolor: isHighlighted
                    ? theme.palette.mode === "dark"
                      ? "primary.dark"
                      : "primary.light"
                    : index % 2 === 0
                    ? "background.paper"
                    : "background.default",
                  border: isHighlighted ? 2 : index % 2 === 0 ? 1 : 0,
                  borderColor: isHighlighted ? "primary.main" : "divider",
                }}
              >
                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    p: 2,
                  }}
                >
                  <Box
                    sx={{ display: "flex", flexDirection: "column", flex: 1 }}
                  >
                    {/* Render fields based on the renderItemFields prop */}
                    {renderItemFields(item, translations, theme)}
                  </Box>
                  <Box sx={{ display: "flex", gap: 1 }}>
                    <Tooltip title={translations.edit} arrow>
                      <IconButton
                        aria-label={translations.edit}
                        color="primary"
                        onClick={() => onEdit(item)}
                      >
                        <Edit />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title={translations.delete} arrow>
                      <IconButton
                        aria-label={translations.delete}
                        color="error"
                        onClick={() => onDelete(item)}
                      >
                        <Delete />
                      </IconButton>
                    </Tooltip>
                  </Box>
                </Box>
              </Paper>
            );
          })}

          {/* Pagination controls */}
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
                {translations.rowsPerPage}
              </InputLabel>
              <Select
                labelId="rows-per-page-select-label"
                id="rows-per-page-select"
                value={rowsPerPage}
                label={translations.rowsPerPage}
                onChange={(e) => onRowsPerPageChange(e.target.value)}
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
              onChange={(e, newPage) => onPageChange(newPage)}
              color="primary"
              showFirstButton
              showLastButton
              size="medium"
              sx={{ "& .MuiPaginationItem-root": { fontWeight: "medium" } }}
            />

            {/* Page info */}
            <Box sx={{ typography: "body2", fontWeight: "medium" }}>
              {translations.showing} {startIndex + 1}-
              {Math.min(endIndex, totalItems)} {translations.of} {totalItems}
            </Box>
          </Box>
        </>
      ) : (
        <Box sx={{ textAlign: "center", py: 3 }}>{translations.noItems}</Box>
      )}
    </Box>
  );
};

export default MyGenericListView;
