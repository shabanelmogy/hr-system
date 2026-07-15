using EFCore.BulkExtensions;
using HrManagementSystem.Features.GeographicalInformation.Countries.Contracts;
using HrManagementSystem.Features.GeographicalInformation.Countries.Entities;
using HrManagementSystem.Features.GeographicalInformation.Countries.Errors;
using HrManagementSystem.Features.GeographicalInformation.Countries.Jobs;

using HrManagementSystem.Features.Platform.EntityChangeLogs.Services;

namespace HrManagementSystem.Features.GeographicalInformation.Countries.Services;

public class CountryService(
    ApplicationDbContext context,
    IHttpContextAccessor httpContextAccessor,
    IEntityChangeLogService entityChangeLogService,
    CountryErrors countryErrors,
    IMapper mapper) : ICountryService
{
    private readonly ApplicationDbContext _context = context;
    private readonly IMapper _mapper = mapper;
    private readonly IHttpContextAccessor _httpContextAccessor = httpContextAccessor;
    private readonly IEntityChangeLogService _entityChangeLogService = entityChangeLogService;
    private readonly CountryErrors _countryErrors = countryErrors;

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

        QueueCountryChanged(response, "Add");

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
        QueueCountryChanged(null, "BulkAdd", countryRequests.Count);

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

        QueueCountryChanged(response, "Update");

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
        QueueCountryChanged(_mapper.Map<CountryResponse>(country), action);

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

    private void QueueCountryChanged(
        CountryResponse? country,
        string action,
        int? bulkCount = null)
    {
        var request = new CountryChangedJobRequest(
            country,
            action,
            bulkCount,
            _httpContextAccessor.HttpContext?.User.GetUserId(),
            Guid.NewGuid());

        BackgroundJob.Enqueue<CountryChangedJob>(
            job => job.ExecuteAsync(request, CancellationToken.None));
    }
}
