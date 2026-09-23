import { coaHierarchyKeys } from './coa-hierarchy-keys';

describe('COA hierarchy query keys', () => {
  it('isolates the account code proposal cache for each create session', () => {
    expect(coaHierarchyKeys.accountCodeProposal(1)).not.toEqual(coaHierarchyKeys.accountCodeProposal(2));
  });
});
