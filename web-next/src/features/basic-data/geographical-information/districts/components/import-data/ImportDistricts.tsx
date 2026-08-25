import LocationCityOutlined from "@mui/icons-material/LocationCityOutlined";
import { Box } from "@mui/material";
import { styled } from "@mui/material/styles";
import { useTranslation } from "react-i18next";
import {
  SpreadsheetImportCard,
  SpreadsheetImportFeedback,
} from "@/shared/components/file-upload";
import DistrictDataTable from "./DistrictDataTable";
import LoadingAlert from "./LoadingAlert";
import NoDataMessage from "./NoDataMessage";
import { StateLookupAlert } from "./StateLookupAlert";
import { useDistrictImportColumns } from "./UseDistrictColumns";
import { useImportDistricts } from "./useImportDistricts";

const AnimatedBox = styled(Box)({
  animation: "fadeIn 0.5s ease-in",
  "@keyframes fadeIn": {
    from: { opacity: 0, transform: "translateY(10px)" },
    to: { opacity: 1, transform: "translateY(0)" },
  },
});

interface ImportDistrictsProps {
  onReconcile?: () => void;
}

export default function ImportDistricts({ onReconcile }: ImportDistrictsProps) {
  const { t } = useTranslation();
  const columns = useDistrictImportColumns();
  const {
    districts,
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
    stateLookupState,
    maximumBatchSize,
    maximumFileSizeMb,
    expectedHeaders,
    handleFileSelect,
    validateFile,
    uploadDistricts,
    clearData,
    downloadTemplate,
    retryStateLookup,
    SnackbarComponent,
  } = useImportDistricts();

  return (
    <Box sx={{ maxWidth: 1600, margin: "auto", p: { xs: 2, sm: 3 } }}>
      <AnimatedBox>
        <StateLookupAlert state={stateLookupState} onRetry={retryStateLookup} />

        <SpreadsheetImportCard
          selectedFile={selectedFile}
          busy={loading}
          progress={uploadProgress}
          maxSizeMb={maximumFileSizeMb}
          maxRows={maximumBatchSize}
          rowCount={districts.length}
          rowCountLabel={t("districts.import.districtRows", { count: districts.length })}
          hint={t("imports.expectedHeaders", { headers: expectedHeaders })}
          icon={<LocationCityOutlined />}
          uploadableCount={uploadableCount}
          canSubmit={canSubmit}
          locked={viewState === "uncertain"}
          onFileSelect={handleFileSelect}
          validateFile={validateFile}
          onSubmit={uploadDistricts}
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

        <DistrictDataTable districts={districts} columns={columns} />
        <NoDataMessage show={viewState === "idle"} />
      </AnimatedBox>
      {SnackbarComponent}
    </Box>
  );
}
