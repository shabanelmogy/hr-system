export interface ErrorDialogDetails {
  title?: string;
  messages: string[];
  status?: number;
  traceId?: string;
  correlationId?: string;
  errorType?: string;
  errorCodes?: string[];
  detail?: string;
  stack?: string;
  reportId: string;
  occurredAt: string;
}

export interface AppToastOptions {
  title?: string;
  duration?: number;
  position?: 'top' | 'bottom';
  onPress?: () => void;
}

export interface ErrorReportContext {
  heading: string;
  includeTechnical: boolean;
  appVersion?: string;
  language?: string;
  direction?: string;
  theme?: string;
  platform?: string;
  screen?: string;
}
