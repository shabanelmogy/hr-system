export interface RecruitmentStageConfig {
  id: string;
  nameAr: string;
  nameEn: string;
  sequence: number;
  color: string;
  foldedInKanban: boolean;
  isDefault: boolean;
  sendEmailNotification: boolean;
  emailTemplate?: string;
  mappedStatus: number;
}

export interface RejectionReasonConfig {
  id: string;
  reasonAr: string;
  reasonEn: string;
  category: "qualifications" | "salary" | "behavioral" | "candidate_withdrew" | "other";
  sendAutoEmail: boolean;
  emailSubjectAr?: string;
  emailSubjectEn?: string;
  emailBodyAr?: string;
  emailBodyEn?: string;
}

export interface RecruitmentSourceConfig {
  id: string;
  nameAr: string;
  nameEn: string;
  type: "portal" | "social" | "referral" | "agency" | "fair" | "other";
  isActive: boolean;
  applicationsCount: number;
  hiredCount: number;
}

export interface EvaluationCriterionConfig {
  id: string;
  titleAr: string;
  titleEn: string;
  descriptionAr?: string;
  descriptionEn?: string;
  category: "technical" | "communication" | "culture" | "problem_solving" | "leadership";
  maxScore: number;
  weight: number;
  isMandatory: boolean;
}

export interface RecruitmentGeneralSettings {
  defaultCurrency: string;
  offerExpiryDays: number;
  autoPublishOpening: boolean;
  enforceHeadcountCapacity: boolean;
  defaultProbationMonths: number;
  enablePublicPortal: boolean;
  inboundEmailAlias?: string;
}

export interface RecruitmentSettingsDto {
  stages: RecruitmentStageConfig[];
  rejectionReasons: RejectionReasonConfig[];
  sources: RecruitmentSourceConfig[];
  evaluationCriteria: EvaluationCriterionConfig[];
  general: RecruitmentGeneralSettings;
}
