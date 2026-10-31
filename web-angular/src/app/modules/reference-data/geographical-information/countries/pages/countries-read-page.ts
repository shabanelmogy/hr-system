import { Component, computed, effect, inject, signal, viewChild } from '@angular/core';
import { NgTemplateOutlet } from '@angular/common';
import { LocalizationRuntime, UiTextPipe } from '../../../../../platform/localization/public-api';
import {
  ActionButton, AppIcon, CardList, CollectionCardTemplate, CollectionCardHeader, CollectionCardFooter, CollectionCell, CollectionEmptyTemplate,
  CollectionRecordFeedback,ConfirmationDialog,DialogPanel, FeedbackNotifications,FeedbackState, MyDataGrid, OptionSelect, PageHeader, ProgressMeter, RowActions,StatusBadge,SortDirectionButton,
  type CollectionColumn, type CollectionSearch,type GridRowAction,type PageViewOption,
} from '../../../../../shared/ui/public-api';
import { CountryReadState } from '../state/country-read-state';
import { countryQuality, countrySearchFields, countrySearchOperators, countrySortFields, type CountryListItem } from '../types/country';
import { CountryReadDetails } from '../components/country-read-details';
import { CountryEditor } from '../components/country-editor';
import { CountryEditorState,type CountrySaved } from '../state/country-editor-state';
import { countryColumnFilterDefinitions } from '../state/country-column-filters';
import { CountryLifecycleState } from '../state/country-lifecycle-state';
import { CollectionChartView } from '../../../../../shared/ui/charts/public-api';
import { countryChartData } from '../utils/country-chart-data';
import { AuthSession } from '../../../../../platform/auth/session.public-api';
import { GlobalReportView,globalReportAllowed } from '../../../../reporting/public-api';

@Component({
  selector: 'erp-countries-read-page', providers: [CountryReadState,CountryEditorState,CountryLifecycleState,CollectionRecordFeedback],
  imports: [NgTemplateOutlet, ActionButton, AppIcon, CardList, CollectionCardTemplate, CollectionCardHeader, CollectionCardFooter, CollectionCell, CollectionEmptyTemplate,
    ConfirmationDialog,DialogPanel, FeedbackState, MyDataGrid, OptionSelect, PageHeader, ProgressMeter, RowActions,StatusBadge,SortDirectionButton, CountryReadDetails,CountryEditor,CollectionChartView,GlobalReportView, UiTextPipe],
  templateUrl: './countries-read-page.html', styleUrl: './countries-read-page.scss',
})
export class CountriesReadPage {
  readonly state = inject(CountryReadState);
  readonly editor=inject(CountryEditorState);
  readonly lifecycle=inject(CountryLifecycleState);readonly records=inject(CollectionRecordFeedback);
  private readonly notifications=inject(FeedbackNotifications);
  readonly actions=(row:CountryListItem):readonly GridRowAction[]=>[
    {id:'view',label:this.text('actions.view'),icon:'view'},
    ...(this.editor.canEdit(row.id)?[{id:'edit',label:this.text('actions.edit'),icon:'edit' as const}]:[]),
    ...(this.lifecycle.can(row,'archive')?[{id:'archive',label:this.text('actions.archive'),icon:'archive' as const,tone:'warning' as const}]:[]),
    ...(this.lifecycle.can(row,'restore')?[{id:'restore',label:this.text('actions.restore'),icon:'restore' as const,tone:'success' as const}]:[]),
  ];
  act(event:{row:CountryListItem;action:string}):void{
    const current=this.state.view();if(current.kind!=='ready'||!current.data.items.some(row=>row.id===event.row.id))return;
    if(event.action==='view')this.state.open(event.row.id);else if(event.action==='edit')this.editor.edit(event.row.id);
    else if(event.action==='archive'||event.action==='restore')this.lifecycle.request(event.row,event.action);
  }
  saved(event:CountrySaved):void{if(event.mode==='edit')this.records.edited(this.state.source(),event.country.id);this.notifications.success(event.mode==='create'?'countries.created':'countries.updated','reference-countries');this.state.refresh();}
  readonly locale = inject(LocalizationRuntime);
  private readonly auth=inject(AuthSession);
  readonly canReport=computed(()=>this.state.canRead()&&globalReportAllowed(this.auth.readIdentity()));
  private readonly reportView=viewChild<GlobalReportView>('countryReport');
  readonly view = signal<'grid' | 'cards' | 'chart' | 'report'>('grid');
  readonly toolbarVisible=signal(true);
  readonly views=computed<readonly PageViewOption[]>(()=>this.state.canRead()?[{id:'grid',label:this.text('views.grid'),icon:'grid'},{id:'cards',label:this.text('views.cards'),icon:'cards'},{id:'chart',label:this.text('views.chart'),icon:'chart'},...(this.canReport()?[{id:'report',label:this.text('views.report'),icon:'report' as const}]:[])]:[]);
  readonly analytics=computed(()=>{const source=this.state.source();return this.view()==='chart'&&source.kind==='ready'&&source.result?countryChartData(source.result.rows,source.result.total??0,this.locale.language(),key=>key.startsWith('countries.')?this.countryText(key):this.text(key)):{metrics:[],plots:[]};});
  chooseView(value:string):void{
    if(!this.state.canRead()||this.editor.active()||this.lifecycle.pending()||(value==='report'&&!this.canReport()))return;
    if((value==='grid'||value==='cards'||value==='chart'||value==='report')&&value!==this.view()){
      this.lifecycle.clearSelection();this.lifecycle.cancel();
      if(value==='chart'&&this.state.query().pageNumber!==1)this.state.changePage({pageIndex:0,pageSize:this.state.query().pageSize});
      this.view.set(value);
    }
  }
  readonly id = (row: CountryListItem) => row.id;
  readonly rowLabel = (row: CountryListItem) => this.locale.language() === 'ar' ? row.nameAr : row.nameEn;
  readonly otherName = (row: CountryListItem) => this.locale.language() === 'ar' ? row.nameEn : row.nameAr;
  readonly quality = countryQuality;
  readonly qualityLevel = (row: CountryListItem) => {
    const quality = countryQuality(row);
    return this.text('general.' + (quality >= 90 ? 'excellent' : quality >= 75 ? 'good' : quality >= 60 ? 'average' : 'poor')).toLocaleUpperCase(this.locale.language());
  };
  readonly qualityContrast = (row: CountryListItem) => {
    const quality = countryQuality(row);
    return quality >= 90 ? 'var(--success-foreground)' : quality >= 75 ? 'var(--primary-foreground)' : quality >= 60 ? 'var(--warning-foreground)' : 'var(--destructive-foreground)';
  };
  readonly qualityAccent = (row: CountryListItem) => {
    const quality = countryQuality(row);
    return quality >= 90 ? 'var(--success)' : quality >= 75 ? 'var(--primary)' : quality >= 60 ? 'var(--warning)' : 'var(--destructive)';
  };
  readonly sort = computed(() => ({ field: this.state.query().sortBy, direction: this.state.query().sortDirection }));
  readonly columns = computed<readonly CollectionColumn<CountryListItem>[]>(() => [
    { key: 'id', filter:countryColumnFilterDefinitions.find(filter=>filter.field==='id'), align:'center', flex:.5, header: this.text('general.id'), value: row => row.id },
    { key: 'nameAr', filter:countryColumnFilterDefinitions.find(filter=>filter.field==='nameAr'), align:'center', flex:1, header: this.text('general.nameAr'), value: row => row.nameAr, sortField: 'nameAr' },
    { key: 'nameEn', filter:countryColumnFilterDefinitions.find(filter=>filter.field==='nameEn'), align:'center', flex:1.5, header: this.text('general.nameEn'), value: row => row.nameEn, sortField: 'nameEn' },
    { key: 'alpha2Code', filter:countryColumnFilterDefinitions.find(filter=>filter.field==='alpha2Code'), align:'center', flex:.8, header: this.countryText('countries.alpha2Code'), value: row => row.alpha2Code, sortField: 'alpha2Code' },
    { key: 'alpha3Code', filter:countryColumnFilterDefinitions.find(filter=>filter.field==='alpha3Code'), align:'center', flex:.8, header: this.countryText('countries.alpha3Code'), value: row => row.alpha3Code, sortField: 'alpha3Code' },
    { key: 'phoneCode', filter:countryColumnFilterDefinitions.find(filter=>filter.field==='phoneCode'), align:'center', flex:.8, header: this.countryText('countries.phoneCode'), value: row => row.phoneCode },
    { key: 'currencyCode', filter:countryColumnFilterDefinitions.find(filter=>filter.field==='currencyCode'), align:'center', flex:.8, header: this.countryText('countries.currencyCode'), value: row => row.currencyCode, sortField: 'currencyCode' },
    { key: 'statesCount', filter:countryColumnFilterDefinitions.find(filter=>filter.field==='statesCount'), align:'center', flex:1.2, header: this.countryText('countries.states'), value: row => row.statesCount },
    { key: 'createdOn', filterValue:row=>row.createdOn.slice(0,10), filter:countryColumnFilterDefinitions.find(filter=>filter.field==='createdOn'), align:'center', flex:1, header: this.text('general.createdOn'), value: row => this.date(row.createdOn), sortField: 'createdOn' },
    { key: 'updatedOn', filterValue:row=>row.updatedOn?.slice(0,10), filter:countryColumnFilterDefinitions.find(filter=>filter.field==='updatedOn'), align:'center', flex:1, header: this.text('general.updatedOn'), value: row => this.date(row.updatedOn) },
    { key: 'isDeleted', filterValue:row=>row.isDeleted, filter:countryColumnFilterDefinitions.find(filter=>filter.field==='isDeleted'), align:'center', flex:.8, header: this.countryText('countries.status.label'), value: row => this.status(row) },
  ]);
  readonly search = computed<CollectionSearch>(() => ({
    value: this.state.searchDraft(), maxLength: 200, placeholder: this.text('search.searchText'),
    field: { label: this.text('search.searchField'), value: this.state.query().searchField, options: countrySearchFields.map(value => ({ value, label: value === 'all' ? this.text('common.all') : this.fieldLabel(value) })) },
    operator: { label: this.text('search.searchType'), value: this.state.query().searchOperator, options: countrySearchOperators.map(value => ({ value, label: value === 'doesNotContain' || value === 'doesNotEqual' ? this.countryText('countries.search.operators.' + value) : this.text('search.' + value) })) },
  }));
  readonly statuses = computed(() => ['active', 'archived', 'all'].map(value => ({ value, label: this.countryText('countries.status.' + value) })));
  readonly sorts = computed(() => countrySortFields.map(value => ({ value, label: this.fieldLabel(value) })));
  readonly detailCountry = computed(() => { const detail = this.state.detail(); return detail.kind === 'ready' ? detail.data : null; });
  readonly subtitle = computed(() => this.countryText('countries.total') + ': ' + this.number(this.state.total()));

  constructor() { void this.locale.loadNamespace('core'); void this.locale.loadNamespace('reference-countries');effect(()=>{if(this.view()==='report'&&!this.canReport())this.view.set('grid');}); }
  refreshCurrent():void{if(this.view()==='report')this.reportView()?.reload();else this.state.refresh();}
  text(key: string): string { return this.locale.translate(key); }
  countryText(key: string): string { return this.locale.translate(key, 'reference-countries'); }
  fieldLabel(field: string): string { return ['nameAr', 'nameEn', 'createdOn'].includes(field) ? this.text('general.' + field) : this.countryText('countries.' + field); }
  status(row: CountryListItem): string { return this.countryText(row.isDeleted ? 'countries.status.archived' : 'countries.status.active'); }
  number(value: number): string { return new Intl.NumberFormat(this.locale.language()).format(value); }
  date(value: string | null): string { return value ? new Intl.DateTimeFormat(this.locale.language(), { dateStyle: 'medium' }).format(new Date(value)) : '—'; }
  phone(value: string | null): string { return value ? '+' + value.replace(/^\+/, '') : '—'; }
  chooseSort(field: string): void { this.state.changeSort({ field, direction: this.state.query().sortDirection }); }
  reverseSort(): void { this.state.changeSort({ field: this.state.query().sortBy, direction: this.state.query().sortDirection === 'asc' ? 'desc' : 'asc' }); }
}
