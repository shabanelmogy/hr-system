import type { EnvelopeAmendmentRepository } from '../domain/repositories/envelope-amendment-repository';
export type EnvelopeAmendmentUseCases = EnvelopeAmendmentRepository;
export const createEnvelopeAmendmentUseCases = (repository: EnvelopeAmendmentRepository): EnvelopeAmendmentUseCases => ({
  getPage: (query) => repository.getPage(query), getById: (id) => repository.getById(id), create: (request) => repository.create(request),
  submit: (action) => repository.submit(action), approve: (action) => repository.approve(action), reject: (action) => repository.reject(action),
});
