import { renderToStaticMarkup } from "react-dom/server";
import { createTheme, ThemeProvider } from "@mui/material/styles";
import { Grid } from "@mui/material";
import { describe, expect, it, vi } from "vitest";
import CardViewHeader from "./CardViewHeader";
import MySelect from "../../forms/selects/MySelect";

vi.mock("react-i18next", () => ({ useTranslation: () => ({ t: (key: string) => key }) }));

const base = {
  title: "Error criteria", mainChipLabel: "31", page: 0, compact: true, showTitleSection: false,
  searchTerm: "", searchPlaceholder: "Search errors", onSearchChange: vi.fn(), onClearSearch: vi.fn(), onReset: vi.fn(),
};

function render(header: React.ReactNode) {
  return renderToStaticMarkup(<ThemeProvider theme={createTheme()}>{header}</ThemeProvider>);
}

describe("CardViewHeader criteria composition", () => {
  it("allows a fixed server order without sort callbacks or inert sorting controls", () => {
    const html = render(<CardViewHeader {...base} showSort={false} showFilter={false}
      filterControls={<Grid size={12}><span>Domain date criteria</span></Grid>} />);
    expect(html).toContain("Search errors");
    expect(html).toContain("general.reset");
    expect(html).toContain("Domain date criteria");
    expect(html).not.toContain("general.sortBy");
    expect(html).not.toContain("general.filter");
  });

  it("preserves existing sorting and filter controls by default", () => {
    const html = render(<CardViewHeader {...base} sortBy="name" sortByOptions={[{ value: "name", label: "Name" }]}
      onSortByChange={vi.fn()} sortOrder="asc" onSortOrderChange={vi.fn()}
      filterBy="all" filterOptions={[{ value: "all", label: "All" }]} onFilterByChange={vi.fn()} />);
    expect(html).toContain("general.sortBy");
    expect(html).toContain("general.filter");
    expect(html).toContain("Search errors");
    expect(render(<CardViewHeader {...base} showSort={false} showFilter={false}
      filterBy="all" filterOptions={[]} onFilterByChange={vi.fn()} />)).not.toContain("general.filter");
  });

  it("opts a shared selector into compact sizing while preserving its default", () => {
    const select = { all: false, selectedItem: "all", label: "Source", valueMember: "value" as const,
      displayMember: "label" as const, dataSource: [{ value: "all", label: "All" }], handleSelectionChange: vi.fn() };
    const compactClass = /class="[^"]*\bMuiInputBase-sizeSmall\b/;
    expect(render(<MySelect {...select} size="small" />)).toMatch(compactClass);
    expect(render(<MySelect {...select} />)).not.toMatch(compactClass);
  });
});
