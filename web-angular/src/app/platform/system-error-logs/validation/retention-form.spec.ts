import { TestBed } from '@angular/core/testing';
import { submit } from '@angular/forms/signals';
import { createRetentionForm, parseRetentionDraft, retentionFieldError } from './retention-form';

describe('Retention Signal Form', () => {
  afterEach(() => TestBed.resetTestingModule());
  it('accepts only the bounded integer retention contract', () => {
    expect(retentionFieldError(' ')).toBe('required');
    for (const input of ['0', '-1', '3651', '2.5', '1e2', 'Infinity']) {
      expect(retentionFieldError(input)).toBe('range');
      expect(() => parseRetentionDraft({ retentionDays: input })).toThrow();
    }
    expect(parseRetentionDraft({ retentionDays: ' 001 ' })).toBe(1);
    expect(parseRetentionDraft({ retentionDays: '3650' })).toBe(3650);
  });
  it('keeps Save available to validate and returns field-specific errors before a command', async () => {
    const action = vi.fn(async () => undefined);
    const form = TestBed.runInInjectionContext(() =>
      createRetentionForm({ submission: { action, ignoreValidators: 'none' } }),
    );
    await submit(form);
    expect(action).not.toHaveBeenCalled();
    expect(
      form
        .retentionDays()
        .errors()
        .some((error) => error.kind === 'required'),
    ).toBe(true);
    form.retentionDays().value.set('3651');
    await submit(form);
    expect(action).not.toHaveBeenCalled();
    expect(
      form
        .retentionDays()
        .errors()
        .some((error) => error.kind === 'range'),
    ).toBe(true);
    form.retentionDays().value.set('90');
    await submit(form);
    expect(action).toHaveBeenCalledOnce();
  });
});
