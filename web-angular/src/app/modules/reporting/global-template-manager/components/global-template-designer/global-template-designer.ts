import {
  ChangeDetectionStrategy,
  Component,
  computed,
  effect,
  inject,
  output,
  viewChild,
} from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { LocalizationRuntime, UiTextPipe } from '../../../../../platform/localization/public-api';
import {
  ActionButton,
  AppIcon,
  DialogPanel,
  FeedbackState,
  FormCloseGuard,
  FormContainer,
  MyDataGrid,
  RecordSummary,
  ReferenceField,
  SurfaceCard,
  TextField,
  type CollectionColumn,
  type CollectionSource,
  type ReferenceSource,
} from '../../../../../shared/ui/public-api';
import { GlobalTemplateDesignState } from '../../state/global-template-design-state';
import { GlobalTemplateViewState } from '../../state/global-template-view-state';
import type { GlobalTemplateDesignSource, GlobalTemplateDetail } from '../../types/global-template';

type DesignColumn = GlobalTemplateDesignSource['columns'][number];

@Component({
  selector: 'erp-global-template-designer',
  imports: [
    ReactiveFormsModule,
    ActionButton,
    AppIcon,
    DialogPanel,
    FeedbackState,
    FormCloseGuard,
    FormContainer,
    MyDataGrid,
    RecordSummary,
    ReferenceField,
    SurfaceCard,
    TextField,
    UiTextPipe,
  ],
  providers: [GlobalTemplateDesignState, GlobalTemplateViewState],
  templateUrl: './global-template-designer.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class GlobalTemplateDesigner {
  readonly state = inject(GlobalTemplateDesignState);
  readonly locale = inject(LocalizationRuntime);
  readonly created = output<GlobalTemplateDetail>();
  private readonly entryForm = viewChild<FormContainer>('entryForm');
  readonly moduleOptions = computed(() =>
    this.reference(
      'modules',
      [...new Set(this.state.sources().map((source) => source.moduleKey))].map((key) => ({
        value: key,
        label: this.text('globalTemplates.modules.' + key),
      })),
    ),
  );
  readonly sourceOptions = computed(() =>
    this.reference(
      'sources:' + (this.state.moduleKey() ?? ''),
      this.state
        .sources()
        .filter((source) => source.moduleKey === this.state.moduleKey())
        .map((source) => ({
          value: source.sourceKey,
          label: this.text('globalTemplates.entities.' + source.sourceKey),
        })),
    ),
  );
  readonly messages = computed(() => ({
    required: this.text('globalTemplates.design.required'),
    maxlength: this.text('globalTemplates.design.tooLong'),
    pattern: this.text('globalTemplates.design.keyFormat'),
    sourcePrefix: this.text('globalTemplates.design.keyPrefix'),
  }));
  readonly viewOptions = computed<ReferenceSource>(() => {
    const query = this.state.views.query();
    const state = this.state.views.state();
    const options = this.state.views.items().map((view) => ({
      value: view.viewName,
      label: view.viewName,
      disabled: !view.isCompatible,
      description: this.text(
        'globalTemplates.design.viewReasons.' + (view.rejectionCode ?? 'Compatible'),
      ),
    }));
    return !this.state.selectedSource() || state.kind === 'ready'
      ? { kind: 'ready', query, result: { query, options, hasMore: this.state.views.hasMore() } }
      : { kind: state.kind, query };
  });
  readonly viewSelection = computed(() => {
    const selected = this.state.views.selected();
    return selected
      ? {
          scopeKey: this.state.views.query().scopeKey,
          value: selected.viewName,
          kind: 'ready' as const,
          option: { value: selected.viewName, label: selected.viewName },
        }
      : null;
  });
  readonly fieldColumns = computed<readonly CollectionColumn<DesignColumn>[]>(() => [
    {
      key: 'name',
      header: this.text('globalTemplates.design.field'),
      value: (field) => field.name,
      minWidth: 170,
    },
    {
      key: 'type',
      header: this.text('globalTemplates.design.type'),
      value: (field) => field.type,
      width: 110,
    },
    {
      key: 'nullable',
      header: this.text('globalTemplates.design.nullable'),
      value: (field) => this.text('globalTemplates.design.' + (field.nullable ? 'yes' : 'no')),
      width: 110,
    },
  ]);
  readonly fieldSource = computed<CollectionSource<DesignColumn>>(() => {
    const source = this.state.selectedSource();
    const rows = source?.columns ?? [];
    const query = {
      scopeKey: JSON.stringify([
        this.state.identity()?.userId,
        source?.sourceKey,
        source?.contractFingerprint,
      ]),
      criteriaKey: '',
      pageIndex: 0,
      pageSize: Math.max(rows.length, 1),
    };
    return {
      kind: 'ready',
      query,
      result: { query, rows, total: rows.length, hasNextPage: false },
    };
  });
  readonly fieldId = (field: DesignColumn) => field.name;

  constructor() {
    effect(() => {
      if (Object.keys(this.state.feedback()?.fields ?? {}).length) this.entryForm()?.revealErrors();
    });
  }
  open(): void {
    this.state.open();
  }
  save(): void {
    this.state.save((detail) => this.created.emit(detail));
  }
  text(key: string): string {
    return this.locale.translate(key, 'reporting');
  }
  private reference(
    key: string,
    options: readonly { value: string; label: string }[],
  ): ReferenceSource {
    const state = this.state.catalogState();
    const query = { scopeKey: JSON.stringify([this.state.identity()?.userId, key]), search: '' };
    return state.kind === 'ready'
      ? { kind: 'ready', query, result: { query, options, hasMore: false } }
      : { kind: state.kind, query };
  }
}
