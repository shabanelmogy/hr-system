const isDevelopmentBuild = typeof __DEV__ === 'boolean' ? __DEV__ : process.env.NODE_ENV !== 'production';
const apiUrl = validateApiUrl(process.env.EXPO_PUBLIC_API_URL, isDevelopmentBuild);
const publicSelfRegistrationEnabled = process.env.EXPO_PUBLIC_ENABLE_SELF_REGISTRATION === 'true';
const demoLoginEnabled = parseBooleanFlag(process.env.EXPO_PUBLIC_DEMO_LOGIN_ENABLED, isDevelopmentBuild);

export const ENV = {
  apiUrl,
  isApiConfigured: apiUrl.length > 0,
  publicSelfRegistrationEnabled,
  demoLoginEnabled,
} as const;

export function parseBooleanFlag(value: string | undefined, defaultValue: boolean): boolean {
  if (value === undefined || value.trim() === '') return defaultValue;
  const normalized = value.trim().toLowerCase();
  if (normalized === 'true') return true;
  if (normalized === 'false') return false;
  throw new Error('Boolean environment flags must be either true or false.');
}

export function requireApiUrl(): string {
  if (!ENV.isApiConfigured) {
    throw new Error('EXPO_PUBLIC_API_URL is not configured.');
  }

  return ENV.apiUrl;
}

export function requireApiRootUrl(): string {
  return new URL(requireApiUrl()).origin;
}

export function validateApiUrl(value: string | undefined, isDevelopment: boolean): string {
  const candidate = value?.trim();
  if (!candidate) return '';

  let url: URL;
  try {
    url = new URL(candidate);
  } catch {
    throw new Error('EXPO_PUBLIC_API_URL must be an absolute HTTP(S) API URL.');
  }

  if (
    !['https:', 'http:'].includes(url.protocol) ||
    !url.hostname ||
    url.username ||
    url.password ||
    url.search ||
    url.hash ||
    !/^\/api\/v\d+\/?$/i.test(url.pathname)
  ) {
    throw new Error('EXPO_PUBLIC_API_URL must use an HTTP(S) origin and a versioned /api/vN path without credentials, query, or fragment.');
  }

  if (url.protocol === 'http:' && (!isDevelopment || !isPrivateDevelopmentHost(url.hostname))) {
    throw new Error('EXPO_PUBLIC_API_URL must use HTTPS except for local/private development hosts.');
  }

  url.pathname = url.pathname.replace(/\/$/, '');
  return url.toString().replace(/\/$/, '');
}

function isPrivateDevelopmentHost(hostname: string): boolean {
  const host = hostname.toLowerCase().replace(/^\[|\]$/g, '');
  if (host === 'localhost' || host.endsWith('.localhost') || host === '::1') {
    return true;
  }

  if (host.includes(':')) {
    // URL has already validated IPv6 syntax. Permit only ULA (fc00::/7) and
    // link-local (fe80::/10) ranges for plain-HTTP development endpoints.
    return /^(?:fc|fd)[0-9a-f]{2}:/i.test(host) || /^fe[89ab][0-9a-f]:/i.test(host);
  }

  const octets = host.split('.').map(Number);
  if (octets.length !== 4 || octets.some((octet) => !Number.isInteger(octet) || octet < 0 || octet > 255)) {
    return false;
  }
  const [first, second] = octets;
  return first === 10 || first === 127 || (first === 172 && second >= 16 && second <= 31) || (first === 192 && second === 168);
}
