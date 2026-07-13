// cspell:words nodownload
import { useState, useEffect, useRef, useCallback, useMemo } from "react";
import { useParams, useRouter } from "next/navigation";
import fileService from "../../services/fileService";

export type MediaType = "iframe" | "image" | "video" | "audio" | "excel" | "word" | "txt" | "unsupported";

const allowedIframeExtensions = ["pdf"] as const;
const excelExtensions = ["xlsx", "xls", "csv"] as const;
const wordExtensions = ["docx", "doc"] as const;
const txtExtensions = ["txt"] as const;
const imageExtensions = [
  "jpg",
  "jpeg",
  "png",
  "gif",
  "bmp",
  "svg",
  "webp",
] as const;
const videoExtensions = ["mp4", "webm", "mov", "avi", "mkv"] as const;
const audioExtensions = ["mp3", "wav", "ogg", "m4a"] as const;

export interface UseMediaViewerReturn {
  isLoading: boolean;
  error: string | null;
  mediaUrl: string;
  isFullscreen: boolean;
  mediaType: MediaType;
  getFileExtension: () => string;
  handleBack: () => void;
  handleFullscreen: () => void;
  handleDownload: () => Promise<void>;
  retry: () => void;
  setError: (msg: string | null) => void;
}

export default function useMediaViewer(): UseMediaViewerReturn {
  const { fileParams } = useParams<{ fileParams?: string[] }>();
  const router = useRouter();
  const [fileId = "", extension = "", storedName = "", ...fileNameParts] = fileParams ?? [];
  const downloadName = fileNameParts.join("/");

  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [mediaUrl, setMediaUrl] = useState<string>("");
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
  const [retryKey, setRetryKey] = useState(0);

  // Track object URL cleanup to avoid leaks
  const cleanupRef = useRef<null | (() => void)>(null);

  const getFileExtension = useCallback((): string => {
    return extension.substring(1).toLowerCase() || "";
  }, [extension]);

  const mediaType: MediaType = useMemo(() => {
    const ext = getFileExtension();

    if (allowedIframeExtensions.includes(ext as typeof allowedIframeExtensions[number])) {
      return "iframe";
    }
    if (imageExtensions.includes(ext as typeof imageExtensions[number])) {
      return "image";
    }
    if (videoExtensions.includes(ext as typeof videoExtensions[number])) {
      return "video";
    }
    if (audioExtensions.includes(ext as typeof audioExtensions[number])) {
      return "audio";
    }
    if (excelExtensions.includes(ext as typeof excelExtensions[number])) {
      return "excel";
    }
    if (wordExtensions.includes(ext as typeof wordExtensions[number])) {
      return "word";
    }
    if (txtExtensions.includes(ext as typeof txtExtensions[number])) {
      return "txt";
    }

    return "unsupported";
  }, [getFileExtension]);

  useEffect(() => {
    let isMounted = true;
    let timeoutId: ReturnType<typeof setTimeout> | undefined;

    const loadMedia = async () => {
      try {
        if (!isMounted) return;

        setIsLoading(true);
        setError(null);

        if (!fileId || !extension) {
          if (isMounted) {
            setError("Invalid parameters - Missing ID or file extension");
          }
          return;
        }

        // Debounce rapid navigation
        await new Promise((resolve) => {
          timeoutId = setTimeout(resolve, 300);
        });

        if (!isMounted) return;

        const res = await fileService.downloadStream(fileId);

        if (!isMounted) return;

        if (res.success) {
          // cleanup previous blob url if exists
          if (cleanupRef.current) {
            cleanupRef.current();
          }
          cleanupRef.current = res.data.cleanup;
          setMediaUrl(res.data.url);
        } else {
          setError("Failed to load media stream");
        }
      } catch (err: unknown) {
        console.error("Error loading media:", err);
        const message = err instanceof Error ? err.message : "Error loading media";
        if (isMounted) {
          setError(message);
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    loadMedia();

    return () => {
      isMounted = false;
      if (timeoutId) clearTimeout(timeoutId);
      if (cleanupRef.current) {
        cleanupRef.current();
        cleanupRef.current = null;
      }
    };
  }, [fileId, extension, retryKey]);

  const retry = useCallback(() => {
    setRetryKey((value) => value + 1);
  }, []);

  const handleBack = useCallback(() => {
    router.back();
  }, [router]);

  const handleFullscreen = useCallback(() => {
    const element = document.getElementById("media-content");

    if (!document.fullscreenElement && element) {
      element.requestFullscreen().catch((err) => {
        console.error("Error attempting to enable fullscreen:", err);
      });
      setIsFullscreen(true);
    } else if (document.fullscreenElement) {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  }, []);

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };

    document.addEventListener("fullscreenchange", handleFullscreenChange);
    return () =>
      document.removeEventListener("fullscreenchange", handleFullscreenChange);
  }, []);

  const handleDownload = useCallback(async () => {
    if (!storedName) return;
    try {
      const response = await fileService.downloadFile(
        storedName,
        downloadName || storedName
      );

      if (!response.success) {
        throw new Error("Download failed");
      }
    } catch (err) {
      console.error("Download error:", err);
      setError("Download failed");
    }
  }, [storedName, downloadName]);

  return {
    isLoading,
    error,
    mediaUrl,
    isFullscreen,
    mediaType,
    getFileExtension,
    handleBack,
    handleFullscreen,
    handleDownload,
    retry,
    setError,
  };
}
