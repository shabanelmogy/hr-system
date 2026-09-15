namespace ErpSystem.Modules.Accounting.Infrastructure.Parties;

public sealed class AccountingPartyReference
{
    private AccountingPartyReference()
    {
    }

    internal AccountingPartyReference(
        Guid partyId,
        string tenantId,
        int companyId,
        string displayName,
        string? email,
        string? phone,
        Guid sourceEventId,
        DateTimeOffset sourceOccurredOnUtc,
        long sourceRevision)
    {
        PartyId = partyId;
        TenantId = tenantId;
        CompanyId = companyId;
        Apply(displayName, email, phone, sourceEventId, sourceOccurredOnUtc, sourceRevision);
    }

    public Guid PartyId { get; private set; }
    public string TenantId { get; private set; } = string.Empty;
    public int CompanyId { get; private set; }
    public string DisplayName { get; private set; } = string.Empty;
    public string? Email { get; private set; }
    public string? Phone { get; private set; }
    public Guid SourceEventId { get; private set; }
    public DateTimeOffset SourceOccurredOnUtc { get; private set; }
    public long SourceRevision { get; private set; }
    public byte[] RowVersion { get; private set; } = [];

    internal void Apply(
        string displayName,
        string? email,
        string? phone,
        Guid sourceEventId,
        DateTimeOffset sourceOccurredOnUtc,
        long sourceRevision)
    {
        DisplayName = displayName;
        Email = email;
        Phone = phone;
        SourceEventId = sourceEventId;
        SourceOccurredOnUtc = sourceOccurredOnUtc;
        SourceRevision = sourceRevision;
    }
}
