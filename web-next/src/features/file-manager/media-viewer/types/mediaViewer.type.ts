export type MediaType = "iframe" | "image" | "video" | "audio" | "excel" | "word" | "txt" | "unsupported";

export interface MediaContentProps {
  mediaType: MediaType;
  mediaUrl: string;
  isLoading: boolean;
  getFileExtension: () => string;
  onError: (message: string) => void;
  onBack?: () => void;
  fileName?: string;
  onDownload?: () => void;
  onRetry?: () => void;
  error?: string | null;
}