import { describe, expect, it } from "vitest";

import { parseFileItems } from "./fileService";

const fileResponse = {
  id: "01234567-89ab-cdef-0123-456789abcdef",
  fileName: "invoice.pdf",
  storedFileName: "invoice-01234567.pdf",
  contentType: "application/pdf",
  fileExtension: ".pdf",
  createdOn: "2026-09-15T09:00:00Z",
  createdByPc: "WEB",
  createdById: "user-1",
  isDeleted: false,
};

describe("file response contract", () => {
  it("accepts the current Platform file DTO with a string GUID id", () => {
    expect(parseFileItems([fileResponse])).toEqual([fileResponse]);
  });

  it("rejects legacy numeric ids and missing required response fields", () => {
    expect(() => parseFileItems([{ ...fileResponse, id: 42 }])).toThrow(
      "Invalid file response",
    );
    const missingCreatedBy: Partial<typeof fileResponse> = { ...fileResponse };
    delete missingCreatedBy.createdById;
    expect(() => parseFileItems([missingCreatedBy])).toThrow("Invalid file response");
  });
});
