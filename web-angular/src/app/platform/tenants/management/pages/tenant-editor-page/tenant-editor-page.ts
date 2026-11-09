import { Component, computed, inject } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';
import { TenantEditorWorkspace } from '../../components/tenant-editor-workspace/tenant-editor-workspace';

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
  readonly tenantIds = computed(() => [this.params().get('id')]);
}
