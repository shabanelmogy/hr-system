export type Id = string | number;

export interface CrudRoutes {
  getAll: string;
  getById: (id: Id) => string;
  add: string;
  update: string;
  delete: (id: Id) => string;
}

export interface StatesRoutes extends CrudRoutes {}

export interface DistrictsRoutes extends CrudRoutes {
  getAllByState: (stateId: Id) => string;
  getDistrictWithAddresses: (id: Id) => string;
  getCount: string;
}

export interface RolesRoutes extends Omit<CrudRoutes, 'delete'> {
  toggle: (id: Id) => string;
  getRoleClaims: (id: Id) => string;
  updateRoleClaims: string;
}

export interface UsersRoutes {
  getAll: string;
  add: string;
  update: (id: Id) => string;
  toggle: (id: Id) => string;
  unlock: (id: Id) => string;
  revoke: (userId: Id) => string;
  delete: (id: Id) => string;
}

export interface ExportRoutes {
  excel: string;
  pdf: string;
}

export interface AdvancedToolsRoutes {
  getLocalizationApi: string;
  updateLocalizationApi: string;
  trackChanges: string;
}

export interface GoogleRoutes {
  auth: string;
}

// Kanban types
export interface KanbanBoardMembersRoutes extends CrudRoutes {
  getByBoard: (boardId: Id) => string;
}

export interface KanbanCardAssigneesRoutes extends CrudRoutes {
  getByCard: (cardId: Id) => string;
  getByUser: (userId: Id) => string;
}

export interface KanbanCardLabelsRoutes extends CrudRoutes {
  getByCard: (cardId: Id) => string;
}

export interface KanbanCardAttachmentsRoutes extends CrudRoutes {
  getByCard: (cardId: Id) => string;
}

export interface BoardTaskCommentsRoutes extends CrudRoutes {
  getByTask: (taskId: Id) => string;
}

export interface BoardTaskAttachmentsRoutes extends CrudRoutes {
  getByTask: (taskId: Id) => string;
}

export interface FilesRoute {
  uploadMany: string;
  download: (id: Id) => string;
  delete: (id: Id) => string;
}
