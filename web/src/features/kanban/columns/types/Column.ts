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

export interface CreateKanbanColumnRequest {
  kanbanBoardId: string | number;
  name: string;
  order: number;
}

export interface UpdateKanbanColumnRequest extends CreateKanbanColumnRequest {
  id: string | number;
  isArchived?: boolean;
}

export interface KanbanCard {
  id: string | number;
  kanbanColumnId: string | number;
  title: string;
  order: number;
  isArchived: boolean;
  createdOn: string;
  updatedOn: string;
  isDeleted: boolean;
}
