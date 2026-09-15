"use client";

import ExternalToolFrame from "../components/ExternalToolFrame";
import { useTranslation } from "react-i18next";

export default function ApiEndpointsPage() {
  const { t } = useTranslation();
  return <ExternalToolFrame path="/swagger/index.html" title={t("externalTools.apiEndpoints")} />;
}
