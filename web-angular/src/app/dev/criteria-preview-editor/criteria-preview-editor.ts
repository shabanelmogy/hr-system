import { Component, inject } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { UiTextPipe } from '../../platform/localization/public-api';
import { ActionButton, PageHeader, StatusBadge } from '../../shared/ui/public-api';

@Component({
  imports: [ActionButton, PageHeader, StatusBadge, UiTextPipe],
  templateUrl: './criteria-preview-editor.html',
})
export class CriteriaPreviewEditor {
  private readonly router = inject(Router);
  readonly record = inject(ActivatedRoute).snapshot.paramMap.get('record') ?? '';
  back() {
    void this.router.navigate(['/dev/criteria'], {
      queryParamsHandling: 'preserve',
      preserveFragment: true,
    });
  }
}
