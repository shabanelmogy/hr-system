import MapOutlined from "@mui/icons-material/MapOutlined";
import { Box } from "@mui/material";
import { styled } from "@mui/material/styles";
import { useTranslation } from "react-i18next";
import {
  SpreadsheetImportCard,
  SpreadsheetImportFeedback,
} from "@/shared/components/file-upload";
import { CountryLookupAlert } from "./CountryLookupAlert";
import LoadingAlert from "./LoadingAlert";
import NoDataMessage from "./NoDataMessage";
import StateDataTable from "./StateDataTable";
import { useStateImportColumns } from "./UseStateColumns";
import { useImportStates } from "./useImportStates";

const AnimatedBox = styled(Box)({
  animation: "fadeIn 0.5s ease-in",
  "@keyframes fadeIn": {
    from: { opacity: 0, transform: "translateY(10px)" },
    to: { opacity: 1, transform: "translateY(0)" },
  },
});

interface ImportStatesProps {
  onReconcile?: () => void;
}

const ImportStates = ({ onReconcile }: ImportStatesProps) => {
  const { t } = useTranslation();
  const columns = useStateImportColumns();
  const {
    states,
    viewState,
    viewMessage,
    loading,
    loadingText,
    showCounter,
    elapsedTime,
    selectedFile,
    uploadProgress,
    uploadableCount,
    countryLookupState,
    maximumBatchSize,
    maximumFileSizeMb,
    expectedHeaders,
    handleFileSelect,
    validateFile,
    uploadStates,
    clearData,
    downloadTemplate,
    retryCountryLookup,
    SnackbarComponent,
  } = useImportStates();

  return (
    <Box sx={{ maxWidth: 1600, margin: "auto", p: { xs: 2, sm: 3 } }}>
      <AnimatedBox>
        <CountryLookupAlert state={countryLookupState} onRetry={retryCountryLookup} />

        <SpreadsheetImportCard
          selectedFile={selectedFile}
          busy={loading}
          progress={uploadProgress}
          maxSizeMb={maximumFileSizeMb}
          maxRows={maximumBatchSize}
          rowCount={states.length}
          rowCountLabel={t("states.import.stateRows", { count: states.length })}
          hint={t("imports.expectedHeaders", { headers: expectedHeaders })}
          icon={<MapOutlined />}
          uploadableCount={uploadableCount}
          canSubmit={countryLookupState === "ready"}
          locked={viewState === "uncertain"}
          onFileSelect={handleFileSelect}
          validateFile={validateFile}
          onSubmit={uploadStates}
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

        <StateDataTable states={states} columns={columns} />
        <NoDataMessage show={viewState === "idle"} />
      </AnimatedBox>
      {SnackbarComponent}
    </Box>
  );
};

export default ImportStates;
