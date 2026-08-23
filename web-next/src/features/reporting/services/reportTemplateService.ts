import { apiRoutes } from "@/config";
import apiService from "@/shared/services/apiService";
import type {
  CreateReportTemplateRequest,
  DuplicateReportTemplateRequest,
  ReportTemplateDetail,
  ReportTemplateListItem,
  UpdateReportTemplateRequest,
  ReportDataSourceDescriptor,
} from "../types/reportTemplate";

const reportTemplateService = {
  list: (featureKey: string) =>
    apiService.get<ReportTemplateListItem[]>(apiRoutes.reportTemplates.list, {
      featureKey,
    }),

  listForManagement: (featureKey: string) =>
    apiService.get<ReportTemplateListItem[]>(apiRoutes.reportTemplates.manage, {
      featureKey,
    }),

  getDataSources: (featureKey: string) =>
    apiService.get<ReportDataSourceDescriptor[]>(apiRoutes.reportTemplates.dataSources, {
      featureKey,
    }),

  getById: (id: string) =>
    apiService.get<ReportTemplateDetail>(apiRoutes.reportTemplates.getById(id)),

  getForManagement: (id: string) =>
    apiService.get<ReportTemplateDetail>(apiRoutes.reportTemplates.getForManagement(id)),

  create: (request: CreateReportTemplateRequest) =>
    apiService.post<ReportTemplateDetail>(apiRoutes.reportTemplates.create, request),

  update: (id: string, request: UpdateReportTemplateRequest) =>
    apiService.put<ReportTemplateDetail>(apiRoutes.reportTemplates.update(id), request),

  duplicate: (id: string, request: DuplicateReportTemplateRequest) =>
    apiService.post<ReportTemplateDetail>(apiRoutes.reportTemplates.duplicate(id), request),

  publish: (id: string, rowVersion: string) =>
    apiService.post<void>(apiRoutes.reportTemplates.publish(id), { rowVersion }),
};

export default reportTemplateService;
