export const APP_CONFIG = {
  name: 'HR Management',
  apiTimeoutMs: 15_000,
  defaultPageSize: 10,
  pageSizeOptions: [10, 25, 50] as const,
} as const;
