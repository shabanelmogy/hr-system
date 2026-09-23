import type { CrystalReportRepository } from '../domain/repositories/crystal-report-repository';
import { createCrystalReportUseCases } from './crystal-report-use-cases';

describe('Crystal report application use cases', () => {
  it('delegates catalog and render operations through the repository port', async () => {
    const repository: jest.Mocked<CrystalReportRepository> = {
      listPublished: jest.fn().mockResolvedValue([]),
      render: jest.fn().mockResolvedValue(new ArrayBuffer(0)),
      listGlobal: jest.fn().mockResolvedValue([]),
      renderGlobal: jest.fn().mockResolvedValue(new ArrayBuffer(0)),
    };
    const useCases = createCrystalReportUseCases(repository);

    await expect(useCases.listPublished('countries')).resolves.toEqual([]);
    await useCases.render('report-id', { language: 'en' });
    await expect(useCases.listGlobal('countries')).resolves.toEqual([]);
    await useCases.renderGlobal('source-id', {
      entityKey: 'countries',
      expectedSha256: 'sha256',
      language: 'en',
    });

    expect(repository.listPublished).toHaveBeenCalledWith('countries');
    expect(repository.render).toHaveBeenCalledWith('report-id', { language: 'en' });
    expect(repository.listGlobal).toHaveBeenCalledWith('countries');
    expect(repository.renderGlobal).toHaveBeenCalledWith('source-id', {
      entityKey: 'countries',
      expectedSha256: 'sha256',
      language: 'en',
    });
  });
});
