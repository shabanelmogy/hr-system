import { Directive, InjectionToken, input, type InputSignal } from '@angular/core';

export interface FormSectionRef {
  readonly id: InputSignal<string>;
}

export const FORM_SECTION = new InjectionToken<FormSectionRef>('FORM_SECTION');

/** Assigns a generic logical section to all shared fields below this host. */
@Directive({
  selector: '[formSection]',
  providers: [{ provide: FORM_SECTION, useExisting: FormSection }],
})
export class FormSection implements FormSectionRef {
  readonly id = input.required<string>({ alias: 'formSection' });
}
