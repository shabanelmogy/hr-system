import { useMemo } from 'react';

import { createErrorLogUseCases } from '../application/error-log-use-cases';
import { defaultErrorLogRepository } from '../data/repositories/default-error-log-repository';

export function useErrorLogUseCases() {
  return useMemo(() => createErrorLogUseCases(defaultErrorLogRepository), []);
}
