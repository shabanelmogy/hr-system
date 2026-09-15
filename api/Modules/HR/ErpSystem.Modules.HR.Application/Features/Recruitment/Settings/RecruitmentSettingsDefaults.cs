using ErpSystem.Modules.HR.Domain.Recruitment.Entities;

namespace ErpSystem.Modules.HR.Application.Features.Recruitment.Settings;

internal static class RecruitmentSettingsDefaults
{
    public static IReadOnlyList<RecruitmentStage> Stages() =>
    [
        new("stage_applied", "تم التقديم", "Applied", 10, "#1976d2", false, true, true, 2, "شكراً لتقديمك على وظيفتنا، سيتم فحص طلبك والتواصل معك قريباً."),
        new("stage_screening", "قيد الفرز الأولي", "Screening", 20, "#ed6c02", false, false, false, 3),
        new("stage_shortlist", "القائمة المختصرة", "Shortlisted", 30, "#9c27b0", false, false, true, 4, "يسعدنا إبلاغك بتأهلك للقائمة المختصرة وسيتم التنسيق للمقابلة قريباً."),
        new("stage_tech_interview", "المقابلة الفنية", "Technical Interview", 40, "#0288d1", false, false, true, 5),
        new("stage_hr_interview", "مقابلة الإدارة والموارد البشرية", "HR & Culture Fit", 50, "#5c6bc0", false, false, true, 6),
        new("stage_offer_issued", "تم إرسال العرض الوظيفي", "Offer Issued", 60, "#ff9800", false, false, true, 7),
        new("stage_offer_accepted", "تم قبول العرض", "Offer Accepted", 70, "#009688", false, false, false, 8),
        new("stage_hired", "تم التعيين الرسمي", "Hired", 80, "#2e7d32", true, false, true, 12)
    ];

    public static IReadOnlyList<RejectionReason> RejectionReasons() =>
    [
        new("rr_salary", "الراتب المتوقع أعلى من الميزانية المحددة للوظيفة", "Expected salary exceeds budgeted compensation range", "salary", true, "تحديث بخصوص طلب التوظيف", "Update regarding your application", "نشكرك على اهتمامك ووقتك، ونظراً لأن الراتب المطلوب يتجاوز الموازنة المحددة للشاغر حالياً، نتمنى لك التوفيق في فرص قادمة.", "Thank you for your interest and time. As expected salary exceeds our budget, we wish you the best."),
        new("rr_tech_fail", "عدم اجتياز التقييم الفني أو العملي", "Did not pass technical assessment or practical evaluation", "qualifications", true, "نتيجة التقييم الفني", "Technical Assessment Feedback", "نقدر مجهودك في الاختبار الفني، ولكن تم اختيار مرشحين ذوي توافق أعلى مع متطلبات المشروع الحالية.", "We appreciate your effort; however, we are proceeding with other candidates."),
        new("rr_insufficient_exp", "عدم تطابق سنوات الخبرة أو المؤهلات التخصصية المطلوبة", "Insufficient years of relevant experience or required qualifications", "qualifications", true, "تحديث بخصوص طلب التوظيف", "Application Update", "شكراً لتقديمك، تم حفظ سيرتك الذاتية في قاعدة بياناتنا للتواصل معك في شواغر مستقبلية أكثر توافقاً.", "Thank you for applying. We have retained your profile for future matching opportunities."),
        new("rr_no_show", "عدم حضور المقابلة المحددة بدون اعتذار مسبق", "Candidate did not attend scheduled interview without prior notice", "other", false),
        new("rr_withdrew", "اعتذار المرشح لظروف شخصية أو قبوله عرضاً آخر", "Candidate withdrew application or accepted another offer", "candidate_withdrew", false),
        new("rr_culture_fit", "عدم التوافق مع قيم وثقافة بيئة العمل", "Culture and behavioral alignment mismatch", "behavioral", true, "تحديث بخصوص طلب التوظيف", "Update on your application", "نشكرك على لقائنا ومشاركتنا خبراتك ونتمنى لك خالص التوفيق والنجاح المهني.", "Thank you for meeting with us. We wish you every success in your future endeavors.")
    ];

    public static IReadOnlyList<RecruitmentSource> Sources() =>
    [
        new("src_linkedin", "لينكد إن", "LinkedIn", "social", true, 54, 7),
        new("src_portal", "بوابة التوظيف الرسمية", "Company Careers Portal", "portal", true, 96, 15),
        new("src_referral", "ترشيح من موظف داخلي", "Employee Referral", "referral", true, 22, 6),
        new("src_wuzzuf", "منصات التوظيف (Wuzzuf / Bayt)", "Recruitment Platforms (Wuzzuf / Bayt)", "portal", true, 68, 9),
        new("src_agency", "وكالات ومكاتب التوظيف الخارجية", "Recruitment Agencies & Headhunters", "agency", true, 14, 4),
        new("src_fairs", "معارض التوظيف والجامعات", "Job Fairs & Universities", "fair", false, 28, 2)
    ];

    public static IReadOnlyList<EvaluationCriterion> EvaluationCriteria() =>
    [
        new("crit_tech", "الكفاءة والخبرة الفنية التخصصية", "Technical Competence & Core Expertise", "technical", 5, 30, true, "عمق المعرفة بالأدوات والتقنيات والمشروعات السابقة وجودة الكود/المخرجات", "Depth of knowledge in tools, technologies, and work deliverables"),
        new("crit_comm", "مهارات التواصل والعرض والتعبير", "Communication & Presentation Skills", "communication", 5, 20, true, "القدرة على إيصال الأفكار المعقدة بسلاسة والإنصات والتعبير الواضح", "Ability to articulate complex ideas, active listening, and clarity"),
        new("crit_problem_solving", "حل المشكلات والتفكير التحليلي", "Problem Solving & Analytical Thinking", "problem_solving", 5, 25, true, "كيفية التعامل مع التحديات غير المتوقعة والابتكار والبحث عن حلول جذرية", "Handling unexpected bottlenecks, structured root-cause analysis, and innovation"),
        new("crit_culture", "التوافق مع ثقافة وقيم الشركة", "Culture & Values Alignment", "culture", 5, 15, true, "النزاهة، الشغف، الرغبة في التطور المستمر، والتكيف مع بيئة العمل", "Integrity, adaptability, passion for learning, and collaborative mindset"),
        new("crit_leadership", "العمل الجماعي والروح القيادية", "Teamwork & Leadership Qualities", "leadership", 5, 10, false, "المبادرة، دعم الزملاء، وتوجيه الكفاءات الشابة", "Initiative, mentoring peers, and driving collective team success")
    ];

    public static RecruitmentPolicy Policy() =>
        new("EGP", 7, true, true, 3, true, "careers@company.com");
}
