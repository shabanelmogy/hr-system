export interface ErrorEnvironment {
  appVersion: string;
  appLanguage: string;
  browserLanguage: string;
  direction: string;
  theme: string;
  timeZone: string;
  browser: string;
  platform: string;
  viewport: string;
  screen: string;
  online: boolean;
}

export interface ErrorDialogDetails {
  reportId?: string;
  title?: string;
  messages: string[];
  status?: number;
  traceId?: string;
  errorType?: string;
  errorCodes?: string[];
  detail?: string;
  occurredAt?: string;
  path?: string;
  environment?: ErrorEnvironment;
}

export interface ErrorRuntimeContext {
  reportId?: string;
  occurredAt?: string;
  path?: string;
  environment?: ErrorEnvironment;
}
