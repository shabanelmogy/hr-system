"use client";

import AdminPanelSettingsIcon from "@mui/icons-material/AdminPanelSettings";
import ApartmentIcon from "@mui/icons-material/Apartment";
import ArrowForwardRoundedIcon from "@mui/icons-material/ArrowForwardRounded";
import AutoGraphIcon from "@mui/icons-material/AutoGraph";
import BusinessIcon from "@mui/icons-material/Business";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import EventIcon from "@mui/icons-material/Event";
import HistoryIcon from "@mui/icons-material/History";
import PeopleIcon from "@mui/icons-material/People";
import PublicIcon from "@mui/icons-material/Public";
import ScheduleIcon from "@mui/icons-material/Schedule";
import {
  Alert,
  Avatar,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  CircularProgress,
  LinearProgress,
  Stack,
  Typography,
  alpha,
  useTheme,
} from "@mui/material";
import { useMemo, type ReactNode } from "react";
import { useTranslation } from "react-i18next";
import Link from "next/link";

import { appRoutes, type AppPath } from "@/config/routes";
import { MetricCard, type MetricColor } from "@/shared/components/cards";
import { ContentWrapper } from "@/shared/components/layout";
import { PageHeader } from "@/shared/components/navigation/header";
import {
  subscriptionStatuses,
  type SubscriptionStatus,
  type TenantManagementResponse,
} from "./types";
import { useTenantsQuery } from "./useTenantsQuery";

const EXPIRING_WINDOW_DAYS = 30;
const dashboardListSx = {
  height: "100%",
  minHeight: 0,
  overflowX: "hidden",
  overflowY: "auto",
  pe: 0.5,
  scrollbarGutter: "stable",
} as const;

export default function TenantDashboardPage() {
  const { t, i18n } = useTranslation();
  const tenantsQuery = useTenantsQuery();
  const tenants = useMemo(() => tenantsQuery.data ?? [], [tenantsQuery.data]);
  const summary = useMemo(() => summarizeTenants(tenants), [tenants]);

  return (
    <ContentWrapper fillAvailable>
      <PageHeader
        title={t("superAdminDashboard.title")}
        subTitle={t("superAdminDashboard.subtitle")}
        actions={(
          <Stack
            component="nav"
            aria-label={t("superAdminDashboard.title")}
            direction={{ xs: "column", sm: "row" }}
            spacing={1.5}
            sx={{ width: "100%" }}
          >
            <DashboardActionButton
              color="info"
              href={appRoutes.superAdmin.geography.countries}
              icon={<PublicIcon fontSize="small" />}
              label={t("menu.globalGeography")}
            />
            <DashboardActionButton
              color="primary"
              filled
              href={appRoutes.superAdmin.tenants}
              icon={<ApartmentIcon fontSize="small" />}
              label={t("superAdminDashboard.manageTenants")}
            />
          </Stack>
        )}
      />

      {tenantsQuery.isLoading ? (
        <Box sx={{ display: "grid", flex: 1, minHeight: 0, placeItems: "center" }}>
          <CircularProgress />
        </Box>
      ) : tenantsQuery.isError ? (
        <Alert severity="error">{getErrorMessage(tenantsQuery.error)}</Alert>
      ) : (
        <Box
          sx={{
            display: "grid",
            flex: 1,
            gap: 2,
            gridTemplateRows: {
              xs: "96px minmax(160px, 0.95fr) minmax(168px, 1fr)",
              md: "96px minmax(170px, 0.9fr) minmax(180px, 1fr)",
            },
            minHeight: 0,
            overflow: "hidden",
          }}
        >
          <Box
            sx={{
              display: "grid",
              gap: 2,
              gridTemplateColumns: {
                xs: "repeat(6, minmax(150px, 1fr))",
                md: "repeat(6, minmax(0, 1fr))",
              },
              minWidth: 0,
              overflowX: { xs: "auto", md: "hidden" },
              overflowY: "hidden",
              pb: { xs: 0.5, md: 0 },
              scrollSnapType: { xs: "inline proximity", md: "none" },
            }}
          >
            <MetricCard
              color="primary"
              compact
              gradient
              icon={ApartmentIcon}
              showTrend={false}
              size="small"
              title={t("superAdminDashboard.totalTenants")}
              value={summary.totalTenants}
              sx={{ height: "100%", minWidth: 0, scrollSnapAlign: "start" }}
            />
            <MetricCard
              color="success"
              compact
              gradient
              icon={CheckCircleIcon}
              showTrend={false}
              size="small"
              title={t("superAdminDashboard.enabledTenants")}
              value={summary.enabledTenants}
              sx={{ height: "100%", minWidth: 0, scrollSnapAlign: "start" }}
            />
            <MetricCard
              color="secondary"
              compact
              gradient
              icon={AdminPanelSettingsIcon}
              showTrend={false}
              size="small"
              title={t("superAdminDashboard.totalAdmins")}
              value={summary.admins}
              sx={{ height: "100%", minWidth: 0, scrollSnapAlign: "start" }}
            />
            <MetricCard
              color="info"
              compact
              gradient
              icon={PeopleIcon}
              showTrend={false}
              size="small"
              title={t("superAdminDashboard.totalUsers")}
              value={summary.users}
              sx={{ height: "100%", minWidth: 0, scrollSnapAlign: "start" }}
            />
            <MetricCard
              color="warning"
              compact
              gradient
              icon={BusinessIcon}
              showTrend={false}
              size="small"
              title={t("superAdminDashboard.totalCompanies")}
              value={summary.companies}
              sx={{ height: "100%", minWidth: 0, scrollSnapAlign: "start" }}
            />
            <MetricCard
              color="error"
              compact
              gradient
              icon={EventIcon}
              showTrend={false}
              size="small"
              title={t("superAdminDashboard.expiringSoon")}
              value={summary.expiringSoon.length}
              sx={{ height: "100%", minWidth: 0, scrollSnapAlign: "start" }}
            />
          </Box>

          <Box
            sx={{
              display: "grid",
              gap: 2,
              gridTemplateColumns: { xs: "1fr", md: "minmax(0, 1fr) minmax(0, 1fr)" },
              gridTemplateRows: { xs: "repeat(2, minmax(150px, 1fr))", md: "minmax(0, 1fr)" },
              height: "100%",
              minWidth: 0,
              minHeight: 0,
              overflowY: { xs: "auto", md: "hidden" },
              scrollbarGutter: { xs: "stable", md: "auto" },
            }}
          >
            <DashboardPanel
              color="primary"
              icon={<AutoGraphIcon fontSize="small" />}
              title={t("superAdminDashboard.accountCapacity")}
            >
              <Stack spacing={2} sx={{ height: "100%", justifyContent: "center" }}>
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
            </DashboardPanel>

            <DashboardPanel
              color="secondary"
              icon={<EventIcon fontSize="small" />}
              title={t("superAdminDashboard.subscriptionOverview")}
            >
              <SubscriptionOverview
                counts={summary.statusCounts}
                total={summary.totalTenants}
              />
            </DashboardPanel>
          </Box>

          <Box
            sx={{
              display: "grid",
              gap: 2,
              gridTemplateColumns: { xs: "1fr", md: "minmax(0, 1fr) minmax(0, 1fr)" },
              gridTemplateRows: { xs: "repeat(2, minmax(150px, 1fr))", md: "minmax(0, 1fr)" },
              height: "100%",
              minWidth: 0,
              minHeight: 0,
              overflowY: { xs: "auto", md: "hidden" },
              scrollbarGutter: { xs: "stable", md: "auto" },
            }}
          >
            <DashboardPanel
              color="warning"
              icon={<ScheduleIcon fontSize="small" />}
              title={t("superAdminDashboard.expiringSubscriptions")}
            >
              {summary.expiringSoon.length ? (
                  <Box sx={dashboardListSx}>
                    {summary.expiringSoon.map((tenant) => (
                      <Stack
                        key={tenant.id}
                        direction="row"
                        sx={{
                          alignItems: "center",
                          bgcolor: "action.hover",
                          borderRadius: 2,
                          gap: 2,
                          justifyContent: "space-between",
                          mb: 0.75,
                          px: 1.25,
                          py: 1,
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
                  </Box>
                ) : (
                  <Alert severity="success" sx={{ mt: 1 }}>
                    {t("superAdminDashboard.noExpiringSubscriptions")}
                  </Alert>
              )}
            </DashboardPanel>

            <DashboardPanel
              color="info"
              icon={<HistoryIcon fontSize="small" />}
              title={t("superAdminDashboard.recentTenants")}
            >
              {summary.recentTenants.length ? (
                  <Box sx={dashboardListSx}>
                    {summary.recentTenants.map((tenant) => (
                      <Stack
                        key={tenant.id}
                        direction="row"
                        sx={{
                          alignItems: "center",
                          bgcolor: "action.hover",
                          borderRadius: 2,
                          gap: 2,
                          justifyContent: "space-between",
                          mb: 0.75,
                          px: 1.25,
                          py: 1,
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
                  </Box>
                ) : (
                  <Typography color="text.secondary" sx={{ mt: 1 }}>
                    {t("superAdminDashboard.noTenants")}
                  </Typography>
              )}
            </DashboardPanel>
          </Box>
        </Box>
      )}
    </ContentWrapper>
  );
}

function DashboardActionButton({
  color,
  filled = false,
  href,
  icon,
  label,
}: {
  color: MetricColor;
  filled?: boolean;
  href: AppPath;
  icon: ReactNode;
  label: ReactNode;
}) {
  const theme = useTheme();
  const palette = theme.palette[color];
  const foreground = filled ? palette.contrastText : palette.main;

  return (
    <Button
      color={color}
      component={Link}
      disableElevation
      endIcon={(
        <ArrowForwardRoundedIcon
          fontSize="small"
          sx={{ transform: theme.direction === "rtl" ? "rotate(180deg)" : undefined }}
        />
      )}
      href={href}
      startIcon={(
        <Box
          sx={{
            alignItems: "center",
            bgcolor: filled ? alpha(palette.contrastText, 0.16) : alpha(palette.main, 0.12),
            borderRadius: 1.75,
            color: foreground,
            display: "flex",
            height: 34,
            justifyContent: "center",
            width: 34,
          }}
        >
          {icon}
        </Box>
      )}
      variant={filled ? "contained" : "outlined"}
      sx={{
        background: filled
          ? `linear-gradient(135deg, ${palette.dark}, ${palette.main})`
          : `linear-gradient(135deg, ${alpha(palette.main, 0.1)}, ${alpha(
              theme.palette.background.paper,
              0.92,
            )})`,
        borderColor: alpha(palette.main, 0.45),
        borderRadius: 2.5,
        boxShadow: filled
          ? `0 8px 22px ${alpha(palette.main, 0.24)}`
          : `0 6px 18px ${alpha(palette.main, 0.1)}`,
        color: foreground,
        flex: 1,
        fontWeight: 800,
        gap: 1,
        justifyContent: "flex-start",
        minHeight: 54,
        minWidth: { sm: 216 },
        px: 1.25,
        textTransform: "none",
        transition: theme.transitions.create(["background", "border-color", "box-shadow", "transform"]),
        whiteSpace: "nowrap",
        width: { xs: "100%", sm: "auto" },
        "& .MuiButton-startIcon": { m: 0 },
        "& .MuiButton-endIcon": { marginInlineEnd: 0, marginInlineStart: "auto" },
        "&:hover": {
          background: filled
            ? `linear-gradient(135deg, ${palette.main}, ${palette.light})`
            : `linear-gradient(135deg, ${alpha(palette.main, 0.16)}, ${alpha(
                theme.palette.background.paper,
                0.98,
              )})`,
          borderColor: palette.main,
          boxShadow: `0 10px 26px ${alpha(palette.main, filled ? 0.3 : 0.16)}`,
          transform: "translateY(-2px)",
        },
        "@media (prefers-reduced-motion: reduce)": {
          transition: "none",
          "&:hover": { transform: "none" },
        },
      }}
    >
      {label}
    </Button>
  );
}

function DashboardPanel({
  color,
  children,
  icon,
  title,
}: {
  color: MetricColor;
  children: ReactNode;
  icon: ReactNode;
  title: ReactNode;
}) {
  const theme = useTheme();
  const palette = theme.palette[color];

  return (
    <Card
      variant="outlined"
      sx={{
        background: `linear-gradient(145deg, ${alpha(palette.main, 0.075)}, ${alpha(
          theme.palette.background.paper,
          0.98,
        )} 42%)`,
        borderColor: alpha(palette.main, 0.2),
        borderRadius: 3,
        boxShadow: `0 10px 30px ${alpha(palette.main, 0.07)}`,
        display: "flex",
        minHeight: 0,
        overflow: "hidden",
      }}
    >
      <CardContent
        sx={{
          display: "flex",
          flex: 1,
          flexDirection: "column",
          minHeight: 0,
          p: 1.5,
          "&:last-child": { pb: 1.5 },
        }}
      >
        <Stack
          direction="row"
          sx={{ alignItems: "center", flexShrink: 0, gap: 1, minHeight: 34 }}
        >
          <Avatar
            variant="rounded"
            sx={{
              bgcolor: alpha(palette.main, 0.12),
              color: palette.main,
              height: 34,
              width: 34,
            }}
          >
            {icon}
          </Avatar>
          <Typography noWrap sx={{ fontWeight: 800 }} variant="subtitle1">
            {title}
          </Typography>
        </Stack>
        <Box sx={{ flex: 1, minHeight: 0, mt: 1 }}>{children}</Box>
      </CardContent>
    </Card>
  );
}

function SubscriptionOverview({
  counts,
  total,
}: {
  counts: Record<SubscriptionStatus, number>;
  total: number;
}) {
  const { t } = useTranslation();
  const theme = useTheme();
  const statusColor = (status: SubscriptionStatus) => {
    const color = getStatusColor(status);
    return color === "default" ? theme.palette.grey[500] : theme.palette[color].main;
  };

  return (
    <Stack sx={{ height: "100%", justifyContent: "center", minHeight: 0 }} spacing={1}>
      <Stack direction="row" sx={{ alignItems: "baseline", justifyContent: "space-between" }}>
        <Typography color="text.secondary" variant="caption">
          {t("superAdminDashboard.totalTenants")}
        </Typography>
        <Typography sx={{ fontWeight: 900 }} variant="h6">
          {total}
        </Typography>
      </Stack>

      <Box
        aria-label={t("superAdminDashboard.subscriptionOverview")}
        sx={{
          bgcolor: "action.hover",
          borderRadius: 999,
          display: "flex",
          height: 9,
          overflow: "hidden",
          width: "100%",
        }}
      >
        {total > 0
          ? subscriptionStatuses.map((status) => {
              const count = counts[status];
              return count > 0 ? (
                <Box
                  key={status}
                  title={`${t(`tenantManagement.statuses.${status}`)}: ${count}`}
                  sx={{ bgcolor: statusColor(status), flexGrow: count, minWidth: 3 }}
                />
              ) : null;
            })
          : null}
      </Box>

      <Box
        sx={{
          display: "grid",
          gap: 0.65,
          gridTemplateColumns: "repeat(4, minmax(0, 1fr))",
          minWidth: 0,
        }}
      >
        {subscriptionStatuses.map((status) => (
          <Stack
            key={status}
            direction="row"
            sx={{
              alignItems: "center",
              bgcolor: alpha(statusColor(status), 0.075),
              borderRadius: 1.5,
              gap: 0.75,
              minWidth: 0,
              px: 0.8,
              py: 0.55,
            }}
          >
            <Box
              sx={{
                bgcolor: statusColor(status),
                borderRadius: "50%",
                flexShrink: 0,
                height: 7,
                width: 7,
              }}
            />
            <Typography noWrap sx={{ flex: 1, minWidth: 0 }} variant="caption">
              {t(`tenantManagement.statuses.${status}`)}
            </Typography>
            <Typography sx={{ fontWeight: 900 }} variant="caption">
              {counts[status]}
            </Typography>
          </Stack>
        ))}
      </Box>
    </Stack>
  );
}

function CapacityRow({ label, used, limit }: { label: string; used: number; limit: number }) {
  const { t } = useTranslation();
  const percent = limit > 0 ? Math.min(100, Math.round((used / limit) * 100)) : 0;

  return (
    <Stack spacing={0.8} sx={{ bgcolor: "action.hover", borderRadius: 2, px: 1.25, py: 1 }}>
      <Stack direction="row" sx={{ gap: 2, justifyContent: "space-between" }}>
        <Typography sx={{ fontWeight: 700 }}>{label}</Typography>
        <Typography color="text.secondary" variant="body2">
          {t("superAdminDashboard.seatsUsed", { used, limit })}
        </Typography>
      </Stack>
      <LinearProgress
        color={percent >= 90 ? "warning" : "primary"}
        sx={{ borderRadius: 999, height: 7 }}
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
    recentTenants: [...tenants].sort((left, right) =>
      new Date(right.createdOn).getTime() - new Date(left.createdOn).getTime()
    ),
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
