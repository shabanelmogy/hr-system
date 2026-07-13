import DropZone from "@/shared/components/fileUpload/dropZone";
import { UploadDropAreaProps } from "../types/fileUpload.type";

const UploadDropArea = ({
  dragActive,
  isUploading,
  multiple,
  accept,
  onDragEnter,
  onDragLeave,
  onDragOver,
  onDrop,
  onFileInput,
}: UploadDropAreaProps) => {
  return (
    <DropZone
      dragActive={dragActive}
      isUploading={isUploading}
      multiple={multiple}
      accept={accept}
      onDragEnter={onDragEnter}
      onDragLeave={onDragLeave}
      onDragOver={onDragOver}
      onDrop={onDrop}
      onFileInput={onFileInput}
      onClick={undefined}
    />
  );
};

export default UploadDropArea;
