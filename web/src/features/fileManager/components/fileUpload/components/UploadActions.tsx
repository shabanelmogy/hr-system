import FileUploadActions from "@/shared/components/fileUpload/fileUploadActions";
import { UploadActionsProps } from "../types/fileUpload.type";

const UploadActions = ({ files, isUploading, onUpload, onClose }: UploadActionsProps) => {
  return (
    <FileUploadActions files={files} isUploading={isUploading} onUpload={onUpload} onClose={onClose} />
  );
};

export default UploadActions;
