import { fetch } from 'expo/fetch';
import { Platform } from 'react-native';
import { z } from 'zod';

import { requireReportApiUrl } from '@/src/core/config/env';
import { createSensitiveCacheFile } from '@/src/core/storage/sensitive-file-cache';
import { countryReportInfoSchema, type CountryReportInfo } from './country-report-schemas';

export type { CountryReportInfo } from './country-report-schemas';

export interface GenerateCountryReportRequest {
  language: 'ar' | 'en';
  nameAr: string;
  nameEn: string;
  report: CountryReportInfo;
}

export interface GeneratedCountryReport {
  fileName: string;
  size: number;
  uri: string;
  dispose: () => void;
}

const defaultHeaders = {
  'Content-Type': 'application/json',
  'X-ApiKey': 'company',
} as const;

export const defaultCountryReport: CountryReportInfo = {
  Id: 'Countries',
  ReportPath: 'Reports/Countries',
  Title: 'الدول',
  Subject: 'Countries',
};

export const countryReportApi = {
  async getCatalog(language: 'ar' | 'en'): Promise<CountryReportInfo[]> {
    const response = await fetch(buildReportUrl('report/info'), {
      method: 'POST',
      headers: reportHeaders(language),
      body: JSON.stringify({ subFolderPath: 'Countries', reportCategory: 'Countries' }),
    });
    await ensureSuccess(response);
    const reports = z.array(countryReportInfoSchema).parse(await response.json());
    return [...reports].sort((left, right) =>
      left.Id === defaultCountryReport.Id ? -1 : right.Id === defaultCountryReport.Id ? 1 : 0);
  },

  async generate(request: GenerateCountryReportRequest): Promise<GeneratedCountryReport> {
    const response = await fetch(buildReportUrl('report/generate'), {
      method: 'POST',
      headers: reportHeaders(request.language),
      body: JSON.stringify({
        Lang: request.language,
        LogoName: 'Logo1.jpg',
        ExportFilename: 'Countries',
        ReportPath: request.report.ReportPath,
        ReportFileName: request.report.Id,
        NameAr: optionalValue(request.nameAr),
        NameEn: optionalValue(request.nameEn),
      }),
    });
    await ensureSuccess(response);

    const contentType = response.headers.get('content-type')?.toLowerCase() ?? '';
    const fileName = `${sanitizeFileName(request.report.Id)}.pdf`;

    if (Platform.OS === 'web') {
      const blob = await response.blob();
      if (!isValidPdf(contentType, blob.size)) throw new Error('Invalid PDF response.');
      const uri = URL.createObjectURL(blob);
      return { fileName, size: blob.size, uri, dispose: () => URL.revokeObjectURL(uri) };
    }

    const bytes = await response.bytes();
    if (!isValidPdf(contentType, bytes.byteLength, bytes)) {
      throw new Error('Invalid PDF response.');
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

function buildReportUrl(path: string): string {
  return `${requireReportApiUrl()}/${path.replace(/^\/+/, '')}`;
}

function reportHeaders(language: 'ar' | 'en'): Record<string, string> {
  return { ...defaultHeaders, Culture: language };
}

async function ensureSuccess(response: Response): Promise<void> {
  if (response.ok) return;
  let message = `Request failed with status ${response.status}`;
  try {
    const payload: unknown = await response.json();
    if (payload && typeof payload === 'object' && 'message' in payload) {
      const candidate = (payload as { message?: unknown }).message;
      if (typeof candidate === 'string' && candidate.trim()) message = candidate;
    }
  } catch {
    // Keep the stable HTTP fallback when the service does not return JSON.
  }
  throw new Error(message);
}

function optionalValue(value: string): string | null {
  const normalized = value.trim();
  return normalized || null;
}

function sanitizeFileName(value: string): string {
  return value.replace(/[\\/:*?"<>|]/g, '_') || 'Countries';
}

function isValidPdf(contentType: string, size: number, bytes?: Uint8Array): boolean {
  if (size < 100) return false;
  if (contentType.includes('application/pdf')) return true;
  return Boolean(bytes
    && bytes.length >= 5
    && bytes[0] === 0x25
    && bytes[1] === 0x50
    && bytes[2] === 0x44
    && bytes[3] === 0x46
    && bytes[4] === 0x2d);
}
