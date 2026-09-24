import { renderToStaticMarkup } from "react-dom/server";
import { createTheme, ThemeProvider } from "@mui/material/styles";
import { describe, expect, it, vi } from "vitest";
import CostCenterTreeDiagram from "./CostCenterTreeDiagram";

const capture: { props: Record<string, unknown> | null } = { props: null };

vi.mock("react-i18next", () => ({
  useTranslation: () => ({
    i18n: { language: "en" },
    t: (key: string) => key,
  }),
}));

vi.mock("../../hooks/useOrganizationalStructure", () => ({
  useOrganizationalLookup: () => ({ data: [] }),
}));

vi.mock("@/shared/components/tree-view", () => ({
  SplitTreeView: (props: Record<string, unknown>) => {
    capture.props = props;
    return <div data-testid="cost-center-tree" />;
  },
}));

const items = [
  { id: 1, code: "CC-ROOT", nameEn: "Root", nameAr: "الجذر", parentCostCenterId: null, isDeleted: false },
  { id: 2, code: "CC-CHILD", nameEn: "Child", nameAr: "فرعي", parentCostCenterId: 1, isDeleted: false },
  { id: 3, code: "CC-ARCHIVED", nameEn: "Archived", nameAr: "مؤرشف", parentCostCenterId: null, isDeleted: true },
] as never[];

describe("CostCenterTreeDiagram feature composition", () => {
  it("maps cost-center hierarchy and action permissions into SplitTreeView", () => {
    const onReparent = vi.fn(async () => undefined);
    const onAddChild = vi.fn();
    const onEdit = vi.fn();

    renderToStaticMarkup(
      <ThemeProvider theme={createTheme()}>
        <CostCenterTreeDiagram
          items={items}
          loading={false}
          onAddChild={onAddChild}
          onEdit={onEdit}
          onReparent={onReparent}
          permissions={{ canCreate: true, canEdit: true, canDelete: true }}
        />
      </ThemeProvider>,
    );

    expect(capture.props).not.toBeNull();
    expect(capture.props?.items).toEqual(items.slice(0, 2));
    expect((capture.props?.getParentId as (item: typeof items[number]) => number | null)(items[1])).toBe(1);
    expect(capture.props?.selectedId).toBeNull();
    expect(capture.props?.canDrag).toBe(true);
    expect(capture.props?.onAddChild).toBeTypeOf("function");
    expect(capture.props?.onMove).toBeTypeOf("function");
    expect(capture.props?.onReparent).toBeTypeOf("function");
    expect(capture.props?.onEdit).toBe(onEdit);
  });

  it("removes drag and mutation actions when editing is not allowed", () => {
    renderToStaticMarkup(
      <ThemeProvider theme={createTheme()}>
        <CostCenterTreeDiagram
          items={items}
          onEdit={vi.fn()}
          onReparent={vi.fn(async () => undefined)}
          permissions={{ canCreate: false, canEdit: false, canDelete: false }}
        />
      </ThemeProvider>,
    );

    expect(capture.props?.canDrag).toBe(false);
    expect(capture.props?.onAddChild).toBeUndefined();
    expect(capture.props?.onMove).toBeUndefined();
    expect(capture.props?.onReparent).toBeTypeOf("function");
  });
});
