import FileList from "@/shared/components/fileUpload/fileList";
import { UploadListProps } from "../types/fileUpload.type";

const UploadList = ({ files, isUploading, onRemoveFile }: UploadListProps) => {
  return (
    <FileList files={files} isUploading={isUploading} onRemoveFile={onRemoveFile} />
  );
};

export default UploadList;
