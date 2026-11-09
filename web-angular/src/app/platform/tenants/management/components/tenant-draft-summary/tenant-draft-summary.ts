import { booleanAttribute, Component, computed, inject, input } from '@angular/core';
import {
  MetricCard,
  StatusBadge,
  SurfaceCard,
  ScrollViewport,
} from '../../../../../shared/ui/public-api';
import { NgTemplateOutlet } from '@angular/common';
import { LocalizationRuntime, UiTextPipe } from '../../../../localization/public-api';
import { TenantEditorState } from '../../state/tenant-editor-state';

@Component({
  imports: [MetricCard, StatusBadge, SurfaceCard, UiTextPipe, ScrollViewport, NgTemplateOutlet],
  host: { '[class.fill]': 'fill()' },
  selector: 'erp-tenant-draft-summary',
  styleUrl: './tenant-draft-summary.scss',
  templateUrl: './tenant-draft-summary.html',
})
export class TenantDraftSummary {
  readonly fill = input(false, { transform: booleanAttribute });
  readonly editor = inject(TenantEditorState);
  readonly locale = inject(LocalizationRuntime);
  readonly draft = computed(() => this.editor.form().value());
  readonly metrics = computed(() => {
    const draft = this.draft(),
      number = new Intl.NumberFormat(this.locale.language());
    return [
      { id: 'admins', value: draft.maxAdmins.trim() || '—', icon: 'admin' as const },
      { id: 'users', value: draft.maxUsers.trim() || '—', icon: 'user' as const },
      {
        id: 'selectedModules',
        value: number.format(draft.entitlements.length),
        icon: 'grid' as const,
      },
      {
        id: 'selectedAreas',
        value: number.format(
          draft.entitlements.reduce((count, entry) => count + entry.submoduleCodes.length, 0),
        ),
        icon: 'groups' as const,
      },
    ];
  });
}
