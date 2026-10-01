import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";
import { CrystalReportVersionList } from "./CrystalReportVersionList";
import type { CrystalReportVersion } from "./types";

vi.mock("react-i18next", () => ({
  useTranslation: () => ({ t: (key: string) => key }),
}));

const baseVersion: CrystalReportVersion = {
  id: "22222222-2222-2222-2222-222222222222",
  versionNumber: 1,
  originalFileName: "Countries.rpt",
  size: 8_704,
  sha256: "b".repeat(64),
  summaryTitle: "Country Summary",
  summarySubject: "Countries data",
  validationStatus: "Valid",
  validationReason: null,
  validationContractSchemaVersion: 1,
  validationContractFingerprint: "4d7511139871f7f745560191fafb51a4ccdf963a41740d8cc14ba1b07769573c",
  isPublished: false,
  createdOn: "2026-09-14T00:00:00Z",
};

const actions = {
  onDownload: vi.fn(),
  onRevalidate: vi.fn(),
  onPublish: vi.fn(),
};

describe("CrystalReportVersionList", () => {
  it("shows recovery guidance and a revalidation action for a stale active version", () => {
    const version = { ...baseVersion, validationStatus: "NeedsRevalidation" as const };
    const html = renderToStaticMarkup(
      <CrystalReportVersionList
        versions={[version]}
        reportArchived={false}
        canDownloadVersion
        canUpload
        canPublish
        locked={false}
        {...actions}
      />,
    );

    expect(html).toContain("crystalReports.validationStates.NeedsRevalidation");
    expect(html).toContain("crystalReports.publishRequiresValid");
    expect(html).toContain("crystalReports.revalidate");
    expect(html).toContain("crystalReports.publish");
  });

  it("removes every mutable version action for an archived report", () => {
    const html = renderToStaticMarkup(
      <CrystalReportVersionList
        versions={[baseVersion]}
        reportArchived
        canDownloadVersion
        canUpload
        canPublish
        locked={false}
        {...actions}
      />,
    );

    expect(html).not.toContain("crystalReports.revalidate");
    expect(html).not.toContain("crystalReports.publish");
    expect(html).not.toContain("crystalReports.download");
  });
});
