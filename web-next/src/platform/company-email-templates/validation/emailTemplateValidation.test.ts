import { describe, expect, it } from "vitest";
import { emailTemplateFormSchema } from "./emailTemplateValidation";
const schema = emailTemplateFormSchema({ subject: "subject", body: "body", action: "action" });
const body = '<p>Hello {FIRST_NAME}</p><p><a href="{ACTION_URL}">Continue</a></p>';
describe("email template local draft validation", () => {
  it("permits real formatted drafts while keeping the mandatory action variable", () => {
    expect(schema.safeParse({ subject: "Hello {FIRST_NAME}", body }).success).toBe(true);
    expect(schema.safeParse({ subject: "مرحبًا", body }).success).toBe(true);
  });
  it("places missing/duplicated action failures under the body field", () => {
    for (const value of ["<p>Hello</p>", body + '{ACTION_URL}']) {
      const result = schema.safeParse({ subject: "Title", body: value });
      expect(result.success).toBe(false);
      if (!result.success) expect(result.error.issues.some(issue => issue.path[0] === "body" && issue.message === "action")).toBe(true);
    }
  });
  it("rejects blank/header-injection/oversized subjects", () => {
    for (const subject of ["", "   ", "Hi\r\nBcc: evil", "x".repeat(201)]) expect(schema.safeParse({ subject, body }).success).toBe(false);
  });
});
