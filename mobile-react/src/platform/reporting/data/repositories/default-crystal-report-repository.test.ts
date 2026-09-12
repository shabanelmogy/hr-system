import type { CrystalReportRemoteDataSource } from '../remote/crystal-report-remote-data-source';
import { DefaultCrystalReportRepository } from './default-crystal-report-repository';

function remoteMock(): jest.Mocked<CrystalReportRemoteDataSource> {
  return {
    listPublished: jest.fn(),
    render: jest.fn(),
  };
}

describe('DefaultCrystalReportRepository', () => {
  it('delegates reporting operations while online', async () => {
    const remote = remoteMock();
    remote.listPublished.mockResolvedValue([]);
    const repository = new DefaultCrystalReportRepository(remote, () => true);

    await expect(repository.listPublished('countries')).resolves.toEqual([]);
    expect(remote.listPublished).toHaveBeenCalledWith('countries');
  });

  it('fails closed while offline', () => {
    const remote = remoteMock();
    const repository = new DefaultCrystalReportRepository(remote, () => false);

    expect(() => repository.render('report-id', { language: 'en' }))
      .toThrow('requires an internet connection');
    expect(remote.render).not.toHaveBeenCalled();
  });
});
