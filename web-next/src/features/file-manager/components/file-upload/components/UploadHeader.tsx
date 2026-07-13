import { CardContent } from "@mui/material";
import FileUploadHeader from "@/shared/components/file-upload/FileUploadHeader";
import { UploadHeaderProps } from "../types/fileUpload.type";

const UploadHeader = ({ globalError }: UploadHeaderProps) => {
  return (
    <CardContent>
      <FileUploadHeader globalError={globalError} />
    </CardContent>
  );
};

export default UploadHeader;
