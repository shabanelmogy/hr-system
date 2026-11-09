import {
  booleanAttribute,
  Component,
  computed,
  effect,
  inject,
  input,
  signal,
  type TemplateRef,
  viewChild,
} from '@angular/core';
import { NgTemplateOutlet } from '@angular/common';
import { DomSanitizer, type SafeResourceUrl } from '@angular/platform-browser';
import { ButtonDirective } from 'primeng/button';
import { AppIcon } from '../../icons/app-icon/app-icon';
import { UiTextPipe } from '../../../localization/public-api';
import type { PdfDocument } from '../../../data/public-api';
@Component({
  selector: 'erp-pdf-viewer',
  imports: [AppIcon, ButtonDirective, NgTemplateOutlet, UiTextPipe],
  host: { '[class.fill]': 'fill()' },
  templateUrl: './pdf-viewer.html',
  styleUrl: './pdf-viewer.scss',
})
export class PdfViewer {
  readonly fill = input(false);
  readonly document = input<PdfDocument | null>(null);
  readonly title = input.required<string>();
  readonly downloadName = input('report.pdf');
  readonly showActions = input(true, { transform: booleanAttribute });
  readonly actionsLayout = input<'inline' | 'stacked' | 'toolbar'>('inline');
  /** Render these same document links in another shared layout region. */
  readonly actionsTemplate = viewChild.required<TemplateRef<unknown>>('actions');
  readonly inlineSupported =
    typeof navigator !== 'undefined' && navigator.pdfViewerEnabled === true;
  private readonly sanitizer = inject(DomSanitizer);
  private readonly lease = signal<{
    document: PdfDocument;
    url: string;
    safe: SafeResourceUrl;
  } | null>(null);
  readonly current = computed(() => {
    const lease = this.lease();
    return lease?.document === this.document() ? lease : null;
  });
  constructor() {
    effect((onCleanup) => {
      const document = this.document();
      if (!document) {
        this.lease.set(null);
        return;
      }
      const url = URL.createObjectURL(document.bytes);
      this.lease.set({ document, url, safe: this.sanitizer.bypassSecurityTrustResourceUrl(url) });
      onCleanup(() => URL.revokeObjectURL(url));
    });
  }
}
