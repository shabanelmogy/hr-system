import { parseBooleanFlag, validateApiUrl } from './env';

describe('parseBooleanFlag', () => {
  it('defaults demo flags for local development and accepts explicit build values', () => {
    expect(parseBooleanFlag(undefined, true)).toBe(true);
    expect(parseBooleanFlag(undefined, false)).toBe(false);
    expect(parseBooleanFlag(' TRUE ', false)).toBe(true);
    expect(parseBooleanFlag('false', true)).toBe(false);
    expect(() => parseBooleanFlag('enabled', true)).toThrow(
      'Boolean environment flags must be either true or false.',
    );
  });
});

describe('validateApiUrl', () => {
  it('allows an unconfigured API and normalizes the versioned root', () => {
    expect(validateApiUrl(undefined, false)).toBe('');
    expect(validateApiUrl(' https://erp.example.com/api/v1/ ', false)).toBe('https://erp.example.com/api/v1');
  });

  it.each([
    'https://user:password@erp.example.com/api/v1',
    'https://erp.example.com/api/v1?token=secret',
    'https://erp.example.com/api/v1#fragment',
    'https://erp.example.com/api/v1/extra',
    'ftp://erp.example.com/api/v1',
  ])('rejects unsafe or invalid endpoint %s', (value) => {
    expect(() => validateApiUrl(value, true)).toThrow('EXPO_PUBLIC_API_URL');
  });

  it.each(['http://localhost:5000/api/v1', 'http://10.0.2.2:5000/api/v1', 'http://192.168.1.15/api/v2']) (
    'allows private HTTP development endpoint %s',
    (value) => expect(validateApiUrl(value, true)).toBe(value),
  );

  it.each(['http://[fc00::1]/api/v1', 'http://[fd12:3456::1]/api/v1', 'http://[fe80::1]/api/v1']) (
    'allows local IPv6 development endpoint %s',
    (value) => expect(validateApiUrl(value, true)).toBe(value),
  );

  it.each([
    'http://example.com/api/v1',
    'http://fd.example.com/api/v1',
    'http://fe80.example.com/api/v1',
  ])('rejects non-private HTTP development endpoint %s', (value) => {
    expect(() => validateApiUrl(value, true)).toThrow('HTTPS');
  });

  it.each(['http://example.com/api/v1', 'http://localhost/api/v1'])('rejects insecure production endpoint %s', (value) => {
    expect(() => validateApiUrl(value, false)).toThrow('HTTPS');
  });
});
