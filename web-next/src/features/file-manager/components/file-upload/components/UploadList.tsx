import FileList from "@/shared/components/file-upload/FileList";
import { UploadListProps } from "../types/fileUpload.type";

const UploadList = ({ files, isUploading, onRemoveFile }: UploadListProps) => {
  return (
    <FileList files={files} isUploading={isUploading} onRemoveFile={onRemoveFile} />
  );
};

export default UploadList;
