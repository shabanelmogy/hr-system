import { styled } from "@mui/material/styles";
import { Box, Paper, TableContainer, TableHead, TableRow, TableCell, Chip } from "@mui/material";

export const ViewerContainer = styled(Box)(({ theme }) => ({
  width: "100%",
  height: "100%",
  display: "flex",
  flexDirection: "column",
  backgroundColor: theme.palette.background.paper,
  borderRadius: theme.spacing(1.5),
  overflow: "hidden",
  boxShadow: theme.shadows[8],
}));

export const ToolbarContainer = styled(Paper)(({ theme }) => ({
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  padding: theme.spacing(2),
  backgroundColor: theme.palette.background.paper,
  borderBottom: `1px solid ${theme.palette.divider}`,
  gap: theme.spacing(2),
  flexWrap: "wrap",
}));

export const StyledTableContainer = styled(TableContainer)(({ theme }) => ({
  flex: 1,
  overflow: "auto",
  backgroundColor: theme.palette.background.default,
  "& .MuiTable-root": {
    minWidth: 650,
  },
}));

export const StyledTableHead = styled(TableHead)(({ theme }) => ({
  "& .MuiTableCell-head": {
    backgroundColor: theme.palette.primary.main,
    color: theme.palette.primary.contrastText,
    fontWeight: 600,
    position: "sticky",
    top: 0,
    zIndex: 10,
  },
}));

export const StyledTableRow = styled(TableRow)(({ theme }) => ({
  "&:nth-of-type(odd)": {
    backgroundColor: theme.palette.action.hover,
  },
  "&:hover": {
    backgroundColor: theme.palette.action.selected,
  },
  transition: "background-color 0.2s ease",
}));

export const StyledTableCell = styled(TableCell)(({ theme }) => ({
  padding: theme.spacing(1.5),
  fontSize: "0.875rem",
  borderColor: theme.palette.divider,
}));

export const InfoChip = styled(Chip)(({ theme }) => ({
  backgroundColor: theme.palette.primary.main,
  color: theme.palette.primary.contrastText,
  fontWeight: 600,
}));