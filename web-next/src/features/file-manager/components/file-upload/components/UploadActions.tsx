import FileUploadActions from "@/shared/components/file-upload/FileUploadActions";
import { UploadActionsProps } from "../types/fileUpload.type";

const UploadActions = ({ files, isUploading, onUpload, onClose }: UploadActionsProps) => {
  return (
    <FileUploadActions
      files={files}
      isUploading={isUploading}
      onUpload={onUpload}
      onClose={onClose ?? (() => undefined)}
    />
  );
};

export default UploadActions;
