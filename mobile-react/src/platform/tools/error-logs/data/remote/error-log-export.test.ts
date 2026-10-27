import * as Sharing from 'expo-sharing';
import { File, Paths } from 'expo-file-system';
import { apiService } from '@/src/core/api';
import { createSensitiveCacheFile } from '@/src/core/storage/sensitive-file-cache';
import { errorLogRemoteDataSource } from './error-log-remote-data-source';

jest.mock('@/src/core/api', () => ({ apiService: { get: jest.fn(), put: jest.fn() } }));
jest.mock('expo-sharing', () => ({ isAvailableAsync: jest.fn(), shareAsync: jest.fn() }));
jest.mock('@/src/core/storage/sensitive-file-cache', () => ({ createSensitiveCacheFile: jest.fn() }));

describe('scoped native XLSX export', () => {
  const file = new File(Paths.cache, 'error-logs.xlsx');
  beforeEach(() => {
    jest.clearAllMocks();
    jest.mocked(apiService.get).mockResolvedValue(new Uint8Array([0x50, 0x4b, 0x03, 0x04]).buffer);
    jest.mocked(Sharing.isAvailableAsync).mockResolvedValue(true);
    jest.mocked(Sharing.shareAsync).mockResolvedValue(undefined);
    jest.spyOn(file, 'write').mockImplementation(() => undefined);
    jest.spyOn(file, 'delete').mockImplementation(() => undefined);
    jest.spyOn(file, 'exists', 'get').mockReturnValue(true);
    jest.mocked(createSensitiveCacheFile).mockReturnValue(file);
  });
  it('uses the authenticated API context, active filters and XLSX sharing type, then deletes the file', async () => {
    await errorLogRemoteDataSource.export('company', { page: 1, pageSize: 10, source: 'mobile' });
    expect(apiService.get).toHaveBeenCalledWith('error-logs/export', { params: { page: 1, pageSize: 10, source: 'mobile' }, responseType: 'arraybuffer' });
    expect(createSensitiveCacheFile).toHaveBeenCalledWith('download', 'error-logs-company.xlsx');
    expect(file.write).toHaveBeenCalledWith(new Uint8Array([0x50, 0x4b, 0x03, 0x04]));
    expect(Sharing.shareAsync).toHaveBeenCalledWith(file.uri, { mimeType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', UTI: 'org.openxmlformats.spreadsheetml.sheet' });
    expect(file.delete).toHaveBeenCalledTimes(1);
  });
  it('cleans temporary diagnostics even when native sharing fails', async () => {
    jest.mocked(Sharing.shareAsync).mockRejectedValue(new Error('unavailable'));
    await expect(errorLogRemoteDataSource.export('system', { page: 1, pageSize: 10 })).rejects.toThrow();
    expect(file.delete).toHaveBeenCalledTimes(1);
  });
  it('rejects a malformed response before writing or sharing a file', async () => {
    jest.mocked(apiService.get).mockResolvedValue({ message: 'not a spreadsheet' });
    await expect(errorLogRemoteDataSource.export('company', { page: 1, pageSize: 10 })).rejects.toThrow();
    expect(createSensitiveCacheFile).not.toHaveBeenCalled();
    expect(Sharing.shareAsync).not.toHaveBeenCalled();
  });
});
