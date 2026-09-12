export interface CrystalReportListItem {
  id: string;
  entityKey: string;
  reportKey: string;
  displayName: string;
  summaryTitle: string | null;
  summarySubject: string | null;
  description: string | null;
  currentVersionNumber: number | null;
  isPublished: boolean;
  isArchived: boolean;
  rowVersion: string;
  updatedOn: string | null;
}

export interface CrystalReportRenderRequest {
  language: 'ar' | 'en';
  filters?: Record<string, string | null>;
}
