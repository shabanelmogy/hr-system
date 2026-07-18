"use client";

import CloudUploadOutlined from "@mui/icons-material/CloudUploadOutlined";
import { Box, ButtonBase, Stack, Typography } from "@mui/material";
import {
  forwardRef,
  useCallback,
  useRef,
  useState,
  type ChangeEvent,
  type DragEvent,
  type KeyboardEvent,
  type ReactNode,
  type Ref,
} from "react";

export interface FileDropZoneProps {
  title: string;
  onFilesSelected: (files: File[]) => void;
  accept?: string | readonly string[];
  ariaLabel?: string;
  description?: string;
  disabled?: boolean;
  hint?: string;
  icon?: ReactNode;
  multiple?: boolean;
  onDragActiveChange?: (active: boolean) => void;
  variant?: "default" | "compact";
}

function assignRef<T>(ref: Ref<T> | undefined, value: T | null) {
  if (typeof ref === "function") {
    ref(value);
  } else if (ref) {
    ref.current = value;
  }
}

function normalizeAccept(accept: FileDropZoneProps["accept"]) {
  return typeof accept === "string" ? accept : accept?.join(",");
}

export const FileDropZone = forwardRef<HTMLInputElement, FileDropZoneProps>(
  function FileDropZone(
    {
      title,
      onFilesSelected,
      accept,
      ariaLabel = title,
      description,
      disabled = false,
      hint,
      icon,
      multiple = false,
      onDragActiveChange,
      variant = "default",
    },
    forwardedRef,
  ) {
    const inputRef = useRef<HTMLInputElement | null>(null);
    const [isDragActive, setIsDragActive] = useState(false);

    const setInputRef = useCallback(
      (node: HTMLInputElement | null) => {
        inputRef.current = node;
        assignRef(forwardedRef, node);
      },
      [forwardedRef],
    );

    const updateDragActive = (active: boolean) => {
      setIsDragActive(active);
      onDragActiveChange?.(active);
    };

    const openFilePicker = () => {
      if (disabled || !inputRef.current) return;
      inputRef.current.value = "";
      inputRef.current.click();
    };

    const selectFiles = (files: File[]) => {
      if (disabled || files.length === 0) return;
      onFilesSelected(multiple ? files : files.slice(0, 1));
    };

    const handleInputChange = (event: ChangeEvent<HTMLInputElement>) => {
      selectFiles(Array.from(event.currentTarget.files ?? []));
      event.currentTarget.value = "";
    };

    const handleDragEnter = (event: DragEvent<HTMLDivElement>) => {
      event.preventDefault();
      event.stopPropagation();
      if (!disabled) updateDragActive(true);
    };

    const handleDragLeave = (event: DragEvent<HTMLDivElement>) => {
      event.preventDefault();
      event.stopPropagation();
      const nextTarget = event.relatedTarget;
      if (nextTarget instanceof Node && event.currentTarget.contains(nextTarget)) {
        return;
      }
      updateDragActive(false);
    };

    const handleDragOver = (event: DragEvent<HTMLDivElement>) => {
      event.preventDefault();
      event.stopPropagation();
      if (!disabled) event.dataTransfer.dropEffect = "copy";
    };

    const handleDrop = (event: DragEvent<HTMLDivElement>) => {
      event.preventDefault();
      event.stopPropagation();
      updateDragActive(false);
      selectFiles(Array.from(event.dataTransfer.files));
    };

    const handleKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
      if (event.key !== "Enter" && event.key !== " ") return;
      event.preventDefault();
      openFilePicker();
    };

    const compact = variant === "compact";

    return (
      <Box sx={{ position: "relative", width: "100%" }}>
        <ButtonBase
          component="div"
          role="button"
          tabIndex={disabled ? -1 : 0}
          aria-disabled={disabled}
          aria-label={ariaLabel}
          onClick={openFilePicker}
          onKeyDown={handleKeyDown}
          onDragEnter={handleDragEnter}
          onDragLeave={handleDragLeave}
          onDragOver={handleDragOver}
          onDrop={handleDrop}
          sx={{
            width: "100%",
            minHeight: compact ? 112 : 176,
            px: compact ? 2 : 3,
            py: compact ? 2 : 3,
            border: 2,
            borderStyle: "dashed",
            borderColor: isDragActive ? "primary.main" : "divider",
            borderRadius: 1,
            bgcolor: isDragActive ? "action.hover" : "background.paper",
            color: disabled ? "text.disabled" : "text.primary",
            cursor: disabled ? "not-allowed" : "pointer",
            opacity: disabled ? 0.65 : 1,
            transition: (theme) =>
              theme.transitions.create(["border-color", "background-color", "opacity"]),
            "&:hover": disabled
              ? undefined
              : {
                  borderColor: "primary.main",
                  bgcolor: "action.hover",
                },
            "&:focus-visible": {
              outline: "3px solid",
              outlineColor: "primary.main",
              outlineOffset: 2,
            },
          }}
        >
          <Stack
            direction={compact ? { xs: "column", sm: "row" } : "column"}
            spacing={compact ? 1.5 : 1}
            sx={{ alignItems: "center", justifyContent: "center", width: "100%" }}
          >
            <Box
              aria-hidden="true"
              sx={{
                display: "flex",
                color: isDragActive ? "primary.main" : "text.secondary",
                "& svg": { fontSize: compact ? 32 : 44 },
              }}
            >
              {icon ?? <CloudUploadOutlined />}
            </Box>
            <Box sx={{ minWidth: 0, textAlign: "center" }}>
              <Typography
                component="span"
                variant={compact ? "subtitle1" : "h6"}
                sx={{ display: "block", fontWeight: 600 }}
              >
                {title}
              </Typography>
              {description && (
                <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                  {description}
                </Typography>
              )}
              {hint && (
                <Typography variant="caption" color="text.secondary" sx={{ mt: 0.75, display: "block" }}>
                  {hint}
                </Typography>
              )}
            </Box>
          </Stack>
        </ButtonBase>

        <input
          ref={setInputRef}
          type="file"
          accept={normalizeAccept(accept)}
          multiple={multiple}
          disabled={disabled}
          onChange={handleInputChange}
          aria-label={ariaLabel}
          tabIndex={-1}
          style={{
            clip: "rect(0 0 0 0)",
            clipPath: "inset(50%)",
            height: 1,
            overflow: "hidden",
            position: "absolute",
            whiteSpace: "nowrap",
            width: 1,
          }}
        />
      </Box>
    );
  },
);
