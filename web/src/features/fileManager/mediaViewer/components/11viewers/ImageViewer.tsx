import React, { useState, useRef, useEffect } from "react";
import { Paper } from "@mui/material";
import axios from "axios";
import { useTranslation } from "react-i18next";
import { useSidebar } from "@/layouts/components/sidebar/sidebarContext";
import ImageToolbar from "../03image/Toolbar";
import ImageViewerArea from "../03image/Viewer";
import ImageMenu from "../03image/Menu";

interface ImageViewerProps {
  mediaUrl: string;
  onError: (message: string) => void;
  onBack?: () => void;
}



const ImageViewer: React.FC<ImageViewerProps> = ({ mediaUrl, onError, onBack }) => {
  const { t } = useTranslation();
  const { open: sidebarOpen } = useSidebar();
  const containerRef = useRef<HTMLDivElement>(null);
  const [zoom, setZoom] = useState(100);
  const [rotation, setRotation] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [imageInfo, setImageInfo] = useState({ width: 0, height: 0, size: 0 });
  const [showControls, setShowControls] = useState(true);
  const [showZoomInfo, setShowZoomInfo] = useState(false);
  const [flipH, setFlipH] = useState(false);
  const [flipV, setFlipV] = useState(false);
  const [brightness, setBrightness] = useState(100);
  const [contrast, setContrast] = useState(100);
  const controlsTimeoutRef = useRef<NodeJS.Timeout | undefined>(undefined);
  const zoomInfoTimeoutRef = useRef<NodeJS.Timeout | undefined>(undefined);
  const [imageBlobUrl, setImageBlobUrl] = useState<string | null>(null);
  const [menuAnchor, setMenuAnchor] = useState<null | HTMLElement>(null);

  const MIN_ZOOM = 50;
  const MAX_ZOOM = 300;
  const ZOOM_STEP = 10;

  useEffect(() => {
    const token = sessionStorage.getItem('token');
    const headers = token ? { Authorization: `Bearer ${token}` } : {};
    
    axios.get(mediaUrl, { responseType: 'blob', headers })
      .then(response => {
        const blobUrl = URL.createObjectURL(response.data);
        setImageBlobUrl(blobUrl);
        
        const img = new Image();
        img.onload = () => {
          setImageInfo({
            width: img.naturalWidth,
            height: img.naturalHeight,
            size: response.data.size || 0,
          });
          onError("");
        };
        img.onerror = () => {
          onError(t("media.failedToLoadImage"));
        };
        img.src = blobUrl;
      })
      .catch(() => {
        onError(t("media.failedToLoadImage"));
      });
    
    return () => {
      if (imageBlobUrl) {
        URL.revokeObjectURL(imageBlobUrl);
      }
    };
  }, [mediaUrl, onError, t]);

  const handleZoomIn = () => {
    setZoom((prev) => Math.min(prev + ZOOM_STEP, MAX_ZOOM));
    showZoomInfoBriefly();
  };

  const handleZoomOut = () => {
    setZoom((prev) => Math.max(prev - ZOOM_STEP, MIN_ZOOM));
    showZoomInfoBriefly();
  };

  const showZoomInfoBriefly = () => {
    setShowZoomInfo(true);
    if (zoomInfoTimeoutRef.current) {
      clearTimeout(zoomInfoTimeoutRef.current);
    }
    zoomInfoTimeoutRef.current = setTimeout(() => {
      setShowZoomInfo(false);
    }, 1500);
  };

  const handleRotate = () => {
    setRotation((prev) => (prev + 90) % 360);
  };

  const handleReset = () => {
    setZoom(100);
    setRotation(0);
    setFlipH(false);
    setFlipV(false);
    setBrightness(100);
    setContrast(100);
    if (containerRef.current) {
      containerRef.current.scrollLeft = 0;
      containerRef.current.scrollTop = 0;
    }
  };

  const handleFlipH = () => {
    setFlipH(prev => !prev);
  };

  const handleFlipV = () => {
    setFlipV(prev => !prev);
  };

  const handleFullscreen = () => {
    if (!containerRef.current) return;

    if (!isFullscreen) {
      if (containerRef.current.requestFullscreen) {
        containerRef.current.requestFullscreen();
      }
      setIsFullscreen(true);
    } else {
      if (document.fullscreenElement) {
        document.exitFullscreen();
      }
      setIsFullscreen(false);
    }
  };

  const handleDownload = () => {
    const link = document.createElement("a");
    link.href = mediaUrl;
    link.download = "image.jpg";
    link.click();
  };

  const handleBack = () => {
    if (onBack) onBack();
    else window.history.back();
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    if (zoom <= 100) return;
    setIsDragging(true);
    setDragStart({ x: e.clientX, y: e.clientY });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    setShowControls(true);
    if (controlsTimeoutRef.current) {
      clearTimeout(controlsTimeoutRef.current);
    }

    if (!isDragging || !containerRef.current) return;

    const deltaX = e.clientX - dragStart.x;
    const deltaY = e.clientY - dragStart.y;

    containerRef.current.scrollLeft -= deltaX;
    containerRef.current.scrollTop -= deltaY;

    setDragStart({ x: e.clientX, y: e.clientY });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleMouseLeave = () => {
    setIsDragging(false);
    if (controlsTimeoutRef.current) {
      clearTimeout(controlsTimeoutRef.current);
    }
    controlsTimeoutRef.current = setTimeout(() => {
      setShowControls(false);
    }, 2000);
  };

  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    if (e.deltaY > 0) {
      handleZoomOut();
    } else {
      handleZoomIn();
    }
  };

  useEffect(() => {
    return () => {
      if (controlsTimeoutRef.current) {
        clearTimeout(controlsTimeoutRef.current);
      }
      if (imageBlobUrl) {
        URL.revokeObjectURL(imageBlobUrl);
      }
    };
  }, [imageBlobUrl]);

  return (
    <Paper
      elevation={3}
      sx={{
        width: sidebarOpen ? "calc(100vw - 275px)" : "calc(100vw - 90px)",
        height: "100vh",
        display: "flex",
        flexDirection: "column",
        bgcolor: "background.default",
      }}
    >
      <ImageToolbar
        onBack={handleBack}
        zoom={zoom}
        onZoomIn={handleZoomIn}
        onZoomOut={handleZoomOut}
        onRotate={handleRotate}
        onReset={handleReset}
        flipH={flipH}
        flipV={flipV}
        onFlipH={handleFlipH}
        onFlipV={handleFlipV}
        isFullscreen={isFullscreen}
        onFullscreen={handleFullscreen}
        onOpenMenu={(e) => setMenuAnchor(e.currentTarget)}
        onDownload={handleDownload}
      />

      <ImageViewerArea
        containerRef={containerRef}
        imageBlobUrl={imageBlobUrl}
        zoom={zoom}
        rotation={rotation}
        flipH={flipH}
        flipV={flipV}
        brightness={brightness}
        contrast={contrast}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseLeave}
        onWheel={handleWheel}
        onError={() => onError(t("media.failedToLoadImage"))}
      />

      <ImageMenu
        anchorEl={menuAnchor}
        open={Boolean(menuAnchor)}
        isFullscreen={isFullscreen}
        onClose={() => setMenuAnchor(null)}
        onFlipH={handleFlipH}
        onFlipV={handleFlipV}
        onFullscreen={handleFullscreen}
      />
    </Paper>
  );
};

export default ImageViewer;
