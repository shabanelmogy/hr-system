export interface KanbanBoard {
  id: string | number;
  name: string;
  description?: string;
  isArchived: boolean;
  backgroundColor?: string | null;
  columns?: KanbanColumn[];
  labels?: KanbanLabel[];
  members?: KanbanBoardMember[];
  tasks?: BoardTask[];
  createdOn: string;
  updatedOn: string;
  isDeleted: boolean;
}

export interface CreateKanbanBoardRequest {
  name: string;
  description?: string;
  backgroundColor?: string | null;
}

export interface UpdateKanbanBoardRequest extends CreateKanbanBoardRequest {
  id: string | number;
  isArchived?: boolean;
}

// Minimal referenced types to avoid circular imports in type-only context
export interface KanbanColumn {
  id: string | number;
  kanbanBoardId: string | number;
  name: string;
  order: number;
  isArchived: boolean;
  cards?: KanbanCard[];
  createdOn: string;
  updatedOn: string;
  isDeleted: boolean;
}

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

export interface KanbanLabel {
  id: string | number;
  kanbanBoardId: string | number;
  name: string;
  colorHex: string;
  createdOn: string;
  updatedOn: string;
  isDeleted: boolean;
}

export interface KanbanBoardMember {
  id: string | number;
  kanbanBoardId: string | number;
  userId: string | number;
  role: number; // 1..4
  createdOn: string;
  updatedOn: string;
  isDeleted: boolean;
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

export interface BoardTask {
  id: string | number;
  title: string;
  description?: string;
  status: number;
  priority: number;
  dueDate?: string | null;
  estimatedHours?: number | null;
  loggedHours?: number | null;
  assigneeId?: string | number | null;
  position: number;
  kanbanBoardId?: string | number | null;
  kanbanColumnId?: string | number | null;
  createdOn: string;
  updatedOn: string;
  isDeleted: boolean;
}
