import { booleanAttribute,Component,computed,ElementRef,forwardRef,input,signal,viewChild } from '@angular/core';
import { InputText } from 'primeng/inputtext';
import { Textarea } from 'primeng/textarea';
import { ButtonDirective } from 'primeng/button';
import { Times } from '@primeicons/angular/times';
import { UiTextPipe } from '../../../../platform/localization/public-api';
import { FormFieldControl } from '../form-field-control';
import { CharacterCountBadge } from './character-count-badge';

@Component({
  selector: 'erp-text-field',
  imports: [InputText, Textarea, UiTextPipe, ButtonDirective, Times,CharacterCountBadge],
  providers:[{provide:FormFieldControl,useExisting:forwardRef(()=>TextField)}],
  templateUrl: './text-field.html',
  styleUrl: './text-field.scss',
  host: { '[class.floating]': "appearance() === 'floating'" },
})
export class TextField extends FormFieldControl<string> {
  readonly labelVisibility = input<'visible'|'sr-only'>('visible');
  readonly placeholder = input('');
  readonly type = input<'text' | 'email' | 'password'>('text');
  readonly multiline = input(false, { transform: booleanAttribute });
  readonly rows = input(3);
  readonly autocomplete = input('off');
  readonly inputMode = input<'text'|'numeric'|'decimal'|'email'|'tel'|'url'|'search'|null>(null);
  readonly textDirection = input<'ltr'|'rtl'|'auto'|null>(null);
  readonly showClear = input(true, { transform: booleanAttribute });
  readonly clearVisibility=input<'value'|'always'>('value');
  readonly appearance = input<'default' | 'floating'>('default');
  readonly maxLength = input<number | null>(null);
  readonly showCounter = input(false);
  readonly counterAppearance=input<'inline'|'badge'>('inline');
  readonly counterVisible=computed(()=>{const limit=this.maxLength();return this.showCounter()&&limit!==null&&Number.isSafeInteger(limit)&&limit>0;});
  readonly revealOnlyWithValue = input(false);
  readonly value = signal('');
  readonly revealed = signal(false);
  readonly inputType = computed(() => this.type() === 'password' && this.revealed() ? 'text' : this.type());
  private readonly input = viewChild.required<ElementRef<HTMLInputElement | HTMLTextAreaElement>>('input');
  composing = false;
  isMultiline():boolean{return this.multiline() && this.type()==='text';}
  textareaRows():number{const rows=this.rows();return Number.isInteger(rows)&&rows>=1&&rows<=20?rows:3;}
  keyboardMode():string|null{return this.inputMode();}
  direction():string|null{return this.textDirection();}
  override describedBy(): string | null {
    return [this.help() ? this.id + '-help' : '', this.error() ? this.id + '-error' : '', this.counterVisible() ? this.id + '-counter' : ''].filter(Boolean).join(' ') || null;
  }

  writeValue(value: unknown): void { this.value.set(typeof value === 'string' ? value : ''); this.revealed.set(false); }
  focus(): void { this.input().nativeElement.focus(); }
  onInput(event: Event): void {
    if (!this.composing && (event.target instanceof HTMLInputElement || event.target instanceof HTMLTextAreaElement)) this.accept(event.target.value);
  }
  compositionEnd(event: CompositionEvent): void { this.composing = false; this.onInput(event); }
  clear(): void { if(this.disabled()||this.readOnly())return;this.accept(''); this.blur(); this.focus(); }

}
