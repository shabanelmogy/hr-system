import { Component, computed, effect, inject, input, signal } from '@angular/core';
import { DomSanitizer, type SafeResourceUrl } from '@angular/platform-browser';
import { ButtonDirective } from 'primeng/button';
import { UiTextPipe } from '../../../platform/localization/public-api';
import type { PdfDocument } from '../../data/public-api';
@Component({
  selector: 'erp-pdf-viewer',
  imports: [ButtonDirective, UiTextPipe],
  host:{'[class.fill]':'fill()'},
  template: ` @if (current(); as resource) {
    <section [attr.aria-label]="title()" [class.fill]="fill()">
      <nav [attr.aria-label]="title()">
        <a
          pButton
          [href]="resource.url"
          target="_blank"
          rel="noopener noreferrer"
          referrerpolicy="no-referrer"
          >{{ 'reports.openPdf' | uiText }}</a
        >
        <a pButton variant="outlined" [href]="resource.url" [download]="downloadName()">{{
          'common.downloadFile' | uiText
        }}</a>
      </nav>
      @if (inlineSupported) {
        <iframe [src]="resource.safe" [title]="title()" referrerpolicy="no-referrer"></iframe>
      } @else {
        <p role="status">{{ 'reports.previewUnavailable' | uiText }}</p>
      }
    </section>
  }`,
  styles: `
    :host {
      display: block;
      min-width: 0;
      min-height: 0;
    }
    section {
      display: flex;
      flex-direction: column;
      gap: 12px;
      min-width: 0;
    }
    nav {
      display: flex;
      flex-wrap: wrap;
      gap: 8px;
    }
    nav a{text-decoration:none}
    iframe {
      width: 100%;
      height: max(540px, 70dvh);
      border: 1px solid var(--border);
      border-radius: var(--radius);
      background: var(--surface);
    }
    p {
      padding: 24px;
      color: var(--muted-foreground);
      border: 1px solid var(--border);
      border-radius: var(--radius);
    }
    @media (max-width: 600px) {
      iframe {
        height: 65dvh;
        min-height: 400px;
      }
    }
    :host.fill{height:100%}section.fill{height:100%;min-height:0}section.fill nav{flex-shrink:0;padding:8px;background:var(--surface);border:1px solid var(--border);border-radius:var(--radius)}section.fill iframe{flex:1;min-height:0;height:0;border-radius:0}section.fill p{overflow:auto;margin:0}
  `,
})
export class PdfViewer {
  readonly fill=input(false);
  readonly document = input<PdfDocument | null>(null);
  readonly title = input.required<string>();
  readonly downloadName = input('report.pdf');
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
