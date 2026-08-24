import { shouldCollapseMultiViewLabels } from './viewSelectorLayout';

describe('multi-view selector label layout', () => {
  it('uses compact icon-only segments for four views on phone widths', () => {
    expect(shouldCollapseMultiViewLabels({
      compactToolbar: true,
      showViewLabels: true,
      viewCount: 4,
      viewportWidth: 360,
    })).toBe(true);
  });

  it('keeps labels when the selector has room or fewer views', () => {
    expect(shouldCollapseMultiViewLabels({ compactToolbar: true, showViewLabels: true, viewCount: 4, viewportWidth: 800 })).toBe(false);
    expect(shouldCollapseMultiViewLabels({ compactToolbar: true, showViewLabels: true, viewCount: 3, viewportWidth: 360 })).toBe(false);
  });
});
