namespace ErpSystem.Modules.CRM.Contracts.Authorization;

public static class CrmPermissions
{
    public const string ViewAppointments = "Appointments:View";
    public const string CreateAppointments = "Appointments:Create";
    public const string EditAppointments = "Appointments:Edit";
    public const string DeleteAppointments = "Appointments:Delete";

    public static IReadOnlyList<string> Appointments { get; } =
    [
        ViewAppointments,
        CreateAppointments,
        EditAppointments,
        DeleteAppointments
    ];

    public static IReadOnlyList<string> All => Appointments;
}
