export type Id = string | number;

export interface CrudRoutes {
  getAll: string;
  getById: (id: Id) => string;
  add: string;
  update: string;
  delete: (id: Id) => string;
}

export interface StatesRoutes {
  page: string;
  lookup: (countryId?: Id) => string;
  byCountry: (countryId: Id) => string;
  getById: (id: Id) => string;
  getWithDistricts: (id: Id) => string;
  create: string;
  bulkCreate: string;
  update: (id: Id) => string;
  archive: (id: Id) => string;
  bulkArchive: string;
  restore: (id: Id) => string;
}

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
  getPage: string;
  getCompanyOptions: string;
  add: string;
  update: (id: Id) => string;
  changePassword: (id: Id) => string;
  toggle: (id: Id) => string;
  unlock: (id: Id) => string;
  revoke: (userId: Id) => string;
  archive: (id: Id) => string;
  restore: (id: Id) => string;
}

export interface CountriesRoutes {
  page: string;
  lookup: string;
  getById: (id: Id) => string;
  create: string;
  bulkCreate: string;
  bulkArchive: string;
  update: (id: Id) => string;
  archive: (id: Id) => string;
  restore: (id: Id) => string;
  /**
   * Same-origin JSON endpoint consumed by ActiveReportsJS.  It is deliberately
   * an API URL, never a database connection string.
   */
  reportData: string;
}

export interface ReportTemplatesRoutes {
  list: string;
  manage: string;
  getForManagement: (id: string) => string;
  dataSources: string;
  getById: (id: string) => string;
  create: string;
  update: (id: string) => string;
  duplicate: (id: string) => string;
  publish: (id: string) => string;
  unpublish: (id: string) => string;
}

export interface CrystalReportsRoutes {
  list: string;
  render: (id: string) => string;
  manage: string;
  getForManagement: (id: string) => string;
  create: string;
  versions: (id: string) => string;
  download: (id: string) => string;
  downloadVersion: (id: string, versionId: string) => string;
  publishVersion: (id: string, versionId: string) => string;
  access: (id: string) => string;
  archive: (id: string) => string;
  legacyCandidates: string;
  importLegacy: string;
}

export interface UserInvitationsRoutes {
  getAll: string;
  create: string;
  resend: (id: string) => string;
  revoke: (id: string) => string;
  accept: string;
}

export interface ExportRoutes {
  excel: string;
  pdf: string;
}

export interface AdvancedToolsRoutes {
  getLocalizationApi: string;
  updateLocalizationApi: string;
  trackChanges: string;
  healthCheck: string;
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
