import { Avatar, Box, Checkbox, TableCell, TableRow, Tooltip, Typography } from "@mui/material";
import { alpha, type Theme } from "@mui/material/styles";
import type { RoleClaimsFormData } from "../../utils/validation";
import { PERMISSION_TYPES, type PermissionType } from "./constants";

type RolePermissionRowProps = {
  module: string;
  claims: RoleClaimsFormData["roleClaims"];
  colors: Record<PermissionType, string>;
  theme: Theme;
  onToggle: (claimIndex: number) => void;
};

export default function RolePermissionRow({
  module,
  claims,
  colors,
  theme,
  onToggle,
}: RolePermissionRowProps) {
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
          <Typography variant="body1" sx={{ fontWeight: "medium" }}>{module}</Typography>
        </Box>
      </TableCell>
      {PERMISSION_TYPES.map((type) => {
        const matchesClaim = (displayValue: string) =>
          displayValue.toLowerCase().startsWith(module.toLowerCase()) &&
          displayValue.toLowerCase().endsWith(`:${type.toLowerCase()}`);
        const claimIndex = claims.findIndex((claim) => matchesClaim(claim.displayValue));
        const claim = claims[claimIndex];

        return (
          <TableCell key={`${module}-${type}`} align="center">
            {claim && (
              <Tooltip title={`${type} permission for ${module}`}>
                <Box sx={{ display: "flex", justifyContent: "center" }}>
                  <input type="hidden" value={claim.displayValue} />
                  <Checkbox
                    checked={claim.isSelected}
                    onChange={() => onToggle(claimIndex)}
                    sx={{
                      color: colors[type],
                      transform: "scale(1.1)",
                      "&.Mui-checked": { color: colors[type] },
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
