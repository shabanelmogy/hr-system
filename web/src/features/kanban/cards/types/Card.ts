export interface KanbanCard {
  id: string | number;
  kanbanColumnId: string | number;
  title: string;
  description?: string;
  order: number;
  dueDate?: string | null;
  isArchived: boolean;
  assignees?: KanbanCardAssignee[];
  cardLabels?: KanbanCardLabelLink[];
  comments?: KanbanCardComment[];
  attachments?: KanbanCardAttachment[];
  createdOn: string;
  updatedOn: string;
  isDeleted: boolean;
}

export interface CreateKanbanCardRequest {
  kanbanColumnId: string | number;
  title: string;
  description?: string;
  order: number;
  dueDate?: string | null;
}

export interface UpdateKanbanCardRequest extends CreateKanbanCardRequest {
  id: string | number;
  isArchived?: boolean;
}

export interface KanbanCardAssignee {
  id: string | number;
  kanbanCardId: string | number;
  userId: string | number;
  createdOn: string;
  updatedOn: string;
  isDeleted: boolean;
}

export interface KanbanCardLabelLink {
  id: string | number;
  kanbanCardId: string | number;
  kanbanLabelId: string | number;
  createdOn: string;
  updatedOn: string;
  isDeleted: boolean;
}

export interface KanbanCardComment {
  id: string | number;
  kanbanCardId: string | number;
  commentText: string;
  userId: string | number;
  userName?: string;
  userEmail?: string;
  createdOn: string;
  updatedOn: string;
  isDeleted: boolean;
}

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
