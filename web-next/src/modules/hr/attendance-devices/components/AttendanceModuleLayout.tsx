"use client";
import FingerprintRoundedIcon from "@mui/icons-material/FingerprintRounded";
import ManageSearchRoundedIcon from "@mui/icons-material/ManageSearchRounded";
import PeopleAltRoundedIcon from "@mui/icons-material/PeopleAltRounded";
import QueryStatsRoundedIcon from "@mui/icons-material/QueryStatsRounded";
import { useTranslation } from "react-i18next";
import { appRoutes } from "@/config/routes";
import { useSession } from "@/lib/auth/SessionContext";
import { permissions } from "@/lib/auth/permissions";
import { FeatureModuleLayout } from "@/shared/components/layout";
import type { ReactNode } from "react";
export function AttendanceModuleLayout({ children }: { children: ReactNode }) {
  const { t } = useTranslation();
  const { hasPermission } = useSession();
  const canViewRaw = hasPermission([permissions.ViewRawAttendanceDevices]);
  const items = [
    { id: "devices", label: t("attendanceDevices.devices"), href: appRoutes.modules.hr.attendanceDevices.index, icon: <FingerprintRoundedIcon /> },
    ...(canViewRaw ? [
      { id: "users", label: t("attendanceDevices.rawUsers"), href: appRoutes.modules.hr.attendanceDevices.users, icon: <PeopleAltRoundedIcon /> },
      { id: "punches", label: t("attendanceDevices.rawPunches"), href: appRoutes.modules.hr.attendanceDevices.punches, icon: <ManageSearchRoundedIcon /> },
      { id: "runs", label: t("attendanceDevices.pullRuns"), href: appRoutes.modules.hr.attendanceDevices.pullRuns, icon: <QueryStatsRoundedIcon /> },
    ] : []),
  ];
  return <FeatureModuleLayout title={t("attendanceDevices.title")} description={t("attendanceDevices.description")} moduleHref={appRoutes.modules.hr.attendanceDevices.index} moduleIcon={<FingerprintRoundedIcon />} navigationLabel={t("attendanceDevices.navigation")} openNavigationLabel={t("attendanceDevices.openNavigation")} closeNavigationLabel={t("attendanceDevices.closeNavigation")} backLabel={t("menu.dashboard")} backHref={appRoutes.shell.home} items={items}>{children}</FeatureModuleLayout>;
}
