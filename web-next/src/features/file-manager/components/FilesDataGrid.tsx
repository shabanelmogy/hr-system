import { MyDataGrid } from "@/shared/components/data-grid";
import { useCallback, useMemo } from "react";
import makeFileActions from "./grid-view/components/MakeFileActions";
import makeFileColumns from "./grid-view/components/MakeFileColumns";
import { FilesDataGridProps } from "./grid-view/types/gridView.type";
import { ContentWrapper } from "@/shared/components/layout";

const FilesDataGrid = ({
  files,
  loading,
  apiRef,
  onDownload,
  onView,
  onDelete,
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
    <ContentWrapper>
      <MyDataGrid
        rows={files}
        columns={columns}
        loading={loading}
        apiRef={apiRef ?? undefined}
        filterMode="client"
        initialSortModel={[{ field: "createdOn", sort: "asc" }]}
        pagination
        pageSizeOptions={[5, 10, 25, 50]}
      />
    </ContentWrapper>
  );
};

export default FilesDataGrid;
