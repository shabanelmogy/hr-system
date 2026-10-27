import {
  clearUnsavedChangesForTests,
  discardUnsavedChanges,
  hasUnsavedChanges,
  hasBusyUnsavedChanges,
  registerUnsavedChange,
} from './unsaved-changes-registry';

afterEach(clearUnsavedChangesForTests);

describe('unsaved changes registry', () => {
  it('prevents tab/context exit while a registered form is submitting', () => {
    const discard = jest.fn();
    const unregister = registerUnsavedChange(discard, true);
    expect(hasBusyUnsavedChanges()).toBe(true);
    expect(discardUnsavedChanges()).toBe(false);
    expect(discard).not.toHaveBeenCalled();
    expect(hasUnsavedChanges()).toBe(true);
    unregister();
    expect(hasBusyUnsavedChanges()).toBe(false);
  });
  it('tracks active registrations and unregisters them independently', () => {
    const unregisterFirst = registerUnsavedChange(jest.fn());
    const unregisterSecond = registerUnsavedChange(jest.fn());

    expect(hasUnsavedChanges()).toBe(true);
    unregisterFirst();
    expect(hasUnsavedChanges()).toBe(true);
    unregisterSecond();
    expect(hasUnsavedChanges()).toBe(false);
  });

  it('discards every registered form exactly once', () => {
    const first = jest.fn();
    const second = jest.fn();
    registerUnsavedChange(first);
    registerUnsavedChange(second);

    discardUnsavedChanges();

    expect(first).toHaveBeenCalledTimes(1);
    expect(second).toHaveBeenCalledTimes(1);
    expect(hasUnsavedChanges()).toBe(false);
  });
});
