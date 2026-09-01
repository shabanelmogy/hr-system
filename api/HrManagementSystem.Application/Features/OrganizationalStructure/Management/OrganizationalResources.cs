namespace HrManagementSystem.Application.Features.OrganizationalStructure.Management;

public static class OrganizationalResources
{
    public const string Branches = "branches";
    public const string Departments = "departments";
    public const string Divisions = "divisions";
    public const string JobTitles = "job-titles";
    public const string JobLevels = "job-levels";
    public const string Positions = "positions";
    public const string JobDescriptions = "job-descriptions";

    public static readonly string[] All =
    [
        Branches, Departments, Divisions, JobTitles, JobLevels, Positions, JobDescriptions
    ];

    public static bool IsSupported(string? resource) =>
        resource is not null && All.Contains(resource, StringComparer.OrdinalIgnoreCase);

    public static string Normalize(string resource) => resource.Trim().ToLowerInvariant();
}
