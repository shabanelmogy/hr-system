using System.Reflection;
using System.Runtime.CompilerServices;
using ErpSystem.BuildingBlocks.Application.Common.Errors;
using ErpSystem.BuildingBlocks.Application.Common.Paginations;
using ErpSystem.BuildingBlocks.Authorization;
using ErpSystem.BuildingBlocks.Context.Authentication;
using ErpSystem.Modules.Accounting.Application.Features.Finance.LedgerSetup.Commands;
using ErpSystem.Modules.Accounting.Application.Features.Finance.LedgerSetup.Contracts;
using ErpSystem.Modules.Accounting.Application.Features.Finance.LedgerSetup.Queries;
using ErpSystem.Modules.Accounting.Contracts.Authorization;
using ErpSystem.Modules.Accounting.Domain.Finance.LedgerSetup.Entities;
using ErpSystem.Modules.Accounting.Domain.Finance.LedgerSetup.Enums;
using ErpSystem.Modules.Accounting.Infrastructure;
using ErpSystem.Modules.Accounting.Infrastructure.Features.Finance.LedgerSetup.Persistence;
using ErpSystem.Modules.Accounting.Presentation.Features.Finance.LedgerSetup.V1;
using MediatR;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.Routing;
using Microsoft.EntityFrameworkCore;

namespace ErpSystem.Modules.Accounting.Tests;

public sealed class LedgerSetupCoaHierarchyTests
{
    [Fact]
    public async Task AccountPage_ReturnsTruthfulServerMetadataAndAppliesFocusedCriteria()
    {
        await using var context = CreateContext();
        context.Accounts.AddRange(
            Account("ACC-0001", "Alpha Root"),
            Account("ACC-0002", "Alpha Child"),
            Account("Z-OTHER", "Beta"),
            Account("ACC-0010", "Alpha Archived", isDeleted: true));
        await context.SaveChangesAsync();
        var store = new AccountReadStore(context);

        var page = await store.ListAsync(
            new AccountListQuery(
                PageNumber: 1,
                PageSize: 1,
                Search: "alpha",
                SearchField: "nameEn",
                SearchOperator: "contains",
                RecordStatus: "active",
                SortBy: "nameEn",
                SortDirection: "desc"),
            CancellationToken.None);

        Assert.Single(page.Items);
        Assert.Equal("Alpha Root", page.Items[0].NameEn);
        Assert.Equal(2, page.MetaData.TotalCount);
        Assert.Equal(2, page.MetaData.TotalPages);
        Assert.Equal(1, page.MetaData.CurrentPage);
        Assert.Equal(1, page.MetaData.PageSize);

        var negative = await store.ListAsync(
            new AccountListQuery(
                PageNumber: 1,
                PageSize: 50,
                Search: "ACC-",
                SearchField: "code",
                SearchOperator: "doesNotContain",
                RecordStatus: "all",
                SortBy: "code",
                SortDirection: "asc"),
            CancellationToken.None);

        Assert.Equal("Z-OTHER", Assert.Single(negative.Items).Code);
        Assert.Equal(1, negative.MetaData.TotalCount);
    }

    [Fact]
    public async Task CodeProposal_UsesNextReservedSuffixAcrossActiveAndArchivedAccounts()
    {
        await using var context = CreateContext();
        context.Accounts.AddRange(
            Account("ACC-0001", "One"),
            Account("ACC-0010", "Ten", isDeleted: true),
            Account("ACC-9999", "Nine Thousand"),
            Account("ACC-10000", "Ten Thousand", isDeleted: true),
            Account("ACC-ABC", "Ignored Text"),
            Account("ACC-012", "Ignored Short"),
            Account("CUSTOM", "Ignored Custom"));
        await context.SaveChangesAsync();

        var proposal = await new AccountReadStore(context).GetCodeProposalAsync(CancellationToken.None);

        Assert.Equal("ACC-10001", proposal.Code);
    }

    [Fact]
    public async Task CodeProposal_WhenNoReservedCodes_StartsAtOne()
    {
        await using var context = CreateContext();
        context.Accounts.Add(Account("CUSTOM", "Custom"));
        await context.SaveChangesAsync();

        var proposal = await new AccountReadStore(context).GetCodeProposalAsync(CancellationToken.None);

        Assert.Equal("ACC-0001", proposal.Code);
    }

    [Fact]
    public async Task CodeProposal_DoesNotReserveAndAdvancesOnlyAfterPersistedUse()
    {
        await using var context = CreateContext();
        var store = new AccountReadStore(context);

        var first = await store.GetCodeProposalAsync(CancellationToken.None);
        var concurrentHint = await store.GetCodeProposalAsync(CancellationToken.None);

        Assert.Equal("ACC-0001", first.Code);
        Assert.Equal(first, concurrentHint);

        context.Accounts.Add(Account(first.Code, "Persisted"));
        await context.SaveChangesAsync();

        var afterCommit = await store.GetCodeProposalAsync(CancellationToken.None);
        Assert.Equal("ACC-0002", afterCommit.Code);
    }

    [Fact]
    public void AccountQueryValidator_EnforcesFrozenSearchSortAndStatusVocabulary()
    {
        var validator = new GetAccountsQueryValidator();
        string[] fields = ["all", "code", "nameAr", "nameEn"];
        string[] operators = ["contains", "doesNotContain", "equals", "doesNotEqual", "startsWith", "endsWith"];
        string[] sorts = ["code", "nameAr", "nameEn", "createdOn"];

        foreach (var field in fields)
            Assert.True(validator.Validate(new GetAccountsQuery { SearchField = field }).IsValid);
        foreach (var searchOperator in operators)
            Assert.True(validator.Validate(new GetAccountsQuery { SearchOperator = searchOperator }).IsValid);
        foreach (var sort in sorts)
            Assert.True(validator.Validate(new GetAccountsQuery { SortBy = sort }).IsValid);

        Assert.False(validator.Validate(new GetAccountsQuery { SearchField = "parent" }).IsValid);
        Assert.False(validator.Validate(new GetAccountsQuery { SearchOperator = "regex" }).IsValid);
        Assert.False(validator.Validate(new GetAccountsQuery { RecordStatus = "deleted" }).IsValid);
        Assert.False(validator.Validate(new GetAccountsQuery { SortBy = "id" }).IsValid);
        Assert.False(validator.Validate(new GetAccountsQuery { SortDirection = "sideways" }).IsValid);
        Assert.False(validator.Validate(new GetAccountsQuery { PageSize = PaginationRequest.MaxClientPageSize + 1 }).IsValid);
    }

    [Fact]
    public void UpdateHierarchyLevelValidator_MatchesCreateNameValidation()
    {
        var validator = new UpdateAccountHierarchyLevelCommandValidator();

        var result = validator.Validate(new UpdateAccountHierarchyLevelCommand(1, 1, string.Empty, string.Empty, true, "AQ=="));

        Assert.Contains(result.Errors, error => error.PropertyName == nameof(UpdateAccountHierarchyLevelCommand.NameAr));
        Assert.Contains(result.Errors, error => error.PropertyName == nameof(UpdateAccountHierarchyLevelCommand.NameEn));
    }

    [Fact]
    public async Task AccountsController_ExposesTypedPageAndReadProtectedCodeProposal()
    {
        var sender = new RecordingSender();
        var controller = new AccountsController(sender);
        var query = new GetAccountsQuery { PageSize = 25, SortBy = "nameEn" };

        var page = await controller.List(query, CancellationToken.None);
        var proposal = Assert.IsType<OkObjectResult>(await controller.CodeProposal(CancellationToken.None));

        Assert.Empty(page.Items);
        Assert.Equal("ACC-0001", Assert.IsType<AccountCodeProposalResponse>(proposal.Value).Code);
        Assert.Collection(
            sender.Requests,
            request => Assert.Same(query, request),
            request => Assert.IsType<GetAccountCodeProposalQuery>(request));

        var actions = typeof(AccountsController).GetMethods(BindingFlags.Instance | BindingFlags.Public)
            .Where(method => method.GetCustomAttributes<HttpMethodAttribute>().Any())
            .ToDictionary(method => method.Name);
        Assert.Equal(AccountingPermissions.ViewAccounts, actions[nameof(AccountsController.List)].GetCustomAttribute<HasPermissionAttribute>()?.Policy);
        Assert.Equal(AccountingPermissions.ViewAccounts, actions[nameof(AccountsController.CodeProposal)].GetCustomAttribute<HasPermissionAttribute>()?.Policy);
    }

    private static AccountingDbContext CreateContext() =>
        new(
            new DbContextOptionsBuilder<AccountingDbContext>()
                .UseInMemoryDatabase(Guid.NewGuid().ToString("N"))
                .Options,
            new TestActor(),
            TimeProvider.System);

    private static Account Account(string code, string nameEn, bool isDeleted = false) =>
        new(code, "حساب", nameEn, 1, null, false, ManualPostingPolicy.Allowed, AccountCurrencyPolicy.Any, null)
        {
            TenantId = "tenant-1",
            CompanyId = 11,
            IsDeleted = isDeleted
        };

    private sealed class TestActor : ICurrentActor
    {
        public string? UserId => "user-1";
        public string? TenantId => "tenant-1";
        public int? CompanyId => 11;
        public string? MachineName => "tests";
        public bool IsInRole(string role) => false;
    }

    private sealed class RecordingSender : ISender
    {
        public List<object> Requests { get; } = [];

        public Task<TResponse> Send<TResponse>(IRequest<TResponse> request, CancellationToken cancellationToken = default)
        {
            Requests.Add(request);
            object response = request switch
            {
                GetAccountsQuery query => EmptyPage(query.PageNumber, query.PageSize),
                GetAccountCodeProposalQuery => Result.Success(new AccountCodeProposalResponse("ACC-0001")),
                _ => throw new NotSupportedException(request.GetType().FullName)
            };
            return Task.FromResult((TResponse)response);
        }

        public Task Send<TRequest>(TRequest request, CancellationToken cancellationToken = default)
            where TRequest : IRequest => throw new NotSupportedException();

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

        private static PageResponse<AccountResponse> EmptyPage(int pageNumber, int pageSize)
        {
            var page = new PagedList<AccountResponse>([], 0, pageNumber, pageSize, PaginationRequest.MaxClientPageSize);
            return new PageResponse<AccountResponse>(page, page.MetaData);
        }

        private static async IAsyncEnumerable<T> Empty<T>(
            [EnumeratorCancellation] CancellationToken cancellationToken)
        {
            await Task.CompletedTask;
            cancellationToken.ThrowIfCancellationRequested();
            yield break;
        }
    }
}
