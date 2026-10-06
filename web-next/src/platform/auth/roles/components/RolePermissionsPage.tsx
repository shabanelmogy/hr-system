"use client";

import CheckCircleOutlineRoundedIcon from "@mui/icons-material/CheckCircleOutlineRounded";
import RemoveCircleOutlineRoundedIcon from "@mui/icons-material/RemoveCircleOutlineRounded";
import SearchOffRoundedIcon from "@mui/icons-material/SearchOffRounded";
import {
  Alert,
  Box,
  Button,
  Card,
  CircularProgress,
  Stack,
  TablePagination,
  Typography,
} from "@mui/material";
import { useTranslation } from "react-i18next";
import { ContentWrapper } from "@/shared/components/layout";
import { EmptyState } from "@/shared/components/feedback/states";
import { useUnsavedChangesRegistration } from "@/shared/contexts/UnsavedChangesContext";
import { useRolePermissions } from "../hooks/useRolePermissions";
import RolePermissionsActions from "./role-permissions/RolePermissionsActions";
import RolePermissionsCards from "./role-permissions/RolePermissionsCards";
import RolePermissionsFilters from "./role-permissions/RolePermissionsFilters";
import RolePermissionsHeader from "./role-permissions/RolePermissionsHeader";
import RolePermissionsModuleRail from "./role-permissions/RolePermissionsModuleRail";

type RolePermissionsPageProps = { id: string };

export default function RolePermissionsPage({ id }: RolePermissionsPageProps) {
  const permissions = useRolePermissions(id);
  const { t } = useTranslation();
  const readOnly = Boolean(permissions.role?.isSystem || !permissions.canEdit);

  useUnsavedChangesRegistration(
    Boolean(
      permissions.canEdit &&
      !permissions.role?.isSystem &&
      (permissions.formState.isDirty || permissions.isSaving)
    ),
    permissions.isSaving,
  );

  if (permissions.isLoading) {
    return (
      <ContentWrapper>
        <Stack sx={{ minHeight: 420, alignItems: "center", justifyContent: "center" }} spacing={2}>
          <CircularProgress size={52} />
          <Typography variant="body1" color="text.secondary">
            {t("roles.loadingRolePermissions")}
          </Typography>
        </Stack>
      </ContentWrapper>
    );
  }

  if (!permissions.role) {
    return (
      <ContentWrapper>
        <Stack sx={{ minHeight: 420, alignItems: "center", justifyContent: "center" }}>
          <Alert severity="warning" sx={{ maxWidth: 480 }}>
            {t("roles.roleNotFound")}
          </Alert>
        </Stack>
        {permissions.notifications.SnackbarComponent}
      </ContentWrapper>
    );
  }

  return (
    <ContentWrapper fillAvailable>
      <RolePermissionsHeader
        roleName={permissions.role.name}
        {...permissions.statistics}
        readOnly={readOnly}
        onBack={permissions.goBack}
      />

      {permissions.role.isSystem ? (
        <Alert severity="info" sx={{ mb: 2 }}>
          {t("roles.systemRoleReadOnly")}
        </Alert>
      ) : !permissions.canEdit ? (
        <Alert severity="warning" sx={{ mb: 2 }}>
          {t("roles.missingEditPermission")}
        </Alert>
      ) : null}

      <Card
        variant="outlined"
        sx={{
          display: "flex",
          flex: { md: 1 },
          minHeight: 0,
          borderRadius: 3,
          overflow: { xs: "visible", md: "hidden" },
        }}
      >
        <Box
          component="form"
          onSubmit={readOnly ? undefined : permissions.submit}
          noValidate
          sx={{
            display: "flex",
            flex: 1,
            flexDirection: "column",
            minHeight: 0,
            minWidth: 0,
          }}
        >
          {Object.keys(permissions.formState.errors).length > 0 ? (
            <Alert severity="error" sx={{ m: 2, flexShrink: 0 }}>
              {t("roles.reviewPermissions")}
            </Alert>
          ) : null}

          <Box
            sx={{
              display: "grid",
              flex: { md: 1 },
              minHeight: 0,
              overflow: { md: "hidden" },
              gridTemplateColumns: { xs: "minmax(0, 1fr)", md: "320px minmax(0, 1fr)" },
              alignItems: { xs: "start", md: "stretch" },
            }}
          >
            <RolePermissionsModuleRail
              modules={permissions.businessModules}
              selectedModule={permissions.selectedBusinessModule}
              onSelect={permissions.setSelectedBusinessModule}
            />

            <Box
              sx={{
                display: "flex",
                flexDirection: "column",
                height: { md: "100%" },
                minHeight: 0,
                minWidth: 0,
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
                <RolePermissionsFilters
                  screens={permissions.availableScreens}
                  searchTerm={permissions.searchTerm}
                  selectedScreen={permissions.selectedScreen}
                  showOnlySelected={permissions.showOnlySelected}
                  resultCount={permissions.filteredScreens.length}
                  totalCount={permissions.availableScreens.length}
                  onSearchChange={permissions.setSearchTerm}
                  onScreenChange={permissions.setSelectedScreen}
                  onShowOnlySelectedChange={permissions.setShowOnlySelected}
                  onReset={permissions.resetFilters}
                />
              </Box>

              {!readOnly && permissions.filteredScreens.length > 0 ? (
                <Stack
                  direction={{ xs: "column", sm: "row" }}
                  spacing={1}
                  sx={{
                    flexShrink: 0,
                    px: { xs: 2, md: 2.5 },
                    py: 1.5,
                    alignItems: { sm: "center" },
                    justifyContent: "flex-end",
                    bgcolor: "action.hover",
                    borderBottom: 1,
                    borderColor: "divider",
                  }}
                >
                  <Button
                    size="small"
                    color="success"
                    startIcon={<CheckCircleOutlineRoundedIcon />}
                    onClick={() => permissions.selectFiltered(true)}
                  >
                    {t("roles.selectFiltered")}
                  </Button>
                  <Button
                    size="small"
                    color="error"
                    startIcon={<RemoveCircleOutlineRoundedIcon />}
                    onClick={() => permissions.selectFiltered(false)}
                  >
                    {t("roles.clearFiltered")}
                  </Button>
                </Stack>
              ) : null}

              <Box
                sx={{
                  flex: { md: 1 },
                  minHeight: 0,
                  overflow: { xs: "visible", md: "hidden" },
                }}
              >
                {permissions.filteredScreens.length === 0 ? (
                  <EmptyState
                    icon={SearchOffRoundedIcon}
                    title={t("roles.noPermissionMatches")}
                    subtitle={t("roles.noPermissionMatchesHint")}
                    actionText={t("roles.clearFilters")}
                    onAction={permissions.resetFilters}
                    sx={{ py: 7 }}
                  />
                ) : (
                  <RolePermissionsCards
                    screens={permissions.paginatedScreens}
                    actions={permissions.permissionActions}
                    claims={permissions.role.roleClaims}
                    onSelectScreen={permissions.selectScreen}
                    onToggle={permissions.toggleClaim}
                    readOnly={readOnly}
                  />
                )}
              </Box>

              {permissions.filteredScreens.length > 0 ? (
                <TablePagination
                  component="div"
                  count={permissions.filteredScreens.length}
                  page={permissions.page}
                  onPageChange={(_, page) => permissions.setPage(page)}
                  rowsPerPage={permissions.rowsPerPage}
                  onRowsPerPageChange={(event) => {
                    permissions.setRowsPerPage(Number.parseInt(event.target.value, 10));
                    permissions.setPage(0);
                  }}
                  rowsPerPageOptions={[5, 10, 25, 50]}
                  labelRowsPerPage={t("roles.groupsPerPage")}
                  labelDisplayedRows={({ from, to, count }) =>
                    t("roles.paginationSummary", { from, to, count })}
                  sx={{ flexShrink: 0, borderTop: 1, borderColor: "divider" }}
                />
              ) : null}
            </Box>
          </Box>

          {!readOnly ? (
            <RolePermissionsActions
              selected={permissions.statistics.selected}
              total={permissions.statistics.total}
              changed={permissions.statistics.changed}
              isSaving={permissions.isSaving}
            />
          ) : null}
        </Box>
      </Card>
      {permissions.notifications.SnackbarComponent}
    </ContentWrapper>
  );
}
