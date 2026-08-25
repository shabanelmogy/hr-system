import LocationOnOutlined from "@mui/icons-material/LocationOnOutlined";
import { Box } from "@mui/material";
import { styled } from "@mui/material/styles";
import { useTranslation } from "react-i18next";
import {
  SpreadsheetImportCard,
  SpreadsheetImportFeedback,
} from "@/shared/components/file-upload";
import AddressTypeDataTable from "./AddressTypeDataTable";
import LoadingAlert from "./LoadingAlert";
import NoDataMessage from "./NoDataMessage";
import { useAddressTypeColumns } from "./UseAddressTypeColumns";
import { useAddressTypeImport } from "./useAddressTypeImport";

const AnimatedBox = styled(Box)({
  animation: "fadeIn 0.5s ease-in",
  "@keyframes fadeIn": {
    from: { opacity: 0, transform: "translateY(10px)" },
    to: { opacity: 1, transform: "translateY(0)" },
  },
});

interface AddressTypeImportViewProps {
  onReconcile?: () => void;
}

const AddressTypeImportView = ({ onReconcile }: AddressTypeImportViewProps) => {
  const { t } = useTranslation();
  const columns = useAddressTypeColumns();
  const {
    rows,
    viewState,
    viewMessage,
    loading,
    loadingText,
    showCounter,
    elapsedTime,
    selectedFile,
    uploadProgress,
    uploadableCount,
    canSubmit,
    maximumBatchSize,
    maximumFileSizeMb,
    expectedHeaders,
    handleFileSelect,
    validateFile,
    uploadAddressTypes,
    clearData,
    downloadTemplate,
    SnackbarComponent,
  } = useAddressTypeImport();

  return (
    <Box sx={{ maxWidth: 1600, margin: "auto", p: { xs: 2, sm: 3 } }}>
      <AnimatedBox>
        <SpreadsheetImportCard
          selectedFile={selectedFile}
          busy={loading}
          progress={uploadProgress}
          maxSizeMb={maximumFileSizeMb}
          maxRows={maximumBatchSize}
          rowCount={rows.length}
          rowCountLabel={t("addressTypes.import.rows", { count: rows.length })}
          hint={t("imports.expectedHeaders", { headers: expectedHeaders })}
          icon={<LocationOnOutlined />}
          uploadableCount={uploadableCount}
          canSubmit={canSubmit}
          locked={viewState === "uncertain"}
          onFileSelect={handleFileSelect}
          validateFile={validateFile}
          onSubmit={uploadAddressTypes}
          onClear={clearData}
          onDownloadTemplate={downloadTemplate}
        />

        <SpreadsheetImportFeedback
          viewState={viewState}
          message={viewMessage}
          onReconcile={onReconcile}
        />

        <LoadingAlert
          loading={loading}
          loadingText={loadingText}
          showCounter={showCounter}
          elapsedTime={elapsedTime}
        />

        <AddressTypeDataTable rows={rows} columns={columns} />
        <NoDataMessage show={viewState === "idle"} />
      </AnimatedBox>
      {SnackbarComponent}
    </Box>
  );
};

export default AddressTypeImportView;
