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

export interface CreateBoardTaskRequest {
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
}

export interface UpdateBoardTaskRequest extends CreateBoardTaskRequest {
  id: string | number;
}
