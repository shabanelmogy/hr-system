import { afterNextRender,effect,ElementRef,inject,Injector } from '@angular/core';
import type { CollectionController } from './collection-controller';
import { collectionIdKey } from './collection.types';
export function attachCollectionFocus<T>(controller:CollectionController<T>):void{
 const host=inject<ElementRef<HTMLElement>>(ElementRef),injector=inject(Injector);
 effect(()=>{const request=controller.focusRequest();if(!request)return;
  afterNextRender(()=>{
   if(controller.focusRequest()!==request)return;
   const row=Array.from(host.nativeElement.querySelectorAll<HTMLElement>('[data-collection-row]')).find(element=>element.dataset['collectionRow']===collectionIdKey(request.id));
   row?.focus({preventScroll:true});row?.scrollIntoView({block:'nearest',inline:'nearest'});
  },{injector});
 });
}
export function collectionRowInteraction(event:Event):boolean{
 return event.target instanceof Element&&!!event.target.closest('button,a,input,select,textarea,p-checkbox,p-radiobutton,p-select,[role="checkbox"],[role="combobox"],[role="button"],[role="menuitem"],[role="textbox"],[contenteditable]:not([contenteditable="false"])');
}
