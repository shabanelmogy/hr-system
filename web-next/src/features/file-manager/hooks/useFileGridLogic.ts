// hooks/useFileGridLogic.ts - TanStack Query Implementation
import { showToast } from "@/shared/components/feedback/transient";
import { extractErrorMessage } from "@/shared/utils";
import {
  useGridApiRef,
  type GridApi,
  type GridPaginationModel,
  type GridRowId,
} from "@mui/x-data-grid";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { useRouter } from "next/navigation";
import { FileItem, UseFileGridLogicReturn } from "../types/File";
import { appRoutes } from "@/config";
import {
  useFiles,
  useDeleteFile,
  useUploadFiles,
  useDownloadFile,
} from "./useFileQueries";

type DialogType = "upload" | "delete" | null;

const useFileGridLogic = (): UseFileGridLogicReturn => {
  // Hooks
  const { t } = useTranslation();
  const router = useRouter();

  // TanStack Query hooks
  const {
    data: files = [],
    isLoading: loading,
    error,
    refetch,
    isFetching,
  } = useFiles();

  // Handle query error separately using useEffect
  useEffect(() => {
    if (error) {
      const errorMessage = extractErrorMessage(error);
      showToast.error(errorMessage || t("files.fetchError"));
    }
  }, [error, t]);

  const deleteFileMutation = useDeleteFile({
    onSuccess: () => {
      showToast.success(t("files.deleted"));

      setRowDeleted(true);
      setDialogType(null);
      setSelectedFile(null);

      // Clear the highlight after 4 seconds
      setTimeout(() => {
        setLastDeletedSortedIndex(null);
      }, 4000);
    },
    onError: (error: Error) => {
      const errorMessage = extractErrorMessage(error);
      showToast.error(t("files.deleteError") || errorMessage);
    },
  });

  const uploadFilesMutation = useUploadFiles({
    onSuccess: (result) => {
      if (result.success) {
        showToast.success(t("files.uploaded"));
        setDialogType(null);
      } else {
        showToast.error(result.message);
      }
    },
    onError: (error: Error) => {
      const errorMessage = extractErrorMessage(error);
      showToast.error(t("files.uploadError") || errorMessage);
    },
  });

  const downloadFileMutation = useDownloadFile({
    onSuccess: () => {
      showToast.success(t("files.downloadStarted"));
    },
    onError: (error: Error) => {
      const errorMessage = extractErrorMessage(error);
      showToast.error(t("files.downloadError") || errorMessage);
    },
  });

  // State management
  const [dialogType, setDialogType] = useState<DialogType>(null);
  const [selectedFile, setSelectedFile] = useState<FileItem | null>(null);

  // Navigation state variables
  const [rowDeleted, setRowDeleted] = useState<boolean>(false);
  const [lastDeletedSortedIndex, setLastDeletedSortedIndex] = useState<
    number | null
  >(null);
  const [newRowAdded, setNewRowAdded] = useState<boolean>(false);
  const [lastAddedRowId, setLastAddedRowId] = useState<number | null>(null);
  const [pendingAddedFileName, setPendingAddedFileName] = useState<
    string | null
  >(null);

  const apiRef = useGridApiRef();

  // Reliable navigation helper: change page if needed, then select and scroll
  const navigateTo = useCallback(
    (targetIndex: number, targetRowId: GridRowId) => {
      const api: GridApi | null = apiRef.current;
      if (!api || targetIndex < 0) return;

      const pageSize = api.state.pagination.paginationModel.pageSize || 5;
      const targetPage = Math.floor(targetIndex / pageSize);
      const rowIndexOnPage = targetIndex % pageSize;

      const finalize = () => {
        const cur = apiRef.current;
        if (!cur) return;
        cur.setRowSelectionModel({ type: "include", ids: new Set([targetRowId]) });
        cur.scrollToIndexes({ rowIndex: rowIndexOnPage, colIndex: 0 });
      };

      const currentPage = api.state?.pagination?.paginationModel?.page ?? 0;
      if (currentPage === targetPage) {
        setTimeout(finalize, 0);
      } else {
        let unsub: (() => void) | null = null;
        const onPageChange = (model: GridPaginationModel) => {
          const page = model.page ?? api.state.pagination.paginationModel.page;
          if (page === targetPage) {
            unsub?.();
            setTimeout(finalize, 50);
          }
        };
        unsub = api.subscribeEvent("paginationModelChange", onPageChange);
        api.setPage(targetPage);
      }
    },
    [apiRef]
  );

  // Memoized files
  const stableFiles = useMemo((): FileItem[] => files, [files]);

  // Check for any loading state from mutations
  const isAnyLoading: boolean =
    loading ||
    uploadFilesMutation.isPending ||
    deleteFileMutation.isPending ||
    downloadFileMutation.isPending;

  // Dialog management
  const openDialog = useCallback(
    (type: DialogType, file: FileItem | null = null) => {
      setDialogType(type);
      setSelectedFile(file);
    },
    []
  );

  const closeDialog = useCallback(() => {
    setDialogType(null);
    setSelectedFile(null);
  }, []);

  // Scroll to the previous row after deletion
  useEffect(() => {
    if (rowDeleted && lastDeletedSortedIndex !== null && apiRef.current) {
      const newSortedIds = apiRef.current.getSortedRowIds();
      const prevSortedIndex = lastDeletedSortedIndex - 1;
      if (prevSortedIndex >= 0 && prevSortedIndex < newSortedIds.length) {
        const prevRowId = newSortedIds[prevSortedIndex];
        const pageSize =
          apiRef.current.state.pagination.paginationModel.pageSize;
        const newPage = Math.floor(prevSortedIndex / pageSize);
        const rowIndexOnPage = prevSortedIndex % pageSize;

        apiRef.current.setPage(newPage);
        apiRef.current.setRowSelectionModel({ type: "include", ids: new Set([prevRowId]) });
        apiRef.current.scrollToIndexes({
          rowIndex: rowIndexOnPage,
          colIndex: 0,
        });
      }
      setRowDeleted(false);
      setLastDeletedSortedIndex(null);
    }
  }, [rowDeleted, lastDeletedSortedIndex]);

  // Scroll to the last added row (match Countries logic, with filename fallback)
  useEffect(() => {
    if (!newRowAdded || !apiRef.current || files.length === 0) return;

    const api = apiRef.current;
    if (!api) return;

    // Resolve effective ID
    let effectiveId: number | null = lastAddedRowId;
    if (effectiveId === null && pendingAddedFileName) {
      const uploadedFile = files.find(
        (f) => f.fileName === pendingAddedFileName
      );
      if (uploadedFile) {
        effectiveId = uploadedFile.id;
        setLastAddedRowId(effectiveId);
      }
    }

    // Compute target index and row id
    let targetIndex = -1;
    let targetRowId: GridRowId | null = null;
    if (effectiveId !== null) {
      const sortedIds = api.getSortedRowIds();
      targetIndex = sortedIds.findIndex(
        (id) => String(id) === String(effectiveId)
      );
      if (targetIndex >= 0) targetRowId = sortedIds[targetIndex];
    }

    // Fallback to last row if ID not resolved
    if (targetIndex < 0) {
      const sortedIds = api.getSortedRowIds();
      if (sortedIds.length > 0) {
        targetIndex = sortedIds.length - 1;
        targetRowId = sortedIds[targetIndex];
      }
    }

    if (targetIndex >= 0 && targetRowId !== null) {
      navigateTo(targetIndex, targetRowId);
      setNewRowAdded(false);
      setLastAddedRowId(null);
      setPendingAddedFileName(null);
    }
  }, [newRowAdded, files, lastAddedRowId, pendingAddedFileName, navigateTo]);

  // Additional effect to handle row selection when data is refetched (match Countries logic)
  useEffect(() => {
    if (
      !newRowAdded ||
      isFetching ||
      loading ||
      !apiRef.current ||
      files.length === 0
    )
      return;

    const api = apiRef.current;
    if (!api) return;

    // Resolve effective ID
    let effectiveId: number | null = lastAddedRowId;
    if (effectiveId === null && pendingAddedFileName) {
      const uploadedFile = files.find(
        (f) => f.fileName === pendingAddedFileName
      );
      if (uploadedFile) {
        effectiveId = uploadedFile.id;
        setLastAddedRowId(effectiveId);
      }
    }

    // Compute target index and row id
    let targetIndex = -1;
    let targetRowId: GridRowId | null = null;
    if (effectiveId !== null) {
      const sortedIds = api.getSortedRowIds();
      targetIndex = sortedIds.findIndex(
        (id) => String(id) === String(effectiveId)
      );
      if (targetIndex >= 0) targetRowId = sortedIds[targetIndex];
    }

    // Fallback to last row if ID not resolved
    if (targetIndex < 0) {
      const sortedIds = api.getSortedRowIds();
      if (sortedIds.length > 0) {
        targetIndex = sortedIds.length - 1;
        targetRowId = sortedIds[targetIndex];
      }
    }

    if (targetIndex >= 0 && targetRowId !== null) {
      setTimeout(() => {
        navigateTo(targetIndex, targetRowId);
        setNewRowAdded(false);
        setLastAddedRowId(null);
        setPendingAddedFileName(null);
      }, 150);
    }
  }, [
    isFetching,
    loading,
    lastAddedRowId,
    newRowAdded,
    files,
    pendingAddedFileName,
    navigateTo,
  ]);

  // Delete handler
  const handleDelete = useCallback(async (): Promise<void> => {
    if (!selectedFile?.storedFileName || !apiRef.current) return;

    try {
      const sortedIds = apiRef.current.getSortedRowIds();
      const deletedSortedIndex = sortedIds.indexOf(selectedFile.id);

      await deleteFileMutation.mutateAsync(selectedFile.storedFileName);

      // Update selected file for navigation
      let newSelectedFile: FileItem | null = null;
      if (files.length > 1) {
        // Will be length - 1 after deletion
        const currentIndex = files.findIndex(
          (file) => file.id === selectedFile.id
        );
        newSelectedFile =
          currentIndex > 0
            ? files[Math.min(currentIndex - 1, files.length - 2)]
            : files[1]; // Take the second item since first will be deleted
      }

      setSelectedFile(newSelectedFile);
      setLastDeletedSortedIndex(deletedSortedIndex);
    } catch (error) {}
  }, [selectedFile, files, deleteFileMutation, apiRef]);

  // Action handlers
  const handleDeleteDialog = useCallback(
    (file: FileItem) => {
      openDialog("delete", file);
    },
    [openDialog]
  );

  const handleUpload = useCallback(() => {
    openDialog("upload");
  }, [openDialog]);

  // Download file handler
  const handleDownload = useCallback(
    async (file: FileItem) => {
      if (!file?.storedFileName || !file?.fileName) return;
      downloadFileMutation.mutate({
        storedFileName: file.storedFileName,
        fileName: file.fileName,
      });
    },
    [downloadFileMutation]
  );

  // View file handler - navigates to media viewer
  const handleView = useCallback(
    (file: FileItem) => {
      try {
        const url = appRoutes.extras.mediaViewer(String(file.id), file.fileExtension, file.storedFileName, file.fileName);
        router.push(url);
      } catch (error) {
        showToast.error(t("files.failedToOpenViewer"));
      }
    },
    [router, t]
  );

  // Refresh handler
  const handleRefresh = useCallback(async () => {
    await refetch();
  }, [refetch]);

  // Upload success handler
  const handleUploadSuccess = useCallback(
    (fileName: string) => {
      // Track the file name to resolve ID after refetch if needed
      setPendingAddedFileName(fileName);

      // Try immediate ID resolution if available to speed up navigation
      const uploadedFile = files.find((file) => file.fileName === fileName);
      if (uploadedFile) {
        setLastAddedRowId(uploadedFile.id);
      }

      setNewRowAdded(true);
    },
    [files]
  );

  return {
    // State
    dialogType,
    selectedFile,
    loading: isAnyLoading,
    files: stableFiles,
    apiRef,
    error,
    isFetching,

    // Dialog methods
    openDialog,
    closeDialog,

    // Form and action handlers
    handleDelete,
    handleRefresh,

    // Action methods
    onDelete: handleDeleteDialog,
    onUpload: handleUpload,
    handleDownload,
    handleView,

    // Mutation states for advanced UI feedback
    isUploading: uploadFilesMutation.isPending,
    isDeleting: deleteFileMutation.isPending,

    // Highlighting/Navigation state for card view
    lastDeletedIndex: lastDeletedSortedIndex,

    // Upload success handler
    handleUploadSuccess,
  };
};

export default useFileGridLogic;
