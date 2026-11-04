import { Component, input } from '@angular/core';
import { ScrollAreaModule } from 'primeng/scrollarea';

/** Shared PrimeNG scrolling surface; feature pages supply content, never another scrollbar shell. */
@Component({
  selector: 'erp-scroll-viewport',
  imports: [ScrollAreaModule],
  templateUrl: './scroll-viewport.html',
  styleUrl: './scroll-viewport.scss',
})
export class ScrollViewport {
  readonly label = input.required<string>();
  readonly fillContent = input(false);
  readonly tokens = {
    root: {
      background: 'transparent',
      borderColor: 'transparent',
      borderRadius: '0px',
      focusRing: {
        width: '2px',
        style: 'solid',
        color: 'var(--ring)',
        offset: '-2px',
        shadow: 'none',
      },
    },
    viewport: { padding: '0px' },
    scrollbar: {
      background: 'var(--erp-scrollbar-track)',
      margin: '0px',
      size: 'var(--erp-scrollbar-size)',
      transitionDuration: 'var(--erp-scrollbar-duration)',
    },
    handle: { background: 'var(--erp-scrollbar-thumb)' },
    mask: { fadeSize: '40px' },
  };
}
