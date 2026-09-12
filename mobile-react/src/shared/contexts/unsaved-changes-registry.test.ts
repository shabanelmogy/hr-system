import {
  clearUnsavedChangesForTests,
  discardUnsavedChanges,
  hasUnsavedChanges,
  registerUnsavedChange,
} from './unsaved-changes-registry';

afterEach(clearUnsavedChangesForTests);

describe('unsaved changes registry', () => {
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
