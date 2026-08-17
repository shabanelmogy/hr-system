export interface StoredFile {
  id: string;
  fileName: string;
  storedFileName: string;
  contentType: string;
  fileExtension: string;
  createdOn: string;
  createdByPc: string;
  createdById: string;
  isDeleted: boolean;
}

export interface PreparedFilePreview {
  uri: string;
  size: number;
  contentType: string;
  readText: () => Promise<string>;
  dispose: () => void;
}

export interface AuthenticatedFileSource {
  uri: string;
  headers?: Record<string, string>;
}

export interface UploadFileAsset {
  uri: string;
  name: string;
  mimeType: string;
  size: number | null;
  webFile?: Blob;
}

export interface Appointment {
  id: number;
  start: string;
  end: string;
  text: string;
  isAllDay: boolean;
}

export interface AppointmentInput {
  id?: number;
  start: string;
  end: string;
  text: string;
  isAllDay: boolean;
}

export interface AppointmentRange {
  start: string;
  end: string;
}

export interface TrackChangeLog {
  id: string;
  changeLogId: string | number;
  entityName: string;
  key: string;
  oldValue: string;
  newValue: string;
  changedBy: string;
  changedAt: string;
  changedByPc: string;
}

export interface LocalizationEntry {
  id: string;
  key: string;
  value: string;
}

export type LocalizationCulture = 'ar-EG' | 'en-US';

export type HealthStatus = 'Healthy' | 'Degraded' | 'Unhealthy' | 'Unknown';

export interface HealthCheckEntry {
  name: string;
  status: HealthStatus;
  duration: string;
  description: string | null;
}

export interface HealthCheckReport {
  status: HealthStatus;
  totalDuration: string;
  entries: HealthCheckEntry[];
}

export interface BackgroundJobDashboard {
  servers: number;
  queues: number;
  enqueued: number;
  scheduled: number;
  processing: number;
  succeeded: number;
  failed: number;
  generatedAt: string;
}
