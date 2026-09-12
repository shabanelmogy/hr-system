import { createRecruitmentUseCases } from '../application/recruitment-use-cases';
import { recruitmentRemoteDataSource } from '../data/remote/recruitment-remote-data-source';
import { DefaultRecruitmentRepository } from '../data/repositories/default-recruitment-repository';

export const recruitmentRepository = new DefaultRecruitmentRepository(recruitmentRemoteDataSource);
export const recruitmentUseCases = createRecruitmentUseCases(recruitmentRepository);
