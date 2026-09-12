import { createAuthUseCases } from '../application/auth-use-cases';
import { authRemoteDataSource } from '../data/remote/auth/auth-remote-data-source';
import { DefaultAuthRepository } from '../data/repositories/default-auth-repository';

export const authRepository = new DefaultAuthRepository(authRemoteDataSource);
export const authUseCases = createAuthUseCases(authRepository);
