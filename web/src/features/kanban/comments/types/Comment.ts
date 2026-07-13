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

export interface CreateKanbanCardCommentRequest {
  kanbanCardId: string | number;
  commentText: string;
}

export interface UpdateKanbanCardCommentRequest extends CreateKanbanCardCommentRequest {
  id: string | number;
}
