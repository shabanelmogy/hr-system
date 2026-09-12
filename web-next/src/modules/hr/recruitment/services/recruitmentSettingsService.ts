import type {
  RecruitmentStageConfig,
  RejectionReasonConfig,
  RecruitmentSourceConfig,
  EvaluationCriterionConfig,
  RecruitmentGeneralSettings,
} from "../types/recruitmentSettingsTypes";

const STORAGE_KEYS = {
  STAGES: "recruitment_settings_stages",
  REASONS: "recruitment_settings_reasons",
  SOURCES: "recruitment_settings_sources",
  CRITERIA: "recruitment_settings_criteria",
  GENERAL: "recruitment_settings_general",
};

export const DEFAULT_STAGES: RecruitmentStageConfig[] = [
  {
    id: "stage_applied",
    nameAr: "تم التقديم",
    nameEn: "Applied",
    sequence: 10,
    color: "#1976d2",
    foldedInKanban: false,
    isDefault: true,
    sendEmailNotification: true,
    emailTemplate: "شكراً لتقديمك على وظيفتنا، سيتم فحص طلبك والتواصل معك قريباً.",
    mappedStatus: 2,
  },
  {
    id: "stage_screening",
    nameAr: "قيد الفرز الأولي",
    nameEn: "Screening",
    sequence: 20,
    color: "#ed6c02",
    foldedInKanban: false,
    isDefault: false,
    sendEmailNotification: false,
    mappedStatus: 3,
  },
  {
    id: "stage_shortlist",
    nameAr: "القائمة المختصرة",
    nameEn: "Shortlisted",
    sequence: 30,
    color: "#9c27b0",
    foldedInKanban: false,
    isDefault: false,
    sendEmailNotification: true,
    emailTemplate: "يسعدنا إبلاغك بتأهلك للقائمة المختصرة وسيتم التنسيق للمقابلة قريباً.",
    mappedStatus: 4,
  },
  {
    id: "stage_tech_interview",
    nameAr: "المقابلة الفنية",
    nameEn: "Technical Interview",
    sequence: 40,
    color: "#0288d1",
    foldedInKanban: false,
    isDefault: false,
    sendEmailNotification: true,
    mappedStatus: 5,
  },
  {
    id: "stage_hr_interview",
    nameAr: "مقابلة الإدارة والموارد البشرية",
    nameEn: "HR & Culture Fit",
    sequence: 50,
    color: "#5c6bc0",
    foldedInKanban: false,
    isDefault: false,
    sendEmailNotification: true,
    mappedStatus: 6,
  },
  {
    id: "stage_offer_issued",
    nameAr: "تم إرسال العرض الوظيفي",
    nameEn: "Offer Issued",
    sequence: 60,
    color: "#ff9800",
    foldedInKanban: false,
    isDefault: false,
    sendEmailNotification: true,
    mappedStatus: 7,
  },
  {
    id: "stage_offer_accepted",
    nameAr: "تم قبول العرض",
    nameEn: "Offer Accepted",
    sequence: 70,
    color: "#009688",
    foldedInKanban: false,
    isDefault: false,
    sendEmailNotification: false,
    mappedStatus: 8,
  },
  {
    id: "stage_hired",
    nameAr: "تم التعيين الرسمي",
    nameEn: "Hired",
    sequence: 80,
    color: "#2e7d32",
    foldedInKanban: true,
    isDefault: false,
    sendEmailNotification: true,
    mappedStatus: 12,
  },
];

export const DEFAULT_REASONS: RejectionReasonConfig[] = [
  {
    id: "rr_salary",
    reasonAr: "الراتب المتوقع أعلى من الميزانية المحددة للوظيفة",
    reasonEn: "Expected salary exceeds budgeted compensation range",
    category: "salary",
    sendAutoEmail: true,
    emailSubjectAr: "تحديث بخصوص طلب التوظيف",
    emailSubjectEn: "Update regarding your job application",
    emailBodyAr: "نشكرك على اهتمامك ووقتك، نظراً لأن الراتب المطلوب يتجاوز الموازنة المحددة للشاغر حالياً، نتمنى لك التوفيق في فرص قادمة.",
    emailBodyEn: "Thank you for your interest and time. As the expected salary exceeds our budgeted range, we wish you the best in your career pursuits.",
  },
  {
    id: "rr_tech_fail",
    reasonAr: "عدم اجتياز التقييم الفني أو العملي",
    reasonEn: "Did not pass technical assessment or practical evaluation",
    category: "qualifications",
    sendAutoEmail: true,
    emailSubjectAr: "نتيجة التقييم الفني",
    emailSubjectEn: "Technical Assessment Feedback",
    emailBodyAr: "نقدر مجهودك في الاختبار الفني، ولكن تم اختيار مرشحين ذوي توافق أعلى مع متطلبات المشروع الحالية.",
    emailBodyEn: "We appreciate your effort in the technical assessment; however, we are proceeding with candidates whose skills more closely align with current needs.",
  },
  {
    id: "rr_insufficient_exp",
    reasonAr: "عدم تطابق سنوات الخبرة أو المؤهلات التخصصية المطلوبة",
    reasonEn: "Insufficient years of relevant experience or required qualifications",
    category: "qualifications",
    sendAutoEmail: true,
    emailSubjectAr: "تحديث بخصوص طلب التوظيف",
    emailSubjectEn: "Application Update",
    emailBodyAr: "شكراً لتقديمك، تم حفظ سيرتك الذاتية في قاعدة بياناتنا للتواصل معك في شواغر مستقبلية أكثر توافقاً.",
    emailBodyEn: "Thank you for applying. We have retained your profile in our talent pool for future openings that match your background.",
  },
  {
    id: "rr_no_show",
    reasonAr: "عدم حضور المقابلة المحددة بدون اعتذار مسبق",
    reasonEn: "Candidate did not attend scheduled interview without prior notice",
    category: "other",
    sendAutoEmail: false,
  },
  {
    id: "rr_withdrew",
    reasonAr: "اعتذار المرشح لظروف شخصية أو قبوله عرضاً آخر",
    reasonEn: "Candidate withdrew application or accepted another offer",
    category: "candidate_withdrew",
    sendAutoEmail: false,
  },
  {
    id: "rr_culture_fit",
    reasonAr: "عدم التوافق مع قيم وثقافة بيئة العمل",
    reasonEn: "Culture and behavioral alignment mismatch",
    category: "behavioral",
    sendAutoEmail: true,
    emailSubjectAr: "تحديث بخصوص طلب التوظيف",
    emailSubjectEn: "Update on your application",
    emailBodyAr: "نشكرك على لقائنا ومشاركتنا خبراتك ونتمنى لك خالص التوفيق والنجاح المهني.",
    emailBodyEn: "Thank you for meeting with us and sharing your journey. We wish you every success in your future endeavors.",
  },
];

export const DEFAULT_SOURCES: RecruitmentSourceConfig[] = [
  {
    id: "src_linkedin",
    nameAr: "لينكد إن",
    nameEn: "LinkedIn",
    type: "social",
    isActive: true,
    applicationsCount: 54,
    hiredCount: 7,
  },
  {
    id: "src_portal",
    nameAr: "بوابة التوظيف الرسمية",
    nameEn: "Company Careers Portal",
    type: "portal",
    isActive: true,
    applicationsCount: 96,
    hiredCount: 15,
  },
  {
    id: "src_referral",
    nameAr: "ترشيح من موظف داخلي",
    nameEn: "Employee Referral",
    type: "referral",
    isActive: true,
    applicationsCount: 22,
    hiredCount: 6,
  },
  {
    id: "src_wuzzuf",
    nameAr: "منصات التوظيف (Wuzzuf / Bayt)",
    nameEn: "Recruitment Platforms (Wuzzuf / Bayt)",
    type: "portal",
    isActive: true,
    applicationsCount: 68,
    hiredCount: 9,
  },
  {
    id: "src_agency",
    nameAr: "وكالات ومكاتب التوظيف الخارجية",
    nameEn: "Recruitment Agencies & Headhunters",
    type: "agency",
    isActive: true,
    applicationsCount: 14,
    hiredCount: 4,
  },
  {
    id: "src_fairs",
    nameAr: "معارض التوظيف والجامعات",
    nameEn: "Job Fairs & Universities",
    type: "fair",
    isActive: false,
    applicationsCount: 28,
    hiredCount: 2,
  },
];

export const DEFAULT_CRITERIA: EvaluationCriterionConfig[] = [
  {
    id: "crit_tech",
    titleAr: "الكفاءة والخبرة الفنية التخصصية",
    titleEn: "Technical Competence & Core Expertise",
    descriptionAr: "عمق المعرفة بالأدوات والتقنيات والمشروعات السابقة وجودة الكود/المخرجات",
    descriptionEn: "Depth of knowledge in tools, technologies, architecture, and work deliverables",
    category: "technical",
    maxScore: 5,
    weight: 30,
    isMandatory: true,
  },
  {
    id: "crit_comm",
    titleAr: "مهارات التواصل والعرض والتعبير",
    titleEn: "Communication & Presentation Skills",
    descriptionAr: "القدرة على إيصال الأفكار المعقدة بسلاسة والإنصات والتعبير الواضح",
    descriptionEn: "Ability to articulate complex ideas, active listening, and clarity",
    category: "communication",
    maxScore: 5,
    weight: 20,
    isMandatory: true,
  },
  {
    id: "crit_problem_solving",
    titleAr: "حل المشكلات والتفكير التحليلي",
    titleEn: "Problem Solving & Analytical Thinking",
    descriptionAr: "كيفية التعامل مع التحديات غير المتوقعة والابتكار والبحث عن حلول جذرية",
    descriptionEn: "Handling unexpected bottlenecks, structured root-cause analysis, and innovation",
    category: "problem_solving",
    maxScore: 5,
    weight: 25,
    isMandatory: true,
  },
  {
    id: "crit_culture",
    titleAr: "التوافق مع ثقافة وقيم الشركة",
    titleEn: "Culture & Values Alignment",
    descriptionAr: "النزاهة، الشغف، الرغبة في التطور المستمر، والتكيف مع بيئة العمل",
    descriptionEn: "Integrity, adaptability, passion for learning, and collaborative mindset",
    category: "culture",
    maxScore: 5,
    weight: 15,
    isMandatory: true,
  },
  {
    id: "crit_leadership",
    titleAr: "العمل الجماعي والروح القيادية",
    titleEn: "Teamwork & Leadership Qualities",
    descriptionAr: "المبادرة، دعم الزملاء، وتوجيه الكفاءات الشابة",
    descriptionEn: "Initiative, mentoring peers, and driving collective team success",
    category: "leadership",
    maxScore: 5,
    weight: 10,
    isMandatory: false,
  },
];

export const DEFAULT_GENERAL_SETTINGS: RecruitmentGeneralSettings = {
  defaultCurrency: "EGP",
  offerExpiryDays: 7,
  autoPublishOpening: true,
  enforceHeadcountCapacity: true,
  defaultProbationMonths: 3,
  enablePublicPortal: true,
  inboundEmailAlias: "careers@company.com",
};

// --- Storage Helper Functions ---
const inMemoryStore = new Map<string, string>();

function getStored<T>(key: string, fallback: T): T {
  try {
    if (typeof window !== "undefined" && window.localStorage) {
      const raw = localStorage.getItem(key);
      if (!raw) return fallback;
      return JSON.parse(raw) as T;
    }
    const mem = inMemoryStore.get(key);
    if (!mem) return fallback;
    return JSON.parse(mem) as T;
  } catch {
    return fallback;
  }
}

function setStored<T>(key: string, value: T): void {
  try {
    if (typeof window !== "undefined" && window.localStorage) {
      localStorage.setItem(key, JSON.stringify(value));
    } else {
      inMemoryStore.set(key, JSON.stringify(value));
    }
  } catch (e) {
    console.error(`Failed to save key ${key}`, e);
  }
}

export const recruitmentSettingsService = {
  // Stages
  getStages: (): RecruitmentStageConfig[] => getStored(STORAGE_KEYS.STAGES, DEFAULT_STAGES),
  saveStages: (stages: RecruitmentStageConfig[]): void => setStored(STORAGE_KEYS.STAGES, stages),

  // Reasons
  getRejectionReasons: (): RejectionReasonConfig[] => getStored(STORAGE_KEYS.REASONS, DEFAULT_REASONS),
  saveRejectionReasons: (reasons: RejectionReasonConfig[]): void => setStored(STORAGE_KEYS.REASONS, reasons),

  // Sources
  getSources: (): RecruitmentSourceConfig[] => getStored(STORAGE_KEYS.SOURCES, DEFAULT_SOURCES),
  saveSources: (sources: RecruitmentSourceConfig[]): void => setStored(STORAGE_KEYS.SOURCES, sources),

  // Criteria
  getCriteria: (): EvaluationCriterionConfig[] => getStored(STORAGE_KEYS.CRITERIA, DEFAULT_CRITERIA),
  saveCriteria: (criteria: EvaluationCriterionConfig[]): void => setStored(STORAGE_KEYS.CRITERIA, criteria),

  // General Settings
  getGeneralSettings: (): RecruitmentGeneralSettings => getStored(STORAGE_KEYS.GENERAL, DEFAULT_GENERAL_SETTINGS),
  saveGeneralSettings: (settings: RecruitmentGeneralSettings): void => setStored(STORAGE_KEYS.GENERAL, settings),

  // Reset to Factory Defaults
  resetAll: (): void => {
    inMemoryStore.clear();
    if (typeof window !== "undefined" && window.localStorage) {
      localStorage.removeItem(STORAGE_KEYS.STAGES);
      localStorage.removeItem(STORAGE_KEYS.REASONS);
      localStorage.removeItem(STORAGE_KEYS.SOURCES);
      localStorage.removeItem(STORAGE_KEYS.CRITERIA);
      localStorage.removeItem(STORAGE_KEYS.GENERAL);
    }
  },
};
