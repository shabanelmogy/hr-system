import type { PositionEnvelopeRepository } from '../domain/repositories/position-envelope-repository';
export type PositionEnvelopeUseCases = PositionEnvelopeRepository;
export const createPositionEnvelopeUseCases = (repository: PositionEnvelopeRepository): PositionEnvelopeUseCases => ({
  getPage: (query) => repository.getPage(query), getById: (id) => repository.getById(id),
});
