import { CardContent } from "@mui/material";
import FileUploadHeader from "@/shared/components/fileUpload/fileUploadHeader";
import { UploadHeaderProps } from "../types/fileUpload.type";

const UploadHeader = ({ globalError }: UploadHeaderProps) => {
  return (
    <CardContent>
      <FileUploadHeader globalError={globalError} />
    </CardContent>
  );
};

export default UploadHeader;
