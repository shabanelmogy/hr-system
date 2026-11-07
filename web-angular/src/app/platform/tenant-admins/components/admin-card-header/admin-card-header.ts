import { Component, input } from '@angular/core';
import { StatusBadge } from '../../../../shared/ui/public-api';
import { UiTextPipe } from '../../../localization/public-api';
import type { TenantAdmin } from '../../types/tenant-admin';
@Component({
  selector: 'erp-admin-card-header',
  imports: [StatusBadge, UiTextPipe],
  templateUrl: './admin-card-header.html',
  styleUrl: './admin-card-header.scss',
})
export class AdminCardHeader {
  readonly admin = input.required<TenantAdmin>();
}
