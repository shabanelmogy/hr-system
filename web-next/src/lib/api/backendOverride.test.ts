import { afterEach, describe, expect, it, vi } from "vitest";
import {
  BACKEND_OVERRIDE_COOKIE,
  BACKEND_OVERRIDE_HEADER,
  clearBackendOverride,
  getStoredBackendOverride,
  normalizeBackendUrl,
  saveBackendOverride,
} from "./backendOverride";

function createStorageStub() {
  const entries = new Map<string, string>();
  return {
    getItem: (key: string) => (entries.has(key) ? entries.get(key)! : null),
    setItem: (key: string, value: string) => {
      entries.set(key, String(value));
    },
    removeItem: (key: string) => {
      entries.delete(key);
    },
    clear: () => entries.clear(),
  };
}

function createDocumentStub() {
  const jar = new Map<string, string>();
  return {
    get cookie() {
      return [...jar.entries()].map(([name, value]) => `${name}=${value}`).join("; ");
    },
    set cookie(value: string) {
      const pair = value.split(";")[0] ?? "";
      const separatorIndex = pair.indexOf("=");
      const name = pair.slice(0, separatorIndex).trim();
      const cookieValue = pair.slice(separatorIndex + 1);
      if (/max-age=0\b/.test(value)) {
        jar.delete(name);
        return;
      }
      jar.set(name, cookieValue);
    },
  };
}

describe("normalizeBackendUrl", () => {
  it("accepts absolute http(s) URLs and trims trailing slashes", () => {
    expect(normalizeBackendUrl("https://localhost:7037/")).toBe("https://localhost:7037");
    expect(normalizeBackendUrl("  http://api.example.test/// ")).toBe("http://api.example.test");
  });

  it("rejects invalid values", () => {
    expect(normalizeBackendUrl("not-a-url")).toBeNull();
    expect(normalizeBackendUrl("ftp://api.example.test")).toBeNull();
    expect(normalizeBackendUrl(42)).toBeNull();
    expect(normalizeBackendUrl("   ")).toBeNull();
  });
});

describe("storage-backed override", () => {
  it("returns null outside the browser", () => {
    vi.stubGlobal("window", undefined);
    expect(getStoredBackendOverride()).toBeNull();
    expect(saveBackendOverride("https://api.example.test")).toBeNull();
    expect(() => clearBackendOverride()).not.toThrow();
  });

  it("persists a valid URL to localStorage and cookie", () => {
    vi.stubGlobal("window", { localStorage: createStorageStub() });
    const documentStub = createDocumentStub();
    vi.stubGlobal("document", documentStub);

    const saved = saveBackendOverride("https://demo.example.test/");
    expect(saved).toBe("https://demo.example.test");
    expect(getStoredBackendOverride()).toBe("https://demo.example.test");
    expect(documentStub.cookie).toBe(
      `${BACKEND_OVERRIDE_COOKIE}=${encodeURIComponent("https://demo.example.test")}`,
    );
  });

  it("rejects invalid URLs without touching storage", () => {
    const storage = createStorageStub();
    vi.stubGlobal("window", { localStorage: storage });
    vi.stubGlobal("document", createDocumentStub());

    expect(saveBackendOverride("nope")).toBeNull();
    expect(storage.getItem("hrms.backendUrl")).toBeNull();
    expect(getStoredBackendOverride()).toBeNull();
  });

  it("clears both storage and cookie", () => {
    const storage = createStorageStub();
    vi.stubGlobal("window", { localStorage: storage });
    const documentStub = createDocumentStub();
    vi.stubGlobal("document", documentStub);

    saveBackendOverride("https://demo.example.test");
    clearBackendOverride();

    expect(getStoredBackendOverride()).toBeNull();
    expect(documentStub.cookie.includes(BACKEND_OVERRIDE_COOKIE)).toBe(false);
  });

  it("keeps working when localStorage throws", () => {
    vi.stubGlobal("window", {
      localStorage: {
        getItem: () => {
          throw new Error("blocked");
        },
        setItem: () => {
          throw new Error("blocked");
        },
        removeItem: () => {
          throw new Error("blocked");
        },
      },
    });
    const documentStub = createDocumentStub();
    vi.stubGlobal("document", documentStub);

    expect(saveBackendOverride("https://demo.example.test")).toBe("https://demo.example.test");
    expect(documentStub.cookie).toContain(BACKEND_OVERRIDE_COOKIE);
    expect(() => clearBackendOverride()).not.toThrow();
    expect(documentStub.cookie.includes(BACKEND_OVERRIDE_COOKIE)).toBe(false);
  });
});

describe("constants", () => {
  it("exposes the wire header name", () => {
    expect(BACKEND_OVERRIDE_HEADER).toBe("x-backend-url");
  });
});
