// Keep this catalog aligned with web-next/src/lib/auth/permissions.ts and the API constants.
export const permissions = {
  ViewAddresses: 'Addresses:View',
  CreateAddresses: 'Addresses:Create',
  EditAddresses: 'Addresses:Edit',
  DeleteAddresses: 'Addresses:Delete',
  ViewAddressTypes: 'AddressTypes:View',
  CreateAddressTypes: 'AddressTypes:Create',
  EditAddressTypes: 'AddressTypes:Edit',
  DeleteAddressTypes: 'AddressTypes:Delete',
  ViewApiKeys: 'ApiKeys:View',
  CreateApiKeys: 'ApiKeys:Create',
  EditApiKeys: 'ApiKeys:Edit',
  DeleteApiKeys: 'ApiKeys:Delete',
  ViewBackups: 'Backups:View',
  CreateBackups: 'Backups:Create',
  RestoreBackups: 'Backups:Restore',
  DeleteBackups: 'Backups:Delete',
  ViewCategories: 'Categories:View',
  CreateCategories: 'Categories:Create',
  EditCategories: 'Categories:Edit',
  DeleteCategories: 'Categories:Delete',
  ViewCountries: 'Countries:View',
  CreateCountries: 'Countries:Create',
  EditCountries: 'Countries:Edit',
  DeleteCountries: 'Countries:Delete',
  ViewCrystalReports: 'CrystalReports:View',
  CreateCrystalReports: 'CrystalReports:Create',
  DownloadCrystalReports: 'CrystalReports:Download',
  UploadCrystalReports: 'CrystalReports:Upload',
  PublishCrystalReports: 'CrystalReports:Publish',
  ManageCrystalReportAccess: 'CrystalReports:ManageAccess',
  DeleteCrystalReports: 'CrystalReports:Delete',
  ViewDistricts: 'Districts:View',
  CreateDistricts: 'Districts:Create',
  EditDistricts: 'Districts:Edit',
  DeleteDistricts: 'Districts:Delete',
  ViewChangeLogs: 'ChangeLogs:View',
  ViewHangfireDashboard: 'Hangfire:View',
  ManageDatabaseViews: 'DatabaseViews:Manage',
  ViewLocalizations: 'Localizations:View',
  CreateLocalizations: 'Localizations:Create',
  EditLocalizations: 'Localizations:Edit',
  DeleteLocalizations: 'Localizations:Delete',
  ViewReportsCategories: 'ReportsCategories:View',
  CreateReportsCategories: 'ReportsCategories:Create',
  EditReportsCategories: 'ReportsCategories:Edit',
  DeleteReportsCategories: 'ReportsCategories:Delete',
  ViewRoles: 'Roles:View',
  CreateRoles: 'Roles:Create',
  EditRoles: 'Roles:Edit',
  DeleteRoles: 'Roles:Delete',
  ViewStates: 'States:View',
  CreateStates: 'States:Create',
  EditStates: 'States:Edit',
  DeleteStates: 'States:Delete',
  ViewSubCategories: 'SubCategories:View',
  CreateSubCategories: 'SubCategories:Create',
  EditSubCategories: 'SubCategories:Edit',
  DeleteSubCategories: 'SubCategories:Delete',
  ViewKanbanBoards: 'KanbanBoards:View',
  CreateKanbanBoards: 'KanbanBoards:Create',
  EditKanbanBoards: 'KanbanBoards:Edit',
  DeleteKanbanBoards: 'KanbanBoards:Delete',
  ViewKanbanColumns: 'KanbanColumns:View',
  CreateKanbanColumns: 'KanbanColumns:Create',
  EditKanbanColumns: 'KanbanColumns:Edit',
  DeleteKanbanColumns: 'KanbanColumns:Delete',
  ViewKanbanCards: 'KanbanCards:View',
  CreateKanbanCards: 'KanbanCards:Create',
  EditKanbanCards: 'KanbanCards:Edit',
  DeleteKanbanCards: 'KanbanCards:Delete',
  ViewKanbanCardAssignees: 'KanbanCardAssignees:View',
  CreateKanbanCardAssignees: 'KanbanCardAssignees:Create',
  EditKanbanCardAssignees: 'KanbanCardAssignees:Edit',
  DeleteKanbanCardAssignees: 'KanbanCardAssignees:Delete',
  ViewKanbanCardAttachments: 'KanbanCardAttachments:View',
  CreateKanbanCardAttachments: 'KanbanCardAttachments:Create',
  EditKanbanCardAttachments: 'KanbanCardAttachments:Edit',
  DeleteKanbanCardAttachments: 'KanbanCardAttachments:Delete',
  ViewBoardTaskAttachments: 'BoardTaskAttachments:View',
  CreateBoardTaskAttachments: 'BoardTaskAttachments:Create',
  EditBoardTaskAttachments: 'BoardTaskAttachments:Edit',
  DeleteBoardTaskAttachments: 'BoardTaskAttachments:Delete',
  ViewKanbanCardComments: 'KanbanCardComments:View',
  CreateKanbanCardComments: 'KanbanCardComments:Create',
  EditKanbanCardComments: 'KanbanCardComments:Edit',
  DeleteKanbanCardComments: 'KanbanCardComments:Delete',
  ViewBoardTaskComments: 'BoardTaskComments:View',
  CreateBoardTaskComments: 'BoardTaskComments:Create',
  EditBoardTaskComments: 'BoardTaskComments:Edit',
  DeleteBoardTaskComments: 'BoardTaskComments:Delete',
  ViewKanbanLabels: 'KanbanLabels:View',
  CreateKanbanLabels: 'KanbanLabels:Create',
  EditKanbanLabels: 'KanbanLabels:Edit',
  DeleteKanbanLabels: 'KanbanLabels:Delete',
  ViewKanbanBoardMembers: 'KanbanBoardMembers:View',
  CreateKanbanBoardMembers: 'KanbanBoardMembers:Create',
  EditKanbanBoardMembers: 'KanbanBoardMembers:Edit',
  DeleteKanbanBoardMembers: 'KanbanBoardMembers:Delete',
  ViewUsers: 'Users:View',
  CreateUsers: 'Users:Create',
  EditUsers: 'Users:Edit',
  DeleteUsers: 'Users:Delete',
  ViewChatUsers: 'ChatUsers:View',
  CreateChatUsers: 'ChatUsers:Create',
  EditChatUsers: 'ChatUsers:Edit',
  DeleteChatUsers: 'ChatUsers:Delete',
  ViewConversations: 'Conversations:View',
  CreateConversations: 'Conversations:Create',
  EditConversations: 'Conversations:Edit',
  DeleteConversations: 'Conversations:Delete',
  ViewMessages: 'Messages:View',
  CreateMessages: 'Messages:Create',
  EditMessages: 'Messages:Edit',
  DeleteMessages: 'Messages:Delete',
  AccessChat: 'Chat:Access',
  ModerateChat: 'Chat:Moderate',
  ViewChatAnalytics: 'Chat:ViewAnalytics',
} as const;

export type PermissionString = (typeof permissions)[keyof typeof permissions];

export type PermissionModule =
  | 'Addresses'
  | 'AddressTypes'
  | 'ApiKeys'
  | 'Backups'
  | 'Categories'
  | 'Countries'
  | 'CrystalReports'
  | 'Districts'
  | 'ChangeLogs'
  | 'Hangfire'
  | 'DatabaseViews'
  | 'Localizations'
  | 'ReportsCategories'
  | 'Roles'
  | 'States'
  | 'SubCategories'
  | 'KanbanBoards'
  | 'KanbanColumns'
  | 'KanbanCards'
  | 'KanbanCardAssignees'
  | 'KanbanCardAttachments'
  | 'BoardTaskAttachments'
  | 'KanbanCardComments'
  | 'BoardTaskComments'
  | 'KanbanLabels'
  | 'KanbanBoardMembers'
  | 'Users'
  | 'ChatUsers'
  | 'Conversations'
  | 'Messages'
  | 'Chat';

export const getAllPermissions = (): PermissionString[] => Object.values(permissions);

export function getPermissionModule(permission: PermissionString): PermissionModule {
  const [module, action, ...rest] = permission.split(':');
  if (!module || !action || rest.length > 0) {
    throw new Error(`Invalid permission format: "${permission}". Expected "Module:Action".`);
  }

  return module as PermissionModule;
}

export const getAllPermissionModules = (): PermissionModule[] => [
  ...new Set(getAllPermissions().map(getPermissionModule)),
];

const permissionSetCache = new WeakMap<readonly string[], Set<string>>();

function getPermissionSet(userPermissions: readonly string[]): Set<string> {
  let cached = permissionSetCache.get(userPermissions);
  if (!cached) {
    cached = new Set(userPermissions);
    permissionSetCache.set(userPermissions, cached);
  }
  return cached;
}

export const hasPermission = (
  userPermissions: readonly string[],
  permission: PermissionString,
): boolean => getPermissionSet(userPermissions).has(permission);

export const hasAnyPermission = (
  userPermissions: readonly string[],
  requiredPermissions: readonly PermissionString[],
): boolean => {
  const permissionSet = getPermissionSet(userPermissions);
  return requiredPermissions.some((permission) => permissionSet.has(permission));
};

export const hasAllPermissions = (
  userPermissions: readonly string[],
  requiredPermissions: readonly PermissionString[],
): boolean => {
  const permissionSet = getPermissionSet(userPermissions);
  return requiredPermissions.every((permission) => permissionSet.has(permission));
};
