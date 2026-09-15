using MediatR;

namespace ErpSystem.BuildingBlocks.Application.Abstractions.Messaging;

public interface IQuery<out TResponse> : IRequest<TResponse>;
