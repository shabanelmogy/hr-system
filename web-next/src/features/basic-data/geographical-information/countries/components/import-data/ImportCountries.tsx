import PublicOutlined from "@mui/icons-material/PublicOutlined";
import { Box } from "@mui/material";
import { styled } from "@mui/material/styles";
import { useTranslation } from "react-i18next";
import {
  SpreadsheetImportCard,
  SpreadsheetImportFeedback,
} from "@/shared/components/file-upload";
import CountryDataTable from "./CountryDataTable";
import LoadingAlert from "./LoadingAlert";
import NoDataMessage from "./NoDataMessage";
import { useCountryColumns } from "./UseCountryColumns";
import { useCountryImport } from "./useCountryImport";

const AnimatedBox = styled(Box)({
  animation: "fadeIn 0.5s ease-in",
  "@keyframes fadeIn": {
    from: { opacity: 0, transform: "translateY(10px)" },
    to: { opacity: 1, transform: "translateY(0)" },
  },
});

interface ImportCountriesProps {
  onReconcile?: () => void;
}

const ImportCountries = ({ onReconcile }: ImportCountriesProps) => {
  const { t } = useTranslation();
  const columns = useCountryColumns();
  const {
    countries,
    viewState,
    viewMessage,
    loading,
    loadingText,
    showCounter,
    elapsedTime,
    selectedFile,
    uploadProgress,
    uploadableCount,
    maximumBatchSize,
    maximumFileSizeMb,
    expectedHeaders,
    handleFileSelect,
    validateFile,
    uploadCountries,
    clearData,
    downloadTemplate,
    SnackbarComponent,
  } = useCountryImport();

  return (
    <Box sx={{ maxWidth: 1600, margin: "auto", p: { xs: 2, sm: 3 } }}>
      <AnimatedBox>
        <SpreadsheetImportCard
          selectedFile={selectedFile}
          busy={loading}
          progress={uploadProgress}
          maxSizeMb={maximumFileSizeMb}
          maxRows={maximumBatchSize}
          rowCount={countries.length}
          rowCountLabel={t("imports.countryRows", { count: countries.length })}
          hint={t("imports.expectedHeaders", { headers: expectedHeaders })}
          icon={<PublicOutlined />}
          uploadableCount={uploadableCount}
          locked={viewState === "uncertain"}
          onFileSelect={handleFileSelect}
          validateFile={validateFile}
          onSubmit={uploadCountries}
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

        <CountryDataTable countries={countries} columns={columns} />
        <NoDataMessage show={viewState === "idle"} />
      </AnimatedBox>
      {SnackbarComponent}
    </Box>
  );
};

export default ImportCountries;
