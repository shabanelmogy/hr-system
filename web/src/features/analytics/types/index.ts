// Analytics Dashboard Types
export interface DashboardMetric {
  id: string;
  title: string;
  value: number | string;
  change?: number;
  changeType?: 'increase' | 'decrease' | 'neutral';
  format?: 'number' | 'percentage' | 'currency' | 'text';
  icon?: string;
  color?: string;
}

export interface ChartConfig {
  id: string;
  type: 'bar' | 'line' | 'pie' | 'doughnut' | 'radar' | 'area' | 'composed';
  title: string;
  data: any[];
  xAxisKey?: string;
  yAxisKey?: string;
  dataKeys?: string[];
  colors?: string[];
  height?: number;
  showLegend?: boolean;
  showTooltip?: boolean;
}

export interface DashboardSection {
  id: string;
  title: string;
  type: 'metrics' | 'chart' | 'table' | 'mixed';
  metrics?: DashboardMetric[];
  charts?: ChartConfig[];
  data?: any[];
  layout?: 'grid' | 'flex' | 'single';
  span?: number; // Grid span
}

export interface AnalyticsDashboard {
  id: string;
  title: string;
  description?: string;
  type: 'main' | 'performance' | 'attendance' | 'engagement' | 'documents' | 'custom';
  sections: DashboardSection[];
  filters?: DashboardFilter[];
  dateRange?: {
    start: string;
    end: string;
  };
  refreshInterval?: number; // in minutes
  permissions?: string[];
}

export interface DashboardFilter {
  id: string;
  label: string;
  type: 'select' | 'multiselect' | 'date' | 'daterange' | 'text';
  options?: { value: string; label: string }[];
  value?: any;
  required?: boolean;
}

// Report Builder Types
export interface ReportField {
  id: string;
  name: string;
  label: string;
  type: 'string' | 'number' | 'date' | 'boolean' | 'array';
  category: string;
  aggregations?: string[];
  filters?: string[];
}

export interface ReportColumn {
  field: ReportField;
  aggregation?: string;
  alias?: string;
  width?: number;
  sortable?: boolean;
}

export interface ReportFilter {
  field: ReportField;
  operator: 'equals' | 'not_equals' | 'contains' | 'starts_with' | 'ends_with' | 'greater_than' | 'less_than' | 'between' | 'in' | 'not_in';
  value: any;
}

export interface CustomReport {
  id: string;
  title: string;
  description?: string;
  dataSource: string;
  columns: ReportColumn[];
  filters: ReportFilter[];
  groupBy?: string[];
  sortBy?: {
    field: string;
    direction: 'asc' | 'desc';
  };
  limit?: number;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

// Data Export Types
export interface ExportTemplate {
  id: string;
  name: string;
  description?: string;
  format: 'csv' | 'excel' | 'json' | 'xml' | 'pdf';
  fields: string[];
  filters?: any;
  includeHeaders: boolean;
  delimiter?: string;
  dateFormat?: string;
  createdBy: string;
  createdAt: string;
}

export interface ExportJob {
  id: string;
  templateId: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  progress: number;
  fileUrl?: string;
  error?: string;
  createdAt: string;
  completedAt?: string;
  recordCount?: number;
  fileSize?: number;
}

// Analytics Data Types
export interface KPIMetric {
  id: string;
  name: string;
  value: number;
  target?: number;
  unit: string;
  trend: 'up' | 'down' | 'stable';
  change: number;
  period: string;
}

export interface TrendData {
  period: string;
  value: number;
  previousValue?: number;
  change?: number;
}

export interface DepartmentAnalytics {
  departmentId: string;
  departmentName: string;
  employeeCount: number;
  averagePerformance: number;
  attendanceRate: number;
  turnoverRate: number;
  engagementScore: number;
  topPerformers: string[];
  areasForImprovement: string[];
}

export interface EmployeeAnalytics {
  employeeId: string;
  employeeName: string;
  department: string;
  position: string;
  performanceScore: number;
  attendanceRate: number;
  hoursWorked: number;
  overtimeHours: number;
  engagementScore: number;
  lastReviewDate?: string;
  nextReviewDate?: string;
}

// Document Analytics Types
export interface DocumentAnalytics {
  totalDocuments: number;
  documentsByType: { type: string; count: number }[];
  documentsByStatus: { status: string; count: number }[];
  expiringSoon: number;
  expiredDocuments: number;
  storageUsed: number;
  averageFileSize: number;
  uploadTrends: TrendData[];
  accessPatterns: {
    mostAccessed: string[];
    leastAccessed: string[];
    accessByDepartment: { department: string; count: number }[];
  };
}

// Time & Attendance Analytics Types
export interface AttendanceAnalytics {
  totalEmployees: number;
  presentToday: number;
  absentToday: number;
  lateToday: number;
  attendanceRate: number;
  averageHoursWorked: number;
  overtimeHours: number;
  leaveBalance: {
    vacation: number;
    sick: number;
    personal: number;
  };
  trends: {
    attendance: TrendData[];
    overtime: TrendData[];
    punctuality: TrendData[];
  };
}

// Performance Analytics Types
export interface PerformanceAnalytics {
  averageRating: number;
  reviewCompletionRate: number;
  goalAchievementRate: number;
  topPerformers: EmployeeAnalytics[];
  departments: DepartmentAnalytics[];
  trends: {
    performance: TrendData[];
    reviews: TrendData[];
    goals: TrendData[];
  };
  categories: {
    category: string;
    averageRating: number;
    trend: 'up' | 'down' | 'stable';
  }[];
}

// Engagement Analytics Types
export interface EngagementAnalytics {
  overallScore: number;
  participationRate: number;
  feedbackCount: number;
  messageCount: number;
  surveyResponseRate: number;
  sentimentAnalysis: {
    positive: number;
    neutral: number;
    negative: number;
  };
  trends: {
    engagement: TrendData[];
    feedback: TrendData[];
    communication: TrendData[];
  };
  departments: {
    department: string;
    score: number;
    participation: number;
  }[];
}

// API Response Types
export interface AnalyticsApiResponse<T> {
  data: T;
  success: boolean;
  message?: string;
  timestamp: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

// Filter and Search Types
export interface AnalyticsFilters {
  dateRange?: {
    start: string;
    end: string;
  };
  departments?: string[];
  positions?: string[];
  employeeIds?: string[];
  locations?: string[];
  status?: string[];
}

export interface AnalyticsSearchParams extends AnalyticsFilters {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  search?: string;
}