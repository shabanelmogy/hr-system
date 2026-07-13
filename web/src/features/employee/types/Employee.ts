export interface Employee {
  id: string;
  employeeId: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  photo?: string;
  position: string;
  department: string;
  managerId?: string;
  hireDate: string;
  birthDate?: string;
  gender?: 'male' | 'female' | 'other';
  maritalStatus?: 'single' | 'married' | 'divorced' | 'widowed';
  nationality: string;
  address: EmployeeAddress;
  emergencyContact: EmergencyContact;
  employmentDetails: EmploymentDetails;
  salaryInfo: SalaryInfo;
  documents: EmployeeDocument[];
  status: 'active' | 'inactive' | 'terminated' | 'on-leave';
  createdAt: string;
  updatedAt: string;
  // Enhanced performance tracking
  performanceFeedback?: PerformanceFeedback[];
  performanceCycles?: PerformanceReviewCycle[];
  // Time tracking and attendance
  timeEntries?: TimeEntry[];
  attendanceRecords?: AttendanceRecord[];
  timeTrackingSettings?: TimeTrackingSettings;
  // Communication tools
  messages?: Message[];
  announcements?: Announcement[];
  feedback?: Feedback[];
  // Reporting and analytics
  reports?: EmployeeReport[];
}

export interface EmployeeAddress {
  street: string;
  city: string;
  state: string;
  country: string;
  postalCode: string;
}

export interface EmergencyContact {
  name: string;
  relationship: string;
  phone: string;
  email?: string;
}

export interface EmploymentDetails {
  employmentType: 'full-time' | 'part-time' | 'contract' | 'intern';
  workLocation: string;
  workSchedule: string;
  probationEndDate?: string;
  contractEndDate?: string;
}

export interface SalaryInfo {
  baseSalary: number;
  currency: string;
  payFrequency: 'monthly' | 'weekly' | 'bi-weekly';
  allowances: Allowance[];
  deductions: Deduction[];
  bankDetails: BankDetails;
}

export interface Allowance {
  type: string;
  amount: number;
  description?: string;
}

export interface Deduction {
  type: string;
  amount: number;
  description?: string;
}

export interface BankDetails {
  bankName: string;
  accountNumber: string;
  routingNumber?: string;
  accountType: 'checking' | 'savings';
}

export interface EmployeeDocument {
  id: string;
  employeeId: string;
  type: 'contract' | 'id' | 'certificate' | 'resume' | 'policy' | 'training' | 'performance' | 'other';
  category: string;
  name: string;
  description?: string;
  fileUrl: string;
  fileSize: number;
  mimeType: string;
  version: number;
  versions: DocumentVersion[];
  uploadedBy: string;
  uploadedAt: string;
  expiryDate?: string;
  tags: string[];
  permissions: DocumentPermission[];
  status: 'active' | 'archived' | 'expired';
  lastAccessed?: string;
}

export interface EmployeeFilters {
  department?: string;
  position?: string;
  status?: Employee['status'];
  country?: string;
  city?: string;
  hireDateFrom?: string;
  hireDateTo?: string;
  search?: string;
}

// Enhanced Advanced Filters
export interface AdvancedEmployeeFilters {
  search: string;
  status: Employee['status'][];
  department: string[];
  position: string[];
  employmentType: EmploymentDetails['employmentType'][];
  country: string[];
  city: string[];
  hireDateRange: {
    start?: Date;
    end?: Date;
  };
  salaryRange: {
    min?: number;
    max?: number;
  };
  gender: Employee['gender'][];
  maritalStatus: Employee['maritalStatus'][];
  workLocation: string[];
  managerId?: string;
}

export interface FilterOption {
  value: string;
  label: string;
  count?: number;
  color?: string;
}

export interface SearchResult {
  employees: Employee[];
  totalCount: number;
  filteredCount: number;
  searchTime: number;
}

export type SortField = 'firstName' | 'lastName' | 'email' | 'hireDate' | 'department' | 'position' | 'status' | 'createdAt';
export type SortDirection = 'asc' | 'desc';

export interface SortConfig {
  field: SortField;
  direction: SortDirection;
}

export interface FilterStats {
  totalEmployees: number;
  filteredEmployees: number;
  departments: FilterOption[];
  positions: FilterOption[];
  countries: FilterOption[];
  statuses: FilterOption[];
  employmentTypes: FilterOption[];
  salaryRange: {
    min: number;
    max: number;
    avg: number;
  };
}

// Performance Tracking Types
export interface PerformanceReview {
  id: string;
  employeeId: string;
  reviewPeriod: {
    startDate: string;
    endDate: string;
  };
  reviewerId: string;
  reviewerName: string;
  overallRating: number; // 1-5 scale
  categories: PerformanceCategory[];
  strengths: string[];
  areasForImprovement: string[];
  goals: PerformanceGoal[];
  comments: string;
  status: 'draft' | 'submitted' | 'approved' | 'rejected';
  createdAt: string;
  updatedAt: string;
}

export interface PerformanceCategory {
  id: string;
  name: string;
  rating: number; // 1-5 scale
  weight: number; // Percentage weight in overall score
  comments?: string;
}

export interface PerformanceGoal {
  id: string;
  title: string;
  description: string;
  category: 'professional-development' | 'performance' | 'behavioral' | 'project-specific';
  priority: 'low' | 'medium' | 'high' | 'critical';
  targetDate: string;
  status: 'not-started' | 'in-progress' | 'completed' | 'cancelled';
  progress: number; // 0-100
  milestones?: PerformanceGoalMilestone[];
  dependencies?: string[]; // goal ids
  assignedBy?: string;
  assignedTo?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface PerformanceMetric {
  id: string;
  employeeId: string;
  metricType: 'productivity' | 'quality' | 'attendance' | 'sales' | 'customer-satisfaction' | 'custom';
  name: string;
  value: number;
  target: number;
  unit: string;
  period: {
    startDate: string;
    endDate: string;
  };
  trend: 'improving' | 'declining' | 'stable';
  createdAt: string;
}

export interface PerformanceDashboard {
  employeeId: string;
  overallScore: number;
  reviewCount: number;
  lastReviewDate?: string;
  nextReviewDate?: string;
  activeGoals: number;
  completedGoals: number;
  metrics: PerformanceMetric[];
  recentReviews: PerformanceReview[];
  goalProgress: {
    total: number;
    completed: number;
    inProgress: number;
    overdue: number;
  };
}

export interface PerformanceSettings {
  reviewCycleMonths: number;
  autoScheduleReviews: boolean;
  requireManagerApproval: boolean;
  allowSelfReviews: boolean;
  ratingScale: {
    min: number;
    max: number;
    labels: string[];
  };
  defaultCategories: PerformanceCategory[];
}

export interface EmployeeStats {
  totalEmployees: number;
  activeEmployees: number;
  departments: { name: string; count: number }[];
  countries: { name: string; count: number }[];
  newHiresThisMonth: number;
  turnoverRate: number;
}

export interface CreateEmployeeRequest {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  position: string;
  department: string;
  hireDate: string;
  nationality: string;
  address: EmployeeAddress;
  emergencyContact: EmergencyContact;
  employmentDetails: EmploymentDetails;
}

export interface UpdateEmployeeRequest extends Partial<CreateEmployeeRequest> {
  id: string;
  status?: Employee['status'];
}

// Enhanced Performance Types
export interface PerformanceFeedback {
  id: string;
  employeeId: string;
  reviewerId: string;
  reviewerName: string;
  type: 'self' | 'manager' | 'peer' | 'subordinate' | '360' | 'customer';
  rating?: number;
  comments: string;
  categories: PerformanceCategory[];
  anonymous: boolean;
  status: 'draft' | 'submitted' | 'approved';
  createdAt: string;
  updatedAt: string;
}

export interface PerformanceReviewCycle {
  id: string;
  employeeId: string;
  cycleType: 'annual' | 'semi-annual' | 'quarterly' | 'monthly';
  startDate: string;
  endDate: string;
  status: 'scheduled' | 'in-progress' | 'completed' | 'overdue';
  reviewDueDate: string;
  selfReviewDueDate?: string;
  managerReviewDueDate: string;
}

export interface PerformanceGoalMilestone {
  id: string;
  goalId: string;
  title: string;
  description: string;
  targetDate: string;
  status: 'pending' | 'completed' | 'overdue';
  progress: number;
}

// Time Tracking and Attendance Types
export interface TimeEntry {
  id: string;
  employeeId: string;
  date: string;
  clockIn: string;
  clockOut?: string;
  breaks: BreakEntry[];
  totalHours: number;
  overtimeHours: number;
  status: 'active' | 'completed' | 'approved' | 'rejected';
  approvedBy?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface BreakEntry {
  id: string;
  startTime: string;
  endTime?: string;
  duration: number; // minutes
  type: 'lunch' | 'short-break' | 'meeting' | 'other';
  description?: string;
}

export interface AttendanceRecord {
  id: string;
  employeeId: string;
  date: string;
  status: 'present' | 'absent' | 'late' | 'half-day' | 'vacation' | 'sick' | 'personal-leave' | 'maternity-leave';
  checkInTime?: string;
  checkOutTime?: string;
  hoursWorked: number;
  lateMinutes: number;
  earlyDepartureMinutes: number;
  notes?: string;
  approved: boolean;
  approvedBy?: string;
  createdAt: string;
}

export interface TimeTrackingSettings {
  workHoursPerDay: number;
  workDaysPerWeek: number;
  breakDuration: number;
  overtimeThreshold: number;
  autoClockOut: boolean;
  requireApproval: boolean;
}

// Enhanced Document Management Types
export interface DocumentCategory {
  id: string;
  name: string;
  description: string;
  color?: string;
  icon?: string;
}

export interface DocumentVersion {
  id: string;
  documentId: string;
  version: number;
  fileUrl: string;
  uploadedBy: string;
  uploadedAt: string;
  changes?: string;
  size: number;
}

export interface DocumentPermission {
  id: string;
  documentId: string;
  userId: string;
  permission: 'read' | 'write' | 'delete' | 'share';
  grantedBy: string;
  grantedAt: string;
}

// Communication Tools Types
export interface Message {
  id: string;
  senderId: string;
  senderName: string;
  recipientIds: string[];
  subject: string;
  content: string;
  type: 'direct' | 'group' | 'broadcast';
  priority: 'low' | 'normal' | 'high' | 'urgent';
  status: 'sent' | 'delivered' | 'read' | 'archived';
  attachments: string[];
  threadId?: string; // for replies
  createdAt: string;
  updatedAt: string;
  readBy: string[];
}

export interface Announcement {
  id: string;
  title: string;
  content: string;
  summary?: string;
  authorId: string;
  authorName: string;
  targetAudience: 'all' | 'department' | 'team' | 'individual';
  targetIds: string[]; // department ids or employee ids
  priority: 'low' | 'normal' | 'high' | 'urgent';
  attachments: string[];
  expiryDate?: string;
  createdAt: string;
  updatedAt: string;
  published: boolean;
  readBy: string[];
  acknowledgedBy: string[];
}

export interface Feedback {
  id: string;
  fromEmployeeId: string;
  fromEmployeeName: string;
  toEmployeeId: string;
  toEmployeeName: string;
  type: 'positive' | 'constructive' | 'complaint' | 'suggestion' | 'praise' | 'concern';
  category: string;
  subject: string;
  description: string;
  anonymous: boolean;
  urgent: boolean;
  status: 'open' | 'in-progress' | 'resolved' | 'closed' | 'escalated';
  priority: 'low' | 'normal' | 'high' | 'critical';
  assignedTo?: string;
  resolution?: string;
  attachments: string[];
  createdAt: string;
  updatedAt: string;
  resolvedAt?: string;
}

// Reporting and Analytics Types
export interface AnalyticsReport {
  id: string;
  title: string;
  description?: string;
  type: 'performance' | 'attendance' | 'productivity' | 'engagement' | 'turnover' | 'custom';
  dateRange: {
    start: string;
    end: string;
  };
  filters: {
    department?: string[];
    position?: string[];
    employeeIds?: string[];
    location?: string[];
  };
  data: ReportData;
  charts: ChartData[];
  generatedAt: string;
  generatedBy: string;
  sharedWith: string[];
  status: 'draft' | 'published' | 'archived';
}

export interface ReportData {
  summary: {
    totalEmployees: number;
    averageRating: number;
    attendanceRate: number;
    [key: string]: any;
  };
  details: any[];
  trends: {
    period: string;
    value: number;
  }[];
}

export interface ChartData {
  id: string;
  type: 'bar' | 'line' | 'pie' | 'doughnut' | 'radar' | 'area';
  title: string;
  labels: string[];
  datasets: {
    label: string;
    data: number[];
    backgroundColor?: string | string[];
    borderColor?: string;
    fill?: boolean;
  }[];
}

export interface EmployeeReport {
  employeeId: string;
  employeeName: string;
  period: {
    start: string;
    end: string;
  };
  performance: {
    overallRating: number;
    reviewCount: number;
    goalsAchieved: number;
    goalsTotal: number;
    metrics: PerformanceMetric[];
  };
  attendance: {
    totalDays: number;
    presentDays: number;
    absentDays: number;
    lateDays: number;
    attendanceRate: number;
  };
  timeTracking: {
    totalHours: number;
    overtimeHours: number;
    averageHoursPerDay: number;
    productiveHours: number;
  };
  documents: {
    totalDocuments: number;
    expiringSoon: number;
    categories: { category: string; count: number }[];
  };
  feedback: {
    received: number;
    given: number;
    positive: number;
    constructive: number;
  };
}

export interface DepartmentReport {
  departmentId: string;
  departmentName: string;
  period: {
    start: string;
    end: string;
  };
  employeeCount: number;
  performance: {
    averageRating: number;
    topPerformers: string[];
    needsImprovement: string[];
  };
  attendance: {
    averageAttendanceRate: number;
    absentDays: number;
    turnoverRate: number;
  };
  engagement: {
    feedbackCount: number;
    messageCount: number;
    announcementReadRate: number;
  };
}