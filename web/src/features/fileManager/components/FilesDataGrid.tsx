import MyDataGrid from "@/shared/components/common/datagrid/myDataGrid";
import { useCallback, useMemo } from "react";
import makeFileActions from "./gridView/components/makeFileActions";
import makeFileColumns from "./gridView/components/makeFileColumns";
import { FilesDataGridProps } from "./gridView/types/gridView.type";
import { MyContentsWrapper } from "@/layouts/components";

const FilesDataGrid = ({
  files,
  loading,
  apiRef,
  onDownload,
  onView,
  onDelete,
  onAdd,
  t,
}: FilesDataGridProps) => {
  const getActions = useCallback(
    makeFileActions({ t, onDownload, onView, onDelete }),
    [t, onDownload, onView, onDelete]
  );

  const columns = useMemo(
    () => makeFileColumns({ t, getActions }),
    [t, getActions]
  );

  return (
    <MyContentsWrapper>
      <MyDataGrid
        rows={files}
        columns={columns}
        loading={loading}
        apiRef={apiRef}
        filterMode="client"
        sortModel={[{ field: "createdOn", sort: "asc" }]}
        addNewRow={onAdd}
        pagination
        pageSizeOptions={[5, 10, 25, 50]}
        fileName="files"
        reportPdfHeader="Files Report"
      />
    </MyContentsWrapper>
  );
};

export default FilesDataGrid;
