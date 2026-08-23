using System.Runtime.CompilerServices;
using HrManagementSystem.Api.Features.GeographicalInformation.Countries.V1;
using HrManagementSystem.Application.Common.Errors;
using HrManagementSystem.Application.Common.Paginations;
using HrManagementSystem.Application.Features.GeographicalInformation.Countries.Commands.ArchiveCountry;
using HrManagementSystem.Application.Features.GeographicalInformation.Countries.Commands.BulkArchiveCountries;
using HrManagementSystem.Application.Features.GeographicalInformation.Countries.Commands.CreateCountry;
using HrManagementSystem.Application.Features.GeographicalInformation.Countries.Commands.CreateCountries;
using HrManagementSystem.Application.Features.GeographicalInformation.Countries.Commands.RestoreCountry;
using HrManagementSystem.Application.Features.GeographicalInformation.Countries.Commands.UpdateCountry;
using HrManagementSystem.Application.Features.GeographicalInformation.Countries.Contracts;
using HrManagementSystem.Application.Features.GeographicalInformation.Countries.Queries.GetCountries;
using HrManagementSystem.Application.Features.GeographicalInformation.Countries.Queries.GetCountryById;
using HrManagementSystem.Application.Features.GeographicalInformation.Countries.Queries.GetCountryLookup;
using HrManagementSystem.Application.Features.GeographicalInformation.Countries.Queries.GetCountryWithStates;
using HrManagementSystem.Application.Features.GeographicalInformation.Countries.Queries.GetCountryReportData;
using MediatR;
using Microsoft.AspNetCore.Mvc;

namespace HrManagementSystem.Tests;

public sealed class CountriesControllerCqrsTests
{
    [Fact]
    public async Task EveryAction_DispatchesItsSliceAndUsesCanonicalSuccessStatus()
    {
        var sender = new RecordingSender();
        var controller = new CountriesController(sender);
        var pageQuery = new GetCountriesQuery { Status = "all", PageSize = 25 };
        var create = new CreateCountryCommand("مصر", "Egypt", "EG", "EGY", "+20", "EGP");
        var bulkRequest = new CreateCountriesRequest(
        [
            new CreateCountryRequest("مصر", "Egypt", "EG", "EGY", "+20", "EGP")
        ]);
        var updateRequest = new UpdateCountryRequest("مصر", "Egypt", "EG", "EGY", "+20", "EGP");
        var bulkArchiveRequest = new BulkArchiveCountriesRequest([7, 8]);

        Assert.IsType<OkObjectResult>(await controller.GetPage(pageQuery, CancellationToken.None));
        Assert.IsType<OkObjectResult>(await controller.GetLookup(CancellationToken.None));
        Assert.IsType<OkObjectResult>(await controller.GetReportData(CancellationToken.None));
        Assert.IsType<OkObjectResult>(await controller.GetById(7, CancellationToken.None));
        Assert.IsType<OkObjectResult>(await controller.GetWithStates(7, CancellationToken.None));
        Assert.IsType<CreatedAtActionResult>(await controller.Create(create, CancellationToken.None));
        Assert.Equal(201, Assert.IsType<ObjectResult>(
            await controller.CreateBulk(bulkRequest, CancellationToken.None)).StatusCode);
        Assert.IsType<OkObjectResult>(await controller.Update(7, updateRequest, CancellationToken.None));
        Assert.IsType<NoContentResult>(await controller.Archive(7, CancellationToken.None));
        var bulkArchive = Assert.IsType<OkObjectResult>(
            await controller.BulkArchive(bulkArchiveRequest, CancellationToken.None));
        Assert.Equal(2, Assert.IsType<BulkArchiveCountriesResponse>(bulkArchive.Value).ArchivedCount);
        Assert.IsType<NoContentResult>(await controller.Restore(7, CancellationToken.None));

        Assert.Collection(
            sender.Requests,
            request => Assert.Same(pageQuery, request),
            request => Assert.IsType<GetCountryLookupQuery>(request),
            request => Assert.IsType<GetCountryReportDataQuery>(request),
            request => Assert.Equal(7, Assert.IsType<GetCountryByIdQuery>(request).Id),
            request => Assert.Equal(7, Assert.IsType<GetCountryWithStatesQuery>(request).Id),
            request => Assert.Same(create, request),
            request => Assert.Same(bulkRequest.Countries,
                Assert.IsType<CreateCountriesCommand>(request).Countries),
            request =>
            {
                var update = Assert.IsType<UpdateCountryCommand>(request);
                Assert.Equal(7, update.Id);
                Assert.Equal(updateRequest.NameEn, update.NameEn);
            },
            request => Assert.Equal(7, Assert.IsType<ArchiveCountryCommand>(request).Id),
            request => Assert.Equal([7, 8], Assert.IsType<BulkArchiveCountriesCommand>(request).Ids),
            request => Assert.Equal(7, Assert.IsType<RestoreCountryCommand>(request).Id));
    }

    private sealed class RecordingSender : ISender
    {
        public List<object> Requests { get; } = [];

        public Task<TResponse> Send<TResponse>(
            IRequest<TResponse> request,
            CancellationToken cancellationToken = default)
        {
            Requests.Add(request);
            object response = request switch
            {
                GetCountriesQuery => Page(),
                GetCountryLookupQuery => new List<SimpleCountryResponse>
                {
                    new(7, "مصر", "Egypt", false)
                },
                GetCountryReportDataQuery => new List<CountryReportDataResponse>
                {
                    new(7, "مصر", "Egypt", "EG", "EGY", "+20", "EGP", true)
                },
                GetCountryByIdQuery => Result.Success(Detail()),
                GetCountryWithStatesQuery => Result.Success(WithStates()),
                CreateCountryCommand => Result.Success(Detail()),
                CreateCountriesCommand => Result.Success(new CreateCountriesResponse(1)),
                UpdateCountryCommand => Result.Success(Detail()),
                ArchiveCountryCommand => Result.Success(),
                BulkArchiveCountriesCommand => Result.Success(new BulkArchiveCountriesResponse(2)),
                RestoreCountryCommand => Result.Success(),
                _ => throw new NotSupportedException(request.GetType().FullName)
            };

            return Task.FromResult((TResponse)response);
        }

        public Task Send<TRequest>(TRequest request, CancellationToken cancellationToken = default)
            where TRequest : IRequest =>
            throw new NotSupportedException();

        public Task<object?> Send(object request, CancellationToken cancellationToken = default) =>
            throw new NotSupportedException();

        public IAsyncEnumerable<TResponse> CreateStream<TResponse>(
            IStreamRequest<TResponse> request,
            CancellationToken cancellationToken = default) =>
            Empty<TResponse>(cancellationToken);

        public IAsyncEnumerable<object?> CreateStream(
            object request,
            CancellationToken cancellationToken = default) =>
            Empty<object?>(cancellationToken);

        private static async IAsyncEnumerable<T> Empty<T>(
            [EnumeratorCancellation] CancellationToken cancellationToken)
        {
            await Task.CompletedTask;
            cancellationToken.ThrowIfCancellationRequested();
            yield break;
        }

        private static PageResponse<CountryListItemResponse> Page()
        {
            var items = new List<CountryListItemResponse>
            {
                new(7, "مصر", "Egypt", "EG", "EGY", "+20", "EGP", 3, DateTime.UtcNow, null, false)
            };
            var page = new PagedList<CountryListItemResponse>(items, 1, 1, 10);
            return new PageResponse<CountryListItemResponse>(page, page.MetaData);
        }

        private static CountryDetailResponse Detail() =>
            new(7, "مصر", "Egypt", "EG", "EGY", "+20", "EGP", DateTime.UtcNow, null, false);

        private static CountryResponse WithStates() =>
            new(7, "مصر", "Egypt", "EG", "EGY", "+20", "EGP", [], DateTime.UtcNow, null, false);
    }
}
