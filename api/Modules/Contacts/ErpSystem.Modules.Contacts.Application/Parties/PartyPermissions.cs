namespace ErpSystem.Modules.Contacts.Application.Parties;

/// <summary>Permission identifiers used by Contacts endpoints and the module catalog.</summary>
public static class PartyPermissions
{
    public const string View = "ContactsParties:View";
    public const string Create = "ContactsParties:Create";
    public const string Edit = "ContactsParties:Edit";

    public static IReadOnlyList<string> All { get; } = [View, Create, Edit];
}
