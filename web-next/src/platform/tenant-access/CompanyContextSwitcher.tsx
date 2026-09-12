"use client";

import BusinessRoundedIcon from "@mui/icons-material/BusinessRounded";
import { useMemo } from "react";
import { useTranslation } from "react-i18next";
import { ContextSwitcher, type ContextSwitcherItem } from "@/shared/components/layout";
import useNotifications from "@/shared/hooks/useNotifications";
import { useCompanyContextTransition } from "./useCompanyContextTransition";

export function CompanyContextSwitcher({ compact = false }: { compact?: boolean }) {
  const {
    user,
    transitionToCompany,
    isSwitchingCompany,
  } = useCompanyContextTransition();
  const { t, i18n } = useTranslation();
  const { showError, showSuccess, SnackbarComponent } = useNotifications();
  const isArabic = i18n.resolvedLanguage?.startsWith("ar") ?? false;
  const isSuperAdmin = user?.roles.some(
    (role) => role.trim().toLowerCase() === "super_admin",
  ) ?? false;
  const companies = user?.companies ?? [];
  const currentName = useMemo(
    () => getCompanyName(
      user?.companyNameAr ?? "",
      user?.companyNameEn ?? "",
      user?.companyCode ?? "",
      isArabic,
    ),
    [isArabic, user?.companyCode, user?.companyNameAr, user?.companyNameEn],
  );

  if (!user || isSuperAdmin || !currentName) return null;

  const handleSwitch = async (companyId: number) => {
    if (companyId === user.companyId) {
      return;
    }

    try {
      const switched = await transitionToCompany(companyId);
      if (switched) showSuccess(t("auth.companySwitched"));
    } catch {
      showError(t("auth.companySwitchFailed"));
    }
  };

  return (
    <>
      <ContextSwitcher<number>
        items={companies.map<ContextSwitcherItem<number>>((company) => ({
          value: company.id,
          label: getCompanyName(company.nameAr, company.nameEn, company.companyCode, isArabic),
          secondaryLabel: company.companyCode,
          icon: <BusinessRoundedIcon />,
        }))}
        value={user.companyId}
        onChange={handleSwitch}
        label={t("auth.currentCompany")}
        menuLabel={t("auth.switchCompany")}
        icon={<BusinessRoundedIcon />}
        compact={compact}
        loading={isSwitchingCompany}
      />
      {SnackbarComponent}
    </>
  );
}

function getCompanyName(
  nameAr: string,
  nameEn: string,
  companyCode: string,
  isArabic: boolean,
) {
  return (isArabic ? nameAr : nameEn).trim() ||
    (isArabic ? nameEn : nameAr).trim() ||
    companyCode.trim();
}
