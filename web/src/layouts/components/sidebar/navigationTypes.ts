// navigationTypes.ts
import { PermissionString } from "@/constants/appPermissions";
import React from "react";

// Enums for better type safety
export enum NavigationSectionId {
  Basic_DATA = "basic-data",
  USERS_AND_ROLES = "usersAndRoles",
  CHAT = "chat",
  CHART_EXAMPLES = "chartExamples",
  ADVANCED_TOOLS = "advancedTools",
  HR_MANAGEMENT = "hrManagement",
  ANALYTICS = "analytics",
  COMMUNICATION = "communication",
  DOCUMENTS = "documents",
  KANBAN = "kanban",
  EXTRAS = "extras",
}

export enum NavigationColors {
  PRIMARY_BLUE = "#4a6da7",
  SECONDARY_BLUE = "#5c7cbc",
  GREEN = "#2e7d32",
  LIGHT_GREEN = "#388e3c",
  CHART_BLUE = "#1976d2",
  PURPLE = "#7b1fa2",
  LIGHT_PURPLE = "#8e24aa",
  PINK = "#ba68c8",
  DARK_PURPLE = "#9c27b0",
  DARK_GRAY = "#352F36FF",
  ORANGE = "#ff5722",
  // HR Management colors
  HR_BLUE = "#1565c0",
  LIGHT_HR_BLUE = "#1976d2",
  ANALYTICS_GREEN = "#2e7d32",
  LIGHT_ANALYTICS_GREEN = "#388e3c",
  COMMUNICATION_PURPLE = "#7b1fa2",
  LIGHT_COMMUNICATION_PURPLE = "#8e24aa",
  DOCUMENTS_ORANGE = "#f57c00",
  LIGHT_DOCUMENTS_ORANGE = "#fb8c00",
}

export enum UserRoles {
  ADMIN = "admin",
  USER = "user",
  MANAGER = "manager",
}

export enum NavigationTitles {
  // Menu keys
  BASIC_DATA = "menu.basicData",
  GEOGRAPHIC_DATA = "menu.geographicData",
  COUNTRIES = "menu.countries",
  ADDRESS_TYPES = "menu.addressTypes",
  STATES = "menu.states",
  DISTRICTS = "menu.districts",
  EMPLOYEES = "menu.employees",
  ROLES_AND_USERS_MANAGEMENT = "menu.rolesAndUsersManagement",
  ROLES_MANAGEMENT = "menu.rolesManagement",
  USERS_MANAGEMENT = "menu.usersManagement",
  CHAT = "menu.chat",
  CHAT_INTERFACE = "menu.chatInterface",
  REPORTS = "menu.reports",
  EXTRAS = "menu.extras",
  FILEMANAGER = "menu.filemanager",
  APPOINTMENTS = "menu.appointments",

  // Direct titles
  CHART_EXAMPLES = "menu.chartExamples",
  CHART_LIBRARY = "menu.chartLibrary",
  NOTIFICATION_TEST = "menu.notificationTest",

  // Advanced tools
  ADVANCED_TOOLS_TITLE = "advancedTools.title",
  TRACK_CHANGES = "advancedTools.trackChanges",
  LOCALIZATION_API = "advancedTools.localizationApi",
  HEALTH_CHECK = "advancedTools.healthCheck",
  API_ENDPOINTS = "advancedTools.apiEndPoints",
  HANGFIRE_DASHBOARD = "advancedTools.hangfireDashboard",

  // HR Management
  HR_MANAGEMENT = "menu.hrManagement",
  ANALYTICS = "menu.analytics",
  ANALYTICS_DASHBOARD = "menu.analyticsDashboard",
  PERFORMANCE_ANALYTICS = "menu.performanceAnalytics",
  TIME_ATTENDANCE_ANALYTICS = "menu.timeAttendanceAnalytics",
  EMPLOYEE_ENGAGEMENT = "menu.employeeEngagement",
  DOCUMENT_ANALYTICS = "menu.documentAnalytics",
  CUSTOM_REPORTS = "menu.customReports",
  REPORT_VIEWER = "menu.reportViewer",
  DATA_EXPORT = "menu.dataExport",

  COMMUNICATION = "menu.communication",
  MESSAGING = "menu.messaging",
  ANNOUNCEMENTS = "menu.announcements",
  FEEDBACK = "menu.feedback",
  COMMUNICATION_DASHBOARD = "menu.communicationDashboard",
  NOTIFICATIONS = "menu.notifications",
  COMMUNICATION_REPORTS = "menu.communicationReports",

  DOCUMENTS = "menu.documents",
  DOCUMENT_OVERVIEW = "menu.documentOverview",
  EMPLOYEE_DOCUMENTS = "menu.employeeDocuments",
  COMPANY_DOCUMENTS = "menu.companyDocuments",
  DOCUMENT_TEMPLATES = "menu.documentTemplates",
  DOCUMENT_ARCHIVES = "menu.documentArchives",

  KANBAN = "menu.kanban",
  KANBAN_BOARDS = "menu.kanbanBoards",
}

// Interface definitions
export interface NavigationItem {
  id?: string;
  title: NavigationTitles | string;
  icon: React.ReactElement;
  path?: string;
  roles?: UserRoles[];
  permissions?: PermissionString[];
  items?: NavigationItem[];
}

export interface NavigationSection {
  id: NavigationSectionId;
  title: NavigationTitles | string;
  icon: React.ReactElement;
  path?: string;
  roles?: UserRoles[];
  permissions?: PermissionString[];
  items?: NavigationItem[];
}

export type NavigationConfig = NavigationSection[];

// Utility types for better type checking
export type RoleArray = UserRoles[];
export type PermissionArray = PermissionString[];
export type ColorValue = NavigationColors | string;
export type TitleValue = NavigationTitles | string;
