using MediatR;

namespace HrManagementSystem.Application.Abstractions.Messaging;

public interface IQuery<out TResponse> : IRequest<TResponse>;
