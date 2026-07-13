export interface KanbanLabel {
  id: string | number;
  kanbanBoardId: string | number;
  name: string;
  colorHex: string; // ^#[0-9A-Fa-f]{6}$
  createdOn: string;
  updatedOn: string;
  isDeleted: boolean;
}

export interface CreateKanbanLabelRequest {
  kanbanBoardId: string | number;
  name: string;
  colorHex: string;
}

export interface UpdateKanbanLabelRequest extends CreateKanbanLabelRequest {
  id: string | number;
}
