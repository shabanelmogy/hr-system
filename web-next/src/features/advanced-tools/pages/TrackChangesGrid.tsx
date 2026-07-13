"use client";

import { DAYJS_DATE_FORMAT } from "@/shared/utils/dateFormats";
import { ContentWrapper } from "@/shared/components/layout";
import { MyDataGrid, MyHeader } from "@/shared/components/common";
import { useSnackbar } from "@/shared/hooks";
import { HandleApiError } from "@/shared/services";
import { useGridApiRef } from "@mui/x-data-grid";
import dayjs from "dayjs";
import { useEffect, useMemo } from "react";
import { useTranslation } from "react-i18next";
import { useTrackChanges } from "../hooks/useAdvancedToolsQueries";

const TrackChangesGrid = () => {
  const { showSnackbar, SnackbarComponent } = useSnackbar();
  const { t } = useTranslation();
  const apiRef = useGridApiRef();

  const { data: changes = [], isLoading: loading, error } = useTrackChanges();

  useEffect(() => {
    if (error) {
      HandleApiError(error, (updatedState: any) => {
        showSnackbar("error", updatedState.messages, (error as any).title);
      });
    }
  }, [error, showSnackbar]);

  const columns = useMemo(
    () => [
      {
        field: "changeLogId",
        headerName: t("trackChanges.changeLogId"),
        flex: 0.5,
        align: "center",
        headerAlign: "center",
      },
      {
        field: "entityName",
        headerName: t("trackChanges.entityName"),
        flex: 1,
        align: "center",
        headerAlign: "center",
      },
      {
        field: "key",
        headerName: t("trackChanges.key"),
        flex: 1.5,
        align: "center",
        headerAlign: "center",
      },
      {
        field: "oldValue",
        headerName: t("trackChanges.oldValue"),
        flex: 1,
        align: "center",
        headerAlign: "center",
      },
      {
        field: "newValue",
        headerName: t("trackChanges.newValue"),
        flex: 1,
        align: "center",
        headerAlign: "center",
      },
      {
        field: "changedBy",
        headerName: t("trackChanges.changedBy"),
        flex: 1,
        align: "center",
        headerAlign: "center",
      },
      {
        field: "changedAt",
        headerName: t("trackChanges.changedAt"),
        flex: 1,
        align: "center",
        headerAlign: "center",
        valueFormatter: (params: any) => dayjs(params).format(DAYJS_DATE_FORMAT),
      },
      {
        field: "changedByPc",
        headerName: t("trackChanges.changedByPc"),
        flex: 1,
        align: "center",
        headerAlign: "center",
      },
    ],
    [t]
  );

  return (
    <>
      <ContentWrapper>
        <MyHeader title={t("trackChanges.title")} subTitle={t("trackChanges.subTitle")} />
        {/* @ts-ignore */}
        <MyDataGrid
          rows={changes}
          columns={columns}
          loading={loading}
          apiRef={apiRef}
          showAddButton={false}
          filterMode="client"
          sortModel={[{ field: "id", sort: "asc" }]}
          pagination
          pageSizeOptions={[5, 10, 25]}
        />
      </ContentWrapper>
      {SnackbarComponent}
    </>
  );
};

export default TrackChangesGrid;
