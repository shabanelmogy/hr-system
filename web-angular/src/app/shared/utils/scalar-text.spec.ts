import { scalarText } from './scalar-text';

describe('scalar text boundaries', () => {
  it('retains zero, false and supplied text while rejecting implicit object labels', () => {
    expect(scalarText(0)).toBe('0');
    expect(scalarText(false)).toBe('false');
    expect(scalarText('اسم')).toBe('اسم');
    expect(scalarText({ secret: 'fixture' }, '—')).toBe('—');
    expect(scalarText(null, '—')).toBe('—');
  });
});
