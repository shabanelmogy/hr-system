using System.Reflection;
using System.Runtime.CompilerServices;
using HrManagementSystem.Api.Features.Finance.FiscalYears.V1;
using HrManagementSystem.Application.Common.Consts;
using HrManagementSystem.Application.Common.Errors;
using HrManagementSystem.Application.Common.Paginations;
using HrManagementSystem.Application.Features.Finance.FiscalYears.Commands;
using HrManagementSystem.Application.Features.Finance.FiscalYears.Contracts;
using HrManagementSystem.Application.Features.Finance.FiscalYears.Queries;
using HrManagementSystem.Application.Features.Finance.FiscalYears.Queries.GetFiscalYears;
using HrManagementSystem.Domain.Finance.FiscalYears.Enums;
using HrManagementSystem.Infrastructure.Security.Authorization.Filters;
using MediatR;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.Routing;

namespace HrManagementSystem.Tests;

public sealed class FiscalYearsControllerContractTests
{
    [Fact]
    public async Task EveryAction_DispatchesItsSliceAndUsesCanonicalSuccessStatus()
    {
        var sender = new RecordingSender();
        var controller = new FiscalYearsController(sender);
        var pageQuery = new GetFiscalYearsQuery { RecordStatus = "all", PageSize = 25 };
        var mutation = new CreateFiscalYearRequest(
            "FY2027", "السنة المالية 2027", "Fiscal Year 2027",
            new DateOnly(2027, 1, 1), new DateOnly(2027, 12, 31), FiscalPeriodFrequency.Monthly);
        var update = new UpdateFiscalYearRequest(
            mutation.Code, mutation.NameAr, mutation.NameEn, mutation.StartDate,
            mutation.EndDate, mutation.PeriodFrequency, "AQ==");
        var concurrency = new FiscalYearConcurrencyRequest("AQ==");

        Assert.IsType<OkObjectResult>(await controller.GetPage(pageQuery, CancellationToken.None));
        Assert.IsType<OkObjectResult>(await controller.GetLookup(CancellationToken.None));
        Assert.IsType<OkObjectResult>(await controller.GetById(7, CancellationToken.None));
        Assert.IsType<CreatedAtActionResult>(await controller.Create(mutation, CancellationToken.None));
        Assert.IsType<OkObjectResult>(await controller.Update(7, update, CancellationToken.None));
        Assert.IsType<NoContentResult>(await controller.Archive(7, CancellationToken.None));
        Assert.IsType<OkObjectResult>(await controller.Restore(7, concurrency, CancellationToken.None));
        Assert.IsType<OkObjectResult>(await controller.Open(7, concurrency, CancellationToken.None));
        Assert.IsType<OkObjectResult>(await controller.BeginClosing(7, concurrency, CancellationToken.None));
        Assert.IsType<OkObjectResult>(await controller.Close(7, concurrency, CancellationToken.None));
        Assert.IsType<OkObjectResult>(await controller.Lock(7, concurrency, CancellationToken.None));

        Assert.Collection(
            sender.Requests,
            request => Assert.Same(pageQuery, request),
            request => Assert.IsType<GetFiscalYearLookupQuery>(request),
            request => Assert.Equal(7, Assert.IsType<GetFiscalYearByIdQuery>(request).Id),
            request => Assert.Equal("FY2027", Assert.IsType<CreateFiscalYearCommand>(request).Code),
            request => Assert.Equal("AQ==", Assert.IsType<UpdateFiscalYearCommand>(request).RowVersion),
            request => Assert.Equal(7, Assert.IsType<ArchiveFiscalYearCommand>(request).Id),
            request => Assert.Equal("AQ==", Assert.IsType<RestoreFiscalYearCommand>(request).RowVersion),
            request => AssertLifecycle(request, FiscalYearLifecycleAction.Open),
            request => AssertLifecycle(request, FiscalYearLifecycleAction.BeginClosing),
            request => AssertLifecycle(request, FiscalYearLifecycleAction.Close),
            request => AssertLifecycle(request, FiscalYearLifecycleAction.Lock));
    }

    [Fact]
    public void Controller_IsThinTenantMemberSurfaceWithExactRoutesAndPermissions()
    {
        var constructor = Assert.Single(typeof(FiscalYearsController).GetConstructors());
        Assert.Equal([typeof(ISender)], constructor.GetParameters().Select(parameter => parameter.ParameterType));
        Assert.NotNull(typeof(FiscalYearsController).GetCustomAttribute<TenantMemberAttribute>());
        Assert.Equal(
            "api/v{version:apiVersion}/fiscal-years",
            Assert.Single(typeof(FiscalYearsController).GetCustomAttributes<RouteAttribute>()).Template);

        AssertRoute<HttpGetAttribute>(nameof(FiscalYearsController.GetPage), null, Permissions.ViewFiscalYears);
        AssertRoute<HttpGetAttribute>(nameof(FiscalYearsController.GetLookup), "lookup", Permissions.ViewFiscalYears);
        AssertRoute<HttpGetAttribute>(nameof(FiscalYearsController.GetById), "{id:int}", Permissions.ViewFiscalYears);
        AssertRoute<HttpPostAttribute>(nameof(FiscalYearsController.Create), null, Permissions.CreateFiscalYears);
        AssertRoute<HttpPutAttribute>(nameof(FiscalYearsController.Update), "{id:int}", Permissions.EditFiscalYears);
        AssertRoute<HttpDeleteAttribute>(nameof(FiscalYearsController.Archive), "{id:int}", Permissions.DeleteFiscalYears);
        AssertRoute<HttpPostAttribute>(nameof(FiscalYearsController.Restore), "{id:int}/restore", Permissions.DeleteFiscalYears);
        AssertRoute<HttpPostAttribute>(nameof(FiscalYearsController.Open), "{id:int}/open", Permissions.ManageFiscalYearLifecycle);
        AssertRoute<HttpPostAttribute>(nameof(FiscalYearsController.BeginClosing), "{id:int}/begin-closing", Permissions.ManageFiscalYearLifecycle);
        AssertRoute<HttpPostAttribute>(nameof(FiscalYearsController.Close), "{id:int}/close", Permissions.ManageFiscalYearLifecycle);
        AssertRoute<HttpPostAttribute>(nameof(FiscalYearsController.Lock), "{id:int}/lock", Permissions.ManageFiscalYearLifecycle);
    }

    private static void AssertLifecycle(object request, FiscalYearLifecycleAction action)
    {
        var command = Assert.IsType<ChangeFiscalYearLifecycleCommand>(request);
        Assert.Equal(7, command.Id);
        Assert.Equal("AQ==", command.RowVersion);
        Assert.Equal(action, command.Action);
    }

    private static void AssertRoute<TAttribute>(string action, string? template, string permission)
        where TAttribute : HttpMethodAttribute
    {
        var method = typeof(FiscalYearsController).GetMethod(action)!;
        Assert.Equal(template, Assert.Single(method.GetCustomAttributes<TAttribute>()).Template);
        Assert.Equal(permission, method.GetCustomAttribute<HasPermissionAttribute>()?.Policy);
    }

    private sealed class RecordingSender : ISender
    {
        public List<object> Requests { get; } = [];

        public Task<TResponse> Send<TResponse>(IRequest<TResponse> request, CancellationToken cancellationToken = default)
        {
            Requests.Add(request);
            object response = request switch
            {
                GetFiscalYearsQuery => Page(),
                GetFiscalYearLookupQuery => new List<FiscalYearLookupResponse> { Lookup() },
                GetFiscalYearByIdQuery => Result.Success(Detail()),
                CreateFiscalYearCommand => Result.Success(Detail()),
                UpdateFiscalYearCommand => Result.Success(Detail()),
                ArchiveFiscalYearCommand => Result.Success(),
                RestoreFiscalYearCommand => Result.Success(Detail()),
                ChangeFiscalYearLifecycleCommand => Result.Success(Detail()),
                _ => throw new NotSupportedException(request.GetType().FullName)
            };
            return Task.FromResult((TResponse)response);
        }

        public Task Send<TRequest>(TRequest request, CancellationToken cancellationToken = default)
            where TRequest : IRequest => throw new NotSupportedException();

        public Task<object?> Send(object request, CancellationToken cancellationToken = default) =>
            throw new NotSupportedException();

        public IAsyncEnumerable<TResponse> CreateStream<TResponse>(IStreamRequest<TResponse> request, CancellationToken cancellationToken = default) =>
            Empty<TResponse>(cancellationToken);

        public IAsyncEnumerable<object?> CreateStream(object request, CancellationToken cancellationToken = default) =>
            Empty<object?>(cancellationToken);

        private static async IAsyncEnumerable<T> Empty<T>([EnumeratorCancellation] CancellationToken cancellationToken)
        {
            await Task.CompletedTask;
            cancellationToken.ThrowIfCancellationRequested();
            yield break;
        }

        private static PageResponse<FiscalYearListItemResponse> Page()
        {
            var item = new FiscalYearListItemResponse(
                7, "FY2027", "السنة المالية 2027", "Fiscal Year 2027",
                new DateOnly(2027, 1, 1), new DateOnly(2027, 12, 31),
                FiscalPeriodFrequency.Monthly, FiscalYearStatus.Draft, 12,
                DateTime.UtcNow, null, false, "AQ==");
            var page = new PagedList<FiscalYearListItemResponse>([item], 1, 1, 10);
            return new PageResponse<FiscalYearListItemResponse>(page, page.MetaData);
        }

        private static FiscalYearLookupResponse Lookup() => new(
            7, "FY2027", "السنة المالية 2027", "Fiscal Year 2027",
            new DateOnly(2027, 1, 1), new DateOnly(2027, 12, 31), FiscalYearStatus.Draft);

        private static FiscalYearDetailResponse Detail() => new(
            7, "FY2027", "السنة المالية 2027", "Fiscal Year 2027",
            new DateOnly(2027, 1, 1), new DateOnly(2027, 12, 31),
            FiscalPeriodFrequency.Monthly, FiscalYearStatus.Draft, [],
            DateTime.UtcNow, null, false, "AQ==");
    }
}
