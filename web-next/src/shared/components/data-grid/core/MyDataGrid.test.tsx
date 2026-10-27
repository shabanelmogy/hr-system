import { renderToStaticMarkup } from "react-dom/server";
import { createTheme, ThemeProvider } from "@mui/material/styles";
import { describe, expect, it, vi } from "vitest";
import { useDataGridShell } from "./context";
import MyDataGrid from "./MyDataGrid";
import { GridFooter } from "../navigation/GridFooter";

const capture = vi.hoisted(() => ({ grid: {} as Record<string, unknown>, shell: {} as Record<string, unknown> }));
vi.mock("./ClientDataGrid", () => ({ default: function MockClientDataGrid(props: Record<string, unknown>) {
  capture.grid = props;
  capture.shell = { ...useDataGridShell() };
  return null;
} }));

describe("MyDataGrid shared composition", () => {
  it("keeps standard footer/navigation while forwarding criteria and empty feedback through its shared context", () => {
    const filters = <span>Source criteria</span>;
    const feedback = <span>Retryable feedback</span>;
    renderToStaticMarkup(<ThemeProvider theme={createTheme()}>
      <MyDataGrid rows={[]} columns={[]} toolbarFilters={filters} emptyContent={feedback} />
    </ThemeProvider>);
    expect(capture.shell.showRecordNavigation).toBe(true);
    expect(capture.shell.toolbarFilters).toBe(filters);
    expect(capture.shell.emptyContent).toBe(feedback);
    expect(capture.grid.showToolbar).toBe(true);
    expect(capture.grid.slots).toMatchObject({ footer: GridFooter, noRowsOverlay: expect.any(Function) });
  });

  it("preserves the library empty overlay when the optional feedback is absent", () => {
    renderToStaticMarkup(<ThemeProvider theme={createTheme()}><MyDataGrid rows={[]} columns={[]} /></ThemeProvider>);
    expect(capture.grid.slots).not.toHaveProperty("noRowsOverlay");
    expect(capture.shell.toolbarFilters).toBeUndefined();
  });
});
