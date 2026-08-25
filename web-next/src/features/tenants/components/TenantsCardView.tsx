import ApartmentIcon from "@mui/icons-material/Apartment";
import EditIcon from "@mui/icons-material/Edit";
import { Box, Button, Chip, Grid, Stack, Typography } from "@mui/material";
import { useState } from "react";
import { useTranslation } from "react-i18next";

import { EntityCard } from "@/shared/components/cards";
import { EmptyState, NoResultsState } from "@/shared/components/feedback/states";
import { CardViewPagination, CardViewSkeleton } from "@/shared/components/lists/card-view";
import type { SubscriptionStatus, TenantManagementResponse } from "../types";

interface TenantsCardViewProps {
  tenants: TenantManagementResponse[];
  loading: boolean;
  page: number;
  pageSize: number;
  totalCount: number;
  searchValue: string;
  onEdit: (tenant: TenantManagementResponse) => void;
  onAdd: () => void;
  onRefresh: () => void;
  onReset: () => void;
  onPageChange: (page: number) => void;
  onPageSizeChange: (pageSize: number) => void;
}

export default function TenantsCardView({
  tenants,
  loading,
  page,
  pageSize,
  totalCount,
  searchValue,
  onEdit,
  onAdd,
  onRefresh,
  onReset,
  onPageChange,
  onPageSizeChange,
}: TenantsCardViewProps) {
  const { t } = useTranslation();
  const [hoveredId, setHoveredId] = useState<string | null>(null);

  if (loading) return <CardViewSkeleton />;

  if (tenants.length === 0 && !searchValue.trim()) {
    return (
      <EmptyState
        title={t("tenantManagement.emptyTitle")}
        subtitle={t("tenantManagement.emptySubtitle")}
        icon={ApartmentIcon}
        actionText={t("tenantManagement.addTenant")}
        onAction={onAdd}
      />
    );
  }

  if (tenants.length === 0) {
    return (
      <NoResultsState
        searchTerm={searchValue}
        onClearSearch={onReset}
        onRefresh={onRefresh}
      />
    );
  }

  return (
    <Box sx={{ display: "flex", flexDirection: "column", height: "100%", minHeight: 0 }}>
      <Box
        sx={{
          flex: 1,
          minHeight: 0,
          overflowX: "hidden",
          overflowY: "auto",
          p: { xs: 1, md: 1.5 },
          scrollbarGutter: "stable",
        }}
      >
        <Grid container spacing={2}>
          {tenants.map((tenant, index) => (
            <Grid key={tenant.id} size={{ xs: 12, sm: 6, lg: 4, xl: 3 }}>
              <EntityCard
                index={index}
                height={350}
                isHovered={hoveredId === tenant.id}
                onMouseEnter={() => setHoveredId(tenant.id)}
                onMouseLeave={() => setHoveredId(null)}
                title={tenant.name}
                subtitle={tenant.identifier}
                endBadge={(
                  <Chip
                    size="small"
                    color={getStatusColor(tenant.subscriptionStatus)}
                    label={t(`tenantManagement.statuses.${tenant.subscriptionStatus}`)}
                  />
                )}
                chips={(
                  <Stack direction="row" useFlexGap sx={{ flexWrap: "wrap", gap: 0.75 }}>
                    <Chip
                      size="small"
                      variant="outlined"
                      color={tenant.isActive ? "success" : "default"}
                      label={tenant.isActive
                        ? t("tenantManagement.enabled")
                        : t("tenantManagement.disabled")}
                    />
                    <Chip
                      size="small"
                      variant="outlined"
                      label={tenant.planName || t("tenantManagement.noPlan")}
                    />
                  </Stack>
                )}
                content={(
                  <Stack spacing={1.5}>
                    <Box
                      sx={{
                        display: "grid",
                        gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
                        gap: 1,
                      }}
                    >
                      <Metric label={t("tenantManagement.admins")} value={`${tenant.adminCount}/${tenant.maxAdmins}`} />
                      <Metric label={t("tenantManagement.users")} value={`${tenant.userCount}/${tenant.maxUsers}`} />
                      <Metric label={t("tenantManagement.companies")} value={tenant.companyCount} />
                      <Metric label={t("tenantManagement.totalAccounts")} value={tenant.totalUserCount} />
                    </Box>
                    <Typography variant="body2" color="text.secondary">
                      {formatDate(tenant.subscriptionStartedOn)} – {tenant.subscriptionEndsOn
                        ? formatDate(tenant.subscriptionEndsOn)
                        : t("tenantManagement.noEndDate")}
                    </Typography>
                  </Stack>
                )}
                footer={(
                  <Button startIcon={<EditIcon />} onClick={() => onEdit(tenant)}>
                    {t("tenantManagement.edit")}
                  </Button>
                )}
              />
            </Grid>
          ))}
        </Grid>
      </Box>

      <Box sx={{ flexShrink: 0, pt: 1.5, zIndex: 1 }}>
        <CardViewPagination
          page={page}
          rowsPerPage={pageSize}
          totalItems={totalCount}
          itemsPerPageOptions={[5, 10, 25, 50]}
          itemsLabel={t("tenantManagement.tenantsLabel")}
          pinned
          onPageChange={onPageChange}
          onRowsPerPageChange={onPageSizeChange}
        />
      </Box>
    </Box>
  );
}

function Metric({ label, value }: { label: string; value: string | number }) {
  return (
    <Box
      sx={{
        borderRadius: 1.5,
        bgcolor: "action.hover",
        px: 1.25,
        py: 0.75,
        minWidth: 0,
      }}
    >
      <Typography variant="caption" color="text.secondary" noWrap>{label}</Typography>
      <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>{value}</Typography>
    </Box>
  );
}

function formatDate(value: string): string {
  return new Intl.DateTimeFormat(undefined, { dateStyle: "medium" }).format(new Date(value));
}

function getStatusColor(
  status: SubscriptionStatus,
): "default" | "success" | "warning" | "error" | "info" {
  if (status === "active") return "success";
  if (status === "trial") return "info";
  if (status === "pastDue") return "warning";
  if (status === "suspended" || status === "expired" || status === "cancelled") return "error";
  return "default";
}
