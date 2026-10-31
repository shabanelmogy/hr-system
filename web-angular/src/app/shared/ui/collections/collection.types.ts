export type CollectionId = string | number;
export interface CollectionQuery { readonly scopeKey:string; readonly criteriaKey:string; readonly pageIndex:number; readonly pageSize:number; }
export interface CollectionPage<T> { readonly query:CollectionQuery; readonly rows:readonly T[]; readonly total:number|null; readonly hasNextPage:boolean; }
export interface CollectionSource<T> { readonly query:CollectionQuery; readonly kind:'loading'|'ready'|'error'|'forbidden'; readonly result?:CollectionPage<T>; }
export interface CollectionView<T> { readonly kind:CollectionSource<T>['kind']; readonly rows:readonly T[]; readonly total:number|null; readonly hasNextPage:boolean; readonly query:CollectionQuery; }
export interface CollectionPageRequest { readonly pageIndex:number; readonly pageSize:number; }
export type { CriteriaSort as CollectionSort } from '../../data/collection-criteria';
export interface CollectionColumn<T> { readonly key:string; readonly header:string; readonly value:(row:T)=>string|number|null|undefined; readonly filterValue?:(row:T)=>unknown; readonly sortField?:string; readonly width?:number; readonly minWidth?:number; readonly hideable?:boolean; readonly align?:'start'|'center'|'end'; readonly flex?:number; readonly filter?:import('./grid-filter.types').GridColumnFilter; }
export interface CollectionChoice { readonly value:string; readonly label:string; }
export interface CollectionSearch { readonly value:string; readonly placeholder:string; readonly maxLength?:number; readonly field?:{readonly label:string;readonly value:string;readonly options:readonly CollectionChoice[]}; readonly operator?:{readonly label:string;readonly value:string;readonly options:readonly CollectionChoice[]}; }
export type CollectionSearchChange = {readonly value:string}|{readonly field:string}|{readonly operator:string};
export type CollectionDensity='compact'|'standard'|'comfortable';
export type CollectionToolbarLayout='responsive'|'single-row';
export type RecordAction='first'|'previous'|'next'|'last';
export const collectionPageSizes:readonly number[]=[5,10,25,50];
export const collectionIdKey=(id:CollectionId)=>JSON.stringify([typeof id,id]);
export const collectionQueryKey=(query:CollectionQuery)=>JSON.stringify([query.scopeKey,query.criteriaKey,query.pageIndex,query.pageSize]);
