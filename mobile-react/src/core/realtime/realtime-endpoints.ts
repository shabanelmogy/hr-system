import { ENV } from '@/src/core/config/env';

const apiRootUrl = ENV.apiUrl.replace(/\/api\/v\d+$/i, '');

export const realtimeEndpoints = {
  token: 'auth/realtimeToken',
  companyHub: `${apiRootUrl}/hubs/company`,
} as const;
