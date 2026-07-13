using EFCore.BulkExtensions;
using HrManagementSystem.Features.GeographicalInformation.Countries.Contracts;
using HrManagementSystem.Features.GeographicalInformation.Countries.Entities;
using HrManagementSystem.Features.GeographicalInformation.Countries.Errors;
using HrManagementSystem.Infrastructure.Hubs.GeneralHub;
using HrManagementSystem.Features.Platform.Notifications.Contracts;
using HrManagementSystem.Features.Platform.Notifications.Entities;
using HrManagementSystem.Features.Platform.Notifications.Services;

namespace HrManagementSystem.Features.GeographicalInformation.Countries.Services;

public class CountryService(
    ApplicationDbContext context,
    IHttpContextAccessor httpContextAccessor,
    IEntityChangeLogService entityChangeLogService,
    CountryErrors countryErrors,
    IHubContext<GeneralHub, IGeneralHubClient> generalHubContext,
    INotificationPublisher notificationPublisher,
    ILogger<CountryService> logger,
    IMapper mapper) : ICountryService
{
    private readonly ApplicationDbContext _context = context;
    private readonly IMapper _mapper = mapper;
    private readonly IHttpContextAccessor _httpContextAccessor = httpContextAccessor;
    private readonly IEntityChangeLogService _entityChangeLogService = entityChangeLogService;
    private readonly CountryErrors _countryErrors = countryErrors;
    private readonly IHubContext<GeneralHub, IGeneralHubClient> _generalHubContext = generalHubContext;
    private readonly INotificationPublisher _notificationPublisher = notificationPublisher;
    private readonly ILogger<CountryService> _logger = logger;

    public async Task<IEnumerable<CountryResponse>> GetAllAsync(CancellationToken cancellationToken = default)
    {
        var countries = await _context.Countries
            .AsNoTracking()
            .Where(country => !country.IsDeleted)
            .ProjectToType<CountryResponse>()
            .ToListAsync(cancellationToken);
            
        return countries;
    }

    public async Task<Result<CountryResponse>> GetAsync(int id, CancellationToken cancellationToken = default)
    {
        var response = await _context.Countries
            .AsNoTracking()
            .FirstOrDefaultAsync(country => country.Id == id && !country.IsDeleted, cancellationToken);

        return response is not null
        ? Result.Success(_mapper.Map<CountryResponse>(response))
            : Result.Failure<CountryResponse>(_countryErrors.CountryNotFound);
    }

    public async Task<Result<CountryResponse>> GetRelatedStates(int id, CancellationToken cancellationToken = default)
    {
        var response = await _context.Countries
            .AsNoTracking()
            .Include(c => c.States.Where(state => !state.IsDeleted))
            .FirstOrDefaultAsync(c => c.Id == id && !c.IsDeleted, cancellationToken);

        return response is null
             ? Result.Failure<CountryResponse>(_countryErrors.CountryNotFound)
             : Result.Success(_mapper.Map<CountryResponse>(response));
    }

    public async Task<Result<CountryResponse>> AddAsync(CountryRequest countryRequest, CancellationToken cancellationToken = default)
    {
        if (countryRequest.Id.GetValueOrDefault() != 0)
            return Result.Failure<CountryResponse>(_countryErrors.InvalidCountryId);

        countryRequest = Normalize(countryRequest);
        var newCountry = _mapper.Map<Country>(countryRequest);

        await _context.AddAsync(newCountry, cancellationToken);
        await _context.SaveChangesAsync(cancellationToken);

        var response = _mapper.Map<CountryResponse>(newCountry);

        await PublishCountryUpdateAsync(response, "Add", cancellationToken);

        return Result.Success(response);
    }

    public async Task<Result> AddRangeAsync(List<CountryRequest> countryRequests, CancellationToken cancellationToken = default)
    {
        if (countryRequests == null || countryRequests.Count == 0)
            return Result.Failure(_countryErrors.NoCountriesProvided);

        if (countryRequests.Any(country => country.Id.GetValueOrDefault() != 0))
            return Result.Failure(_countryErrors.InvalidCountryId);

        countryRequests = countryRequests.Select(Normalize).ToList();

        if (HasDuplicates(countryRequests.Select(country => country.NameAr)) ||
            HasDuplicates(countryRequests.Select(country => country.NameEn)) ||
            HasDuplicates(countryRequests.Select(country => country.Alpha2Code)) ||
            HasDuplicates(countryRequests.Select(country => country.Alpha3Code)))
            return Result.Failure(_countryErrors.CountryExists);

        var nameArValues = countryRequests.Select(country => country.NameAr).ToList();
        var nameEnValues = countryRequests.Select(country => country.NameEn).ToList();
        var alpha2CodeValues = countryRequests
            .Select(country => country.Alpha2Code)
            .Where(code => !string.IsNullOrWhiteSpace(code))
            .ToList();
        var alpha3CodeValues = countryRequests
            .Select(country => country.Alpha3Code)
            .Where(code => !string.IsNullOrWhiteSpace(code))
            .ToList();

        var countryExists = await _context.Countries.AnyAsync(
            country =>
                nameArValues.Contains(country.NameAr) ||
                nameEnValues.Contains(country.NameEn) ||
                country.Alpha2Code != null && alpha2CodeValues.Contains(country.Alpha2Code) ||
                country.Alpha3Code != null && alpha3CodeValues.Contains(country.Alpha3Code),
            cancellationToken);

        if (countryExists)
            return Result.Failure(_countryErrors.CountryExists);

        var currentUserId = _httpContextAccessor.HttpContext?.User.GetUserId();
        var newCountries = countryRequests
            .Select(countryRequest =>
            {
                var newCountry = _mapper.Map<Country>(countryRequest);
                newCountry.CreatedById = currentUserId ?? string.Empty;
                return newCountry;
            })
            .ToList();

        await _context.BulkInsertAsync(newCountries, cancellationToken: cancellationToken);
        await PublishCountryUpdateAsync(null, "BulkAdd", cancellationToken, countryRequests.Count);

        return Result.Success();
    }

    public async Task<Result<CountryResponse>> UpdateAsync(CountryRequest countryRequest, CancellationToken cancellationToken = default)
    {
        if (!countryRequest.Id.HasValue || countryRequest.Id.Value <= 0)
            return Result.Failure<CountryResponse>(_countryErrors.InvalidCountryId);

        var countryId = countryRequest.Id.Value;
        countryRequest = Normalize(countryRequest);
        var currentCountry = await _context.Countries
            .FirstOrDefaultAsync(c => c.Id == countryId && !c.IsDeleted, cancellationToken);

        if (currentCountry is null)
            return Result.Failure<CountryResponse>(_countryErrors.CountryNotFound);

        var updatedCountry = _mapper.Map<Country>(countryRequest);
        await _entityChangeLogService.CreateChangeLogAsync(countryId, currentCountry, updatedCountry);

        _mapper.Map(countryRequest, currentCountry);
        _context.Update(currentCountry);
        await _context.SaveChangesAsync(cancellationToken);

        var response = _mapper.Map<CountryResponse>(currentCountry);

        await PublishCountryUpdateAsync(response, "Update", cancellationToken);

        return Result.Success(response);
    }

    public async Task<Result> ToggleDeleteAsync(int id, CancellationToken cancellationToken = default)
    {
        var country = await _context.Countries.FirstOrDefaultAsync(c => c.Id == id, cancellationToken);

        if (country is null)
            return Result.Failure(_countryErrors.CountryNotFound);

        var isInState = !country.IsDeleted && await _context.States.AnyAsync(s => s.CountryId == id && !s.IsDeleted, cancellationToken);
        if (isInState)
            return Result.Failure(_countryErrors.CountryInUseByState);

        country.IsDeleted = !country.IsDeleted;
        var action = country.IsDeleted ? "Delete" : "Restore";
        country.DeletedById = country.IsDeleted ? _httpContextAccessor.HttpContext?.User.GetUserId() : null;
        country.DeletedByPc = country.IsDeleted ? Environment.MachineName : null;
        country.DeletedOn = country.IsDeleted ? DateTime.UtcNow : null;

        await _context.SaveChangesAsync(cancellationToken);
        await PublishCountryUpdateAsync(_mapper.Map<CountryResponse>(country), action, cancellationToken);

        return Result.Success();
    }

    public async Task<Result<CountriesCountResponse>> GetCountAsync(CancellationToken cancellationToken = default)
    {
        var count = await _context.Countries
                          .Where(c => !c.IsDeleted)
                          .CountAsync(cancellationToken: cancellationToken);

        var response = new CountriesCountResponse(count,null,null);

        return Result.Success(response);
    }

    private static bool HasDuplicates(IEnumerable<string?> values)
    {
        return values
            .Where(value => !string.IsNullOrWhiteSpace(value))
            .GroupBy(value => value!.Trim(), StringComparer.OrdinalIgnoreCase)
            .Any(group => group.Count() > 1);
    }

    private static CountryRequest Normalize(CountryRequest request)
    {
        return request with
        {
            NameAr = request.NameAr?.Trim() ?? string.Empty,
            NameEn = request.NameEn?.Trim() ?? string.Empty,
            Alpha2Code = NormalizeUpper(request.Alpha2Code),
            Alpha3Code = NormalizeUpper(request.Alpha3Code),
            PhoneCode = NormalizeOptional(request.PhoneCode),
            CurrencyCode = NormalizeUpper(request.CurrencyCode)
        };
    }

    private static string? NormalizeUpper(string? value)
    {
        return string.IsNullOrWhiteSpace(value)
            ? null
            : value.Trim().ToUpperInvariant();
    }

    private static string? NormalizeOptional(string? value)
    {
        return string.IsNullOrWhiteSpace(value)
            ? null
            : value.Trim();
    }

    private async Task PublishCountryUpdateAsync(
        CountryResponse? country,
        string action,
        CancellationToken cancellationToken,
        int? bulkCount = null)
    {
        await PublishDurableNotificationAsync(country, action, bulkCount, cancellationToken);

        var countriesCount = await GetCountAsync(cancellationToken);
        await _generalHubContext.Clients.All.ReceiveCountryUpdate(
            new CountriesCountResponse(countriesCount.Value.Count, country, action));
    }

    private async Task PublishDurableNotificationAsync(
        CountryResponse? country,
        string action,
        int? bulkCount,
        CancellationToken cancellationToken)
    {
        var eventType = action switch
        {
            "Add" => "Countries.Created",
            "BulkAdd" => "Countries.BulkCreated",
            "Update" => "Countries.Updated",
            "Delete" => "Countries.Deleted",
            "Restore" => "Countries.Restored",
            _ => "Countries.Changed"
        };

        var messageKey = action switch
        {
            "Add" => "CountryCreatedNotificationMessage",
            "BulkAdd" => "CountriesCreatedNotificationMessage",
            "Update" => "CountryUpdatedNotificationMessage",
            "Delete" => "CountryDeletedNotificationMessage",
            "Restore" => "CountryRestoredNotificationMessage",
            _ => "CountryUpdatedNotificationMessage"
        };

        var parameters = country is null
            ? new Dictionary<string, string> { ["Count"] = (bulkCount ?? 0).ToString(CultureInfo.InvariantCulture) }
            : new Dictionary<string, string>
            {
                ["NameAr"] = country.NameAr,
                ["NameEn"] = country.NameEn
            };

        var httpContext = _httpContextAccessor.HttpContext;
        var operationId = httpContext?.Request.Headers["Idempotency-Key"].FirstOrDefault();
        operationId = string.IsNullOrWhiteSpace(operationId)
            ? httpContext?.TraceIdentifier ?? Guid.NewGuid().ToString("N")
            : operationId;

        try
        {
            var result = await _notificationPublisher.PublishToPermissionAsync(
                new NotificationPublishRequest(
                    Permissions.ViewCountries,
                    "GeographicalInformation",
                    eventType,
                    action == "Delete" ? NotificationSeverity.Warning : NotificationSeverity.Success,
                    "CountryNotificationTitle",
                    messageKey,
                    parameters,
                    nameof(Country),
                    country?.Id.ToString(CultureInfo.InvariantCulture),
                    "/basic-data/countries",
                    httpContext?.User.GetUserId(),
                    $"{eventType}:{country?.Id.ToString(CultureInfo.InvariantCulture) ?? "bulk"}:{operationId}"),
                cancellationToken);

            if (result.IsFailure)
            {
                _logger.LogWarning(
                    "Country event {EventType} was saved, but its notification failed with {ErrorCode}",
                    eventType,
                    result.Error.Code);
            }
        }
        catch (OperationCanceledException) when (cancellationToken.IsCancellationRequested)
        {
            throw;
        }
        catch (Exception exception)
        {
            _logger.LogError(
                exception,
                "Country event {EventType} was saved, but its notification could not be created",
                eventType);
        }
    }
}
