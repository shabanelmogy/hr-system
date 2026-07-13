"use client";

// cspell:words nodownload
import { Fade, Box } from "@mui/material";
import MediaContent from "../components/layout/MediaContent";
import { Container, MediaContainer } from "../components/layout/Containers";
import { BusyOverlay } from "../components/controls/Overlays";
import useMediaViewer from "../hooks/useMediaViewer";

const MediaViewer = () => {
  const {
    isLoading,
    error,
    mediaUrl,
    mediaType,
    getFileExtension,
    handleBack,
    handleDownload,
    retry,
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
      onRetry={retry}
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
