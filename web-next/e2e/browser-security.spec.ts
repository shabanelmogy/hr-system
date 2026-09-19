import { expect, test } from "@playwright/test";

const isCi = Boolean(process.env.CI);

test("production browser-security headers remain enforced", async ({ request }) => {
  const response = await request.get("/login");
  expect(response.ok()).toBeTruthy();

  const headers = response.headers();
  const csp = headers["content-security-policy"];

  expect(csp).toBeTruthy();
  expect(headers["content-security-policy-report-only"]).toBeUndefined();
  expect(csp).toContain("default-src 'self'");
  expect(csp).toContain("object-src 'none'");
  expect(headers["x-content-type-options"]).toBe("nosniff");
  expect(headers["x-frame-options"]).toBe("SAMEORIGIN");
  expect(headers["referrer-policy"]).toBe("strict-origin-when-cross-origin");
  expect(headers["permissions-policy"]).toContain("camera=()");
  expect(headers["cross-origin-opener-policy"]).toBe("same-origin-allow-popups");
  expect(headers["strict-transport-security"]).toContain("max-age=31536000");

  if (isCi) {
    expect(csp).not.toContain("'unsafe-eval'");
    expect(csp).toContain("upgrade-insecure-requests");
  }
});
