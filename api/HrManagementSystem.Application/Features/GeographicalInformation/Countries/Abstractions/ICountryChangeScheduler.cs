using HrManagementSystem.Application.Features.GeographicalInformation.Countries.Contracts;

namespace HrManagementSystem.Application.Features.GeographicalInformation.Countries.Abstractions;

public interface ICountryChangeScheduler
{
    void Schedule(CountryChange change);
}

public sealed record CountryChange(
    CountryDetailResponse? Country,
    string Action,
    int? BulkCount,
    string? ActorUserId,
    Guid OperationId);
