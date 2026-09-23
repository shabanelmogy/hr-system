import { beforeEach, describe, expect, it, vi } from "vitest";
import { apiRoutes } from "@/config";
import {
  coaHierarchyService,
  normalizeAccountRequest,
} from "./coaHierarchyService";

const { get, post, put, remove } = vi.hoisted(() => ({
  get: vi.fn(),
  post: vi.fn(),
  put: vi.fn(),
  remove: vi.fn(),
}));

vi.mock("@/shared/services/apiService", () => ({
  default: { get, post, put, delete: remove },
}));

describe("coaHierarchyService", () => {
  beforeEach(() => {
    get.mockReset();
    post.mockReset();
    put.mockReset();
    remove.mockReset();
  });

  it("forwards the exact server paging/search/sort contract", async () => {
    get.mockResolvedValue({ items: [], metaData: { totalCount: 42 } });
    const query = {
      pageNumber: 3,
      pageSize: 25,
      search: "cash",
      searchField: "nameEn" as const,
      searchOperator: "contains" as const,
      recordStatus: "all" as const,
      sortBy: "createdOn" as const,
      sortDirection: "desc" as const,
    };

    await coaHierarchyService.getAccountPage(query);

    expect(get).toHaveBeenCalledWith(
      apiRoutes.ledgerSetup.accounts.base,
      query,
    );
  });

  it("uses the dedicated code proposal and full-detail endpoints", async () => {
    get.mockResolvedValue({});
    await coaHierarchyService.getCodeProposal();
    await coaHierarchyService.getAccount(17);

    expect(get).toHaveBeenNthCalledWith(
      1,
      apiRoutes.ledgerSetup.accounts.codeProposal,
    );
    expect(get).toHaveBeenNthCalledWith(
      2,
      apiRoutes.ledgerSetup.accounts.getById(17),
    );
  });

  it("normalizes account mutation text and clears irrelevant specific currency", () => {
    expect(normalizeAccountRequest({
      code: " acc-0042 ",
      nameAr: " أصول ",
      nameEn: " Assets ",
      accountHierarchyLevelId: 2,
      parentAccountId: null,
      allowPosting: false,
      manualPostingPolicy: 1,
      currencyPolicy: 1,
      specificCurrencyId: 9,
    })).toEqual(expect.objectContaining({
      code: "ACC-0042",
      nameAr: "أصول",
      nameEn: "Assets",
      specificCurrencyId: null,
    }));
  });

  it("sends full row-version lifecycle bodies for accounts and hierarchy levels", async () => {
    remove.mockResolvedValue(undefined);
    post.mockResolvedValue({});

    await coaHierarchyService.archiveAccount({ id: 5, rowVersion: "AQ==" });
    await coaHierarchyService.restoreAccount({ id: 5, rowVersion: "Ag==" });
    await coaHierarchyService.archiveHierarchyLevel({ id: 3, rowVersion: "Aw==" });
    await coaHierarchyService.restoreHierarchyLevel({ id: 3, rowVersion: "BA==" });

    expect(remove).toHaveBeenNthCalledWith(
      1,
      apiRoutes.ledgerSetup.accounts.update(5),
      { rowVersion: "AQ==" },
    );
    expect(post).toHaveBeenNthCalledWith(
      1,
      apiRoutes.ledgerSetup.accounts.restore(5),
      { rowVersion: "Ag==" },
    );
    expect(remove).toHaveBeenNthCalledWith(
      2,
      apiRoutes.ledgerSetup.accounts.hierarchyLevelById(3),
      { rowVersion: "Aw==" },
    );
    expect(post).toHaveBeenNthCalledWith(
      2,
      apiRoutes.ledgerSetup.accounts.hierarchyLevelRestore(3),
      { rowVersion: "BA==" },
    );
  });
});
