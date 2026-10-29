import { Component } from '@angular/core';
import { UiTextPipe } from '../../platform/localization/public-api';

@Component({ selector: 'erp-auth-branding', imports: [UiTextPipe], templateUrl: './auth-branding.html', styleUrl: './auth-branding.scss' })
export class AuthBranding {
  readonly year = new Date().getFullYear();
  readonly features = [{ icon: '🔒', title: 'auth.secureAccess', description: 'auth.secureAccessDesc' },
    { icon: '🔐', title: 'auth.dataPrivacy', description: 'auth.dataPrivacyDesc' },
    { icon: '📊', title: 'auth.analytics', description: 'auth.analyticsDesc' }];
}
