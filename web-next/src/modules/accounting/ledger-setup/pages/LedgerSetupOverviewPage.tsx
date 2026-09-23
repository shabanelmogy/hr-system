"use client";

import { Box, Card, CardActionArea, CardContent, Grid, Typography } from "@mui/material";
import { useRouter } from "next/navigation";
import { useTranslation } from "react-i18next";
import { appRoutes } from "@/config/routes";
import { permissions } from "@/lib/auth/permissions";
import { usePermissions } from "@/shared/hooks/usePermissions";
import { PageHeader } from "@/shared/components/navigation/header";
import { useUnsavedChanges } from "@/shared/contexts/UnsavedChangesContext";

const entries = [
  { key: "fiscalYears", title: "menu.fiscalYears", path: appRoutes.modules.accounting.ledgerSetup.fiscalYears, permission: permissions.ViewFiscalYears },
  { key: "currencies", title: "menu.currencies", path: appRoutes.modules.accounting.ledgerSetup.currencies, permission: permissions.ViewAccountingSetup },
  { key: "settings", title: "menu.accountingSettings", path: appRoutes.modules.accounting.ledgerSetup.accountingSettings, permission: permissions.ViewAccountingSetup },
  { key: "accounts", title: "menu.chartOfAccounts", path: appRoutes.modules.accounting.ledgerSetup.accounts, permission: permissions.ViewAccounts },
  { key: "hierarchy", title: "menu.hierarchyLevels", path: appRoutes.modules.accounting.ledgerSetup.hierarchyLevels, permission: permissions.ViewAccounts },
  { key: "dimensions", title: "menu.dimensions", path: appRoutes.modules.accounting.ledgerSetup.dimensions, permission: permissions.ViewDimensions },
  { key: "books", title: "menu.books", path: appRoutes.modules.accounting.ledgerSetup.books, permission: permissions.ViewAccountingSetup },
  { key: "journals", title: "menu.journals", path: appRoutes.modules.accounting.ledgerSetup.journals, permission: permissions.ViewAccountingSetup },
  { key: "rates", title: "menu.exchangeRates", path: appRoutes.modules.accounting.ledgerSetup.exchangeRates, permission: permissions.ViewAccountingSetup },
  { key: "determination", title: "menu.accountDetermination", path: appRoutes.modules.accounting.ledgerSetup.accountDetermination, permission: permissions.ViewAccountingSetup },
] as const;

export default function LedgerSetupOverviewPage() {
  const { t } = useTranslation();
  const router = useRouter();
  const { requestDiscard } = useUnsavedChanges();
  const auth = usePermissions();
  const visible = entries.filter((entry) => auth.hasPermission(entry.permission));
  const navigate = async (path: (typeof entries)[number]["path"]) => { if (await requestDiscard()) router.push(path); };
  return <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
    <PageHeader title={t("menu.ledgerSetup")} subTitle={t("ledgerSetup.subtitle")} />
    <Grid container spacing={2}>{visible.map((entry) => <Grid key={entry.key} size={{ xs: 12, sm: 6, lg: 4 }}><Card variant="outlined"><CardActionArea onClick={() => void navigate(entry.path)}><CardContent><Typography variant="h6">{t(entry.title)}</Typography><Typography color="text.secondary" variant="body2" sx={{ mt: 1 }}>{t("ledgerSetup.overview.open")}</Typography></CardContent></CardActionArea></Card></Grid>)}</Grid>
  </Box>;
}
