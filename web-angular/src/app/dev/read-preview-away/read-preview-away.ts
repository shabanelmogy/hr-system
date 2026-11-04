import { Component, inject } from '@angular/core';
import { Router } from '@angular/router';
import { UiTextPipe } from '../../platform/localization/public-api';
import { ActionButton, PageHeader } from '../../shared/ui/public-api';
import { ReadPreviewProbe } from '../read-preview-probe';

@Component({
  imports: [ActionButton, PageHeader, UiTextPipe],
  templateUrl: './read-preview-away.html',
  styleUrl: './read-preview-away.scss',
})
export class ReadPreviewAway {
  readonly probe = inject(ReadPreviewProbe);
  private readonly router = inject(Router);
  back() {
    void this.router.navigateByUrl('/dev/reads');
  }
}
