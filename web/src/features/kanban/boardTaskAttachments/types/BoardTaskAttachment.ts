export interface BoardTaskAttachment {
  id: string | number;
  boardTaskId: string | number;
  uploadedFileId: string | number;
  fileName: string;
  fileUrl: string;
  contentType: string;
  fileSize?: number | null;
  uploadedOn?: string;
  createdOn: string;
  updatedOn: string;
  isDeleted: boolean;
}

export interface CreateBoardTaskAttachmentRequest {
  boardTaskId: string | number;
  uploadedFileId: string | number;
}

export interface UpdateBoardTaskAttachmentRequest extends CreateBoardTaskAttachmentRequest {
  id: string | number;
}
