import type { ErrorLogRepository } from '../../domain/repositories/error-log-repository';
import { errorLogRemoteDataSource } from '../remote/error-log-remote-data-source';

/** The diagnostic viewer has no local cache or replay path. */
export const defaultErrorLogRepository: ErrorLogRepository = errorLogRemoteDataSource;
