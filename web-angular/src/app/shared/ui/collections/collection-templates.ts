import { Directive,inject,input,TemplateRef } from '@angular/core';
import type { CollectionColumn,CollectionSource,CollectionQuery } from './collection.types';
export interface CollectionColumnHeaderContext<T>{$implicit:CollectionColumn<T>;}
export interface CollectionColumnFooterContext<T>{$implicit:readonly T[];column:CollectionColumn<T>;total:number|null;query:CollectionQuery;}
@Directive({selector:'ng-template[erpCollectionColumnHeader]'})
export class CollectionColumnHeader<T>{
 readonly erpCollectionColumnHeader=input.required<CollectionColumn<T>>();readonly template=inject<TemplateRef<CollectionColumnHeaderContext<T>>>(TemplateRef);
 static ngTemplateContextGuard<T>(_directive:CollectionColumnHeader<T>,context:unknown):context is CollectionColumnHeaderContext<T>{return true;}
}
@Directive({selector:'ng-template[erpCollectionColumnFooter]'})
export class CollectionColumnFooter<T>{
 readonly erpCollectionColumnFooter=input.required<CollectionColumn<T>>();readonly template=inject<TemplateRef<CollectionColumnFooterContext<T>>>(TemplateRef);
 static ngTemplateContextGuard<T>(_directive:CollectionColumnFooter<T>,context:unknown):context is CollectionColumnFooterContext<T>{return true;}
}
export interface CollectionTemplateContext<T> { $implicit:T; }
@Directive({selector:'ng-template[erpCollectionCell]'})
export class CollectionCell<T> {
 readonly erpCollectionCell=input.required<CollectionColumn<T>>();readonly template=inject<TemplateRef<CollectionTemplateContext<T>>>(TemplateRef);
 static ngTemplateContextGuard<T>(_directive:CollectionCell<T>,context:unknown):context is CollectionTemplateContext<T>{return true;}
}
@Directive({selector:'ng-template[erpCollectionCard]'})
export class CollectionCardTemplate<T> {
 readonly erpCollectionCard=input.required<CollectionSource<T>>();readonly template=inject<TemplateRef<CollectionTemplateContext<T>>>(TemplateRef);
 static ngTemplateContextGuard<T>(_directive:CollectionCardTemplate<T>,context:unknown):context is CollectionTemplateContext<T>{return true;}
}
@Directive({selector:'ng-template[erpCollectionCardHeader]'})
export class CollectionCardHeader<T> {
 readonly erpCollectionCardHeader=input.required<CollectionSource<T>>();readonly template=inject<TemplateRef<CollectionTemplateContext<T>>>(TemplateRef);
 static ngTemplateContextGuard<T>(_directive:CollectionCardHeader<T>,context:unknown):context is CollectionTemplateContext<T>{return true;}
}
@Directive({selector:'ng-template[erpCollectionCardFooter]'})
export class CollectionCardFooter<T> {
 readonly erpCollectionCardFooter=input.required<CollectionSource<T>>();readonly template=inject<TemplateRef<CollectionTemplateContext<T>>>(TemplateRef);
 static ngTemplateContextGuard<T>(_directive:CollectionCardFooter<T>,context:unknown):context is CollectionTemplateContext<T>{return true;}
}
@Directive({selector:'ng-template[erpCollectionEmpty]'})
export class CollectionEmptyTemplate {readonly template=inject<TemplateRef<object>>(TemplateRef);}
@Directive({selector:'ng-template[erpCollectionRowDetails]'})
export class CollectionRowDetails<T>{
 readonly erpCollectionRowDetails=input.required<CollectionSource<T>>();readonly template=inject<TemplateRef<CollectionTemplateContext<T>>>(TemplateRef);
 static ngTemplateContextGuard<T>(_directive:CollectionRowDetails<T>,context:unknown):context is CollectionTemplateContext<T>{return true;}
}
