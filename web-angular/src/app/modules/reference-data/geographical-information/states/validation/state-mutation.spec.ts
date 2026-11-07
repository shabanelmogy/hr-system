import { signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import {
  createStateForm,
  emptyStateDraft,
  parseStateMutation,
  stateDetailDraft,
  stateDraftKey,
  stateFieldError,
} from './state-mutation';

describe('State mutation validation', () => {
  it('normalizes a valid draft but rejects invalid names, code, and parent', () => {
    expect(
      parseStateMutation({ nameAr: ' القاهرة ', nameEn: ' Cairo ', code: ' cai ', countryId: 7 }),
    ).toEqual({ nameAr: 'القاهرة', nameEn: 'Cairo', code: 'CAI', countryId: 7 });
    for (const value of ['', 'a', 'x'.repeat(101), 'a\n b'])
      expect(stateFieldError('nameEn', value)).not.toBeNull();
    expect(() =>
      parseStateMutation({
        ...emptyStateDraft,
        nameAr: 'أب',
        nameEn: 'Ab',
        code: 'A!',
        countryId: 0,
      }),
    ).toThrow();
  });
  it('keeps a new Signal Form actionable while exposing required errors', () => {
    const form = TestBed.runInInjectionContext(() => createStateForm());
    expect(form().disabled()).toBe(false);
    form().markAsTouched();
    expect(form.nameAr().getError('required')).toBeDefined();
  });
  it('creates stable dirty keys for incomplete drafts and projects only editable detail fields', () => {
    expect(() => stateDraftKey(emptyStateDraft)).not.toThrow();
    expect(stateDraftKey({ ...emptyStateDraft, nameEn: ' Cairo ' })).toBe(
      stateDraftKey({ ...emptyStateDraft, nameEn: 'Cairo' }),
    );
    expect(
      stateDetailDraft({
        id: 1,
        nameAr: 'القاهرة',
        nameEn: 'Cairo',
        code: 'CAI',
        countryId: 7,
        country: { id: 7 },
        createdOn: '2026-01-01T00:00:00.000Z',
      }),
    ).toEqual({ nameAr: 'القاهرة', nameEn: 'Cairo', code: 'CAI', countryId: 7 });
  });
  it('revalidates an unavailable selected parent as the lookup becomes ready', () => {
    const available = signal(false);
    const form = TestBed.runInInjectionContext(() =>
      createStateForm({}, (id) => id === 7 && available()),
    );
    form.countryId().value.set(7);
    expect(form.countryId().getError('parentUnavailable')).toBeDefined();
    available.set(true);
    expect(form.countryId().getError('parentUnavailable')).toBeUndefined();
  });
});
