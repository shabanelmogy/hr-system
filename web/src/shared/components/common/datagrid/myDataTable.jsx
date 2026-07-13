import React, { useState } from "react";
import {
  Box,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
  TablePagination,
  Fade,
  Chip,
} from "@mui/material";
import { styled } from "@mui/material/styles";

// Styled components
const StyledTableCell = styled(TableCell)(({ theme }) => ({
  [`&.${TableCell.head}`]: {
    backgroundColor: theme.palette.primary.main,
    color: theme.palette.common.white,
    fontWeight: 600,
  },
}));

const MyDataTable = ({
  data = [],
  columns = [],
  title = "Data",
  icon = null,
  countLabel = "Total Items:",
  initialRowsPerPage = 10,
  rowsPerPageOptions = [5, 10, 25, 50],
  stickyHeader = true,
  maxHeight = { xs: 400, sm: 600 },
  emptyMessage = "No data available",
}) => {
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(initialRowsPerPage);

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  // Function to render cell content based on column type
  const renderCellContent = (item, column) => {
    const value = item[column.field];

    switch (column.type) {
      case "chip":
        return (
          <Chip
            size={column.size || "small"}
            label={value}
            variant={column.variant || "outlined"}
            color={column.color || "default"}
            sx={
              column.chipSx || { fontSize: { xs: "0.75rem", sm: "0.8125rem" } }
            }
          />
        );
      case "custom":
        return column.renderCell ? column.renderCell(value, item) : value;
      default:
        return value;
    }
  };

  return (
    <Fade in={true}>
      <Paper sx={{ overflow: "hidden" }}>
        <Box
          sx={{
            p: 2,
            bgcolor: (theme) =>
              theme.palette.mode === "dark" ? "background.paper" : "grey.50",
            borderBottom: 1,
            borderColor: "divider",
          }}
        >
          <Typography
            variant="h6"
            sx={{
              color: "text.primary",
              display: "flex",
              alignItems: "center",
              gap: 1,
              fontSize: { xs: "1rem", sm: "1.25rem" },
            }}
          >
            {icon &&
              React.cloneElement(icon, {
                color: "primary",
                sx: { fontSize: { xs: 20, sm: 24 } },
              })}
            {countLabel} {data.length}
          </Typography>
        </Box>

        <TableContainer sx={{ maxHeight }}>
          <Table stickyHeader={stickyHeader}>
            <TableHead>
              <TableRow>
                {columns.map((column, index) => (
                  <StyledTableCell
                    key={`header-${index}`}
                    align={column.align || "left"}
                  >
                    <Box
                      sx={{
                        display: "flex",
                        alignItems: "center",
                        gap: 1,
                        justifyContent:
                          column.align === "right" ? "flex-end" : "flex-start",
                      }}
                    >
                      {column.icon &&
                        React.cloneElement(column.icon, {
                          sx: { display: { xs: "none", sm: "block" } },
                        })}
                      <Box sx={{ display: { xs: "none", sm: "block" } }}>
                        {column.headerName}
                      </Box>
                      {column.mobileHeader && (
                        <Box sx={{ display: { xs: "block", sm: "none" } }}>
                          {column.mobileHeader}
                        </Box>
                      )}
                    </Box>
                  </StyledTableCell>
                ))}
              </TableRow>
            </TableHead>

            <TableBody>
              {data.length > 0 ? (
                data
                  .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                  .map((item, rowIndex) => (
                    <TableRow
                      key={`row-${rowIndex}`}
                      sx={{
                        "&:nth-of-type(odd)": { bgcolor: "action.hover" },
                        "&:hover": { bgcolor: "action.selected" },
                      }}
                    >
                      {columns.map((column, colIndex) => (
                        <TableCell
                          key={`cell-${rowIndex}-${colIndex}`}
                          align={column.align || "left"}
                          sx={{
                            ...column.cellSx,
                            fontSize: { xs: "0.875rem", sm: "1rem" },
                          }}
                        >
                          {renderCellContent(item, column)}
                        </TableCell>
                      ))}
                    </TableRow>
                  ))
              ) : (
                <TableRow>
                  <TableCell
                    colSpan={columns.length}
                    align="center"
                    sx={{ py: 3 }}
                  >
                    <Typography variant="body1" color="text.secondary">
                      {emptyMessage}
                    </Typography>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>

        {data.length > 0 && (
          <TablePagination
            rowsPerPageOptions={rowsPerPageOptions}
            component="div"
            count={data.length}
            rowsPerPage={rowsPerPage}
            page={page}
            onPageChange={handleChangePage}
            onRowsPerPageChange={handleChangeRowsPerPage}
            labelRowsPerPage={
              <Box sx={{ display: { xs: "none", sm: "block" } }}>
                Rows per page:
              </Box>
            }
          />
        )}
      </Paper>
    </Fade>
  );
};

export default MyDataTable;
