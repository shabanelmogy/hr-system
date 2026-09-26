import { Avatar, Box, Checkbox, TableCell, TableRow, Tooltip, Typography } from "@mui/material";
import { alpha, type Theme } from "@mui/material/styles";
import type { RoleClaimsFormData } from "../../utils/validation";
import { useTranslation } from "react-i18next";
import {
  getPermissionActionLabel,
  getPermissionResourceLabel,
} from "../../utils/permissionLabels";

type RolePermissionRowProps = {
  module: string;
  actions: string[];
  claims: RoleClaimsFormData["roleClaims"];
  theme: Theme;
  onToggle: (claimIndex: number) => void;
  readOnly: boolean;
};

export default function RolePermissionRow({
  module,
  actions,
  claims,
  theme,
  onToggle,
  readOnly,
}: RolePermissionRowProps) {
  const { t } = useTranslation();
  const resourceLabel = getPermissionResourceLabel(module, t);
  return (
    <TableRow
      hover
      sx={{
        transition: "all 0.2s ease",
        "&:hover": { bgcolor: alpha(theme.palette.primary.main, 0.08) },
      }}
    >
      <TableCell>
        <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
          <Avatar
            sx={{
              width: 32,
              height: 32,
              bgcolor: theme.palette.primary.main,
              color: theme.palette.primary.contrastText,
              fontSize: "0.875rem",
            }}
          >
            {module.substring(0, 2).toUpperCase()}
          </Avatar>
          <Typography variant="body1" sx={{ fontWeight: "medium" }}>{resourceLabel}</Typography>
        </Box>
      </TableCell>
      {actions.map((type) => {
        const matchesClaim = (displayValue: string) =>
          displayValue.toLowerCase() === `${module}:${type}`.toLowerCase();
        const claimIndex = claims.findIndex((claim) => matchesClaim(claim.displayValue));
        const claim = claims[claimIndex];

        return (
          <TableCell key={`${module}-${type}`} align="center">
            {claim && (
              <Tooltip title={t("roles.permissionFor", {
                type: getPermissionActionLabel(type, t),
                module: resourceLabel,
              })}>
                <Box sx={{ display: "flex", justifyContent: "center" }}>
                  <input type="hidden" value={claim.displayValue} />
                  <Checkbox
                    checked={claim.isSelected}
                    disabled={readOnly}
                    onChange={() => onToggle(claimIndex)}
                    sx={{
                      color: theme.palette.primary.main,
                      transform: "scale(1.1)",
                      "&.Mui-checked": { color: theme.palette.primary.main },
                    }}
                  />
                </Box>
              </Tooltip>
            )}
          </TableCell>
        );
      })}
    </TableRow>
  );
}
