import { Component, computed, effect, inject, input } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';
import type { SafeResourceUrl } from '@angular/platform-browser';
import { ActivatedRoute } from '@angular/router';
import { PageHeader, FeedbackState, ActionButton, AppIcon } from '../../../../shared/ui/public-api';
import { LocalizationRuntime, UiTextPipe } from '../../../localization/public-api';
import { AdvancedToolService } from '../../services/advanced-tool-service';
import { OperationalReadState } from '../../state/operational-read-state';
import { HealthReportPanel } from '../../components/health-report-panel/health-report-panel';

@Component({
  selector: 'erp-advanced-tool-page',
  imports: [PageHeader, FeedbackState, UiTextPipe, ActionButton, AppIcon, HealthReportPanel],
  providers: [OperationalReadState],
  templateUrl: './advanced-tool-page.html',
  styleUrl: './advanced-tool-page.scss',
})
export class AdvancedToolPage {
  readonly kind = input<'swagger' | 'hangfire' | 'health'>();
  private readonly route = inject(ActivatedRoute);
  readonly resolvedKind = computed(
    () =>
      this.kind() ??
      (this.route.snapshot.data['toolKind'] as 'swagger' | 'hangfire' | 'health' | undefined) ??
      'swagger',
  );
  readonly service = inject(AdvancedToolService);
  readonly reads = inject(OperationalReadState);
  readonly locale = inject(LocalizationRuntime);
  private readonly sanitizer = inject(DomSanitizer);
  readonly title = computed(() =>
    this.resolvedKind() === 'swagger'
      ? 'menu.apiEndpoints'
      : this.resolvedKind() === 'hangfire'
        ? 'menu.hangfireDashboard'
        : 'menu.healthCheck',
  );
  readonly url = computed<SafeResourceUrl>(() =>
    this.sanitizer.bypassSecurityTrustResourceUrl(
      this.resolvedKind() === 'swagger' ? this.service.swaggerUrl : this.service.hangfireUrl,
    ),
  );
  constructor() {
    void this.locale.loadNamespace('core');
    void this.locale.loadNamespace('platform-advanced-tools');
    effect(() => {
      const kind = this.resolvedKind();
      this.reads.kind.set(kind === 'swagger' ? null : kind);
    });
  }
}
