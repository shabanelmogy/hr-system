export interface KanbanCardAttachment {
  id: string | number;
  kanbanCardId: string | number;
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

export interface CreateKanbanCardAttachmentRequest {
  kanbanCardId: string | number;
  uploadedFileId: string | number;
}

export interface UpdateKanbanCardAttachmentRequest extends CreateKanbanCardAttachmentRequest {
  id: string | number;
}
