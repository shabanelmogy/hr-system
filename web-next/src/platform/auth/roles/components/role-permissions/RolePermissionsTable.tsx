import { Check, Clear, ViewModule } from "@mui/icons-material";
import {
  alpha,
  Box,
  Chip,
  IconButton,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Tooltip,
  useTheme,
} from "@mui/material";
import type { RoleClaimsFormData } from "../../utils/validation";
import RolePermissionRow from "./RolePermissionRow";
import { useTranslation } from "react-i18next";
import { getPermissionActionLabel } from "../../utils/permissionLabels";

type RolePermissionsTableProps = {
  modules: string[];
  actions: string[];
  claims: RoleClaimsFormData["roleClaims"];
  areAllSelected: (type: string) => boolean;
  onSelectAll: (type: string, selected: boolean) => void;
  onToggle: (claimIndex: number) => void;
  readOnly: boolean;
};

export default function RolePermissionsTable(props: RolePermissionsTableProps) {
  const theme = useTheme();
  const { t } = useTranslation();
  const headerBackground = theme.palette.mode === "dark"
    ? alpha(theme.palette.background.paper, 0.8)
    : "grey.50";

  return (
    <TableContainer sx={{ maxHeight: 600 }}>
      <Table stickyHeader>
        <TableHead>
          <TableRow>
            <TableCell sx={{ bgcolor: headerBackground, fontWeight: "bold", minWidth: 150 }}>
              <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                <ViewModule color="primary" /> {t("roles.module")}
              </Box>
            </TableCell>
            {props.actions.map((type) => {
              const allSelected = props.areAllSelected(type);
              return (
                <TableCell key={type} align="center" sx={{ bgcolor: headerBackground, minWidth: 120 }}>
                  <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 1 }}>
                    <Chip
                      size="small"
                      label={getPermissionActionLabel(type, t)}
                      sx={{
                        bgcolor: theme.palette.primary.main,
                        color: theme.palette.primary.contrastText,
                        fontWeight: "bold",
                      }}
                    />
                    {!props.readOnly && <Tooltip title={allSelected ? t("common.unselectAll") : t("common.selectAll")}>
                      <IconButton
                        size="small"
                        onClick={() => props.onSelectAll(type, !allSelected)}
                        sx={{
                          color: allSelected ? theme.palette.error.main : theme.palette.success.main,
                          "&:hover": {
                            bgcolor: alpha(
                              allSelected ? theme.palette.error.main : theme.palette.success.main,
                              0.1,
                            ),
                          },
                        }}
                      >
                        {allSelected ? <Clear /> : <Check />}
                      </IconButton>
                    </Tooltip>}
                  </Box>
                </TableCell>
              );
            })}
          </TableRow>
        </TableHead>
        <TableBody>
          {props.modules.map((module) => (
            <RolePermissionRow
              key={module}
              module={module}
              actions={props.actions}
              claims={props.claims}
              theme={theme}
              onToggle={props.onToggle}
              readOnly={props.readOnly}
            />
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
}
