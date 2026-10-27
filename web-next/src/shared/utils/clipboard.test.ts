import { afterEach, describe, expect, it, vi } from "vitest";
import { copyText } from "./clipboard";

afterEach(() => { vi.unstubAllGlobals(); });
function fallback(command: () => boolean) {
  class Element { focus = vi.fn(); }
  const active = new Element();
  const textarea = { value: "", readOnly: false, tabIndex: 0, style: { position: "", opacity: "" }, focus: vi.fn(), select: vi.fn(), remove: vi.fn() };
  const execCommand = vi.fn(command);
  vi.stubGlobal("navigator", {});
  vi.stubGlobal("HTMLElement", Element);
  vi.stubGlobal("document", { activeElement: active, createElement: () => textarea, body: { appendChild: vi.fn() }, execCommand });
  return { active, textarea, execCommand };
}
describe("shared clipboard", () => {
  it("copies complete Unicode multiline text through the clipboard API", async () => {
    const writeText = vi.fn().mockResolvedValue(undefined);
    vi.stubGlobal("navigator", { clipboard: { writeText } });
    const value = "رسالة الخطأ\nLong.Type.Method\ntrace-id";
    await copyText(value);
    expect(writeText).toHaveBeenCalledWith(value);
  });
  it("propagates permission rejection so the action can show failure", async () => {
    vi.stubGlobal("navigator", { clipboard: { writeText: vi.fn().mockRejectedValue(new Error("Denied")) } });
    await expect(copyText("message")).rejects.toThrow("Denied");
  });
  it("keeps the legacy fallback and restores focus", async () => {
    const { active, textarea, execCommand } = fallback(() => true);
    await copyText("Full message");
    expect(textarea.value).toBe("Full message");
    expect(execCommand).toHaveBeenCalledWith("copy");
    expect(textarea.remove).toHaveBeenCalledOnce();
    expect(active.focus).toHaveBeenCalledWith({ preventScroll: true });
  });
  it("cleans up the fallback even if the browser throws", async () => {
    const { textarea, active } = fallback(() => { throw new Error("Blocked"); });
    await expect(copyText("message")).rejects.toThrow("Blocked");
    expect(textarea.remove).toHaveBeenCalledOnce();
    expect(active.focus).toHaveBeenCalledOnce();
  });
});
