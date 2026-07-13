import apiService from '@/shared/services/apiService';
import {
  AnalyticsApiResponse,
  PaginatedResponse,
  AnalyticsDashboard,
  CustomReport,
  ExportJob,
  ExportTemplate,
  AnalyticsFilters,
  AnalyticsSearchParams,
  KPIMetric,
  DepartmentAnalytics,
  EmployeeAnalytics,
  DocumentAnalytics,
  AttendanceAnalytics,
  PerformanceAnalytics,
  EngagementAnalytics
} from '../types';

class AnalyticsService {
  // Dashboard APIs
  async getDashboard(type: string, filters?: AnalyticsFilters): Promise<AnalyticsApiResponse<AnalyticsDashboard>> {
    const params = new URLSearchParams();
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value) {
          if (Array.isArray(value)) {
            value.forEach(v => params.append(key, v));
          } else if (typeof value === 'object') {
            params.append(key, JSON.stringify(value));
          } else {
            params.append(key, value.toString());
          }
        }
      });
    }

    return apiService.get(`/analytics/dashboard/${type}?${params.toString()}`);
  }

  async getKPIs(filters?: AnalyticsFilters): Promise<AnalyticsApiResponse<KPIMetric[]>> {
    const params = filters ? new URLSearchParams(JSON.stringify(filters)) : '';
    return apiService.get(`/analytics/kpis?${params}`);
  }

  // Department Analytics
  async getDepartmentAnalytics(filters?: AnalyticsFilters): Promise<AnalyticsApiResponse<DepartmentAnalytics[]>> {
    const params = filters ? new URLSearchParams(JSON.stringify(filters)) : '';
    return apiService.get(`/analytics/departments?${params}`);
  }

  // Employee Analytics
  async getEmployeeAnalytics(params?: AnalyticsSearchParams): Promise<PaginatedResponse<EmployeeAnalytics>> {
    const queryParams = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          queryParams.append(key, value.toString());
        }
      });
    }
    return apiService.get(`/analytics/employees?${queryParams.toString()}`);
  }

  // Document Analytics
  async getDocumentAnalytics(filters?: AnalyticsFilters): Promise<AnalyticsApiResponse<DocumentAnalytics>> {
    const params = filters ? new URLSearchParams(JSON.stringify(filters)) : '';
    return apiService.get(`/analytics/documents?${params}`);
  }

  // Time & Attendance Analytics
  async getAttendanceAnalytics(filters?: AnalyticsFilters): Promise<AnalyticsApiResponse<AttendanceAnalytics>> {
    const params = filters ? new URLSearchParams(JSON.stringify(filters)) : '';
    return apiService.get(`/analytics/attendance?${params}`);
  }

  // Performance Analytics
  async getPerformanceAnalytics(filters?: AnalyticsFilters): Promise<AnalyticsApiResponse<PerformanceAnalytics>> {
    const params = filters ? new URLSearchParams(JSON.stringify(filters)) : '';
    return apiService.get(`/analytics/performance?${params}`);
  }

  // Engagement Analytics
  async getEngagementAnalytics(filters?: AnalyticsFilters): Promise<AnalyticsApiResponse<EngagementAnalytics>> {
    const params = filters ? new URLSearchParams(JSON.stringify(filters)) : '';
    return apiService.get(`/analytics/engagement?${params}`);
  }

  // Custom Reports
  async getReports(params?: AnalyticsSearchParams): Promise<PaginatedResponse<CustomReport>> {
    const queryParams = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          queryParams.append(key, value.toString());
        }
      });
    }
    return apiService.get(`/analytics/reports?${queryParams.toString()}`);
  }

  async createReport(report: Omit<CustomReport, 'id' | 'createdAt' | 'updatedAt'>): Promise<AnalyticsApiResponse<CustomReport>> {
    return apiService.post('/analytics/reports', report);
  }

  async updateReport(id: string, report: Partial<CustomReport>): Promise<AnalyticsApiResponse<CustomReport>> {
    return apiService.put(`/analytics/reports/${id}`, report);
  }

  async deleteReport(id: string): Promise<AnalyticsApiResponse<void>> {
    return apiService.delete(`/analytics/reports/${id}`);
  }

  async executeReport(id: string, filters?: AnalyticsFilters): Promise<AnalyticsApiResponse<any[]>> {
    const params = filters ? new URLSearchParams(JSON.stringify(filters)) : '';
    return apiService.post(`/analytics/reports/${id}/execute?${params}`, {});
  }

  // Export Templates
  async getExportTemplates(): Promise<AnalyticsApiResponse<ExportTemplate[]>> {
    return apiService.get('/analytics/export-templates');
  }

  async createExportTemplate(template: Omit<ExportTemplate, 'id' | 'createdAt'>): Promise<AnalyticsApiResponse<ExportTemplate>> {
    return apiService.post('/analytics/export-templates', template);
  }

  async updateExportTemplate(id: string, template: Partial<ExportTemplate>): Promise<AnalyticsApiResponse<ExportTemplate>> {
    return apiService.put(`/analytics/export-templates/${id}`, template);
  }

  async deleteExportTemplate(id: string): Promise<AnalyticsApiResponse<void>> {
    return apiService.delete(`/analytics/export-templates/${id}`);
  }

  // Export Jobs
  async getExportJobs(): Promise<AnalyticsApiResponse<ExportJob[]>> {
    return apiService.get('/analytics/export-jobs');
  }

  async createExportJob(job: { templateId: string; filters?: AnalyticsFilters }): Promise<AnalyticsApiResponse<ExportJob>> {
    return apiService.post('/analytics/export-jobs', job);
  }

  async getExportJobStatus(id: string): Promise<AnalyticsApiResponse<ExportJob>> {
    return apiService.get(`/analytics/export-jobs/${id}`);
  }

  async downloadExport(id: string): Promise<string> {
    // Return the download URL instead of blob for now
    const baseUrl = apiService.getBaseURL();
    return `${baseUrl}/analytics/export-jobs/${id}/download`;
  }

  // Real-time data
  async getRealTimeMetrics(): Promise<AnalyticsApiResponse<any>> {
    return apiService.get('/analytics/realtime');
  }

  // Chart data helpers
  async getChartData(chartType: string, filters?: AnalyticsFilters): Promise<AnalyticsApiResponse<any>> {
    const params = filters ? new URLSearchParams(JSON.stringify(filters)) : '';
    return apiService.get(`/analytics/charts/${chartType}?${params}`);
  }

  // Bulk operations
  async exportBulkData(templateId: string, filters?: AnalyticsFilters): Promise<AnalyticsApiResponse<ExportJob>> {
    return apiService.post('/analytics/bulk-export', { templateId, filters });
  }

  // Dashboard customization
  async saveDashboard(dashboard: AnalyticsDashboard): Promise<AnalyticsApiResponse<AnalyticsDashboard>> {
    return apiService.post('/analytics/dashboards', dashboard);
  }

  async updateDashboard(id: string, dashboard: Partial<AnalyticsDashboard>): Promise<AnalyticsApiResponse<AnalyticsDashboard>> {
    return apiService.put(`/analytics/dashboards/${id}`, dashboard);
  }

  async getSavedDashboards(): Promise<AnalyticsApiResponse<AnalyticsDashboard[]>> {
    return apiService.get('/analytics/dashboards');
  }

  // Alert and notification settings
  async getAlerts(): Promise<AnalyticsApiResponse<any[]>> {
    return apiService.get('/analytics/alerts');
  }

  async createAlert(alert: any): Promise<AnalyticsApiResponse<any>> {
    return apiService.post('/analytics/alerts', alert);
  }

  async updateAlert(id: string, alert: any): Promise<AnalyticsApiResponse<any>> {
    return apiService.put(`/analytics/alerts/${id}`, alert);
  }

  async deleteAlert(id: string): Promise<AnalyticsApiResponse<void>> {
    return apiService.delete(`/analytics/alerts/${id}`);
  }
}

export const analyticsService = new AnalyticsService();