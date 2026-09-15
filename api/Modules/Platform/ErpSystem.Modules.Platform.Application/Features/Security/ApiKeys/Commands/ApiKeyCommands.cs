using ErpSystem.BuildingBlocks.Domain.Exceptions;
using ErpSystem.Modules.Platform.Application.Features.Security.ApiKeys.Abstractions;
using ErpSystem.Modules.Platform.Application.Features.Security.ApiKeys.Contracts;
using ErpSystem.Modules.Platform.Application.Features.Security.ApiKeys.Errors;
using ErpSystem.Modules.Platform.Domain.Security.ApiKeys.Entities;

namespace ErpSystem.Modules.Platform.Application.Features.Security.ApiKeys.Commands;

public sealed record CreateApiKeyCommand(CreateApiKeyRequest Request)
    : ICommand<Result<CreatedApiKeyResponse>>;

public sealed record UpdateApiKeyCommand(UpdateApiKeyRequest Request)
    : ICommand<Result<ApiKeyResponse>>;

public sealed record RevokeApiKeyCommand(int Id) : ICommand<Result>;

public sealed class CreateApiKeyCommandValidator : AbstractValidator<CreateApiKeyCommand>
{
    public CreateApiKeyCommandValidator(IValidator<CreateApiKeyRequest> requestValidator) =>
        RuleFor(command => command.Request).SetValidator(requestValidator);
}

public sealed class UpdateApiKeyCommandValidator : AbstractValidator<UpdateApiKeyCommand>
{
    public UpdateApiKeyCommandValidator(IValidator<UpdateApiKeyRequest> requestValidator) =>
        RuleFor(command => command.Request).SetValidator(requestValidator);
}

public sealed class CreateApiKeyCommandHandler(
    IApiKeyWriteStore writeStore,
    IApiKeyCredentialGenerator credentials,
    IApiKeyEffects effects,
    TimeProvider timeProvider)
    : ICommandHandler<CreateApiKeyCommand, Result<CreatedApiKeyResponse>>
{
    public async Task<Result<CreatedApiKeyResponse>> Handle(
        CreateApiKeyCommand command,
        CancellationToken cancellationToken)
    {
        var request = command.Request;
        var credential = credentials.Generate();
        var now = timeProvider.GetUtcNow().UtcDateTime;
        var apiKey = ApiKey.Create(
            credential.Hash,
            credential.Prefix,
            request.ClientUri,
            request.Description,
            now,
            request.ExpiresAt);

        writeStore.Add(apiKey);
        await writeStore.SaveChangesAsync(cancellationToken);
        effects.DispatchChange("Create", apiKey);

        return Result.Success(new CreatedApiKeyResponse(ApiKeyCommandMapping.ToResponse(apiKey), credential.Secret));
    }
}

public sealed class UpdateApiKeyCommandHandler(
    IApiKeyWriteStore writeStore,
    IApiKeyEffects effects,
    ApiKeyErrors errors,
    TimeProvider timeProvider)
    : ICommandHandler<UpdateApiKeyCommand, Result<ApiKeyResponse>>
{
    public async Task<Result<ApiKeyResponse>> Handle(
        UpdateApiKeyCommand command,
        CancellationToken cancellationToken)
    {
        var request = command.Request;
        var apiKey = await writeStore.GetForUpdateAsync(request.Id, cancellationToken);
        if (apiKey is null)
            return Result.Failure<ApiKeyResponse>(errors.ApiKeyNotFound);

        try
        {
            apiKey.UpdateDetails(
                request.ClientUri,
                request.Description,
                request.ExpiresAt,
                timeProvider.GetUtcNow().UtcDateTime);
        }
        catch (DomainRuleException exception) when (exception.Code == "ApiKey.Revoked")
        {
            return Result.Failure<ApiKeyResponse>(errors.ApiKeyRevoked);
        }

        await writeStore.SaveChangesAsync(cancellationToken);
        effects.DispatchChange("Update", apiKey);
        return Result.Success(ApiKeyCommandMapping.ToResponse(apiKey));
    }
}

public sealed class RevokeApiKeyCommandHandler(
    IApiKeyWriteStore writeStore,
    IApiKeyEffects effects,
    ApiKeyErrors errors,
    TimeProvider timeProvider)
    : ICommandHandler<RevokeApiKeyCommand, Result>
{
    public async Task<Result> Handle(
        RevokeApiKeyCommand command,
        CancellationToken cancellationToken)
    {
        var apiKey = await writeStore.GetForUpdateAsync(command.Id, cancellationToken);
        if (apiKey is null)
            return Result.Failure(errors.ApiKeyNotFound);

        apiKey.Revoke("Revoked by an administrator", timeProvider.GetUtcNow().UtcDateTime);
        await writeStore.SaveChangesAsync(cancellationToken);
        effects.DispatchChange("Revoke", apiKey);
        return Result.Success();
    }
}

internal static class ApiKeyCommandMapping
{
    public static ApiKeyResponse ToResponse(ApiKey apiKey) =>
        new(
            apiKey.Id,
            apiKey.KeyPrefix,
            apiKey.ClientUri,
            apiKey.Description,
            apiKey.IsActive,
            apiKey.CreatedAt,
            apiKey.ExpiresAt,
            apiKey.RevokedAt);
}
