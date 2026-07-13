import React, { RefObject } from 'react';
import { Box, Typography } from '@mui/material';
import { useTranslation } from 'react-i18next';

interface ImageViewerAreaProps {
  containerRef: RefObject<HTMLDivElement>;
  imageBlobUrl: string | null;
  zoom: number;
  rotation: number;
  flipH: boolean;
  flipV: boolean;
  brightness: number;
  contrast: number;
  onMouseDown: (e: React.MouseEvent) => void;
  onMouseMove: (e: React.MouseEvent) => void;
  onMouseUp: () => void;
  onMouseLeave: () => void;
  onWheel: (e: React.WheelEvent) => void;
  onError: () => void;
}

const ImageViewerArea: React.FC<ImageViewerAreaProps> = ({ containerRef, imageBlobUrl, zoom, rotation, flipH, flipV, brightness, contrast, onMouseDown, onMouseMove, onMouseUp, onMouseLeave, onWheel, onError }) => {
  const { t } = useTranslation();
  return (
    <Box
      ref={containerRef}
      onMouseDown={onMouseDown}
      onMouseMove={onMouseMove}
      onMouseUp={onMouseUp}
      onMouseLeave={onMouseLeave}
      onWheel={onWheel}
      sx={{
        flex: 1,
        overflow: 'auto',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        bgcolor: 'background.default',
        position: 'relative',
        cursor: zoom > 100 ? 'grab' : 'default',
        '&:active': { cursor: zoom > 100 ? 'grabbing' : 'default' },
      }}
    >
      {imageBlobUrl ? (
        <img
          src={imageBlobUrl}
          alt="Viewer"
          style={{
            maxWidth: '100%',
            maxHeight: '100%',
            objectFit: 'contain',
            userSelect: 'none',
            transform: `scale(${zoom / 100}) rotate(${rotation}deg) scaleX(${flipH ? -1 : 1}) scaleY(${flipV ? -1 : 1})`,
            filter: `brightness(${brightness}%) contrast(${contrast}%)`,
            transition: 'transform 0.3s ease',
          }}
          onError={onError}
        />
      ) : (
        <Typography variant="h6" color="text.secondary">
          {t("files.loadingImage")}
        </Typography>
      )}
    </Box>
  );
};

export default ImageViewerArea;
