export type PullToRefreshSafetyState = {
  scrollY: number;
  hasUnsavedChanges: boolean;
  isBusy: boolean;
  hasPendingMutations: boolean;
  hasOpenModal: boolean;
  gestureStartedInBlockedSurface: boolean;
  hasFocusedEditableElement: boolean;
};

export function canPullToRefresh(state: PullToRefreshSafetyState) {
  return state.scrollY <= 0
    && !state.hasUnsavedChanges
    && !state.isBusy
    && !state.hasPendingMutations
    && !state.hasOpenModal
    && !state.gestureStartedInBlockedSurface
    && !state.hasFocusedEditableElement;
}

export function isPullToRefreshBlockedTarget(target: EventTarget | null) {
  if (!(target instanceof Element)) return false;
  return Boolean(target.closest([
    "[data-pull-to-refresh-block]",
    ".MuiDataGrid-root",
    "[role='grid']",
    "[role='treegrid']",
    "[role='dialog']",
    "[aria-modal='true']",
    ".MuiModal-root",
  ].join(",")));
}

export function isEditableElement(element: Element | null) {
  if (!element) return false;
  if (element instanceof HTMLInputElement) {
    return !["button", "checkbox", "radio", "reset", "submit"].includes(element.type);
  }
  return element instanceof HTMLTextAreaElement
    || element instanceof HTMLSelectElement
    || element.getAttribute("contenteditable") === "true";
}

export function hasOpenModalSurface() {
  return Boolean(document.querySelector(
    "[role='dialog'],[aria-modal='true'],.MuiModal-root",
  ));
}
