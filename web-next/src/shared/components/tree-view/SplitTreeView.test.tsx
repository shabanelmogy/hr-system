import { renderToStaticMarkup } from "react-dom/server";
import { createTheme, ThemeProvider } from "@mui/material/styles";
import { describe, expect, it } from "vitest";
import SplitTreeView from "./SplitTreeView";

interface TestItem {
  id: number;
  parentId?: number;
  name: string;
  code: string;
}

const sampleItems: TestItem[] = [
  { id: 1, name: "Root Center", code: "CC-ROOT" },
  { id: 2, parentId: 1, name: "Sub Center A", code: "CC-SUB-A" },
  { id: 3, parentId: 1, name: "Sub Center B", code: "CC-SUB-B" },
];

describe("SplitTreeView", () => {
  it("renders tree nodes in tree-list variant with data-tree-list-node-id attributes", () => {
    const html = renderToStaticMarkup(
      <ThemeProvider theme={createTheme()}>
        <SplitTreeView<TestItem>
          items={sampleItems}
          getId={(x) => x.id}
          getParentId={(x) => x.parentId}
          getCode={(x) => x.code}
          getName={(x) => x.name}
          variant="tree-list"
        />
      </ThemeProvider>,
    );

    expect(html).toContain("data-tree-list-node-id=\"1\"");
    expect(html).toContain("data-tree-list-node-id=\"2\"");
    expect(html).toContain("data-tree-list-node-id=\"3\"");
    expect(html).toContain("Root Center");
    expect(html).toContain("Sub Center A");
    expect(html).toContain("Sub Center B");
  });

  it("renders diagram variant with data-tree-node-id when variant is diagram", () => {
    const html = renderToStaticMarkup(
      <ThemeProvider theme={createTheme()}>
        <SplitTreeView<TestItem>
          items={sampleItems}
          getId={(x) => x.id}
          getParentId={(x) => x.parentId}
          variant="diagram"
          renderNode={({ item }) => <div>{item.name} ({item.code})</div>}
        />
      </ThemeProvider>,
    );

    expect(html).toContain("data-tree-node-id=\"1\"");
    expect(html).toContain("data-tree-node-id=\"2\"");
    expect(html).toContain("data-tree-node-id=\"3\"");
    expect(html).toContain("Root Center");
  });

  it("renders the detail panel when selectedId matches an item", () => {
    const html = renderToStaticMarkup(
      <ThemeProvider theme={createTheme()}>
        <SplitTreeView<TestItem>
          items={sampleItems}
          getId={(x) => x.id}
          getParentId={(x) => x.parentId}
          getCode={(x) => x.code}
          getName={(x) => x.name}
          selectedId={2}
          initialDetailPanelOpen={true}
          renderDetailPanel={({ selectedItem }) => (
            <div data-testid="detail-panel">
              <h3>Details for: {selectedItem.name}</h3>
              <p>Code: {selectedItem.code}</p>
            </div>
          )}
        />
      </ThemeProvider>,
    );

    expect(html).toContain("data-testid=\"detail-panel\"");
    expect(html).toContain("Details for: Sub Center A");
    expect(html).toContain("Code: CC-SUB-A");
  });

  it("renders the empty detail panel when no item is selected", () => {
    const html = renderToStaticMarkup(
      <ThemeProvider theme={createTheme()}>
        <SplitTreeView<TestItem>
          items={sampleItems}
          getId={(x) => x.id}
          getParentId={(x) => x.parentId}
          getCode={(x) => x.code}
          getName={(x) => x.name}
          selectedId={null}
          initialDetailPanelOpen={true}
          renderDetailPanel={({ selectedItem }) => <div>{selectedItem.name}</div>}
          renderEmptyDetailPanel={() => <div data-testid="empty-overview">Company Overview</div>}
        />
      </ThemeProvider>,
    );

    expect(html).toContain("data-testid=\"empty-overview\"");
    expect(html).toContain("Company Overview");
  });
});
