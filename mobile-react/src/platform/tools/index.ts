// Navigation/composition facade for the two existing route groups.
export * from './navigation';

// Legacy feature-root screen exports remain stable for existing consumers.
export { FileManagerScreen } from './file-manager';
export { TrackChangesScreen } from './track-changes';
export { LocalizationManagementScreen } from './localization';
export {
  ApiEndpointsScreen,
  HangfireDashboardScreen,
  HealthCheckScreen,
} from './operations';
export { getPlatformToolErrorMessage } from './utils/platform-tool-utils';
