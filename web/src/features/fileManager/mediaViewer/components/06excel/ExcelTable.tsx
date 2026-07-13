import React from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
} from "@mui/material";
import { styled } from "@mui/material/styles";
import { useTranslation } from "react-i18next";

const StyledTableContainer = styled(TableContainer)(({ theme }) => ({
  flex: 1,
  overflow: "auto",
  backgroundColor: theme.palette.background.default,
  "& .MuiTable-root": {
    minWidth: 650,
  },
}));

const StyledTableHead = styled(TableHead)(({ theme }) => ({
  "& .MuiTableCell-head": {
    backgroundColor: theme.palette.primary.main,
    color: theme.palette.primary.contrastText,
    fontWeight: 600,
    position: "sticky",
    top: 0,
    zIndex: 10,
  },
}));

const StyledTableRow = styled(TableRow)(({ theme }) => ({
  "&:nth-of-type(odd)": {
    backgroundColor: theme.palette.action.hover,
  },
  "&:hover": {
    backgroundColor: theme.palette.action.selected,
  },
  transition: "background-color 0.2s ease",
}));

const StyledTableCell = styled(TableCell)(({ theme }) => ({
  padding: theme.spacing(1.5),
  fontSize: "0.875rem",
  borderColor: theme.palette.divider,
}));

export interface ExcelTableProps {
  headers: any[];
  rows: any[][];
  searchTerm: string;
}

const ExcelTable: React.FC<ExcelTableProps> = ({
  headers,
  rows,
  searchTerm,
}) => {
  const { t } = useTranslation();

  return (
    <StyledTableContainer>
      <Table stickyHeader>
        <StyledTableHead>
          <TableRow>
            {headers.map((header, index) => (
              <StyledTableCell key={index} align="left">
                {header || `Column ${index + 1}`}
              </StyledTableCell>
            ))}
          </TableRow>
        </StyledTableHead>
        <TableBody>
          {rows.length > 0 ? (
            rows.map((row, rowIndex) => (
              <StyledTableRow key={rowIndex}>
                {headers.map((_, colIndex) => (
                  <StyledTableCell key={colIndex} align="left">
                    {row[colIndex] || "-"}
                  </StyledTableCell>
                ))}
              </StyledTableRow>
            ))
          ) : (
            <TableRow>
              <StyledTableCell colSpan={headers.length} align="center">
                <Typography color="text.secondary" sx={{ py: 3 }}>
                  {searchTerm ? t("files.NoResults") : t("files.NoData")}
                </Typography>
              </StyledTableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </StyledTableContainer>
  );
};

export default ExcelTable;
