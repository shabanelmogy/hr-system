export interface AccountCodeProposalState {
  code: string;
  proposalApplied: boolean;
}

export function applyInitialAccountCodeProposal(currentCode: string, proposedCode: string | undefined, proposalApplied: boolean): AccountCodeProposalState {
  if (proposalApplied || !proposedCode) return { code: currentCode, proposalApplied };
  return { code: currentCode.trim() ? currentCode : proposedCode, proposalApplied: true };
}
