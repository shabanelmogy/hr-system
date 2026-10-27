import { beforeEach, describe, expect, it, vi } from "vitest";
const api = vi.hoisted(() => ({ get: vi.fn(), post: vi.fn(), put: vi.fn() }));
vi.mock("@/shared/services", () => ({ apiService: api }));
import { getEmailTemplates, previewEmailTemplate, resetEmailTemplate, saveEmailTemplate } from "./emailTemplateService";
describe("email template transport", () => {
  beforeEach(() => vi.clearAllMocks());
  it("validates catalog responses and sends server criteria without a client scope", async () => {
    api.get.mockResolvedValue({ items: [], totalCount: 0, page: 1, pageSize: 10, revision: 2 });
    const criteria = { language: "ar" as const, search: "name", status: "all" as const, page: 1, pageSize: 10 };
    expect((await getEmailTemplates(criteria)).revision).toBe(2);
    expect(api.get.mock.calls[0][1]).toEqual(criteria);
    api.get.mockResolvedValue({ items: "invalid" });
    await expect(getEmailTemplates(criteria)).rejects.toThrow();
  });
  it("previews only draft content, preserves revisions and exposes no send operation", async () => {
    api.post.mockResolvedValue({ subject: "Sample", html: "<p>Sample</p>", text: "Sample" });
    const draft = { subject: "Subject", body: '<a href="{ACTION_URL}">Continue</a>' };
    await previewEmailTemplate("password-reset", "en", draft);
    expect(api.post.mock.calls[0][1]).toEqual({ language: "en", ...draft });
    await saveEmailTemplate("password-reset", { language: "en", ...draft, expectedRevision: 7 });
    expect(api.put.mock.calls[0][1].expectedRevision).toBe(7);
    await resetEmailTemplate("password-reset", "en", 8);
    expect(api.post.mock.calls[1][0]).toMatch(/password-reset\/reset$/);
  });
});
