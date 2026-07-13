import { dateFormat } from "@/constants/strings";
import { MyContentsWrapper } from "@/layouts/components";
import { MyDataGrid, MyHeader } from "@/shared/components";
import { useSnackbar } from "@/shared/hooks";
import { apiService, HandleApiError } from "@/shared/services";
import { useGridApiRef } from "@mui/x-data-grid";
import dayjs from "dayjs";
import { useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";


const TrackChangesGrid = () => {
  const [loading, setLoading] = useState(true);
  const { showSnackbar, SnackbarComponent } = useSnackbar();
  const [changes, setChanges] = useState([]);
  const { t } = useTranslation();
  const apiRef = useGridApiRef(); // Add this line

  useEffect(() => {
    getAllChanges();
  }, []);

  const getAllChanges = async () => {
    try {
      setLoading(true);
      const response = await apiService.get(
        "/api/v1/EntityChangeLogs/GetAllChangesLogs"
      );
      const allChanges = response.data || response;
      setChanges(
        allChanges.map((row: any) => ({ ...row, id: crypto.randomUUID() }))
      );
    } catch (error) {
      HandleApiError(error, (updatedState: any) => {
        showSnackbar("error", updatedState.messages, (error as any).title);
      });
    } finally {
      setLoading(false);
    }
  };

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
        valueFormatter: (params: any) => dayjs(params).format(dateFormat),
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
      <MyContentsWrapper>
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
      </MyContentsWrapper>
      {SnackbarComponent}
    </>
  );
};

export default TrackChangesGrid;
