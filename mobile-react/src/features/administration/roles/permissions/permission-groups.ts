import type { TFunction } from 'i18next';

import type { RoleClaim } from '../../types/administration';

export interface IndexedRoleClaim {
  action: string;
  claim: RoleClaim;
  index: number;
}

export interface PermissionGroup {
  claims: IndexedRoleClaim[];
  module: string;
}

const moduleTranslationKeys: Record<string, string> = {
  Addresses: 'addresses',
  AddressTypes: 'addressTypes',
  ApiKeys: 'apiKeys',
  Backups: 'backups',
  Categories: 'categories',
  Countries: 'countries',
  CrystalReports: 'crystalReports',
  Districts: 'districts',
  ChangeLogs: 'changeLogs',
  Hangfire: 'hangfire',
  DatabaseViews: 'databaseViews',
  Localizations: 'localizations',
  ReportsCategories: 'reportsCategories',
  Roles: 'roles',
  States: 'states',
  SubCategories: 'subCategories',
  KanbanBoards: 'kanbanBoards',
  KanbanColumns: 'kanbanColumns',
  KanbanCards: 'kanbanCards',
  KanbanCardAssignees: 'kanbanCardAssignees',
  KanbanCardAttachments: 'kanbanCardAttachments',
  BoardTaskAttachments: 'boardTaskAttachments',
  KanbanCardComments: 'kanbanCardComments',
  BoardTaskComments: 'boardTaskComments',
  KanbanLabels: 'kanbanLabels',
  KanbanBoardMembers: 'kanbanBoardMembers',
  Users: 'users',
  ChatUsers: 'chatUsers',
  Conversations: 'conversations',
  Messages: 'messages',
  Chat: 'chat',
};

const actionTranslationKeys: Record<string, string> = {
  View: 'view',
  Create: 'create',
  Edit: 'edit',
  Delete: 'delete',
  Restore: 'restore',
  Download: 'download',
  Upload: 'upload',
  Publish: 'publish',
  Manage: 'manage',
  ManageAccess: 'manageAccess',
  Access: 'access',
  Moderate: 'moderate',
  ViewAnalytics: 'viewAnalytics',
};

export function groupRoleClaims(claims: readonly RoleClaim[]): PermissionGroup[] {
  const groups = new Map<string, IndexedRoleClaim[]>();

  claims.forEach((claim, index) => {
    const separatorIndex = claim.displayValue.indexOf(':');
    const module = separatorIndex > 0
      ? claim.displayValue.slice(0, separatorIndex)
      : claim.displayValue;
    const action = separatorIndex > 0
      ? claim.displayValue.slice(separatorIndex + 1)
      : claim.displayValue;
    const entries = groups.get(module) ?? [];
    entries.push({ action, claim, index });
    groups.set(module, entries);
  });

  return [...groups.entries()]
    .map(([module, groupedClaims]) => ({ module, claims: groupedClaims }))
    .sort((left, right) => left.module.localeCompare(right.module));
}

export function getPermissionModuleLabel(module: string, t: TFunction): string {
  const key = moduleTranslationKeys[module];
  return key ? t(`roleManagement.permissionModules.${key}`) : humanize(module);
}

export function getPermissionActionLabel(action: string, t: TFunction): string {
  const key = actionTranslationKeys[action];
  return key ? t(`roleManagement.permissionActions.${key}`) : humanize(action);
}

function humanize(value: string): string {
  return value
    .replace(/([a-z0-9])([A-Z])/g, '$1 $2')
    .replace(/[_-]+/g, ' ')
    .trim();
}
