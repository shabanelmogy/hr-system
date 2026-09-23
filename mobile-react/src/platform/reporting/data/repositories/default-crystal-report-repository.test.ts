import type { CrystalReportRemoteDataSource } from '../remote/crystal-report-remote-data-source';
import { DefaultCrystalReportRepository } from './default-crystal-report-repository';

function remoteMock(): jest.Mocked<CrystalReportRemoteDataSource> {
  return {
    listPublished: jest.fn(),
    render: jest.fn(),
    listGlobal: jest.fn(),
    renderGlobal: jest.fn(),
  };
}

describe('DefaultCrystalReportRepository', () => {
  it('delegates reporting operations while online', async () => {
    const remote = remoteMock();
    remote.listPublished.mockResolvedValue([]);
    remote.listGlobal.mockResolvedValue([]);
    const repository = new DefaultCrystalReportRepository(remote, () => true);

    await expect(repository.listPublished('countries')).resolves.toEqual([]);
    expect(remote.listPublished).toHaveBeenCalledWith('countries');
    await expect(repository.listGlobal('countries')).resolves.toEqual([]);
    expect(remote.listGlobal).toHaveBeenCalledWith('countries');
  });

  it('fails closed while offline', () => {
    const remote = remoteMock();
    const repository = new DefaultCrystalReportRepository(remote, () => false);

    expect(() => repository.render('report-id', { language: 'en' }))
      .toThrow('requires an internet connection');
    expect(remote.render).not.toHaveBeenCalled();
    expect(() => repository.renderGlobal('source-id', {
      entityKey: 'countries',
      expectedSha256: 'sha256',
      language: 'en',
    })).toThrow('requires an internet connection');
    expect(remote.renderGlobal).not.toHaveBeenCalled();
  });
});
