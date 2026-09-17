"use client";

// cspell:words nodownload
import React from "react";
import dynamic from "next/dynamic";
import { CircularProgress } from "@mui/material";
import { useTranslation } from "react-i18next";
import { MediaContentProps } from "../../types/mediaViewer.type";
import MediaErrorView from "../modals/MediaErrorView";
import { ensureSyncfusionLicense } from "../viewers/syncfusionRuntime";

const viewerLoading = () => <CircularProgress size={40} />;
const AudioPlayer = dynamic(() => import("../viewers/AudioPlayer"), { ssr: false, loading: viewerLoading });
const VideoPlayer = dynamic(() => import("../viewers/VideoPlayer"), { ssr: false, loading: viewerLoading });
const ImageViewer = dynamic(() => import("../viewers/ImageViewer"), { ssr: false, loading: viewerLoading });
const ExcelViewer = dynamic(() => import("../viewers/ExcelViewer"), { ssr: false, loading: viewerLoading });
const PdfViewer = dynamic(async () => {
  await ensureSyncfusionLicense();
  return import("../viewers/PdfViewer");
}, { ssr: false, loading: viewerLoading });
const WordViewer = dynamic(() => import("../viewers/WordViewer"), { ssr: false, loading: viewerLoading });
const TxtViewer = dynamic(() => import("../viewers/TxtViewer"), { ssr: false, loading: viewerLoading });

const MediaContent: React.FC<MediaContentProps> = ({
  mediaType,
  mediaUrl,
  getFileExtension,
  onError,
  onBack,
  fileName,
  onDownload,
  onRetry,
  error,
}) => {
  const { t } = useTranslation();

  if (mediaType === "unsupported" || error) {
    return (
      <MediaErrorView
        fileName={fileName}
        fileExtension={getFileExtension()}
        onDownload={onDownload}
        onBack={onBack}
        onRetry={onRetry}
        errorMessage={error || t("media.unsupportedFormat")}
      />
    );
  }

  switch (mediaType) {
    case "iframe":
      return <PdfViewer mediaUrl={mediaUrl} onError={onError} onBack={onBack} />;

    case "image":
      return <ImageViewer mediaUrl={mediaUrl} onError={onError} onBack={onBack} />;

    case "video":
      return <VideoPlayer mediaUrl={mediaUrl} onError={onError} onBack={onBack} />;

    case "audio":
      return <AudioPlayer mediaUrl={mediaUrl} onError={onError} onBack={onBack} />;

    case "excel":
      return <ExcelViewer mediaUrl={mediaUrl} onError={onError} />;

    case "word":
      return <WordViewer mediaUrl={mediaUrl} onError={onError} onBack={onBack} />;

    case "txt":
      return <TxtViewer fileUrl={mediaUrl} fileName={fileName} onError={onError} onBack={onBack} />;

    default:
      return null;
  }
};

export default MediaContent;
