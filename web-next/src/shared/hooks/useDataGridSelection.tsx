import { useEffect } from "react";

const useDataGridSelection = (
  apiRef: any,
  items: any[],
  newRowAdded: boolean,
  lastAddedRowId: any,
  rowEdited: boolean,
  lastEditedRowId: any,
  rowDeleted: boolean,
  lastDeletedRowIndex: number
) => {
  // Handle scrolling to newly added row
  useEffect(() => {
    if (newRowAdded && items.length > 0 && apiRef.current) {
      const lastRowIndex = items.length - 1;
      const pageSize = apiRef.current.state.pagination.paginationModel.pageSize;
      const newPage = Math.floor(lastRowIndex / pageSize);

      apiRef.current.setPage(newPage);
      apiRef.current.setRowSelectionModel({ type: "include", ids: new Set([lastAddedRowId]) });

      setTimeout(() => {
        apiRef.current.scrollToIndexes({
          rowIndex: lastRowIndex,
          columnIndex: 0,
          behavior: "smooth",
        });
      }, 300);
    }
  }, [newRowAdded, items, apiRef, lastAddedRowId]);

  // Handle scrolling to edited row
  useEffect(() => {
    if (rowEdited && items.length > 0 && apiRef.current) {
      const editedIndex = items.findIndex(
        (item) => item.id === lastEditedRowId
      );
      if (editedIndex >= 0 && editedIndex < items.length) {
        const pageSize =
          apiRef.current.state.pagination.paginationModel.pageSize;
        const newPage = Math.floor(editedIndex / pageSize);

        apiRef.current.setPage(newPage);
        apiRef.current.scrollToIndexes({ rowIndex: editedIndex, colIndex: 0 });
        apiRef.current.selectRow(lastEditedRowId, true);
      }
    }
  }, [rowEdited, items, apiRef, lastEditedRowId]);

  // Handle scrolling after row deletion
  useEffect(() => {
    if (rowDeleted && items.length > 0 && apiRef.current) {
      let prevRowIndex = lastDeletedRowIndex - 1;
      if (prevRowIndex < 0) {
        prevRowIndex = 0; // Go to the first row if deleted row was the first
      }

      if (prevRowIndex >= 0 && prevRowIndex < items.length) {
        const prevRowId = items[prevRowIndex].id;
        const pageSize =
          apiRef.current.state.pagination.paginationModel.pageSize;
        const newPage = Math.floor(prevRowIndex / pageSize);

        apiRef.current.setPage(newPage);
        apiRef.current.scrollToIndexes({ rowIndex: prevRowIndex, colIndex: 0 });
        apiRef.current.selectRow(prevRowId, true);
      }
    }
  }, [rowDeleted, items, apiRef, lastDeletedRowIndex]);
};

export default useDataGridSelection;

/* 
Example Of Use 
  useDataGridSelection(
    apiRef,
    categories,
    newRowAdded,
    lastAddedRowId,
    rowEdited,
    lastEditedRowId,
    rowDeleted,
    lastDeletedRowIndex
  );
*/
