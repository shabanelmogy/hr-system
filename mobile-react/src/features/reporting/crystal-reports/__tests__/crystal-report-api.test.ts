import { beforeEach, describe, expect, it, jest } from '@jest/globals';

import { apiService, axiosClient } from '@/src/core/api';

import { crystalReportEndpoints, crystalReportsApi } from '../crystal-report-api';

jest.mock('@/src/core/api', () => ({
  apiService: { get: jest.fn() },
  axiosClient: { post: jest.fn() },
}));

const getMock = apiService.get as jest.MockedFunction<typeof apiService.get>;
const postMock = axiosClient.post as jest.MockedFunction<typeof axiosClient.post>;

const publishedReport = {
  id: '3f2504e0-4f89-11d3-9a0c-0305e82c3301',
  entityKey: 'countries',
  reportKey: 'countries-directory',
  displayName: 'Countries directory',
  summaryTitle: 'دليل الدول',
  summarySubject: 'Countries directory report',
  description: null,
  currentVersionNumber: 2,
  isPublished: true,
  isArchived: false,
  rowVersion: 'AQIDBA==',
  updatedOn: '2026-08-23T10:00:00Z',
};

describe('managed Crystal report API', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('lists the permitted published catalog for the exact feature entity key', async () => {
    getMock.mockResolvedValue([publishedReport]);

    await expect(crystalReportsApi.listPublished('countries')).resolves.toEqual([publishedReport]);
    expect(getMock).toHaveBeenCalledWith(crystalReportEndpoints.base, {
      params: { entityKey: 'countries' },
    });
  });

  it('fails closed when the published catalog does not match the runtime schema', async () => {
    getMock.mockResolvedValue([{ ...publishedReport, id: 'not-a-guid' }]);

    await expect(crystalReportsApi.listPublished('countries')).rejects.toThrow();
  });

  it('renders through the authenticated HR API using the approved binary request', async () => {
    const pdf = Uint8Array.from([0x25, 0x50, 0x44, 0x46, 0x2d]).buffer;
    const request = {
      language: 'en' as const,
      filters: { NameEn: 'Egypt' },
    };
    postMock.mockResolvedValue({ data: pdf });

    await expect(crystalReportsApi.render(publishedReport.id, request)).resolves.toBe(pdf);
    expect(postMock).toHaveBeenCalledWith(
      crystalReportEndpoints.render(publishedReport.id),
      request,
      {
        responseType: 'arraybuffer',
        timeout: 120_000,
        allowWhenReadOnly: true,
        headers: { Accept: 'application/pdf' },
      },
    );
  });
});
