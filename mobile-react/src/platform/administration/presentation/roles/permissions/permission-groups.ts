import type { TFunction } from 'i18next';

import type { RoleClaim } from '../../../domain/models/administration';

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
  AccountDimensionPolicies: 'accountDimensionPolicies',
  AccountHierarchyLevels: 'accountHierarchyLevels',
  AccountingSettings: 'accountingSettings',
  AccountMappings: 'accountMappings',
  Accounts: 'accounts',
  Addresses: 'addresses',
  AddressTypes: 'addressTypes',
  Analytics: 'analytics',
  ApiKeys: 'apiKeys',
  Appointments: 'appointments',
  AttendanceAgents: 'attendanceAgents',
  AttendanceDevices: 'attendanceDevices',
  Backups: 'backups',
  Books: 'books',
  Candidates: 'candidates',
  Categories: 'categories',
  ChangeLogs: 'changeLogs',
  CompanyGeographicScope: 'companyGeographicScope',
  ContactsParties: 'contactsParties',
  Countries: 'countries',
  CrystalReportAccess: 'crystalReportAccess',
  CrystalReports: 'crystalReports',
  Currencies: 'currencies',
  DatabaseViews: 'databaseViews',
  DimensionDefinitions: 'dimensionDefinitions',
  DimensionValues: 'dimensionValues',
  Districts: 'districts',
  EmploymentApplications: 'employmentApplications',
  EnvelopeAmendments: 'envelopeAmendments',
  ExchangeRates: 'exchangeRates',
  ExchangeRateTypes: 'exchangeRateTypes',
  FiscalYears: 'fiscalYears',
  GlobalCrystalReports: 'globalCrystalReports',
  Hangfire: 'hangfire',
  Interviews: 'interviews',
  Invoices: 'invoices',
  JobOffers: 'jobOffers',
  JobOpenings: 'jobOpenings',
  JobPostings: 'jobPostings',
  JobRequisitions: 'jobRequisitions',
  JournalDefinitions: 'journalDefinitions',
  Localizations: 'localizations',
  OfflineOperations: 'offlineOperations',
  OrganizationalStructure: 'organizationalStructure',
  PositionEnvelopes: 'positionEnvelopes',
  PostingProfiles: 'postingProfiles',
  Recruitment: 'recruitment',
  RecruitmentSettings: 'recruitmentSettings',
  ReportsCategories: 'reportsCategories',
  ReportTemplates: 'reportTemplates',
  RolePermissions: 'rolePermissions',
  Roles: 'roles',
  StaffingRequests: 'staffingRequests',
  States: 'states',
  SubCategories: 'subCategories',
  UserInvitations: 'userInvitations',
  Users: 'users',
  WorkforceBudgets: 'workforceBudgets',
  WorkforcePlanning: 'workforcePlanning',
  WorkforcePlans: 'workforcePlans',
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
  ChatUsers: 'chatUsers',
  Conversations: 'conversations',
  Messages: 'messages',
  Chat: 'chat',
};

const actionTranslationKeys: Record<string, string> = {
  Approve: 'approve',
  ApproveJobDescriptions: 'approveJobDescriptions',
  Archive: 'archive',
  BeginClosing: 'beginClosing',
  Cancel: 'cancel',
  Close: 'close',
  Complete: 'complete',
  Create: 'create',
  Delete: 'delete',
  Detect: 'detect',
  Download: 'download',
  Edit: 'edit',
  EditCredentials: 'editCredentials',
  Evaluate: 'evaluate',
  Export: 'export',
  GenerateQrCode: 'generateQrCode',
  Hire: 'hire',
  Issue: 'issue',
  Lock: 'lock',
  Move: 'move',
  Open: 'open',
  Pause: 'pause',
  Publish: 'publish',
  PullAttendance: 'pullAttendance',
  PullUsers: 'pullUsers',
  Reject: 'reject',
  Reopen: 'reopen',
  Resend: 'resend',
  ResetPassword: 'resetPassword',
  Resolve: 'resolve',
  Respond: 'respond',
  Restore: 'restore',
  Review: 'review',
  Revoke: 'revoke',
  Schedule: 'schedule',
  SetStatus: 'setStatus',
  Submit: 'submit',
  Test: 'test',
  Unlock: 'unlock',
  Unpublish: 'unpublish',
  Upload: 'upload',
  View: 'view',
  ViewDashboard: 'viewDashboard',
  ViewFinancials: 'viewFinancials',
  ViewRaw: 'viewRaw',
  ViewTrace: 'viewTrace',
  Withdraw: 'withdraw',
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
