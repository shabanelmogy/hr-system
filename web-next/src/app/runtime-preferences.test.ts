import { describe, expect, it } from "vitest";
import {
  DEFAULT_RUNTIME_PREFERENCES,
  reconcileRuntimePreferences,
  resolveRuntimePreferences,
} from "./runtime-preferences";

const cookieSource = (values: Record<string, string>) => ({
  get(name: string) {
    const value = values[name];
    return value === undefined ? undefined : { value };
  },
});

describe("runtime preferences", () => {
  it("defaults to English and light mode", () => {
    expect(resolveRuntimePreferences(cookieSource({}))).toEqual(
      DEFAULT_RUNTIME_PREFERENCES,
    );
  });

  it("restores Arabic RTL dark preferences from cookies", () => {
    expect(resolveRuntimePreferences(cookieSource({
      i18next: "ar",
      currentMode: "dark",
    }))).toEqual({
      language: "ar",
      direction: "rtl",
      themeMode: "dark",
    });
  });

  it("ignores unsupported cookie values", () => {
    expect(resolveRuntimePreferences(cookieSource({
      i18next: "fr",
      currentMode: "system",
    }))).toEqual({
      language: "en",
      direction: "ltr",
      themeMode: "light",
    });
  });

  it("prefers newer browser cookies over a stale streamed server snapshot", () => {
    expect(reconcileRuntimePreferences(
      { language: "en", direction: "ltr", themeMode: "light" },
      "i18next=ar; currentMode=dark",
    )).toEqual({
      language: "ar",
      direction: "rtl",
      themeMode: "dark",
    });
  });

  it("falls back to the streamed preferences when client cookies are absent", () => {
    expect(reconcileRuntimePreferences(
      { language: "ar", direction: "rtl", themeMode: "dark" },
      "unrelated=value",
    )).toEqual({
      language: "ar",
      direction: "rtl",
      themeMode: "dark",
    });
  });
});
