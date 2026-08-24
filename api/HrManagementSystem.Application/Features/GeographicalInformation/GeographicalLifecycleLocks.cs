namespace HrManagementSystem.Application.Features.GeographicalInformation;

public static class GeographicalLifecycleLocks
{
    public static string Country(int countryId) =>
        $"GeographicalInformation:Country:{countryId}";

    public static string State(int stateId) =>
        $"GeographicalInformation:State:{stateId}";
}
