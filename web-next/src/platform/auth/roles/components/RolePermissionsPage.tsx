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
    <ContentWrapper>
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

      <Card variant="outlined" sx={{ borderRadius: 3, overflow: "visible" }}>
        <Box sx={{ p: { xs: 2, md: 2.5 }, borderBottom: 1, borderColor: "divider" }}>
          <RolePermissionsFilters
            modules={permissions.availableModules}
            searchTerm={permissions.searchTerm}
            selectedModule={permissions.selectedModule}
            showOnlySelected={permissions.showOnlySelected}
            resultCount={permissions.filteredModules.length}
            totalCount={permissions.availableModules.length}
            onSearchChange={permissions.setSearchTerm}
            onModuleChange={permissions.setSelectedModule}
            onShowOnlySelectedChange={permissions.setShowOnlySelected}
            onReset={permissions.resetFilters}
          />
        </Box>

        <form onSubmit={readOnly ? undefined : permissions.submit} noValidate>
          {Object.keys(permissions.formState.errors).length > 0 ? (
            <Alert severity="error" sx={{ m: 2 }}>
              {t("roles.reviewPermissions")}
            </Alert>
          ) : null}

          {!readOnly && permissions.filteredModules.length > 0 ? (
            <Stack
              direction={{ xs: "column", sm: "row" }}
              spacing={1}
              sx={{
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

          {permissions.filteredModules.length === 0 ? (
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
              modules={permissions.paginatedModules}
              actions={permissions.permissionActions}
              claims={permissions.role.roleClaims}
              onSelectModule={permissions.selectModule}
              onToggle={permissions.toggleClaim}
              readOnly={readOnly}
            />
          )}

          {permissions.filteredModules.length > 0 ? (
            <TablePagination
              component="div"
              count={permissions.filteredModules.length}
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
              sx={{ borderTop: 1, borderColor: "divider" }}
            />
          ) : null}

          {!readOnly ? (
            <RolePermissionsActions
              selected={permissions.statistics.selected}
              total={permissions.statistics.total}
              changed={permissions.statistics.changed}
              isSaving={permissions.isSaving}
            />
          ) : null}
        </form>
      </Card>
      {permissions.notifications.SnackbarComponent}
    </ContentWrapper>
  );
}
