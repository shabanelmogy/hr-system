import { auth } from './auth';
import { countries, addressTypes, states, districts } from './basicData';
import { roles, users } from './rolesUsers';
import { exportRoutes, advancedTools, google } from './advanced';
import { appointments } from './appointments';
import { files } from './files';
import {
  kanbanBoards,
  kanbanColumns,
  kanbanCards,
  kanbanLabels,
  kanbanBoardMembers,
  kanbanCardAssignees,
  kanbanCardLabels,
  kanbanCardComments,
  kanbanCardAttachments,
  boardTasks,
  boardTaskComments,
  boardTaskAttachments,
} from './kanban';

export const version = '/api/v1';

export const apiRoutes = {
  version,
  auth,
  countries,
  addressTypes,
  states,
  districts,
  roles,
  users,
  export: exportRoutes,
  advancedTools,
  google,
  appointments,
  files,
  // Kanban
  kanbanBoards,
  kanbanColumns,
  kanbanCards,
  kanbanLabels,
  kanbanBoardMembers,
  kanbanCardAssignees,
  kanbanCardLabels,
  kanbanCardComments,
  kanbanCardAttachments,
  boardTasks,
  boardTaskComments,
  boardTaskAttachments,
};

export default apiRoutes;

export * from './types';