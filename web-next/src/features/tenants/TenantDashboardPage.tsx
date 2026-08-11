"use client";

import AdminPanelSettingsIcon from "@mui/icons-material/AdminPanelSettings";
import ApartmentIcon from "@mui/icons-material/Apartment";
import BusinessIcon from "@mui/icons-material/Business";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import EventIcon from "@mui/icons-material/Event";
import PeopleIcon from "@mui/icons-material/People";
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  CircularProgress,
  Divider,
  LinearProgress,
  Stack,
  Typography,
} from "@mui/material";
import { useMemo, type ReactNode } from "react";
import { useTranslation } from "react-i18next";
import Link from "next/link";

import { appRoutes } from "@/config/routes";
import { ContentWrapper } from "@/shared/components/layout";
import { PageHeader } from "@/shared/components/navigation/header";
import {
  subscriptionStatuses,
  type SubscriptionStatus,
  type TenantManagementResponse,
} from "./types";
import { useTenantsQuery } from "./useTenantsQuery";

const EXPIRING_WINDOW_DAYS = 30;

export default function TenantDashboardPage() {
  const { t, i18n } = useTranslation();
  const tenantsQuery = useTenantsQuery();
  const tenants = useMemo(() => tenantsQuery.data ?? [], [tenantsQuery.data]);
  const summary = useMemo(() => summarizeTenants(tenants), [tenants]);

  return (
    <ContentWrapper>
      <PageHeader
        title={t("superAdminDashboard.title")}
        subTitle={t("superAdminDashboard.subtitle")}
      />

      {tenantsQuery.isLoading ? (
        <Box sx={{ display: "grid", minHeight: 280, placeItems: "center" }}>
          <CircularProgress />
        </Box>
      ) : tenantsQuery.isError ? (
        <Alert severity="error">{getErrorMessage(tenantsQuery.error)}</Alert>
      ) : (
        <Stack spacing={3}>
          <Box
            sx={{
              display: "grid",
              gap: 2,
              gridTemplateColumns: "repeat(auto-fit, minmax(190px, 1fr))",
              minWidth: 0,
            }}
          >
            <SummaryCard
              color="primary.main"
              icon={<ApartmentIcon />}
              label={t("superAdminDashboard.totalTenants")}
              value={summary.totalTenants}
            />
            <SummaryCard
              color="success.main"
              icon={<CheckCircleIcon />}
              label={t("superAdminDashboard.enabledTenants")}
              value={summary.enabledTenants}
            />
            <SummaryCard
              color="secondary.main"
              icon={<AdminPanelSettingsIcon />}
              label={t("superAdminDashboard.totalAdmins")}
              value={summary.admins}
            />
            <SummaryCard
              color="info.main"
              icon={<PeopleIcon />}
              label={t("superAdminDashboard.totalUsers")}
              value={summary.users}
            />
            <SummaryCard
              color="warning.main"
              icon={<BusinessIcon />}
              label={t("superAdminDashboard.totalCompanies")}
              value={summary.companies}
            />
            <SummaryCard
              color="error.main"
              icon={<EventIcon />}
              label={t("superAdminDashboard.expiringSoon")}
              value={summary.expiringSoon.length}
            />
          </Box>

          <Box
            sx={{
              display: "grid",
              gap: 2,
              gridTemplateColumns: { xs: "1fr", lg: "minmax(0, 1fr) minmax(0, 1fr)" },
              minWidth: 0,
            }}
          >
            <Card variant="outlined">
              <CardContent>
                <Typography variant="h6" sx={{ fontWeight: 700 }}>
                  {t("superAdminDashboard.accountCapacity")}
                </Typography>
                <Stack spacing={3} sx={{ mt: 2.5 }}>
                  <CapacityRow
                    label={t("tenantManagement.admins")}
                    limit={summary.maxAdmins}
                    used={summary.admins}
                  />
                  <CapacityRow
                    label={t("tenantManagement.users")}
                    limit={summary.maxUsers}
                    used={summary.users}
                  />
                </Stack>
              </CardContent>
            </Card>

            <Card variant="outlined">
              <CardContent>
                <Typography variant="h6" sx={{ fontWeight: 700 }}>
                  {t("superAdminDashboard.subscriptionOverview")}
                </Typography>
                <Stack divider={<Divider flexItem />} sx={{ mt: 1.5 }}>
                  {subscriptionStatuses.map((status) => (
                    <Stack
                      key={status}
                      direction="row"
                      sx={{
                        alignItems: "center",
                        justifyContent: "space-between",
                        py: 1,
                      }}
                    >
                      <Chip
                        color={getStatusColor(status)}
                        label={t(`tenantManagement.statuses.${status}`)}
                        size="small"
                        variant="outlined"
                      />
                      <Typography sx={{ fontWeight: 800 }}>{summary.statusCounts[status]}</Typography>
                    </Stack>
                  ))}
                </Stack>
              </CardContent>
            </Card>
          </Box>

          <Box
            sx={{
              display: "grid",
              gap: 2,
              gridTemplateColumns: { xs: "1fr", lg: "minmax(0, 1fr) minmax(0, 1fr)" },
              minWidth: 0,
            }}
          >
            <Card variant="outlined">
              <CardContent>
                <Typography variant="h6" sx={{ fontWeight: 700 }}>
                  {t("superAdminDashboard.expiringSubscriptions")}
                </Typography>
                {summary.expiringSoon.length ? (
                  <Stack divider={<Divider flexItem />} sx={{ mt: 1.5 }}>
                    {summary.expiringSoon.slice(0, 5).map((tenant) => (
                      <Stack
                        key={tenant.id}
                        direction="row"
                        sx={{
                          alignItems: "center",
                          gap: 2,
                          justifyContent: "space-between",
                          py: 1.25,
                        }}
                      >
                        <Box sx={{ minWidth: 0 }}>
                          <Typography noWrap sx={{ fontWeight: 700 }}>{tenant.name}</Typography>
                          <Typography color="text.secondary" variant="body2" noWrap>
                            {tenant.planName || t("tenantManagement.noPlan")}
                          </Typography>
                        </Box>
                        <Box sx={{ textAlign: "end" }}>
                          <Typography color="warning.main" sx={{ fontWeight: 700 }} variant="body2">
                            {t("superAdminDashboard.daysRemaining", {
                              count: getDaysUntil(tenant.subscriptionEndsOn),
                            })}
                          </Typography>
                          <Typography color="text.secondary" variant="caption">
                            {formatDate(tenant.subscriptionEndsOn, i18n.language)}
                          </Typography>
                        </Box>
                      </Stack>
                    ))}
                  </Stack>
                ) : (
                  <Alert severity="success" sx={{ mt: 2 }}>
                    {t("superAdminDashboard.noExpiringSubscriptions")}
                  </Alert>
                )}
              </CardContent>
            </Card>

            <Card variant="outlined">
              <CardContent>
                <Typography variant="h6" sx={{ fontWeight: 700 }}>
                  {t("superAdminDashboard.recentTenants")}
                </Typography>
                {summary.recentTenants.length ? (
                  <Stack divider={<Divider flexItem />} sx={{ mt: 1.5 }}>
                    {summary.recentTenants.map((tenant) => (
                      <Stack
                        key={tenant.id}
                        direction="row"
                        sx={{
                          alignItems: "center",
                          gap: 2,
                          justifyContent: "space-between",
                          py: 1.25,
                        }}
                      >
                        <Box sx={{ minWidth: 0 }}>
                          <Typography noWrap sx={{ fontWeight: 700 }}>{tenant.name}</Typography>
                          <Typography color="text.secondary" variant="body2" noWrap>
                            {tenant.identifier}
                          </Typography>
                        </Box>
                        <Chip
                          color={getStatusColor(tenant.subscriptionStatus)}
                          label={t(`tenantManagement.statuses.${tenant.subscriptionStatus}`)}
                          size="small"
                        />
                      </Stack>
                    ))}
                  </Stack>
                ) : (
                  <Typography color="text.secondary" sx={{ mt: 2 }}>
                    {t("superAdminDashboard.noTenants")}
                  </Typography>
                )}
              </CardContent>
            </Card>
          </Box>

          <Box sx={{ display: "flex", justifyContent: "flex-end" }}>
            <Button component={Link} href={appRoutes.superAdmin.tenants} variant="contained">
              {t("superAdminDashboard.manageTenants")}
            </Button>
          </Box>
        </Stack>
      )}
    </ContentWrapper>
  );
}

function SummaryCard({
  color,
  icon,
  label,
  value,
}: {
  color: string;
  icon: ReactNode;
  label: string;
  value: number;
}) {
  return (
    <Card variant="outlined">
      <CardContent>
        <Stack direction="row" sx={{ alignItems: "center", gap: 1.5 }}>
          <Box
            sx={{
              alignItems: "center",
              bgcolor: "action.hover",
              borderRadius: 2,
              color,
              display: "flex",
              height: 44,
              justifyContent: "center",
              width: 44,
            }}
          >
            {icon}
          </Box>
          <Box sx={{ minWidth: 0 }}>
            <Typography color="text.secondary" noWrap variant="body2">{label}</Typography>
            <Typography sx={{ fontWeight: 800 }} variant="h5">{value}</Typography>
          </Box>
        </Stack>
      </CardContent>
    </Card>
  );
}

function CapacityRow({ label, used, limit }: { label: string; used: number; limit: number }) {
  const { t } = useTranslation();
  const percent = limit > 0 ? Math.min(100, Math.round((used / limit) * 100)) : 0;

  return (
    <Stack spacing={1}>
      <Stack direction="row" sx={{ gap: 2, justifyContent: "space-between" }}>
        <Typography sx={{ fontWeight: 700 }}>{label}</Typography>
        <Typography color="text.secondary" variant="body2">
          {t("superAdminDashboard.seatsUsed", { used, limit })}
        </Typography>
      </Stack>
      <LinearProgress
        color={percent >= 90 ? "warning" : "primary"}
        value={percent}
        variant="determinate"
      />
    </Stack>
  );
}

function summarizeTenants(tenants: TenantManagementResponse[]) {
  const now = Date.now();
  const expiringThreshold = now + EXPIRING_WINDOW_DAYS * 24 * 60 * 60 * 1000;
  const statusCounts = Object.fromEntries(
    subscriptionStatuses.map((status) => [status, 0]),
  ) as Record<SubscriptionStatus, number>;

  for (const tenant of tenants) statusCounts[tenant.subscriptionStatus] += 1;

  return {
    totalTenants: tenants.length,
    enabledTenants: tenants.filter((tenant) => tenant.isActive).length,
    admins: tenants.reduce((total, tenant) => total + tenant.adminCount, 0),
    users: tenants.reduce((total, tenant) => total + tenant.userCount, 0),
    companies: tenants.reduce((total, tenant) => total + tenant.companyCount, 0),
    maxAdmins: tenants.reduce((total, tenant) => total + tenant.maxAdmins, 0),
    maxUsers: tenants.reduce((total, tenant) => total + tenant.maxUsers, 0),
    statusCounts,
    expiringSoon: tenants
      .filter((tenant) => {
        if (!tenant.subscriptionEndsOn) return false;
        const endsOn = new Date(tenant.subscriptionEndsOn).getTime();
        return endsOn >= now && endsOn <= expiringThreshold;
      })
      .sort((left, right) =>
        new Date(left.subscriptionEndsOn!).getTime() - new Date(right.subscriptionEndsOn!).getTime()
      ),
    recentTenants: [...tenants]
      .sort((left, right) =>
        new Date(right.createdOn).getTime() - new Date(left.createdOn).getTime()
      )
      .slice(0, 5),
  };
}

function getDaysUntil(value: string | null): number {
  if (!value) return 0;
  return Math.max(0, Math.ceil((new Date(value).getTime() - Date.now()) / 86_400_000));
}

function formatDate(value: string | null, locale: string): string {
  if (!value) return "";
  return new Intl.DateTimeFormat(locale, { dateStyle: "medium" }).format(new Date(value));
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

function getErrorMessage(error: unknown): string {
  if (error && typeof error === "object" && "message" in error && typeof error.message === "string") {
    return error.message;
  }
  return "Unable to load tenant dashboard.";
}
