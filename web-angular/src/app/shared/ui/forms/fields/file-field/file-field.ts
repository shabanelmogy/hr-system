import { Component, type ElementRef, forwardRef, input, signal, viewChild } from '@angular/core';
import { FileUpload, type FileSelectEvent } from 'primeng/fileupload';
import { FormFieldControl } from '../../form-field-control';
import { ActionButton } from '../../../buttons/public-api';

@Component({
  imports: [FileUpload, ActionButton],
  providers: [{ provide: FormFieldControl, useExisting: forwardRef(() => FileField) }],
  selector: 'erp-file-field',
  styleUrl: './file-field.scss',
  templateUrl: './file-field.html',
})
export class FileField extends FormFieldControl<File | null> {
  readonly value = signal<File | null>(null);
  readonly acceptTypes = input('');
  readonly chooseLabel = input.required<string>();
  readonly clearLabel = input.required<string>();
  private readonly host = viewChild.required<ElementRef<HTMLElement>>('field');
  private readonly picker = viewChild(FileUpload);
  writeValue(value: unknown): void {
    this.value.set(value instanceof File ? value : null);
    if (!this.value()) this.picker()?.clear();
  }
  select(event: FileSelectEvent): void {
    this.accept(event.files[0] ?? null);
    this.blur();
  }
  clear(): void {
    this.accept(null);
    this.picker()?.clear();
    this.blur();
  }
  focus(): void {
    this.host().nativeElement.querySelector<HTMLButtonElement>('button')?.focus();
  }
}
