import { computed, Injectable, signal } from '@angular/core';
export interface RegisteredFormField {
  readonly id: string;
  readonly name: () => string;
  readonly label: () => string;
  readonly error: () => string | null;
  readonly sectionId: () => string | null;
  focus(): void;
}

interface FieldRegistration {
  readonly field: RegisteredFormField;
  readonly host: HTMLElement;
  readonly sequence: number;
}

const documentPositionPreceding = 2;
const documentPositionFollowing = 4;

/** Nearest-form registry that crosses child-component view boundaries. */
@Injectable()
export class FormFieldRegistry {
  private readonly registrations = signal<readonly FieldRegistration[]>([]);
  private sequence = 0;
  readonly fields = computed(() => {
    const registrations = [...this.registrations()].sort((left, right) => {
      const position = left.host.compareDocumentPosition(right.host);
      if (position & documentPositionFollowing) return -1;
      if (position & documentPositionPreceding) return 1;
      return left.sequence - right.sequence;
    });
    return registrations.map((registration) => registration.field);
  });

  register(field: RegisteredFormField, host: HTMLElement): () => void {
    const registration: FieldRegistration = { field, host, sequence: ++this.sequence };
    this.registrations.update((current) => [...current, registration]);
    return () =>
      this.registrations.update((current) =>
        current.filter((candidate) => candidate !== registration),
      );
  }
}
