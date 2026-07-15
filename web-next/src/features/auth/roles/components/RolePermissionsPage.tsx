"use client";

import { ContentWrapper } from "@/shared/components/layout";
import {
  Alert,
  alpha,
  Box,
  Card,
  CircularProgress,
  Divider,
  Fade,
  TablePagination,
  Typography,
  useTheme,
} from "@mui/material";
import { useRolePermissions } from "../hooks/useRolePermissions";
import DiscardRoleChangesDialog from "./role-permissions/DiscardRoleChangesDialog";
import RolePermissionsActions from "./role-permissions/RolePermissionsActions";
import RolePermissionsFilters from "./role-permissions/RolePermissionsFilters";
import RolePermissionsHeader from "./role-permissions/RolePermissionsHeader";
import RolePermissionsTable from "./role-permissions/RolePermissionsTable";

type RolePermissionsPageProps = { id: string };

export default function RolePermissionsPage({ id }: RolePermissionsPageProps) {
  const permissions = useRolePermissions(id);
  const theme = useTheme();

  if (permissions.isLoading) {
    return (
      <ContentWrapper>
        <Box sx={{ display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center", minHeight: 400, gap: 2 }}>
          <CircularProgress size={60} />
          <Typography variant="h6" sx={{ color: "text.secondary" }}>Loading role permissions...</Typography>
        </Box>
      </ContentWrapper>
    );
  }

  if (!permissions.role) {
    return (
      <ContentWrapper>
        <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: 400 }}>
          <Alert severity="warning" sx={{ maxWidth: 400 }}>Role not found</Alert>
        </Box>
        {permissions.notifications.SnackbarComponent}
      </ContentWrapper>
    );
  }

  return (
    <ContentWrapper>
      <Fade in timeout={600}>
        <Box>
          <RolePermissionsHeader
            roleName={permissions.role.name}
            {...permissions.statistics}
            onDashboard={permissions.goDashboard}
          />
          <Card sx={{ borderRadius: 2, boxShadow: 3, bgcolor: "background.paper" }}>
            <Box sx={{ p: 3, borderBottom: 1, borderColor: "divider" }}>
              <RolePermissionsFilters
                searchTerm={permissions.searchTerm}
                selectedModule={permissions.selectedModule}
                showOnlySelected={permissions.showOnlySelected}
                resultCount={permissions.filteredModules.length}
                onSearchChange={permissions.setSearchTerm}
                onModuleChange={permissions.setSelectedModule}
                onShowOnlySelectedChange={permissions.setShowOnlySelected}
              />
            </Box>
            <form onSubmit={permissions.submit} noValidate>
              {Object.keys(permissions.formState.errors).length > 0 && (
                <Alert severity="error" sx={{ mb: 2 }}>
                  Please review the role permissions before saving.
                </Alert>
              )}
              <RolePermissionsTable
                modules={permissions.paginatedModules}
                claims={permissions.role.roleClaims}
                areAllSelected={permissions.areAllSelected}
                onSelectAll={permissions.selectAll}
                onToggle={permissions.toggleClaim}
              />
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
                sx={{
                  borderTop: 1,
                  borderColor: "divider",
                  bgcolor: theme.palette.mode === "dark"
                    ? alpha(theme.palette.background.paper, 0.8)
                    : "grey.50",
                }}
              />
              <Divider />
              <RolePermissionsActions
                selected={permissions.statistics.selected}
                total={permissions.statistics.total}
                isSaving={permissions.isSaving}
                onBack={permissions.goBack}
              />
            </form>
          </Card>
        </Box>
      </Fade>
      {permissions.notifications.SnackbarComponent}
      <DiscardRoleChangesDialog
        open={permissions.discardDialogOpen}
        onClose={() => permissions.setDiscardDialogOpen(false)}
        onDiscard={permissions.confirmBack}
      />
    </ContentWrapper>
  );
}
