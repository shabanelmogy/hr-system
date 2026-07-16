import {
  Box,
  Chip,
  Fade,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TablePagination,
  TableRow,
  Typography,
  tableCellClasses,
  type ChipProps,
  type TableCellProps,
} from "@mui/material";
import { styled, type SxProps, type Theme } from "@mui/material/styles";
import React, { useState, type ChangeEvent, type ReactElement, type ReactNode } from "react";

const StyledTableCell = styled(TableCell)(({ theme }) => ({
  [`&.${tableCellClasses.head}`]: {
    backgroundColor: theme.palette.primary.main,
    color: theme.palette.common.white,
    fontWeight: 600,
  },
}));

interface TableIconProps {
  color?: string;
  sx?: SxProps<Theme>;
}

export interface MyDataTableColumn<TItem extends object> {
  field: Extract<keyof TItem, string>;
  headerName: ReactNode;
  mobileHeader?: ReactNode;
  icon?: ReactElement<TableIconProps>;
  align?: TableCellProps["align"];
  type?: "chip" | "custom";
  size?: ChipProps["size"];
  variant?: ChipProps["variant"];
  color?: ChipProps["color"];
  chipSx?: SxProps<Theme>;
  cellSx?: SxProps<Theme>;
  renderCell?: (value: unknown, item: TItem) => ReactNode;
}

interface MyDataTableProps<TItem extends object> {
  data?: readonly TItem[];
  columns?: readonly MyDataTableColumn<TItem>[];
  title?: string;
  icon?: ReactElement<TableIconProps> | null;
  countLabel?: string;
  initialRowsPerPage?: number;
  rowsPerPageOptions?: readonly number[];
  stickyHeader?: boolean;
  maxHeight?: number | string | Record<string, number | string>;
  emptyMessage?: string;
}

const MyDataTable = <TItem extends object>({
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
}: MyDataTableProps<TItem>) => {
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(initialRowsPerPage);

  const renderCellContent = (
    item: TItem,
    column: MyDataTableColumn<TItem>,
  ): ReactNode => {
    const value = item[column.field];
    if (column.type === "chip") {
      return (
        <Chip
          size={column.size ?? "small"}
          label={toDisplayNode(value)}
          variant={column.variant ?? "outlined"}
          color={column.color ?? "default"}
          sx={column.chipSx ?? { fontSize: { xs: "0.75rem", sm: "0.8125rem" } }}
        />
      );
    }
    if (column.type === "custom" && column.renderCell) {
      return column.renderCell(value, item);
    }
    return toDisplayNode(value);
  };

  return (
    <Fade in>
      <Paper sx={{ overflow: "hidden" }}>
        <Box sx={{ p: 2, bgcolor: "background.paper", borderBottom: 1, borderColor: "divider" }}>
          <Typography
            variant="h6"
            title={title}
            sx={{ color: "text.primary", display: "flex", alignItems: "center", gap: 1, fontSize: { xs: "1rem", sm: "1.25rem" } }}
          >
            {icon && React.cloneElement(icon, { color: "primary", sx: { fontSize: { xs: 20, sm: 24 } } })}
            {countLabel} {data.length}
          </Typography>
        </Box>

        <TableContainer sx={{ maxHeight }}>
          <Table stickyHeader={stickyHeader}>
            <TableHead>
              <TableRow>
                {columns.map((column, index) => (
                  <StyledTableCell key={`header-${index}`} align={column.align ?? "left"}>
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1, justifyContent: column.align === "right" ? "flex-end" : "flex-start" }}>
                      {column.icon && React.cloneElement(column.icon, { sx: { display: { xs: "none", sm: "block" } } })}
                      <Box sx={{ display: { xs: "none", sm: "block" } }}>{column.headerName}</Box>
                      {column.mobileHeader && <Box sx={{ display: { xs: "block", sm: "none" } }}>{column.mobileHeader}</Box>}
                    </Box>
                  </StyledTableCell>
                ))}
              </TableRow>
            </TableHead>

            <TableBody>
              {data.length > 0 ? (
                data.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map((item, rowIndex) => (
                  <TableRow key={`row-${rowIndex}`} sx={{ "&:nth-of-type(odd)": { bgcolor: "action.hover" }, "&:hover": { bgcolor: "action.selected" } }}>
                    {columns.map((column, colIndex) => (
                      <TableCell key={`cell-${rowIndex}-${colIndex}`} align={column.align ?? "left"} sx={[{ fontSize: { xs: "0.875rem", sm: "1rem" } }, ...(Array.isArray(column.cellSx) ? column.cellSx : [column.cellSx])]}>
                        {renderCellContent(item, column)}
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              ) : (
                <TableRow><TableCell colSpan={columns.length} align="center" sx={{ py: 3 }}><Typography variant="body1" color="text.secondary">{emptyMessage}</Typography></TableCell></TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>

        {data.length > 0 && (
          <TablePagination
            rowsPerPageOptions={[...rowsPerPageOptions]}
            component="div"
            count={data.length}
            rowsPerPage={rowsPerPage}
            page={page}
            onPageChange={(_, newPage: number) => setPage(newPage)}
            onRowsPerPageChange={(event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
              setRowsPerPage(Number.parseInt(event.target.value, 10));
              setPage(0);
            }}
            labelRowsPerPage={<Box sx={{ display: { xs: "none", sm: "block" } }}>Rows per page:</Box>}
          />
        )}
      </Paper>
    </Fade>
  );
};

function toDisplayNode(value: unknown): ReactNode {
  if (value == null) return "";
  if (typeof value === "string" || typeof value === "number") return value;
  return String(value);
}

export default MyDataTable;
