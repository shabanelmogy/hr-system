interface MultiViewLabelLayoutInput {
  compactToolbar: boolean;
  showViewLabels: boolean;
  viewCount: number;
  viewportWidth: number;
}

export function shouldCollapseMultiViewLabels({
  compactToolbar,
  showViewLabels,
  viewCount,
  viewportWidth,
}: MultiViewLabelLayoutInput): boolean {
  return showViewLabels && compactToolbar && viewCount >= 4 && viewportWidth < 600;
}
