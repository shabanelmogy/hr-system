// cspell:words nodownload
import { Fade, Box } from "@mui/material";
import MediaContent from "./components/08layout/MediaContent";
import { Container, MediaContainer } from "./components/08layout/Containers";
import { BusyOverlay } from "./components/07controls/Overlays";
import useMediaViewer from "./hooks/useMediaViewer";

const MediaViewer = () => {
  const {
    isLoading,
    error,
    mediaUrl,
    mediaType,
    getFileExtension,
    handleBack,
    handleDownload,
    setError,
  } = useMediaViewer();

  
  const renderMedia = () => (
    <MediaContent
      mediaType={mediaType}
      mediaUrl={mediaUrl}
      isLoading={isLoading}
      getFileExtension={getFileExtension}
      onError={(msg) => setError(msg || null)}
      onBack={handleBack}
      fileName={`Document.${getFileExtension()}`}
      onDownload={handleDownload}
      onRetry={() => window.location.reload()}
      error={error}
    />
  );

  return (
    <Box sx={{ display: 'flex', height: 'calc(100vh - 120px)', width: '100%'}}>
      <Container sx={{ flex: 1 }}>
        <BusyOverlay show={isLoading} />

        {!isLoading && (
          <Fade in={true}>
            <MediaContainer>
              {renderMedia()}
            </MediaContainer>
          </Fade>
        )}
      </Container>
    </Box>
  );
};

export default MediaViewer;
