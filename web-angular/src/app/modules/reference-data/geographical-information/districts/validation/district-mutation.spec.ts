import { signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import {
  createDistrictForm,
  emptyDistrictDraft,
  parseDistrictMutation,
  districtDetailDraft,
  districtDraftKey,
  districtFieldError,
} from './district-mutation';

describe('District mutation validation', () => {
  it('normalizes a valid draft but rejects invalid names, code, and parent', () => {
    expect(
      parseDistrictMutation({ nameAr: ' القاهرة ', nameEn: ' Cairo ', code: ' cai ', stateId: 7 }),
    ).toEqual({ nameAr: 'القاهرة', nameEn: 'Cairo', code: 'CAI', stateId: 7 });
    for (const value of ['', 'a', 'x'.repeat(101), 'a\n b'])
      expect(districtFieldError('nameEn', value)).not.toBeNull();
    expect(() =>
      parseDistrictMutation({
        ...emptyDistrictDraft,
        nameAr: 'أب',
        nameEn: 'Ab',
        code: 'A!',
        stateId: 0,
      }),
    ).toThrow();
  });
  it('keeps a new Signal Form actionable while exposing required errors', () => {
    const form = TestBed.runInInjectionContext(() => createDistrictForm());
    expect(form().disabled()).toBe(false);
    form().markAsTouched();
    expect(form.nameAr().getError('required')).toBeDefined();
  });
  it('creates stable dirty keys for incomplete drafts and projects only editable detail fields', () => {
    expect(() => districtDraftKey(emptyDistrictDraft)).not.toThrow();
    expect(districtDraftKey({ ...emptyDistrictDraft, nameEn: ' Cairo ' })).toBe(
      districtDraftKey({ ...emptyDistrictDraft, nameEn: 'Cairo' }),
    );
    expect(
      districtDetailDraft({
        id: 1,
        nameAr: 'القاهرة',
        nameEn: 'Cairo',
        code: 'CAI',
        stateId: 7,
        state: { id: 7 },
        createdOn: '2026-01-01T00:00:00.000Z',
      }),
    ).toEqual({ nameAr: 'القاهرة', nameEn: 'Cairo', code: 'CAI', stateId: 7 });
  });
  it('revalidates an unavailable selected parent as the lookup becomes ready', () => {
    const available = signal(false);
    const form = TestBed.runInInjectionContext(() =>
      createDistrictForm({}, (id) => id === 7 && available()),
    );
    form.stateId().value.set(7);
    expect(form.stateId().getError('parentUnavailable')).toBeDefined();
    available.set(true);
    expect(form.stateId().getError('parentUnavailable')).toBeUndefined();
  });
});
