import { Component, computed, inject } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';
import { TenantEditorWorkspace } from '../../components/tenant-editor-workspace/tenant-editor-workspace';
import type { TenantSection } from '../../types/tenant';

@Component({
  imports: [TenantEditorWorkspace],
  selector: 'erp-tenant-editor-page',
  styleUrl: './tenant-editor-page.scss',
  templateUrl: './tenant-editor-page.html',
})
export class TenantEditorPage {
  private readonly route = inject(ActivatedRoute);
  private readonly params = toSignal(this.route.paramMap, {
    initialValue: this.route.snapshot.paramMap,
  });
  private readonly queryParams = toSignal(this.route.queryParamMap, {
    initialValue: this.route.snapshot.queryParamMap,
  });
  readonly tenantIds = computed(() => [this.params().get('id')]);
  readonly initialSection = computed<TenantSection>(() =>
    this.queryParams().get('tab') === 'administrators' ? 'administrators' : 'identity',
  );
}
