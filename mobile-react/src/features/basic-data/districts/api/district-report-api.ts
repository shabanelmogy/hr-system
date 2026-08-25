import { Platform } from 'react-native';

import { createSensitiveCacheFile } from '@/src/core/storage/sensitive-file-cache';
import {
  crystalReportsApi,
  type CrystalReportListItem,
} from '@/src/features/reporting';

export type DistrictReportInfo = CrystalReportListItem;

export interface GenerateDistrictReportRequest {
  language: 'ar' | 'en';
  nameAr: string;
  nameEn: string;
  stateAr: string;
  stateEn: string;
  report: DistrictReportInfo;
}

export interface GeneratedDistrictReport {
  fileName: string;
  size: number;
  uri: string;
  dispose: () => void;
}

export function buildDistrictRenderFilters(
  nameAr: string,
  nameEn: string,
  stateAr: string,
  stateEn: string,
): Record<string, string> {
  const filters: Record<string, string> = {};
  const values = {
    NameAr: nameAr.trim(),
    NameEn: nameEn.trim(),
    StateAr: stateAr.trim(),
    StateEn: stateEn.trim(),
  };
  Object.entries(values).forEach(([key, value]) => {
    if (value) filters[key] = value;
  });
  return filters;
}

export function getDistrictReportDisplayName(
  report: DistrictReportInfo,
  language: 'ar' | 'en',
): string {
  return (language === 'ar' ? report.summaryTitle : report.summarySubject) || report.displayName;
}

export const districtReportApi = {
  async generate(request: GenerateDistrictReportRequest): Promise<GeneratedDistrictReport> {
    const pdf = await crystalReportsApi.render(request.report.id, {
      language: request.language,
      filters: buildDistrictRenderFilters(
        request.nameAr,
        request.nameEn,
        request.stateAr,
        request.stateEn,
      ),
    });
    const bytes = new Uint8Array(pdf);
    if (!isValidPdf(bytes)) throw new Error('Invalid PDF response.');

    const fileName = `${sanitizeFileName(request.report.displayName)}.pdf`;

    if (Platform.OS === 'web') {
      const uri = URL.createObjectURL(new Blob([pdf], { type: 'application/pdf' }));
      return { fileName, size: pdf.byteLength, uri, dispose: () => URL.revokeObjectURL(uri) };
    }

    const file = createSensitiveCacheFile('preview', fileName);
    file.create({ intermediates: true, overwrite: true });
    file.write(bytes);
    return {
      fileName,
      size: bytes.byteLength,
      uri: file.uri,
      dispose: () => {
        try {
          if (file.exists) file.delete();
        } catch {
          // Cache cleanup is best-effort and must not hide a successful report action.
        }
      },
    };
  },
};

function sanitizeFileName(value: string): string {
  return value.replace(/[\\/:*?"<>|]/g, '_') || 'Districts';
}

function isValidPdf(bytes: Uint8Array): boolean {
  return bytes.length >= 100
    && bytes[0] === 0x25
    && bytes[1] === 0x50
    && bytes[2] === 0x44
    && bytes[3] === 0x46
    && bytes[4] === 0x2d;
}
