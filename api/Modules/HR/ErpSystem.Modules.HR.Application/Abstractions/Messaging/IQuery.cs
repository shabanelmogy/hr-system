using MediatR;

namespace ErpSystem.Modules.HR.Application.Abstractions.Messaging;

public interface IQuery<out TResponse> : IRequest<TResponse>;
