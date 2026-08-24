import * as XLSX from "xlsx";
import { describe, expect, it } from "vitest";
import {
  SpreadsheetImportError,
  XLSX_MIME_TYPE,
  isAmbiguousImportSubmissionError,
  parseSpreadsheetImportFile,
  validateSpreadsheetImportFile,
  type SpreadsheetImportPolicy,
} from "./excelService";

const policy: SpreadsheetImportPolicy = {
  headers: ["nameAr", "nameEn"],
  maxRows: 2,
  maxBytes: 1024 * 1024,
  worksheetIndex: 0,
};

function createWorkbookFile(
  rows: unknown[][],
  configureSheet?: (sheet: XLSX.WorkSheet) => void,
): File {
  const worksheet = XLSX.utils.aoa_to_sheet(rows);
  configureSheet?.(worksheet);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, "Import");
  const bytes = new Uint8Array(
    XLSX.write(workbook, { bookType: "xlsx", type: "array" }),
  );

  return {
    name: "import.xlsx",
    size: bytes.byteLength,
    type: XLSX_MIME_TYPE,
    arrayBuffer: async () => bytes.buffer,
  } as File;
}

async function expectImportError(file: File, code: SpreadsheetImportError["code"]) {
  await expect(parseSpreadsheetImportFile(file, policy)).rejects.toMatchObject({ code });
}

describe("spreadsheet import file validation", () => {
  it("accepts an XLSX file with the canonical MIME type or an empty browser MIME", () => {
    expect(
      validateSpreadsheetImportFile(
        { name: "states.xlsx", size: 20, type: XLSX_MIME_TYPE },
        policy,
      ),
    ).toBeNull();
    expect(
      validateSpreadsheetImportFile(
        { name: "states.xlsx", size: 20, type: "" },
        policy,
      ),
    ).toBeNull();
  });

  it.each([
    [{ name: "states.xls", size: 20, type: XLSX_MIME_TYPE }, "unsupportedExtension"],
    [{ name: "states.xlsx", size: 20, type: "text/plain" }, "unsupportedMime"],
    [{ name: "states.xlsx", size: 0, type: XLSX_MIME_TYPE }, "emptyFile"],
    [{ name: "states.xlsx", size: policy.maxBytes! + 1, type: XLSX_MIME_TYPE }, "fileTooLarge"],
  ] as const)("rejects invalid file metadata with %s", (file, code) => {
    expect(validateSpreadsheetImportFile(file, policy)).toMatchObject({ code });
  });
});

describe("spreadsheet import parsing", () => {
  it("validates row 1 and preserves worksheet row numbers while ignoring blank rows", async () => {
    const result = await parseSpreadsheetImportFile(
      createWorkbookFile([
        ["nameAr", "nameEn"],
        ["القاهرة", "Cairo"],
        [],
        ["الجيزة", "Giza"],
      ]),
      policy,
    );

    expect(result.sheetName).toBe("Import");
    expect(result.rows).toEqual([
      { rowNumber: 2, values: ["القاهرة", "Cairo"] },
      { rowNumber: 4, values: ["الجيزة", "Giza"] },
    ]);
  });

  it.each([
    [["Arabic", "English"], ["invalidHeaders"]],
    [["nameEn", "nameAr"], ["invalidHeaders"]],
    [["NameAr", "nameEn"], ["invalidHeaders"]],
    [["nameAr", "nameAr"], ["duplicateHeaders"]],
  ] as const)("rejects a non-canonical header row", async (headers, [code]) => {
    await expectImportError(createWorkbookFile([[...headers], ["قيمة", "Value"]]), code);
  });

  it("does not discard a headerless first data row", async () => {
    await expectImportError(
      createWorkbookFile([
        ["القاهرة", "Cairo"],
        ["الجيزة", "Giza"],
      ]),
      "invalidHeaders",
    );
  });

  it("rejects renamed text content that is not an XLSX ZIP container", async () => {
    const bytes = new TextEncoder().encode("nameAr,nameEn\nالقاهرة,Cairo");
    const file = {
      name: "renamed.xlsx",
      size: bytes.byteLength,
      type: XLSX_MIME_TYPE,
      arrayBuffer: async () => bytes.buffer,
    } as File;

    await expectImportError(file, "invalidWorkbook");
  });

  it("rejects values outside the canonical columns", async () => {
    await expectImportError(
      createWorkbookFile([
        ["nameAr", "nameEn"],
        ["القاهرة", "Cairo", "unexpected"],
      ]),
      "unexpectedColumns",
    );
  });

  it("rejects formulas instead of trusting cached values", async () => {
    await expectImportError(
      createWorkbookFile(
        [
          ["nameAr", "nameEn"],
          ["القاهرة", "Cairo"],
        ],
        (sheet) => {
          sheet.B2 = { t: "s", v: "Cairo", f: "\"Cairo\"" };
        },
      ),
      "formulaNotAllowed",
    );
  });

  it("stops when the total non-empty row limit is exceeded", async () => {
    await expectImportError(
      createWorkbookFile([
        ["nameAr", "nameEn"],
        ["واحد", "One"],
        ["اثنان", "Two"],
        ["ثلاثة", "Three"],
      ]),
      "rowLimitExceeded",
    );
  });

  it("rejects a header-only workbook as empty", async () => {
    await expectImportError(
      createWorkbookFile([["nameAr", "nameEn"]]),
      "emptyFile",
    );
  });
});

describe("ambiguous spreadsheet submissions", () => {
  it("classifies no-response and server failures as uncertain", () => {
    expect(isAmbiguousImportSubmissionError({ status: 0 })).toBe(true);
    expect(isAmbiguousImportSubmissionError({ status: 500 })).toBe(true);
    expect(isAmbiguousImportSubmissionError({ status: 503 })).toBe(true);
  });

  it("keeps deterministic client conflicts retryable only after correction", () => {
    expect(isAmbiguousImportSubmissionError({ status: 400 })).toBe(false);
    expect(isAmbiguousImportSubmissionError({ status: 409 })).toBe(false);
  });
});
