export type CrystalReportStatus = "published" | "draft" | "archived";

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
  updatedOn: string;
}

export interface CrystalReportPage {
  items: CrystalReportListItem[];
  totalCount: number;
}

export interface CrystalReportVersion {
  id: string;
  versionNumber: number;
  originalFileName: string;
  validationStatus: "pending" | "valid" | "invalid" | "published" | string;
  validationMessage: string | null;
  summaryTitle: string | null;
  summarySubject: string | null;
  size: number | null;
  createdOn: string;
  rowVersion: string;
}

export interface CrystalReportAccessGrant {
  roleId: string;
  rights: CrystalReportRight[];
}

export interface CrystalReportRoleOption {
  id: string;
  name: string;
}

export type CrystalReportRight = "Run" | "Download" | "Upload" | "Publish" | "ManageAccess";

export interface CrystalReportDetail extends CrystalReportListItem {
  versions: CrystalReportVersion[];
  access: CrystalReportAccessGrant[];
}

export interface CreateCrystalReportRequest {
  entityKey: string;
  description?: string;
  file: File;
}

export interface DiscoveredCrystalReport {
  sourceId: string;
  entityKey: string;
  reportKey: string;
  fileName: string;
  displayName: string;
  subject: string | null;
  size: number;
  sha256: string;
  lastModifiedUtc: string;
  isImportable: boolean;
  validationReason: string | null;
  isImported: boolean;
}

export interface ImportDiscoveredCrystalReportRequest {
  sourceId: string;
  expectedSha256: string;
  description?: string;
}

export interface RenderCrystalReportRequest {
  language: "ar" | "en";
  filters?: Record<string, string | null>;
}
