import CloudUploadOutlined from "@mui/icons-material/CloudUploadOutlined";
import { createTheme, ThemeProvider } from "@mui/material/styles";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";
import { FileDropZone } from "./FileDropZone";

describe("FileDropZone", () => {
  it("renders an accessible file selector with normalized accepted types", () => {
    const html = renderToStaticMarkup(
      <ThemeProvider theme={createTheme()}>
        <FileDropZone
          title="Select documents"
          description="Drop documents here"
          accept={["application/pdf", ".docx"]}
          multiple
          icon={<CloudUploadOutlined />}
          onFilesSelected={vi.fn()}
        />
      </ThemeProvider>,
    );

    expect(html).toContain('role="button"');
    expect(html).toContain('aria-label="Select documents"');
    expect(html).toContain('accept="application/pdf,.docx"');
    expect(html).toContain("Select documents");
    expect(html).toContain("Drop documents here");
  });
});

