"use client";

import { useTranslation } from "react-i18next";
import { ContentWrapper } from "@/shared/components/layout";
import { PageHeader } from "@/shared/components/navigation/header";
import { useQueryErrorNotification } from "@/shared/hooks";
import TrackChangesDataGrid from "../components/TrackChangesDataGrid";
import useTrackChangesQuery from "../hooks/useTrackChangesQuery";

export default function TrackChangesPage() {
  const { t } = useTranslation();
  const { data: changes = [], isLoading, error } = useTrackChangesQuery();

  useQueryErrorNotification(error);

  return (
    <ContentWrapper>
      <PageHeader
        title={t("trackChanges.title")}
        subTitle={t("trackChanges.subTitle")}
      />
      <TrackChangesDataGrid loading={isLoading} rows={changes} />
    </ContentWrapper>
  );
}
