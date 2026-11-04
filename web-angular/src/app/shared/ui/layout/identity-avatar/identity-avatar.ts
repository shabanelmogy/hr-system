import { Component, computed, input } from '@angular/core';

@Component({
  selector: 'erp-identity-avatar',
  templateUrl: './identity-avatar.html',
  styleUrl: './identity-avatar.scss',
})
export class IdentityAvatar {
  readonly name = input.required<string>();
  readonly initials = computed(
    () =>
      this.name()
        .trim()
        .split(/\s+/)
        .filter(Boolean)
        .slice(0, 2)
        .map((part) => part.charAt(0))
        .join('')
        .toUpperCase() || 'U',
  );
}
