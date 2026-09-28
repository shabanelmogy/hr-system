"use client";

import CalendarMonthRoundedIcon from "@mui/icons-material/CalendarMonthRounded";
import { useMemo } from "react";
import { useTranslation } from "react-i18next";
import { permissions } from "@/lib/auth/permissions";
import { AccountingTranslationScope } from "@/locales/scopes/AccountingTranslationScope";
import { ContextSwitcher, type ContextSwitcherItem } from "@/shared/components/layout";
import { useUnsavedChanges } from "@/shared/contexts/UnsavedChangesContext";
import { usePermissions } from "@/shared/hooks/usePermissions";
import useNotifications from "@/shared/hooks/useNotifications";
import { extractErrorMessage } from "@/shared/utils/errorUtils";
import {
  useFiscalYearContext,
  useUpdateFiscalYearContext,
} from "../hooks/useFiscalYearQueries";
import type { FiscalYearLookup } from "../types/FiscalYear";

interface FiscalYearContextSwitcherProps {
  compact?: boolean;
  iconOnly?: boolean;
}

/** Accounting-owned content injected by the app composition root into the generic shell slot. */
export function FiscalYearContextSwitcher(props: FiscalYearContextSwitcherProps) {
  return (
    <AccountingTranslationScope>
      <FiscalYearContextSwitcherContent {...props} />
    </AccountingTranslationScope>
  );
}

function FiscalYearContextSwitcherContent({
  compact = false,
  iconOnly = false,
}: FiscalYearContextSwitcherProps) {
  const { t, i18n } = useTranslation();
  const { hasPermission } = usePermissions();
  const { requestDiscard } = useUnsavedChanges();
  const { showError, showSuccess, SnackbarComponent } = useNotifications();
  const canView = hasPermission(permissions.ViewFiscalYears);
  const context = useFiscalYearContext(canView);
  const updateContext = useUpdateFiscalYearContext();
  const isArabic = i18n.resolvedLanguage?.startsWith("ar") ?? false;
  const items = useMemo(
    () => (context.data?.availableFiscalYears ?? []).map<ContextSwitcherItem<number>>(
      (fiscalYear) => ({
        value: fiscalYear.id,
        label: getFiscalYearName(fiscalYear, isArabic),
        secondaryLabel: fiscalYear.isCurrent
          ? t("fiscalYears.context.companyCurrent")
          : `${fiscalYear.startDate} — ${fiscalYear.endDate}`,
        icon: <CalendarMonthRoundedIcon />,
      }),
    ),
    [context.data?.availableFiscalYears, isArabic, t],
  );

  if (!canView) return null;

  const selectedId = context.data?.selectedFiscalYear?.id ?? 0;
  const handleChange = async (fiscalYearId: number) => {
    if (!(await requestDiscard())) return;

    try {
      const result = await updateContext.mutateAsync(fiscalYearId);
      const selected = result.selectedFiscalYear;
      showSuccess(t("fiscalYears.context.switchSuccess", {
        fiscalYear: selected ? getFiscalYearName(selected, isArabic) : "",
      }));
    } catch (error) {
      showError(extractErrorMessage(error) || t("fiscalYears.context.switchError"));
    }
  };

  return (
    <>
      <ContextSwitcher<number>
        items={items}
        value={selectedId}
        onChange={handleChange}
        label={t("fiscalYears.context.label")}
        emptyLabel={context.isError
          ? t("fiscalYears.context.loadError")
          : t("fiscalYears.context.noSelection")}
        menuLabel={t("fiscalYears.context.menuLabel")}
        icon={<CalendarMonthRoundedIcon />}
        compact={compact}
        iconOnly={iconOnly}
        loading={context.isLoading || updateContext.isPending}
        disabled={context.isError || items.length === 0}
        error={context.isError}
        tone="warning"
      />
      {SnackbarComponent}
    </>
  );
}

function getFiscalYearName(fiscalYear: FiscalYearLookup, isArabic: boolean) {
  return (isArabic ? fiscalYear.nameAr : fiscalYear.nameEn).trim() ||
    (isArabic ? fiscalYear.nameEn : fiscalYear.nameAr).trim() ||
    fiscalYear.code;
}
