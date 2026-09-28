import AppsRoundedIcon from "@mui/icons-material/AppsRounded";
import SearchRoundedIcon from "@mui/icons-material/SearchRounded";
import {
  Avatar,
  Box,
  Chip,
  List,
  ListItemButton,
  ListItemText,
  Stack,
  Typography,
} from "@mui/material";
import { useTranslation } from "react-i18next";
import { useState } from "react";
import { MyTextField } from "@/shared/components/forms";
import { getPermissionBusinessModuleLabel } from "../../utils/permissionLabels";
import type { PermissionBusinessModuleSummary } from "../../utils/permissionPresentation";

type RolePermissionsModuleRailProps = {
  modules: PermissionBusinessModuleSummary[];
  selectedModule: string;
  onSelect: (moduleCode: string) => void;
};

export default function RolePermissionsModuleRail({
  modules,
  selectedModule,
  onSelect,
}: RolePermissionsModuleRailProps) {
  const { i18n, t } = useTranslation();
  const [searchTerm, setSearchTerm] = useState("");
  const query = searchTerm.trim().toLocaleLowerCase(i18n.language);
  const visibleModules = query
    ? modules.filter((module) => [
        module.code,
        getPermissionBusinessModuleLabel(module.code, t),
      ].some((value) => value.toLocaleLowerCase(i18n.language).includes(query)))
    : modules;

  return (
    <Box
      component="nav"
      aria-label={t("roles.businessModuleNavigation")}
      sx={{
        display: "flex",
        flexDirection: "column",
        height: { md: "100%" },
        minHeight: 0,
        minWidth: 0,
        bgcolor: "background.default",
        borderBottom: { xs: 1, md: 0 },
        borderInlineEnd: { xs: 0, md: 1 },
        borderColor: "divider",
      }}
    >
      <Box
        sx={{
          flexShrink: 0,
          p: { xs: 2, md: 2.5 },
          borderBottom: 1,
          borderColor: "divider",
        }}
      >
        <Stack spacing={2}>
          <Box>
            <Typography component="h2" variant="subtitle1" sx={{ fontWeight: 800 }}>
              {t("roles.businessModuleNavigation")}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {t("roles.chooseBusinessModule")}
            </Typography>
          </Box>

          <MyTextField
            counter={false}
            fieldName="rolePermissionModuleSearch"
            labelKey={null}
            margin="none"
            maxValue={80}
            placeholder={t("roles.searchBusinessModules")}
            value={searchTerm}
            onChange={(event) => setSearchTerm(event.target.value)}
            showClearButton
            size="small"
            startIcon={<SearchRoundedIcon color="action" />}
          />
        </Stack>
      </Box>

      <Box
        sx={{
          flex: { md: 1 },
          minHeight: 0,
          overflowY: { md: "auto" },
          overscrollBehavior: "contain",
          p: 1.5,
        }}
      >
        {visibleModules.length > 0 ? (
          <List disablePadding sx={{ display: "grid", gap: 0.75, alignContent: "start" }}>
            {visibleModules.map((module) => {
              const selected = module.code.toLowerCase() === selectedModule.toLowerCase();
              const label = getPermissionBusinessModuleLabel(module.code, t);

              return (
                <ListItemButton
                  key={module.code}
                  selected={selected}
                  onClick={() => onSelect(module.code)}
                  aria-current={selected ? "page" : undefined}
                  sx={{
                    minHeight: 68,
                    gap: 1,
                    border: 1,
                    borderColor: selected ? "primary.main" : "divider",
                    borderRadius: 2,
                    bgcolor: selected ? "action.selected" : "background.paper",
                    "&.Mui-selected": { bgcolor: "action.selected" },
                    "&.Mui-selected:hover": { bgcolor: "action.hover" },
                  }}
                >
                  <Avatar
                    variant="rounded"
                    sx={{
                      width: 34,
                      height: 34,
                      bgcolor: selected ? "primary.main" : "action.hover",
                      color: selected ? "primary.contrastText" : "primary.main",
                    }}
                  >
                    <AppsRoundedIcon fontSize="small" />
                  </Avatar>
                  <ListItemText
                    primary={label}
                    secondary={t("roles.moduleScreensCount", { count: module.screenCount })}
                    slotProps={{
                      primary: {
                        sx: {
                          fontWeight: 800,
                          whiteSpace: "normal",
                          overflowWrap: "anywhere",
                        },
                      },
                      secondary: { noWrap: true },
                    }}
                  />
                  <Chip
                    size="small"
                    color={module.selectedCount > 0 ? "primary" : "default"}
                    label={t("roles.selectedOfTotal", {
                      selected: module.selectedCount,
                      total: module.permissionCount,
                    })}
                  />
                </ListItemButton>
              );
            })}
          </List>
        ) : (
          <Typography color="text.secondary" variant="body2" sx={{ px: 1, py: 2 }}>
            {t("roles.noBusinessModulesMatch")}
          </Typography>
        )}
      </Box>
    </Box>
  );
}
