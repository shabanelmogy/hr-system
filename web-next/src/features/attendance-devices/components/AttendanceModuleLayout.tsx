"use client";
import FingerprintRoundedIcon from "@mui/icons-material/FingerprintRounded";
import ManageSearchRoundedIcon from "@mui/icons-material/ManageSearchRounded";
import PeopleAltRoundedIcon from "@mui/icons-material/PeopleAltRounded";
import QueryStatsRoundedIcon from "@mui/icons-material/QueryStatsRounded";
import { useTranslation } from "react-i18next";
import { appRoutes } from "@/config/routes";
import { FeatureModuleLayout } from "@/shared/components/layout";
import type { ReactNode } from "react";
export function AttendanceModuleLayout({ children }: { children: ReactNode }) {
  const { t } = useTranslation();
  return <FeatureModuleLayout title={t("attendanceDevices.title")} description={t("attendanceDevices.description")} moduleHref={appRoutes.attendanceDevices.index} moduleIcon={<FingerprintRoundedIcon />} navigationLabel={t("attendanceDevices.navigation")} openNavigationLabel={t("attendanceDevices.openNavigation")} closeNavigationLabel={t("attendanceDevices.closeNavigation")} backLabel={t("menu.dashboard")} backHref={appRoutes.home} items={[
    { id: "devices", label: t("attendanceDevices.devices"), href: appRoutes.attendanceDevices.index, icon: <FingerprintRoundedIcon /> },
    { id: "users", label: t("attendanceDevices.rawUsers"), href: appRoutes.attendanceDevices.users, icon: <PeopleAltRoundedIcon /> },
    { id: "punches", label: t("attendanceDevices.rawPunches"), href: appRoutes.attendanceDevices.punches, icon: <ManageSearchRoundedIcon /> },
    { id: "runs", label: t("attendanceDevices.pullRuns"), href: appRoutes.attendanceDevices.pullRuns, icon: <QueryStatsRoundedIcon /> },
  ]}>{children}</FeatureModuleLayout>;
}
