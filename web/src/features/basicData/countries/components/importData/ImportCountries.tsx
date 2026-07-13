import { Box } from "@mui/material";
import { styled } from "@mui/material/styles";
import { useCountryImport } from "./useCountryImport";
import { useCountryColumns } from "./useCountryColumns";
import UploadSection from "./UploadSection";
import LoadingAlert from "./LoadingAlert";
import CountryDataTable from "./CountryDataTable";
import NoDataMessage from "./NoDataMessage";

const AnimatedBox = styled(Box)({
  animation: "fadeIn 0.5s ease-in",
  "@keyframes fadeIn": {
    from: { opacity: 0, transform: "translateY(10px)" },
    to: { opacity: 1, transform: "translateY(0)" },
  },
});

// Excel expected columns order (header row is ignored):
// [nameAr, nameEn, alpha2Code, alpha3Code, phoneCode, currencyCode]
const ImportCountries = () => {
  const columns = useCountryColumns();
  
  const {
    countries,
    loading,
    loadingText,
    showCounter,
    elapsedTime,
    selectedFile,
    uploadProgress,
    handleFileSelect,
    validateFile,
    uploadCountries,
    clearData,
    SnackbarComponent,
  } = useCountryImport();

  return (
    <Box sx={{ maxWidth: 1600, margin: "auto", p: { xs: 2, sm: 3 } }}>
      <AnimatedBox>

        {/* Upload Section */}
        <UploadSection
          selectedFile={selectedFile}
          loading={loading}
          loadingText={loadingText}
          uploadProgress={uploadProgress}
          countriesCount={countries.length}
          onFileSelect={handleFileSelect}
          validateFile={validateFile}
          onUpload={uploadCountries}
          onClear={clearData}
        />

        {/* Status Messages */}
        <LoadingAlert
          loading={loading}
          loadingText={loadingText}
          showCounter={showCounter}
          elapsedTime={elapsedTime}
        />

        {/* Data Table - Preview */}
        <CountryDataTable countries={countries} columns={columns} />

        {/* No Data Message */}
        <NoDataMessage show={countries.length === 0 && !loading} />
        
      </AnimatedBox>
      {SnackbarComponent}
    </Box>
  );
};

export default ImportCountries;
