namespace ErpSystem.Modules.ReferenceData.Application.Validation;

internal static class ValidationPatterns
{
    public const string IsoAlpha2Code = "^[A-Za-z]{2}$";
    public const string IsoAlpha3Code = "^[A-Za-z]{3}$";
    public const string InternationalPhoneCode = "^\\+?\\d{1,10}$";
    public const string CurrencyCode = "^[A-Za-z]{3}$";
    public const string StateCode = "^[A-Za-z0-9-]{2,10}$";
}
