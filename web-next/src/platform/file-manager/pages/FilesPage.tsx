"use client";

import ContentsWrapper from "@/shared/components/layout/ContentWrapper";
import { useSnackbar } from "@/shared/hooks";
import { Dialog } from "@mui/material";
import dynamic from "next/dynamic";
import { useCallback } from "react";
import { useTranslation } from "react-i18next";
import FilesMultiView from "../components/FilesMultiView";
import useFileGridLogic from "../hooks/useFileGridLogic";

const FileDeleteDialog = dynamic(() => import("@/platform/file-manager/components/dialog/FileDeleteDialog"), { ssr: false });
const FileUpload = dynamic(() => import("../components/file-upload/FileUploadPage"), { ssr: false });

const FilesPage = () => {

  const { SnackbarComponent } = useSnackbar();
  const { t } = useTranslation();

  // Custom logic hooks
  const {
    dialogType,
    selectedFile,
    loading,
    files,
    apiRef,
    closeDialog,
    handleDelete,
    handleRefresh,
    onDelete,
    onUpload,
    handleDownload,
    handleView,
    handleUploadSuccess,
  } = useFileGridLogic();


  // Form submission handler for upload success
  const handleFormSubmit = useCallback(
    async (fileName: string) => {
      // Refetch files after upload
      await handleRefresh();
      // Trigger navigation to uploaded file
      handleUploadSuccess(fileName);
    },
    [handleRefresh, handleUploadSuccess]
  );

  return (
    <>
      <ContentsWrapper>
        <FilesMultiView
          files={files}
          loading={loading}
          apiRef={apiRef}
          onDownload={handleDownload}
          onView={handleView}
          onDelete={onDelete}
          onAdd={onUpload}
          onRefresh={handleRefresh}
          t={t}
        />

        {dialogType === "upload" ? <Dialog
          open
          onClose={(_, reason) => {
            if (!loading || reason !== "escapeKeyDown") closeDialog();
          }}
          maxWidth="sm"
          fullWidth
        >
          <FileUpload
            onSuccess={handleFormSubmit}
            onClose={closeDialog}
            multiple={true}
          />
        </Dialog> : null}

        {dialogType === "delete" ? <FileDeleteDialog
          open
          onClose={closeDialog}
          onConfirm={handleDelete}
          selectedFile={selectedFile}
          loading={loading}
        /> : null}
      </ContentsWrapper>
      {SnackbarComponent}
    </>
  );
};

export default FilesPage;
