namespace ErpSystem.Modules.ReferenceData.Contracts.Authorization;

public static class ReferenceDataPermissions
{
    public const string ViewAddresses = "Addresses:View";
    public const string CreateAddresses = "Addresses:Create";
    public const string EditAddresses = "Addresses:Edit";
    public const string DeleteAddresses = "Addresses:Delete";

    public const string ViewAddressTypes = "AddressTypes:View";
    public const string CreateAddressTypes = "AddressTypes:Create";
    public const string EditAddressTypes = "AddressTypes:Edit";
    public const string DeleteAddressTypes = "AddressTypes:Delete";

    public const string ViewCountries = "Countries:View";
    public const string CreateCountries = "Countries:Create";
    public const string EditCountries = "Countries:Edit";
    public const string DeleteCountries = "Countries:Delete";

    public const string ViewStates = "States:View";
    public const string CreateStates = "States:Create";
    public const string EditStates = "States:Edit";
    public const string DeleteStates = "States:Delete";

    public const string ViewDistricts = "Districts:View";
    public const string CreateDistricts = "Districts:Create";
    public const string EditDistricts = "Districts:Edit";
    public const string DeleteDistricts = "Districts:Delete";

    public static IReadOnlyList<string> TenantReferenceData { get; } =
    [
        ViewAddresses, CreateAddresses, EditAddresses, DeleteAddresses,
        ViewAddressTypes, CreateAddressTypes, EditAddressTypes, DeleteAddressTypes
    ];

    public static IReadOnlyList<string> GlobalGeography { get; } =
    [
        ViewCountries, CreateCountries, EditCountries, DeleteCountries,
        ViewStates, CreateStates, EditStates, DeleteStates,
        ViewDistricts, CreateDistricts, EditDistricts, DeleteDistricts
    ];

    public static IReadOnlyList<string> All { get; } =
        TenantReferenceData.Concat(GlobalGeography).ToArray();
}