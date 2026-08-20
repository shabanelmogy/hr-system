const normalizeUrl = (value: string | undefined) => value?.trim().replace(/\/+$/, '') ?? '';

const apiUrl = normalizeUrl(process.env.EXPO_PUBLIC_API_URL);
const reportApiUrl = normalizeUrl(process.env.EXPO_PUBLIC_REPORT_API_URL);
const publicSelfRegistrationEnabled = process.env.EXPO_PUBLIC_ENABLE_SELF_REGISTRATION === 'true';

export const ENV = {
  apiUrl,
  isApiConfigured: apiUrl.length > 0,
  isReportApiConfigured: reportApiUrl.length > 0,
  publicSelfRegistrationEnabled,
  reportApiUrl,
} as const;

export function requireApiUrl(): string {
  if (!ENV.isApiConfigured) {
    throw new Error('EXPO_PUBLIC_API_URL is not configured.');
  }

  return ENV.apiUrl;
}

export function requireApiRootUrl(): string {
  return requireApiUrl().replace(/\/api\/v\d+$/i, '');
}

export function requireReportApiUrl(): string {
  if (!ENV.isReportApiConfigured) {
    throw new Error('EXPO_PUBLIC_REPORT_API_URL is not configured.');
  }

  return ENV.reportApiUrl;
}
