import type { GlobalTemplateDetail, GlobalTemplateViewerSource } from '../types/global-template';

async function sha256(value: string): Promise<string> {
  const bytes = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(value));
  return Array.from(new Uint8Array(bytes), (byte) => byte.toString(16).padStart(2, '0')).join('');
}

/** Matches the existing IGlobalCrystalReportIdentity SourceId/Token wire contract. */
export async function matchesGlobalTemplateViewer(
  detail: GlobalTemplateDetail,
  source: GlobalTemplateViewerSource,
  fingerprint: string,
): Promise<boolean> {
  if (
    detail.entityKey !== source.entityKey ||
    detail.reportKey !== source.reportKey ||
    !detail.isPublished ||
    detail.isArchived
  )
    return false;
  const published = detail.versions.find(
    (version) => version.isPublished && version.versionNumber === detail.currentVersionNumber,
  );
  if (
    !published ||
    published.validationStatus !== 'Valid' ||
    published.validationContractFingerprint !== fingerprint
  )
    return false;
  const [id, token] = await Promise.all([
    sha256('managed-global\n' + detail.id.replaceAll('-', '').toLowerCase()),
    sha256(
      published.id.replaceAll('-', '').toLowerCase() + '\n' + fingerprint + '\n' + published.sha256,
    ),
  ]);
  return id === source.id && token === source.rowVersion;
}
