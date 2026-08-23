export type ReportTemplateListItem = {
  id: string;
  name: string;
  featureKey: string;
  dataSourceKey: string;
  isPublished: boolean;
  isArchived: boolean;
  rowVersion: string;
  revisionNumber: number;
  createdOn: string;
  updatedOn?: string;
};

export type ReportTemplateDetail = ReportTemplateListItem & {
  definitionJson: string;
  description?: string | null;
};

export type CreateReportTemplateRequest = {
  featureKey: string;
  name: string;
  description?: string | null;
  definitionJson: string;
  dataSourceKey: string;
};

export type UpdateReportTemplateRequest = Omit<
  CreateReportTemplateRequest,
  "featureKey"
> & {
  rowVersion: string;
};

export type DuplicateReportTemplateRequest = {
  name: string;
};

/** A server-approved REST source; it never represents database credentials. */
export type ReportDataSourceDescriptor = {
  key: string;
  featureKey: string;
  displayName: string;
  dataProvider: string;
  connectString: string;
  relativeApiPath: string;
  httpMethod: string;
  requiresAuthentication: boolean;
};
