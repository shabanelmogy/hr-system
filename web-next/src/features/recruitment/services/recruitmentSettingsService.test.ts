import { describe, it, expect, beforeEach } from "vitest";
import {
  recruitmentSettingsService,
  DEFAULT_STAGES,
  DEFAULT_REASONS,
  DEFAULT_SOURCES,
  DEFAULT_CRITERIA,
  DEFAULT_GENERAL_SETTINGS,
} from "./recruitmentSettingsService";

describe("recruitmentSettingsService", () => {
  beforeEach(() => {
    recruitmentSettingsService.resetAll();
  });

  it("provides valid default recruitment stages with sequence order", () => {
    const stages = recruitmentSettingsService.getStages();
    expect(stages.length).toBeGreaterThanOrEqual(6);

    // Verify first stage is default and has sequence 10
    expect(stages[0].nameEn).toBe("Applied");
    expect(stages[0].sequence).toBe(10);
    expect(stages[0].isDefault).toBe(true);

    // Verify sequences are strictly increasing
    for (let i = 1; i < stages.length; i++) {
      expect(stages[i].sequence).toBeGreaterThan(stages[i - 1].sequence);
    }
  });

  it("persists updated stages correctly", () => {
    const customStages = [
      ...DEFAULT_STAGES,
      {
        id: "stage_custom_test",
        nameAr: "اختبار مخصص",
        nameEn: "Custom Test",
        sequence: 45,
        color: "#123456",
        foldedInKanban: false,
        isDefault: false,
        sendEmailNotification: true,
        mappedStatus: 5,
      },
    ];

    recruitmentSettingsService.saveStages(customStages);
    const retrieved = recruitmentSettingsService.getStages();
    expect(retrieved.length).toBe(DEFAULT_STAGES.length + 1);
    expect(retrieved.some((s) => s.id === "stage_custom_test")).toBe(true);
  });

  it("provides comprehensive rejection reasons covering standard categories", () => {
    const reasons = recruitmentSettingsService.getRejectionReasons();
    expect(reasons.length).toBeGreaterThanOrEqual(5);

    const categories = reasons.map((r) => r.category);
    expect(categories).toContain("salary");
    expect(categories).toContain("qualifications");
    expect(categories).toContain("behavioral");
    expect(categories).toContain("candidate_withdrew");

    // All reasons with auto email have template text
    const withEmail = reasons.filter((r) => r.sendAutoEmail);
    expect(withEmail.length).toBeGreaterThan(0);
    withEmail.forEach((r) => {
      expect(r.emailBodyAr).toBeDefined();
      expect(r.emailSubjectAr).toBeDefined();
    });
  });

  it("provides sourcing channels with valid metrics", () => {
    const sources = recruitmentSettingsService.getSources();
    expect(sources.length).toBeGreaterThanOrEqual(4);

    const activeSources = sources.filter((s) => s.isActive);
    expect(activeSources.length).toBeGreaterThan(0);

    sources.forEach((s) => {
      expect(s.applicationsCount).toBeGreaterThanOrEqual(s.hiredCount);
    });
  });

  it("provides balanced evaluation criteria with 100% total weight", () => {
    const criteria = recruitmentSettingsService.getCriteria();
    expect(criteria.length).toBeGreaterThanOrEqual(4);

    const totalWeight = criteria.reduce((sum, c) => sum + c.weight, 0);
    expect(totalWeight).toBe(100);

    const mandatory = criteria.filter((c) => c.isMandatory);
    expect(mandatory.length).toBeGreaterThan(0);
  });

  it("manages general recruitment governance settings", () => {
    const defaultSettings = recruitmentSettingsService.getGeneralSettings();
    expect(defaultSettings.defaultCurrency).toBe("EGP");
    expect(defaultSettings.offerExpiryDays).toBe(7);
    expect(defaultSettings.autoPublishOpening).toBe(true);
    expect(defaultSettings.enforceHeadcountCapacity).toBe(true);

    recruitmentSettingsService.saveGeneralSettings({
      ...defaultSettings,
      defaultCurrency: "SAR",
      offerExpiryDays: 14,
    });

    const updated = recruitmentSettingsService.getGeneralSettings();
    expect(updated.defaultCurrency).toBe("SAR");
    expect(updated.offerExpiryDays).toBe(14);
  });
});
