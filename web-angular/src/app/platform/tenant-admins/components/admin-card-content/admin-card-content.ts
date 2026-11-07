import { Component, input } from '@angular/core';
import { StatusBadge } from '../../../../shared/ui/public-api';
import { UiTextPipe } from '../../../localization/public-api';
import type { TenantAdmin } from '../../types/tenant-admin';
@Component({
  selector: 'erp-admin-card-content',
  imports: [StatusBadge, UiTextPipe],
  templateUrl: './admin-card-content.html',
  styleUrl: './admin-card-content.scss',
})
export class AdminCardContent {
  readonly admin = input.required<TenantAdmin>();
}
