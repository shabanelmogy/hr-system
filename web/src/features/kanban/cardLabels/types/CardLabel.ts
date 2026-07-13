export interface KanbanCardLabelLink {
  id: string | number;
  kanbanCardId: string | number;
  kanbanLabelId: string | number;
  createdOn: string;
  updatedOn: string;
  isDeleted: boolean;
}

export interface CreateKanbanCardLabelLinkRequest {
  kanbanCardId: string | number;
  kanbanLabelId: string | number;
}

export interface UpdateKanbanCardLabelLinkRequest extends CreateKanbanCardLabelLinkRequest {
  id: string | number;
}
