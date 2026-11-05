import { signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { form, required, submit } from '@angular/forms/signals';
import { mapServerFieldErrors } from './submission-errors';

describe('API errors translated to native submission errors', () => {
  function setup() {
    const model = signal({ profile: { name: 'Existing' }, rows: [{ name: 'First' }, { name: 'Second' }] });
    const fields = TestBed.runInInjectionContext(() => form(model, p => required(p.profile.name)));
    return { model, fields };
  }

  it('maps exact nested and bracket paths and keeps unknown/unsafe paths visible', async () => {
    const { fields, model } = setup();
    await submit(fields, async () => mapServerFieldErrors(fields, {
      'profile.name': 'Unique name', 'rows[1].name': 'Invalid row', absent: 'Other issue', '__proto__.x': 'Unsafe path',
    }, model()));
    expect(fields.profile.name().getError('server')?.message).toBe('Unique name');
    expect(fields.rows[1].name().getError('server')?.message).toBe('Invalid row');
    expect(fields().errors().map(e => e.message)).toEqual(['Other issue', 'Unsafe path']);
  });

  it('lets Angular clear a server error on edit while preserving client validation', async () => {
    const { fields, model } = setup();
    await submit(fields, async () => mapServerFieldErrors(fields, { 'profile.name': 'Unique name' }, model()));
    fields.profile.name().value.set('');
    expect(fields.profile.name().getError('server')).toBeUndefined();
    expect(fields.profile.name().getError('required')).toBeDefined();
    fields.profile.name().value.set('Existing');
    expect(fields.profile.name().getError('server')).toBeUndefined();
  });

  it('does not attach late errors to edited fields or reordered rows', () => {
    const { fields, model } = setup();
    const submitted = model();
    fields.profile.name().value.set('New draft');
    model.update(value => ({ ...value, rows: [...value.rows].reverse() }));
    expect(mapServerFieldErrors(fields, { 'profile.name': 'Old name', 'rows[0].name': 'Old row' }, submitted)).toEqual([]);
  });
});
