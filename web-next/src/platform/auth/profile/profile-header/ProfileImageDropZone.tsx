import ImageOutlined from "@mui/icons-material/ImageOutlined";
import { FileDropZone } from "@/shared/components/file-upload";
import type { RefObject } from "react";
import { useTranslation } from "react-i18next";

interface ProfileImageDropZoneProps {
  fileInputRef: RefObject<HTMLInputElement | null>;
  isDragging: boolean;
  onDragActiveChange: (active: boolean) => void;
  onFileSelect: (file: File | null) => void;
}

const ProfileImageDropZone = ({
  fileInputRef,
  isDragging,
  onDragActiveChange,
  onFileSelect,
}: ProfileImageDropZoneProps) => {
  const { t } = useTranslation();

  return (
    <FileDropZone
      ref={fileInputRef}
      variant="compact"
      accept={["image/jpeg", "image/png", "image/webp"]}
      title={isDragging ? t("actions.dropImage") : t("actions.updateProfile")}
      description={t("actions.dragPhoto")}
      ariaLabel={t("actions.updateProfile")}
      icon={<ImageOutlined />}
      onDragActiveChange={onDragActiveChange}
      onFilesSelected={(files) => onFileSelect(files[0] ?? null)}
    />
  );
};

export default ProfileImageDropZone;

