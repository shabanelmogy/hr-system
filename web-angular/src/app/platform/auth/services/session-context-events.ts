import { DOCUMENT } from '@angular/common';
import { DestroyRef, inject, Injectable } from '@angular/core';

export type ContextHint='external'|'visible';
@Injectable({providedIn:'root'})
export class SessionContextEvents {
  private readonly document=inject(DOCUMENT);
  private readonly listeners=new Set<(hint:ContextHint)=>void>();
  private readonly channel:BroadcastChannel|null;
  private closed=false;
  constructor(){
    const view=this.document.defaultView;
    this.channel=typeof view?.BroadcastChannel==='function'?new view.BroadcastChannel('erp-browser-session-context'):null;
    const message=(event:MessageEvent<unknown>)=>{
      const data=event.data;
      if(typeof data==='object'&&data!==null&&'kind'in data&&data.kind==='session-changed'&&Object.keys(data).length===1)this.emit('external');
    };
    const visible=()=>{if(this.document.visibilityState==='visible')this.emit('visible');};
    this.channel?.addEventListener('message',message);
    this.document.addEventListener('visibilitychange',visible);view?.addEventListener('focus',visible);
    inject(DestroyRef).onDestroy(()=>{this.closed=true;this.channel?.removeEventListener('message',message);this.channel?.close();this.document.removeEventListener('visibilitychange',visible);view?.removeEventListener('focus',visible);this.listeners.clear();});
  }
  subscribe(listener:(hint:ContextHint)=>void):()=>void{this.listeners.add(listener);return()=>this.listeners.delete(listener);}
  publish():void{if(!this.closed)this.channel?.postMessage({kind:'session-changed'});}
  private emit(hint:ContextHint):void{for(const listener of this.listeners)listener(hint);}
}
