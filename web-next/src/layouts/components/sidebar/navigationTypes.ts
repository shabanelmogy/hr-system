// navigationTypes.ts
import type { PermissionString } from "@/lib/auth/permissions";
import React from "react";

// Enums for better type safety
export enum NavigationSectionId {
  Basic_DATA = "basic-data",
  USERS_AND_ROLES = "usersAndRoles",
  CHAT = "chat",
  CHART_EXAMPLES = "chartExamples",
  ADVANCED_TOOLS = "advancedTools",
  HR_MANAGEMENT = "hrManagement",
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
  COUNTRY_REPORT = "menu.countryReport",
  GLOBAL_PRESENCE = "menu.globalPresence",
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
