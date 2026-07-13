// Simplified TypeScript permissions system

// Define permission actions and modules
export type PermissionAction = 'View' | 'Create' | 'Edit' | 'Delete';
export type PermissionModule =
   | 'Addresses' | 'AddressTypes' | 'ApiKeys' | 'Categories' | 'Countries'
   | 'Districts' | 'ChangeLogs' | 'Localizations' | 'ReportsCategories'
   | 'Roles' | 'States' | 'SubCategories' | 'Users' | 'Analytics'
   | 'Communication' | 'Documents'
   // Kanban modules
   | 'KanbanBoards' | 'KanbanColumns' | 'KanbanCards'
   | 'KanbanCardAssignees' | 'KanbanCardAttachments'
   | 'BoardTaskAttachments' | 'KanbanCardComments' | 'BoardTaskComments'
   | 'KanbanLabels' | 'KanbanBoardMembers' | 'BoardTasks';

// Permission string type
export type PermissionString = `${PermissionModule}:${PermissionAction}` | 'ChangeLogs:View';

// All permissions in a simple object with methods for backward compatibility
export const Permissions = {
  // Addresses
  ViewAddresses: "Addresses:View",
  CreateAddresses: "Addresses:Create",
  EditAddresses: "Addresses:Edit",
  DeleteAddresses: "Addresses:Delete",

  // AddressTypes
  ViewAddressTypes: "AddressTypes:View",
  CreateAddressTypes: "AddressTypes:Create",
  EditAddressTypes: "AddressTypes:Edit",
  DeleteAddressTypes: "AddressTypes:Delete",

  // ApiKeys
  ViewApiKeys: "ApiKeys:View",
  CreateApiKeys: "ApiKeys:Create",
  EditApiKeys: "ApiKeys:Edit",
  DeleteApiKeys: "ApiKeys:Delete",

  // Categories
  ViewCategories: "Categories:View",
  CreateCategories: "Categories:Create",
  EditCategories: "Categories:Edit",
  DeleteCategories: "Categories:Delete",

  // Countries
  ViewCountries: "Countries:View",
  CreateCountries: "Countries:Create",
  EditCountries: "Countries:Edit",
  DeleteCountries: "Countries:Delete",

  // Districts
  ViewDistricts: "Districts:View",
  CreateDistricts: "Districts:Create",
  EditDistricts: "Districts:Edit",
  DeleteDistricts: "Districts:Delete",

  // ChangeLogs (View only)
  ViewChangeLogs: "ChangeLogs:View",

  // Localizations
  ViewLocalizations: "Localizations:View",
  CreateLocalizations: "Localizations:Create",
  EditLocalizations: "Localizations:Edit",
  DeleteLocalizations: "Localizations:Delete",

  // ReportsCategories
  ViewReportsCategories: "ReportsCategories:View",
  CreateReportsCategories: "ReportsCategories:Create",
  EditReportsCategories: "ReportsCategories:Edit",
  DeleteReportsCategories: "ReportsCategories:Delete",

  // Roles
  ViewRoles: "Roles:View",
  CreateRoles: "Roles:Create",
  EditRoles: "Roles:Edit",
  DeleteRoles: "Roles:Delete",

  // States
  ViewStates: "States:View",
  CreateStates: "States:Create",
  EditStates: "States:Edit",
  DeleteStates: "States:Delete",

  // SubCategories
  ViewSubCategories: "SubCategories:View",
  CreateSubCategories: "SubCategories:Create",
  EditSubCategories: "SubCategories:Edit",
  DeleteSubCategories: "SubCategories:Delete",

  // Users
  ViewUsers: "Users:View",
  CreateUsers: "Users:Create",
  EditUsers: "Users:Edit",
  DeleteUsers: "Users:Delete",

  // Analytics
  ViewAnalytics: "Analytics:View",
  CreateAnalytics: "Analytics:Create",
  EditAnalytics: "Analytics:Edit",
  DeleteAnalytics: "Analytics:Delete",

  // Communication
  ViewCommunication: "Communication:View",
  CreateCommunication: "Communication:Create",
  EditCommunication: "Communication:Edit",
  DeleteCommunication: "Communication:Delete",

  // Documents
  ViewDocuments: "Documents:View",
  CreateDocuments: "Documents:Create",
  EditDocuments: "Documents:Edit",
  DeleteDocuments: "Documents:Delete",

  // Kanban Boards
  ViewKanbanBoards: "KanbanBoards:View",
  CreateKanbanBoards: "KanbanBoards:Create",
  EditKanbanBoards: "KanbanBoards:Edit",
  DeleteKanbanBoards: "KanbanBoards:Delete",

  // Kanban Columns
  ViewKanbanColumns: "KanbanColumns:View",
  CreateKanbanColumns: "KanbanColumns:Create",
  EditKanbanColumns: "KanbanColumns:Edit",
  DeleteKanbanColumns: "KanbanColumns:Delete",

  // Kanban Cards
  ViewKanbanCards: "KanbanCards:View",
  CreateKanbanCards: "KanbanCards:Create",
  EditKanbanCards: "KanbanCards:Edit",
  DeleteKanbanCards: "KanbanCards:Delete",

  // Kanban Card Assignees
  ViewKanbanCardAssignees: "KanbanCardAssignees:View",
  CreateKanbanCardAssignees: "KanbanCardAssignees:Create",
  EditKanbanCardAssignees: "KanbanCardAssignees:Edit",
  DeleteKanbanCardAssignees: "KanbanCardAssignees:Delete",

  // Kanban Card Attachments
  ViewKanbanCardAttachments: "KanbanCardAttachments:View",
  CreateKanbanCardAttachments: "KanbanCardAttachments:Create",
  EditKanbanCardAttachments: "KanbanCardAttachments:Edit",
  DeleteKanbanCardAttachments: "KanbanCardAttachments:Delete",

  // Board Task Attachments
  ViewBoardTaskAttachments: "BoardTaskAttachments:View",
  CreateBoardTaskAttachments: "BoardTaskAttachments:Create",
  EditBoardTaskAttachments: "BoardTaskAttachments:Edit",
  DeleteBoardTaskAttachments: "BoardTaskAttachments:Delete",

  // Kanban Card Comments
  ViewKanbanCardComments: "KanbanCardComments:View",
  CreateKanbanCardComments: "KanbanCardComments:Create",
  EditKanbanCardComments: "KanbanCardComments:Edit",
  DeleteKanbanCardComments: "KanbanCardComments:Delete",

  // Board Task Comments
  ViewBoardTaskComments: "BoardTaskComments:View",
  CreateBoardTaskComments: "BoardTaskComments:Create",
  EditBoardTaskComments: "BoardTaskComments:Edit",
  DeleteBoardTaskComments: "BoardTaskComments:Delete",

  // Kanban Labels
  ViewKanbanLabels: "KanbanLabels:View",
  CreateKanbanLabels: "KanbanLabels:Create",
  EditKanbanLabels: "KanbanLabels:Edit",
  DeleteKanbanLabels: "KanbanLabels:Delete",

  // Kanban Board Members
  ViewKanbanBoardMembers: "KanbanBoardMembers:View",
  CreateKanbanBoardMembers: "KanbanBoardMembers:Create",
  EditKanbanBoardMembers: "KanbanBoardMembers:Edit",
  DeleteKanbanBoardMembers: "KanbanBoardMembers:Delete",

  // Board Tasks
  ViewBoardTasks: "BoardTasks:View",
  CreateBoardTasks: "BoardTasks:Create",
  EditBoardTasks: "BoardTasks:Edit",
  DeleteBoardTasks: "BoardTasks:Delete",

  // Methods for backward compatibility
  getAllPermissions: () => getAllPermissions(),
  getAllModules: () => getAllModules(),
  getModuleName: (permission: string) => getModuleName(permission),
} as const;

// Helper functions
export const getAllPermissions = (): string[] => {
  const { getAllPermissions: _, getAllModules: __, getModuleName: ___, ...permissions } = Permissions;
  return Object.values(permissions);
};

export const getModuleName = (permission: string): string | null => {
  return permission.includes(':') ? permission.split(':')[0] : null;
};

export const getAllModules = (): string[] => {
  const modules = getAllPermissions().map(getModuleName).filter(Boolean);
  return [...new Set(modules)] as string[];
};

// Permission checking helpers
export const hasPermission = (userPermissions: string[], permission: string): boolean => {
  return userPermissions.includes(permission);
};

export const hasAnyPermission = (userPermissions: string[], permissions: string[]): boolean => {
  return permissions.some(permission => userPermissions.includes(permission));
};

export const hasAllPermissions = (userPermissions: string[], permissions: string[]): boolean => {
  return permissions.every(permission => userPermissions.includes(permission));
};

// Default export for backward compatibility
export default Permissions;
