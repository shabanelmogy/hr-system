using System.Runtime.CompilerServices;
using HrManagementSystem.Api.Features.GeographicalInformation.States.V1;
using HrManagementSystem.Application.Common.Errors;
using HrManagementSystem.Application.Common.Paginations;
using HrManagementSystem.Application.Features.GeographicalInformation.Countries.Contracts;
using HrManagementSystem.Application.Features.GeographicalInformation.States.Commands;
using HrManagementSystem.Application.Features.GeographicalInformation.States.Contracts;
using HrManagementSystem.Application.Features.GeographicalInformation.States.Queries;
using MediatR;
using Microsoft.AspNetCore.Mvc;

namespace HrManagementSystem.Tests;

public sealed class StatesControllerCqrsTests
{
    [Fact]
    public async Task EveryAction_DispatchesItsSliceAndUsesCanonicalSuccessStatus()
    {
        var sender = new RecordingSender();
        var controller = new StatesController(sender);
        var pageQuery = new GetStatesQuery { Status = "all", PageSize = 25 };
        var create = new CreateStateCommand("القاهرة", "Cairo", "CAI", 7);
        var update = new UpdateStateRequest("الجيزة", "Giza", "GIZ", 7);
        var bulk = new BulkArchiveStatesRequest([7, 8]);

        Assert.IsType<OkObjectResult>(await controller.GetPage(pageQuery, CancellationToken.None));
        Assert.IsType<OkObjectResult>(await controller.GetLookup(7, CancellationToken.None));
        Assert.IsType<OkObjectResult>(await controller.GetByCountry(7, CancellationToken.None));
        Assert.IsType<OkObjectResult>(await controller.GetById(7, CancellationToken.None));
        Assert.IsType<OkObjectResult>(await controller.GetWithDistricts(7, CancellationToken.None));
        Assert.IsType<CreatedAtActionResult>(await controller.Create(create, CancellationToken.None));
        Assert.IsType<OkObjectResult>(await controller.Update(7, update, CancellationToken.None));
        Assert.IsType<NoContentResult>(await controller.Archive(7, CancellationToken.None));
        var archived = Assert.IsType<OkObjectResult>(await controller.BulkArchive(bulk, CancellationToken.None));
        Assert.Equal(2, Assert.IsType<BulkArchiveStatesResponse>(archived.Value).ArchivedCount);
        Assert.IsType<NoContentResult>(await controller.Restore(7, CancellationToken.None));

        Assert.Collection(
            sender.Requests,
            request => Assert.Same(pageQuery, request),
            request => Assert.Equal(7, Assert.IsType<GetStateLookupQuery>(request).CountryId),
            request => Assert.Equal(7, Assert.IsType<GetStateLookupQuery>(request).CountryId),
            request => Assert.Equal(7, Assert.IsType<GetStateByIdQuery>(request).Id),
            request => Assert.Equal(7, Assert.IsType<GetStateWithDistrictsQuery>(request).Id),
            request => Assert.Same(create, request),
            request =>
            {
                var command = Assert.IsType<UpdateStateCommand>(request);
                Assert.Equal(7, command.Id);
                Assert.Equal("Giza", command.NameEn);
            },
            request => Assert.Equal(7, Assert.IsType<ArchiveStateCommand>(request).Id),
            request => Assert.Equal([7, 8], Assert.IsType<BulkArchiveStatesCommand>(request).Ids),
            request => Assert.Equal(7, Assert.IsType<RestoreStateCommand>(request).Id));
    }

    private sealed class RecordingSender : ISender
    {
        public List<object> Requests { get; } = [];

        public Task<TResponse> Send<TResponse>(IRequest<TResponse> request, CancellationToken cancellationToken = default)
        {
            Requests.Add(request);
            object response = request switch
            {
                GetStatesQuery => Page(),
                GetStateLookupQuery => new List<StateLookupResponse> { new(7, "القاهرة", "Cairo", "CAI", 7) },
                GetStateByIdQuery => Result.Success(Detail()),
                GetStateWithDistrictsQuery => Result.Success(WithDistricts()),
                CreateStateCommand => Result.Success(Detail()),
                UpdateStateCommand => Result.Success(Detail()),
                ArchiveStateCommand => Result.Success(),
                BulkArchiveStatesCommand => Result.Success(new BulkArchiveStatesResponse(2)),
                RestoreStateCommand => Result.Success(),
                _ => throw new NotSupportedException(request.GetType().FullName)
            };
            return Task.FromResult((TResponse)response);
        }

        public Task Send<TRequest>(TRequest request, CancellationToken cancellationToken = default) where TRequest : IRequest =>
            throw new NotSupportedException();
        public Task<object?> Send(object request, CancellationToken cancellationToken = default) => throw new NotSupportedException();
        public IAsyncEnumerable<TResponse> CreateStream<TResponse>(IStreamRequest<TResponse> request, CancellationToken cancellationToken = default) => Empty<TResponse>(cancellationToken);
        public IAsyncEnumerable<object?> CreateStream(object request, CancellationToken cancellationToken = default) => Empty<object?>(cancellationToken);

        private static async IAsyncEnumerable<T> Empty<T>([EnumeratorCancellation] CancellationToken cancellationToken)
        {
            await Task.CompletedTask;
            cancellationToken.ThrowIfCancellationRequested();
            yield break;
        }

        private static PageResponse<StateListItemResponse> Page()
        {
            var country = new SimpleCountryResponse(7, "مصر", "Egypt", false);
            var page = new PagedList<StateListItemResponse>(
                [new(7, "القاهرة", "Cairo", "CAI", 7, country, 2, DateTime.UtcNow, null, false)], 1, 1, 10);
            return new PageResponse<StateListItemResponse>(page, page.MetaData);
        }

        private static StateDetailResponse Detail() =>
            new(7, "القاهرة", "Cairo", "CAI", 7, new SimpleCountryResponse(7, "مصر", "Egypt", false), DateTime.UtcNow, null, false);

        private static StateWithDistrictsResponse WithDistricts() =>
            new(7, "القاهرة", "Cairo", "CAI", 7, new SimpleCountryResponse(7, "مصر", "Egypt", false), [], DateTime.UtcNow, null, false);
    }
}
