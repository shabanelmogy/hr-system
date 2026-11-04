import { afterRenderEffect, untracked, type WritableSignal } from '@angular/core';
/** Observe native geometry without owning component data or column policy. */
export function attachGridViewport(options: {
  readonly viewport: () => HTMLElement | undefined;
  readonly availableWidth: WritableSignal<number>;
  readonly headerMinimums: WritableSignal<Readonly<Record<string, number>>>;
  readonly refresh: () => void;
}) {
  afterRenderEffect((cleanup) => {
    const viewport = options.viewport();
    if (!viewport) return;
    const resize = new ResizeObserver((entries) => {
      const width = entries[0]?.contentRect.width ?? viewport.clientWidth;
      options.availableWidth.set(width);
    });
    resize.observe(viewport);
    options.availableWidth.set(viewport.clientWidth);
    cleanup(() => resize.disconnect());
  });
  afterRenderEffect((cleanup) => {
    options.refresh();
    const viewport = options.viewport();
    if (!viewport) return;
    let active = true;
    const measure = () => {
      if (!active || !viewport.isConnected) return;
      const minimums: Record<string, number> = {};
      for (const cell of viewport.querySelectorAll<HTMLElement>('th[data-column-key]')) {
        const title = cell.querySelector<HTMLElement>('.column-header>span:first-child');
        if (!title?.scrollWidth) continue;
        const style = getComputedStyle(cell),
          heading = title.parentElement!;
        let width =
          title.scrollWidth +
          parseFloat(style.paddingInlineStart) +
          parseFloat(style.paddingInlineEnd) +
          2;
        for (const child of Array.from(heading.children)) {
          if (child === title) continue;
          const childStyle = getComputedStyle(child);
          width +=
            child.getBoundingClientRect().width +
            (parseFloat(childStyle.marginInlineStart) || 0) +
            (parseFloat(childStyle.marginInlineEnd) || 0);
        }
        width +=
          (parseFloat(getComputedStyle(heading).columnGap) || 0) *
          Math.max(0, heading.children.length - 1);
        minimums[cell.dataset['columnKey']!] = Math.ceil(width);
      }
      if (Object.keys(minimums).length)
        untracked(() => {
          if (JSON.stringify(options.headerMinimums()) !== JSON.stringify(minimums))
            options.headerMinimums.set(minimums);
        });
    };
    measure();
    void viewport.ownerDocument.fonts?.ready.then(measure, measure);
    cleanup(() => {
      active = false;
    });
  });
}
