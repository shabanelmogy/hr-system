using ErpSystem.BuildingBlocks.Application.Abstractions.Messaging;
using ErpSystem.BuildingBlocks.Application.Common.Errors;
using ErpSystem.BuildingBlocks.Application.Common.Realtime;
using ErpSystem.BuildingBlocks.Authorization;
using ErpSystem.BuildingBlocks.Context.Authentication;
using ErpSystem.Modules.Platform.Application.Features.Security.ApiKeys.Abstractions;
using ErpSystem.Modules.Platform.Application.Features.Security.ApiKeys.Commands;
using ErpSystem.Modules.Platform.Application.Features.Security.ApiKeys.Contracts;
using ErpSystem.Modules.Platform.Application.Features.Security.ApiKeys.Errors;
using ErpSystem.Modules.Platform.Application.Features.Security.ApiKeys.Queries;
using ErpSystem.Modules.Platform.Contracts.Authorization;
using ErpSystem.Modules.Platform.Domain.Security.ApiKeys.Entities;
using ErpSystem.Modules.Platform.Infrastructure;
using ErpSystem.Modules.Platform.Infrastructure.Features.Security.ApiKeys.Persistence;
using ErpSystem.Modules.Platform.Presentation.Features.Security.ApiKeys.V1;
using MediatR;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.Routing;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Localization;
using System.Reflection;
using System.Runtime.CompilerServices;
using System.Security.Cryptography;
using System.Text;

namespace ErpSystem.Modules.Platform.Tests;

public sealed class PlatformApiKeyCqrsTests
{
    [Fact]
    public void ApiKeysController_IsSenderOnlyAndLegacyServiceIsRemoved()
    {
        var parameters = Assert.Single(typeof(ApiKeysController).GetConstructors())
            .GetParameters()
            .Select(parameter => parameter.ParameterType)
            .ToArray();

        Assert.Equal([typeof(ISender)], parameters);
        Assert.Null(typeof(ApiKeyReadStore).Assembly.GetType(
            "ErpSystem.Modules.Platform.Infrastructure.Features.Security.ApiKeys.Services.ApiKeyService"));
        Assert.Null(typeof(GetAllApiKeysQuery).Assembly.GetType(
            "ErpSystem.Modules.Platform.Application.Features.Security.ApiKeys.Services.IApiKeyService"));

        Assert.IsAssignableFrom<IQuery<IReadOnlyCollection<ApiKeyResponse>>>(new GetAllApiKeysQuery());
        Assert.IsAssignableFrom<IQuery<Result<ApiKeyResponse>>>(new GetApiKeyQuery(1));
        Assert.IsAssignableFrom<ICommand<Result<CreatedApiKeyResponse>>>(
            new CreateApiKeyCommand(new CreateApiKeyRequest("https://client.example", "client", null)));
        Assert.IsAssignableFrom<ICommand<Result<ApiKeyResponse>>>(
            new UpdateApiKeyCommand(new UpdateApiKeyRequest(1, "https://client.example", "client", null)));
        Assert.IsAssignableFrom<ICommand<Result>>(new RevokeApiKeyCommand(1));
    }

    [Fact]
    public void ApiKeysController_PreservesRoutesAndPermissions()
    {
        AssertRoute<HttpGetAttribute>(nameof(ApiKeysController.GetAll), null, PlatformPermissions.ViewApiKeys);
        AssertRoute<HttpGetAttribute>(nameof(ApiKeysController.Get), "{id:int}", PlatformPermissions.ViewApiKeys);
        AssertRoute<HttpPostAttribute>(nameof(ApiKeysController.Add), null, PlatformPermissions.CreateApiKeys);
        AssertRoute<HttpPutAttribute>(nameof(ApiKeysController.Update), null, PlatformPermissions.EditApiKeys);
        AssertRoute<HttpPostAttribute>(nameof(ApiKeysController.Revoke), "{id:int}/revoke", PlatformPermissions.RevokeApiKeys);
    }

    [Fact]
    public async Task ApiKeysController_DelegatesCommandsAndPreservesSuccessResults()
    {
        var sender = new RecordingSender();
        var controller = new ApiKeysController(sender);
        var create = new CreateApiKeyRequest("https://create.example", "create", null);
        var update = new UpdateApiKeyRequest(7, "https://update.example", "update", null);

        var allResult = Assert.IsType<OkObjectResult>(await controller.GetAll(CancellationToken.None));
        Assert.IsAssignableFrom<IReadOnlyCollection<ApiKeyResponse>>(allResult.Value);

        var getResult = Assert.IsType<OkObjectResult>(await controller.Get(7, CancellationToken.None));
        Assert.Equal(7, Assert.IsType<ApiKeyResponse>(getResult.Value).Id);

        var addResult = Assert.IsType<CreatedAtActionResult>(await controller.Add(create, CancellationToken.None));
        Assert.Equal(nameof(ApiKeysController.Get), addResult.ActionName);
        Assert.Equal(7, addResult.RouteValues!["id"]);
        Assert.Equal("hrk_visible-once", Assert.IsType<CreatedApiKeyResponse>(addResult.Value).Secret);

        var updateResult = Assert.IsType<OkObjectResult>(await controller.Update(update, CancellationToken.None));
        Assert.Equal(7, Assert.IsType<ApiKeyResponse>(updateResult.Value).Id);

        Assert.IsType<NoContentResult>(await controller.Revoke(7, CancellationToken.None));

        Assert.Collection(
            sender.Requests,
            request => Assert.IsType<GetAllApiKeysQuery>(request),
            request => Assert.Equal(7, Assert.IsType<GetApiKeyQuery>(request).Id),
            request => Assert.Same(create, Assert.IsType<CreateApiKeyCommand>(request).Request),
            request => Assert.Same(update, Assert.IsType<UpdateApiKeyCommand>(request).Request),
            request => Assert.Equal(7, Assert.IsType<RevokeApiKeyCommand>(request).Id));
    }

    [Fact]
    public void CredentialGenerator_PreservesSecretFormatPrefixAndSha256StorageMaterial()
    {
        var credential = new ApiKeyCredentialGenerator().Generate();

        Assert.StartsWith("hrk_", credential.Secret, StringComparison.Ordinal);
        Assert.Equal(12, credential.Prefix.Length);
        Assert.Equal(credential.Secret[..12], credential.Prefix);
        Assert.Equal(
            Convert.ToHexString(SHA256.HashData(Encoding.UTF8.GetBytes(credential.Secret))),
            credential.Hash);
        Assert.Equal(64, credential.Hash.Length);
        Assert.DoesNotContain(credential.Secret, credential.Hash, StringComparison.Ordinal);
        Assert.DoesNotContain(nameof(ApiKey.KeyHash), typeof(ApiKeyResponse).GetProperties().Select(property => property.Name));
    }

    [Fact]
    public async Task ReadStore_IsCompanyScopedAndOrdersNewestFirst()
    {
        var databaseName = Guid.NewGuid().ToString("N");
        var options = new DbContextOptionsBuilder<PlatformDbContext>()
            .UseInMemoryDatabase(databaseName)
            .Options;
        var older = Key("tenant-a", 1, "https://older.example", new DateTime(2026, 1, 1, 0, 0, 0, DateTimeKind.Utc));
        var newer = Key("tenant-a", 1, "https://newer.example", new DateTime(2026, 2, 1, 0, 0, 0, DateTimeKind.Utc));
        var otherCompany = Key("tenant-a", 2, "https://other.example", new DateTime(2026, 3, 1, 0, 0, 0, DateTimeKind.Utc));

        await using (var seed = new PlatformDbContext(options))
        {
            seed.ApiKeys.AddRange(older, newer, otherCompany);
            await seed.SaveChangesAsync();
        }

        await using var scoped = new PlatformDbContext(options, new Actor("actor", "tenant-a", 1));
        IApiKeyReadStore store = new ApiKeyReadStore(scoped);

        var all = await store.GetAllAsync(CancellationToken.None);

        Assert.Equal([newer.ClientUri, older.ClientUri], all.Select(key => key.ClientUri));
        Assert.Null(await store.GetByIdAsync(otherCompany.Id, CancellationToken.None));
        Assert.Equal(newer.Id, (await store.GetByIdAsync(newer.Id, CancellationToken.None))!.Id);
    }

    [Fact]
    public async Task UpdateRevokedKey_MapsDomainRuleToApiKeyRevokedWithoutSavingOrDispatching()
    {
        var apiKey = Key("tenant-a", 1, "https://client.example", DateTime.UtcNow.AddDays(-2));
        apiKey.Revoke("already revoked", DateTime.UtcNow.AddDays(-1));
        var store = new RecordingWriteStore(apiKey);
        var effects = new RecordingEffects();
        var errors = Errors();
        var handler = new UpdateApiKeyCommandHandler(store, effects, errors, TimeProvider.System);

        var result = await handler.Handle(
            new UpdateApiKeyCommand(new UpdateApiKeyRequest(
                apiKey.Id,
                "https://updated.example",
                "updated",
                DateTime.UtcNow.AddDays(5))),
            CancellationToken.None);

        Assert.True(result.IsFailure);
        Assert.Equal("ApiKey.Revoked", result.Error.Code);
        Assert.Equal(0, store.SaveCount);
        Assert.Empty(effects.Changes);
    }

    [Fact]
    public async Task MissingApiKeyQuery_MapsToApiKeyNotFound()
    {
        var handler = new GetApiKeyQueryHandler(new MissingReadStore(), Errors());

        var result = await handler.Handle(new GetApiKeyQuery(404), CancellationToken.None);

        Assert.True(result.IsFailure);
        Assert.Equal("ApiKey.NotFound", result.Error.Code);
    }

    [Fact]
    public void Effects_PreserveCompanyPermissionAudienceAndAction()
    {
        var dispatcher = new RecordingRealtimeDispatcher();
        var effects = new ApiKeyEffects(dispatcher);
        var apiKey = Key("tenant-a", 17, "https://client.example", DateTime.UtcNow);

        effects.DispatchChange("Revoke", apiKey);

        var change = Assert.Single(dispatcher.Changes);
        Assert.Equal("Revoke", change.Action);
        Assert.Equal(apiKey.Id.ToString(System.Globalization.CultureInfo.InvariantCulture), change.EntityId);
        Assert.Equal(RealtimeAudienceKind.CompanyPermission, change.Audience.Kind);
        Assert.Equal("tenant-a", change.Audience.TenantId);
        Assert.Equal(17, change.Audience.CompanyId);
        Assert.Equal(PlatformPermissions.ViewApiKeys, change.Audience.Permission);
    }

    private static ApiKey Key(string tenantId, int companyId, string clientUri, DateTime createdAt)
    {
        var apiKey = ApiKey.Create(
            new string('A', 64),
            "hrk_prefix12",
            clientUri,
            "test key",
            createdAt,
            null);
        apiKey.TenantId = tenantId;
        apiKey.CompanyId = companyId;
        return apiKey;
    }

    private static ApiKeyErrors Errors() => new(new PassThroughLocalizer<CreateApiKeyRequest>());

    private static void AssertRoute<TAttribute>(
        string actionName,
        string? expectedTemplate,
        string expectedPermission)
        where TAttribute : HttpMethodAttribute
    {
        var method = typeof(ApiKeysController).GetMethod(actionName)!;
        var attribute = Assert.Single(
            method.GetCustomAttributes(typeof(TAttribute), inherit: false).Cast<TAttribute>());
        Assert.Equal(expectedTemplate, attribute.Template);
        Assert.Equal(expectedPermission, method.GetCustomAttribute<HasPermissionAttribute>()?.Policy);
    }

    private sealed class Actor(string? userId, string? tenantId, int? companyId) : ICurrentActor
    {
        public string? UserId { get; } = userId;
        public string? TenantId { get; } = tenantId;
        public int? CompanyId { get; } = companyId;
    }

    private sealed class RecordingWriteStore(ApiKey apiKey) : IApiKeyWriteStore
    {
        public int SaveCount { get; private set; }

        public void Add(ApiKey value) => throw new NotSupportedException();

        public Task<ApiKey?> GetForUpdateAsync(int id, CancellationToken cancellationToken = default) =>
            Task.FromResult<ApiKey?>(apiKey);

        public Task<int> SaveChangesAsync(CancellationToken cancellationToken = default)
        {
            SaveCount++;
            return Task.FromResult(1);
        }
    }

    private sealed class RecordingEffects : IApiKeyEffects
    {
        public List<(string Action, ApiKey ApiKey)> Changes { get; } = [];
        public void DispatchChange(string action, ApiKey apiKey) => Changes.Add((action, apiKey));
    }

    private sealed class MissingReadStore : IApiKeyReadStore
    {
        public Task<IReadOnlyCollection<ApiKeyResponse>> GetAllAsync(CancellationToken cancellationToken = default) =>
            Task.FromResult<IReadOnlyCollection<ApiKeyResponse>>([]);

        public Task<ApiKeyResponse?> GetByIdAsync(int id, CancellationToken cancellationToken = default) =>
            Task.FromResult<ApiKeyResponse?>(null);
    }

    private sealed class RecordingRealtimeDispatcher : IRealtimeChangeDispatcher
    {
        public List<RealtimeChangeRequest> Changes { get; } = [];
        public void Dispatch(RealtimeChangeRequest request) => Changes.Add(request);
    }

    private sealed class PassThroughLocalizer<T> : IStringLocalizer<T>
    {
        public LocalizedString this[string name] => new(name, name, resourceNotFound: false);

        public LocalizedString this[string name, params object[] arguments] =>
            new(name, string.Format(System.Globalization.CultureInfo.InvariantCulture, name, arguments), resourceNotFound: false);

        public IEnumerable<LocalizedString> GetAllStrings(bool includeParentCultures) => [];
    }

    private sealed class RecordingSender : ISender
    {
        public List<object> Requests { get; } = [];

        public Task<TResponse> Send<TResponse>(
            IRequest<TResponse> request,
            CancellationToken cancellationToken = default)
        {
            Requests.Add(request);
            var apiKey = Response(7);
            object response = request switch
            {
                GetAllApiKeysQuery => new List<ApiKeyResponse> { apiKey },
                GetApiKeyQuery => Result.Success(apiKey),
                CreateApiKeyCommand => Result.Success(new CreatedApiKeyResponse(apiKey, "hrk_visible-once")),
                UpdateApiKeyCommand => Result.Success(apiKey),
                RevokeApiKeyCommand => Result.Success(),
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
    }

    private static ApiKeyResponse Response(int id) =>
        new(id, "hrk_prefix12", "https://client.example", "client", true, DateTime.UtcNow, null, null);
}
