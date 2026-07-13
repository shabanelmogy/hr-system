import type {
  CrudRoutes,
  KanbanBoardMembersRoutes,
  KanbanCardAssigneesRoutes,
  KanbanCardLabelsRoutes,
  KanbanCardAttachmentsRoutes,
  BoardTaskCommentsRoutes,
  BoardTaskAttachmentsRoutes,
  Id
} from './types';

const version = "/api/v1";

export const kanbanBoards: CrudRoutes = {
  getAll: `${version}/kanbanboards`,
  getById: (id: Id) => `${version}/kanbanboards/${id}`,
  add: `${version}/kanbanboards`,
  update: `${version}/kanbanboards`,
  delete: (id: Id) => `${version}/kanbanboards/${id}`,
};

export const kanbanColumns: CrudRoutes = {
  getAll: `${version}/kanbancolumns`,
  getById: (id: Id) => `${version}/kanbancolumns/${id}`,
  add: `${version}/kanbancolumns`,
  update: `${version}/kanbancolumns`,
  delete: (id: Id) => `${version}/kanbancolumns/${id}`,
};

export const kanbanCards: CrudRoutes = {
  getAll: `${version}/kanbancards`,
  getById: (id: Id) => `${version}/kanbancards/${id}`,
  add: `${version}/kanbancards`,
  update: `${version}/kanbancards`,
  delete: (id: Id) => `${version}/kanbancards/${id}`,
};

export const kanbanLabels: CrudRoutes = {
  getAll: `${version}/KanbanLabels/GetAll`,
  getById: (id: Id) => `${version}/KanbanLabels/GetById/${id}`,
  add: `${version}/KanbanLabels/Add`,
  update: `${version}/KanbanLabels/Update`,
  delete: (id: Id) => `${version}/KanbanLabels/Delete/${id}`,
};

export const kanbanBoardMembers: KanbanBoardMembersRoutes = {
  getAll: `${version}/kanbanboardmembers`,
  getById: (id: Id) => `${version}/kanbanboardmembers/${id}`,
  getByBoard: (boardId: Id) => `${version}/kanbanboardmembers/board/${boardId}`,
  add: `${version}/kanbanboardmembers`,
  update: `${version}/kanbanboardmembers`,
  delete: (id: Id) => `${version}/kanbanboardmembers/${id}`,
};

export const kanbanCardAssignees: KanbanCardAssigneesRoutes = {
  getAll: `${version}/kanbancardassignees`,
  getById: (id: Id) => `${version}/kanbancardassignees/${id}`,
  getByCard: (cardId: Id) => `${version}/kanbancardassignees/card/${cardId}`,
  getByUser: (userId: Id) => `${version}/kanbancardassignees/user/${userId}`,
  add: `${version}/kanbancardassignees`,
  update: `${version}/kanbancardassignees`,
  delete: (id: Id) => `${version}/kanbancardassignees/${id}`,
};

export const kanbanCardLabels: KanbanCardLabelsRoutes = {
  getAll: `${version}/kanbancardlabels`,
  getById: (id: Id) => `${version}/kanbancardlabels/${id}`,
  getByCard: (cardId: Id) => `${version}/kanbancardlabels/card/${cardId}`,
  add: `${version}/kanbancardlabels`,
  update: `${version}/kanbancardlabels`,
  delete: (id: Id) => `${version}/kanbancardlabels/${id}`,
};

export const kanbanCardComments: CrudRoutes = {
  getAll: `${version}/KanbanCardComments/GetAll`,
  getById: (id: Id) => `${version}/KanbanCardComments/GetById/${id}`,
  add: `${version}/KanbanCardComments/Add`,
  update: `${version}/KanbanCardComments/Update`,
  delete: (id: Id) => `${version}/KanbanCardComments/Delete/${id}`,
};

export const kanbanCardAttachments: KanbanCardAttachmentsRoutes = {
  getAll: `${version}/kanbancardattachments`,
  getById: (id: Id) => `${version}/kanbancardattachments/${id}`,
  getByCard: (cardId: Id) => `${version}/kanbancardattachments/card/${cardId}`,
  add: `${version}/kanbancardattachments`,
  update: `${version}/kanbancardattachments`,
  delete: (id: Id) => `${version}/kanbancardattachments/${id}`,
};

export const boardTasks: CrudRoutes = {
  getAll: `${version}/BoardTasks/GetAll`,
  getById: (id: Id) => `${version}/BoardTasks/GetById/${id}`,
  add: `${version}/BoardTasks/Add`,
  update: `${version}/BoardTasks/Update`,
  delete: (id: Id) => `${version}/BoardTasks/Delete/${id}`,
};

export const boardTaskComments: BoardTaskCommentsRoutes = {
  getAll: `${version}/BoardTaskComments/GetAll`,
  getById: (id: Id) => `${version}/BoardTaskComments/GetById/${id}`,
  getByTask: (taskId: Id) => `${version}/BoardTaskComments/GetByTaskId/task/${taskId}`,
  add: `${version}/BoardTaskComments/Add`,
  update: `${version}/BoardTaskComments/Update`,
  delete: (id: Id) => `${version}/BoardTaskComments/Delete/${id}`,
};

export const boardTaskAttachments: BoardTaskAttachmentsRoutes = {
  getAll: `${version}/boardtaskattachments`,
  getById: (id: Id) => `${version}/boardtaskattachments/${id}`,
  getByTask: (taskId: Id) => `${version}/boardtaskattachments/task/${taskId}`,
  add: `${version}/boardtaskattachments`,
  update: `${version}/boardtaskattachments`,
  delete: (id: Id) => `${version}/boardtaskattachments/${id}`,
};
