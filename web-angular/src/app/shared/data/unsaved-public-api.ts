// Startup/navigation entry: keep collection, PDF and query helpers in their lazy consumers.
export { UnsavedChanges } from './unsaved-changes';
export type { DraftState, DraftOwner, TransitionConsent } from './unsaved-changes';
export { UnsavedNavigation, unsavedNavigationGuard } from './unsaved-navigation';
