namespace HrManagementSystem.Application.Abstractions.Persistence;

public interface ICategoryValidationQueries
{
    Task<bool> CategoryNameArExistsAsync(string name, int? excludedId, CancellationToken cancellationToken);
    Task<bool> CategoryNameEnExistsAsync(string name, int? excludedId, CancellationToken cancellationToken);
    Task<int> CountActiveCategoriesAsync(IReadOnlyCollection<int> ids, CancellationToken cancellationToken);
}

public interface ISubCategoryValidationQueries
{
    Task<bool> SubCategoryNameArExistsAsync(string name, int? excludedId, CancellationToken cancellationToken);
    Task<bool> SubCategoryNameEnExistsAsync(string name, int? excludedId, CancellationToken cancellationToken);
}

public interface IReportValidationQueries
{
    Task<bool> ReportCategoryNameExistsAsync(string name, int? excludedId, CancellationToken cancellationToken);
    Task<bool> ReportDetailPropertyNameExistsAsync(
        string propertyName,
        int reportMasterId,
        int? excludedId,
        CancellationToken cancellationToken);
    Task<bool> ReportDetailColumnNameExistsAsync(
        string columnName,
        int reportMasterId,
        int? excludedId,
        CancellationToken cancellationToken);
}

public interface ICountryValidationQueries
{
    Task<bool> CountryNameEnExistsAsync(string name, int? excludedId, CancellationToken cancellationToken);
    Task<bool> CountryNameArExistsAsync(string name, int? excludedId, CancellationToken cancellationToken);
    Task<bool> CountryAlpha2CodeExistsAsync(string code, int? excludedId, CancellationToken cancellationToken);
    Task<bool> CountryAlpha3CodeExistsAsync(string code, int? excludedId, CancellationToken cancellationToken);
    Task<bool> CountryExistsAsync(int id, CancellationToken cancellationToken);
}

public interface IStateValidationQueries
{
    Task<bool> StateNameEnExistsAsync(string name, int countryId, int? excludedId, CancellationToken cancellationToken);
    Task<bool> StateNameArExistsAsync(string name, int countryId, int? excludedId, CancellationToken cancellationToken);
    Task<bool> StateCodeExistsAsync(string code, int countryId, int? excludedId, CancellationToken cancellationToken);
    Task<bool> StateExistsAsync(int id, CancellationToken cancellationToken);
}

public interface IDistrictValidationQueries
{
    Task<bool> DistrictNameEnExistsAsync(string name, int stateId, int? excludedId, CancellationToken cancellationToken);
    Task<bool> DistrictNameArExistsAsync(string name, int stateId, int? excludedId, CancellationToken cancellationToken);
    Task<bool> DistrictCodeExistsAsync(string code, int stateId, int? excludedId, CancellationToken cancellationToken);
    Task<bool> DistrictExistsAsync(int id, CancellationToken cancellationToken);
}

public interface IAddressTypeValidationQueries
{
    Task<bool> AddressTypeNameEnExistsAsync(string name, int? excludedId, CancellationToken cancellationToken);
    Task<bool> AddressTypeNameArExistsAsync(string name, int? excludedId, CancellationToken cancellationToken);
    Task<bool> AddressTypeExistsAsync(int id, CancellationToken cancellationToken);
}

public interface IUserValidationQueries
{
    Task<bool> UserNameExistsAsync(
        string userName,
        string? excludedUserId,
        CancellationToken cancellationToken);
}

public interface IRoleValidationQueries
{
    Task<bool> RoleNameExistsAsync(
        string roleName,
        string? excludedRoleId,
        CancellationToken cancellationToken);
}
