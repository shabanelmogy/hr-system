"use client";

import { useTranslation } from "react-i18next";
import { ContentWrapper } from "@/shared/components/layout";
import { PageHeader } from "@/shared/components/navigation/header";
import HealthCheckPanel from "../components/HealthCheckPanel";

export default function HealthCheckPage() {
  const { t } = useTranslation();

  return (
    <ContentWrapper>
      <PageHeader
        title={t("healthCheck.title")}
        subTitle={t("healthCheck.subTitle")}
      />
      <HealthCheckPanel />
    </ContentWrapper>
  );
}
