import AppsRoundedIcon from "@mui/icons-material/AppsRounded";
import CheckCircleOutlineRoundedIcon from "@mui/icons-material/CheckCircleOutlineRounded";
import ExpandMoreRoundedIcon from "@mui/icons-material/ExpandMoreRounded";
import RemoveCircleOutlineRoundedIcon from "@mui/icons-material/RemoveCircleOutlineRounded";
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Avatar,
  Box,
  Button,
  Checkbox,
  Chip,
  FormControlLabel,
  Stack,
  Typography,
} from "@mui/material";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import type { RoleClaimsFormData } from "../../utils/validation";
import {
  getPermissionActionLabel,
  getPermissionResourceLabel,
} from "../../utils/permissionLabels";

type RolePermissionsCardsProps = {
  modules: string[];
  actions: string[];
  claims: RoleClaimsFormData["roleClaims"];
  onSelectModule: (module: string, selected: boolean) => void;
  onToggle: (claimIndex: number) => void;
  readOnly: boolean;
};

export default function RolePermissionsCards({
  modules,
  actions,
  claims,
  onSelectModule,
  onToggle,
  readOnly,
}: RolePermissionsCardsProps) {
  const { t } = useTranslation();
  const [expandedScreen, setExpandedScreen] = useState<string | false>(false);

  return (
    <Stack spacing={1.25} sx={{ p: 1.5 }}>
      {modules.map((module) => {
        const moduleClaims = actions.flatMap((action) => {
          const claimIndex = claims.findIndex(
            (claim) => claim.displayValue.toLowerCase() === `${module}:${action}`.toLowerCase(),
          );
          return claimIndex >= 0 ? [{ action, claimIndex, claim: claims[claimIndex] }] : [];
        });
        const selectedCount = moduleClaims.filter(({ claim }) => claim.isSelected).length;
        const allSelected = moduleClaims.length > 0 && selectedCount === moduleClaims.length;
        const resourceLabel = getPermissionResourceLabel(module, t);
        const screenId = `role-permission-screen-${module
          .toLowerCase()
          .replace(/[^a-z0-9_-]+/g, "-")}`;

        return (
          <Accordion
            key={module}
            expanded={expandedScreen === module}
            onChange={(_, expanded) => setExpandedScreen(expanded ? module : false)}
            disableGutters
            variant="outlined"
            slotProps={{
              heading: { component: "h3" },
              transition: { unmountOnExit: true },
            }}
            sx={{
              borderRadius: "12px !important",
              overflow: "hidden",
              transition: (theme) => theme.transitions.create(["border-color", "box-shadow"]),
              "&.Mui-expanded": {
                borderColor: "primary.main",
                boxShadow: (theme) => `0 8px 24px ${theme.palette.action.hover}`,
              },
              "&::before": { display: "none" },
            }}
          >
            <AccordionSummary
              id={`${screenId}-header`}
              aria-controls={`${screenId}-content`}
              expandIcon={<ExpandMoreRoundedIcon />}
              sx={{
                minHeight: 68,
                px: { xs: 1.5, sm: 2 },
                "&.Mui-expanded": { minHeight: 68, bgcolor: "action.hover" },
                "& .MuiAccordionSummary-content": { my: 1.25 },
                "& .MuiAccordionSummary-content.Mui-expanded": { my: 1.25 },
              }}
            >
              <Stack direction="row" spacing={1.25} sx={{ alignItems: "center", minWidth: 0, flex: 1 }}>
                <Avatar
                  variant="rounded"
                  sx={{ width: 36, height: 36, bgcolor: "primary.main" }}
                >
                  <AppsRoundedIcon fontSize="small" />
                </Avatar>
                <Box sx={{ minWidth: 0, flex: 1 }}>
                  <Typography component="span" sx={{ display: "block", fontWeight: 800 }} noWrap>
                    {resourceLabel}
                  </Typography>
                  <Typography
                    component="span"
                    variant="caption"
                    color="text.secondary"
                    sx={{ display: "block" }}
                  >
                    {t("roles.screenPermissionsHint", { count: moduleClaims.length })}
                  </Typography>
                </Box>
                <Chip
                  size="small"
                  color={selectedCount > 0 ? "primary" : "default"}
                  label={t("roles.selectedOfTotal", {
                    selected: selectedCount,
                    total: moduleClaims.length,
                  })}
                />
              </Stack>
            </AccordionSummary>
            <AccordionDetails
              id={`${screenId}-content`}
              aria-labelledby={`${screenId}-header`}
              sx={{ p: { xs: 1.5, sm: 2 }, borderTop: 1, borderColor: "divider" }}
            >
              {!readOnly ? (
                <Box sx={{ display: "flex", justifyContent: "flex-end", mb: 1.5 }}>
                  <Button
                    size="small"
                    color={allSelected ? "error" : "success"}
                    startIcon={allSelected
                      ? <RemoveCircleOutlineRoundedIcon />
                      : <CheckCircleOutlineRoundedIcon />}
                    onClick={() => onSelectModule(module, !allSelected)}
                  >
                    {t(allSelected ? "roles.clearGroup" : "roles.selectGroup")}
                  </Button>
                </Box>
              ) : null}
              <Box
                sx={{
                  display: "grid",
                  gridTemplateColumns: {
                    xs: "1fr",
                    sm: "repeat(2, minmax(0, 1fr))",
                    lg: "repeat(3, minmax(0, 1fr))",
                  },
                  gap: 1,
                }}
              >
                {moduleClaims.map(({ action, claim, claimIndex }) => {
                  const actionLabel = getPermissionActionLabel(action, t);
                  const permissionLabel = t("roles.permissionFor", {
                    type: actionLabel,
                    module: resourceLabel,
                  });

                  return (
                    <FormControlLabel
                      key={claim.displayValue}
                      sx={{
                        m: 0,
                        px: 1,
                        py: 0.5,
                        minHeight: 48,
                        border: 1,
                        borderColor: claim.isSelected ? "primary.main" : "divider",
                        borderRadius: 2,
                        bgcolor: claim.isSelected ? "action.selected" : "background.paper",
                        transition: (theme) => theme.transitions.create([
                          "background-color",
                          "border-color",
                        ]),
                        "&:hover": { bgcolor: "action.hover" },
                      }}
                      control={
                        <Checkbox
                          checked={claim.isSelected}
                          disabled={readOnly}
                          onChange={() => onToggle(claimIndex)}
                          slotProps={{ input: { "aria-label": permissionLabel } }}
                        />
                      }
                      label={actionLabel}
                    />
                  );
                })}
              </Box>
            </AccordionDetails>
          </Accordion>
        );
      })}
    </Stack>
  );
}
