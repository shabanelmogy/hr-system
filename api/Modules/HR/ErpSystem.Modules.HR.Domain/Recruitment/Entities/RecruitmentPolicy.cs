using ErpSystem.BuildingBlocks.Domain.Entities;
using static ErpSystem.BuildingBlocks.Domain.Guards.DomainGuard;

namespace ErpSystem.Modules.HR.Domain.Recruitment.Entities;

public sealed class RecruitmentPolicy : TenantAuditableEntity
{
    private RecruitmentPolicy()
    {
    }

    public RecruitmentPolicy(
        string defaultCurrency,
        int offerExpiryDays,
        bool autoPublishOpening,
        bool enforceHeadcountCapacity,
        int defaultProbationMonths,
        bool enablePublicPortal,
        string inboundEmailAlias)
    {
        DefaultCurrency = NormalizeCurrencyCode(defaultCurrency, nameof(defaultCurrency));
        OfferExpiryDays = offerExpiryDays;
        AutoPublishOpening = autoPublishOpening;
        EnforceHeadcountCapacity = enforceHeadcountCapacity;
        DefaultProbationMonths = defaultProbationMonths;
        EnablePublicPortal = enablePublicPortal;
        InboundEmailAlias = inboundEmailAlias;
    }

    public int Id { get; private set; }
    public string DefaultCurrency { get; private set; } = "EGP";
    public int OfferExpiryDays { get; private set; } = 7;
    public bool AutoPublishOpening { get; private set; } = true;
    public bool EnforceHeadcountCapacity { get; private set; } = true;
    public int DefaultProbationMonths { get; private set; } = 3;
    public bool EnablePublicPortal { get; private set; } = true;
    public string InboundEmailAlias { get; private set; } = "careers@company.com";

    public void Update(
        string defaultCurrency,
        int offerExpiryDays,
        bool autoPublishOpening,
        bool enforceHeadcountCapacity,
        int defaultProbationMonths,
        bool enablePublicPortal,
        string inboundEmailAlias)
    {
        DefaultCurrency = NormalizeCurrencyCode(defaultCurrency, nameof(defaultCurrency));
        OfferExpiryDays = offerExpiryDays;
        AutoPublishOpening = autoPublishOpening;
        EnforceHeadcountCapacity = enforceHeadcountCapacity;
        DefaultProbationMonths = defaultProbationMonths;
        EnablePublicPortal = enablePublicPortal;
        InboundEmailAlias = inboundEmailAlias;
    }
}
