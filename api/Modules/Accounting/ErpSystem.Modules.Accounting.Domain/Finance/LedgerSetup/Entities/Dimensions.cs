using ErpSystem.Modules.Accounting.Domain.Finance.LedgerSetup.Enums;
using static ErpSystem.BuildingBlocks.Domain.Guards.DomainGuard;

namespace ErpSystem.Modules.Accounting.Domain.Finance.LedgerSetup.Entities;

public sealed class DimensionDefinition : CompanyAuditableEntity
{
    private DimensionDefinition()
    {
    }

    public DimensionDefinition(
        string code,
        string nameAr,
        string nameEn,
        DimensionValueSourceKind valueSource)
    {
        Update(code, nameAr, nameEn, valueSource);
    }

    public int Id { get; private set; }
    public string Code { get; private set; } = string.Empty;
    public string NameAr { get; private set; } = string.Empty;
    public string NameEn { get; private set; } = string.Empty;
    public DimensionValueSourceKind ValueSource { get; private set; }

    public void Update(
        string code,
        string nameAr,
        string nameEn,
        DimensionValueSourceKind valueSource)
    {
        Code = Required(code, nameof(code)).ToUpperInvariant();
        NameAr = Required(nameAr, nameof(nameAr));
        NameEn = Required(nameEn, nameof(nameEn));
        ValueSource = Defined(valueSource, nameof(valueSource));
    }
}

public sealed class DimensionValue : CompanyAuditableEntity
{
    private DimensionValue()
    {
    }

    public DimensionValue(
        int dimensionDefinitionId,
        string code,
        string nameAr,
        string nameEn)
    {
        DimensionDefinitionId = Positive(dimensionDefinitionId, nameof(dimensionDefinitionId));
        Update(code, nameAr, nameEn);
    }

    public int Id { get; private set; }
    public int DimensionDefinitionId { get; private set; }
    public DimensionDefinition DimensionDefinition { get; private set; } = null!;
    public string Code { get; private set; } = string.Empty;
    public string NameAr { get; private set; } = string.Empty;
    public string NameEn { get; private set; } = string.Empty;

    public void Update(string code, string nameAr, string nameEn)
    {
        Code = Required(code, nameof(code)).ToUpperInvariant();
        NameAr = Required(nameAr, nameof(nameAr));
        NameEn = Required(nameEn, nameof(nameEn));
    }
}

public sealed class AccountDimensionPolicy : CompanyAuditableEntity
{
    private AccountDimensionPolicy()
    {
    }

    public AccountDimensionPolicy(
        int accountId,
        int dimensionDefinitionId,
        DimensionRequirementPolicy requirement)
    {
        AccountId = Positive(accountId, nameof(accountId));
        DimensionDefinitionId = Positive(dimensionDefinitionId, nameof(dimensionDefinitionId));
        Requirement = Defined(requirement, nameof(requirement));
    }

    public int Id { get; private set; }
    public int AccountId { get; private set; }
    public Account Account { get; private set; } = null!;
    public int DimensionDefinitionId { get; private set; }
    public DimensionDefinition DimensionDefinition { get; private set; } = null!;
    public DimensionRequirementPolicy Requirement { get; private set; }

    public void ChangeRequirement(DimensionRequirementPolicy requirement) =>
        Requirement = Defined(requirement, nameof(requirement));
}
