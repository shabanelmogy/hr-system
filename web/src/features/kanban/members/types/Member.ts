export interface KanbanBoardMember {
  id: string | number;
  kanbanBoardId: string | number;
  userId: string | number;
  role: number; // 1..4
  createdOn: string;
  updatedOn: string;
  isDeleted: boolean;
}

export interface CreateKanbanBoardMemberRequest {
  kanbanBoardId: string | number;
  userId: string | number;
  role: number;
}

export interface UpdateKanbanBoardMemberRequest extends CreateKanbanBoardMemberRequest {
  id: string | number;
}
