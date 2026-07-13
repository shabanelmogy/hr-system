export interface KanbanCardAssignee {
  id: string | number;
  kanbanCardId: string | number;
  userId: string | number;
  createdOn: string;
  updatedOn: string;
  isDeleted: boolean;
}

export interface CreateKanbanCardAssigneeRequest {
  kanbanCardId: string | number;
  userId: string | number;
}

export interface UpdateKanbanCardAssigneeRequest extends CreateKanbanCardAssigneeRequest {
  id: string | number;
}
