import { LocalCloseController, type CloseSnapshot } from './local-close-controller';

const initial: CloseSnapshot = { identity: 'editor-A', revision: 1, active: true, unsaved: true, pending: false };
describe('Local form close consent', () => {
  it('closes a clean editor once and rejects inactive, pending and invalid identities', () => {
    const controller = new LocalCloseController();
    expect(controller.request({ ...initial, active: false })).toBe(false);
    expect(controller.request({ ...initial, pending: true })).toBe(false);
    expect(controller.request({ ...initial, identity: '' })).toBe(false);
    expect(controller.request({ ...initial, revision: NaN })).toBe(false);
    const clean = { ...initial, unsaved: false };
    expect(controller.request(clean)).toBe(true);
    expect(controller.request(clean)).toBe(false);
    expect(controller.consent()).toBeNull();
  });
  it('deduplicates prompts, keeps editing, and accepts a fresh matching consent exactly once', () => {
    const controller = new LocalCloseController();
    controller.request(initial); const first = controller.consent()!;
    controller.request(initial); expect(controller.consent()).toBe(first);
    controller.keep(first); expect(controller.consent()).toBeNull();
    controller.request(initial); const second = controller.consent()!;
    expect(second.token).not.toBe(first.token);
    expect(controller.confirm(initial, first)).toBe(false);
    expect(controller.confirm(initial, second)).toBe(true);
    expect(controller.confirm(initial, second)).toBe(false);
    expect(controller.request(initial)).toBe(false);
  });
  it.each([
    { identity: 'editor-B' }, { revision: 2 }, { pending: true }, { active: false }, { unsaved: false },
  ])('invalidates old consent after owner/state replacement %o', replacement => {
    const controller = new LocalCloseController();
    controller.request(initial); const consent = controller.consent()!;
    const current = { ...initial, ...replacement };
    expect(controller.confirm(current, consent)).toBe(false);
    expect(controller.consent()).toBeNull();
  });
  it('pending transitions, clean reset and teardown cannot resurrect consent', () => {
    const controller = new LocalCloseController();
    controller.request(initial); const consent = controller.consent()!;
    controller.synchronize({ ...initial, pending: true });
    expect(controller.confirm(initial, consent)).toBe(false);
    controller.request(initial); const next = controller.consent()!;
    controller.synchronize({ ...initial, unsaved: false });
    expect(controller.confirm(initial, next)).toBe(false);
    controller.request(initial); controller.destroy();
    expect(controller.request(initial)).toBe(false);
    expect(controller.consent()).toBeNull();
  });
});
