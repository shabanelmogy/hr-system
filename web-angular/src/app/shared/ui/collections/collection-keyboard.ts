import type { RecordAction } from './collection.types';
interface RecordKeyboardPage {readonly pageIndex:number;readonly pageSize:number;readonly rowIndex:number;readonly rowCount:number;readonly total:number|null;readonly hasNextPage:boolean;readonly rtl:boolean;}
/** Shared record navigation only; callers preserve their own interactive controls/selection. */
export function collectionKeyTarget(event:Pick<KeyboardEvent,'key'|'ctrlKey'|'altKey'|'metaKey'>,page:RecordKeyboardPage):RecordAction|number|null{
 if(event.altKey||event.metaKey||event.ctrlKey&&!['Home','End'].includes(event.key)||page.rowIndex<0||page.rowCount<1)return null;
 const forward=page.rtl?'ArrowLeft':'ArrowRight',backward=page.rtl?'ArrowRight':'ArrowLeft';
 if(event.key==='ArrowDown'||event.key===forward)return'next';
 if(event.key==='ArrowUp'||event.key===backward)return'previous';
 if(event.ctrlKey)return event.key==='Home'?'first':event.key==='End'?'last':null;
 const start=page.pageIndex*page.pageSize,index=start+page.rowIndex;
 if(event.key==='Home')return start;
 if(event.key==='End')return start+page.rowCount-1;
 if(event.key==='PageUp')return Math.max(0,index-page.pageSize);
 if(event.key==='PageDown'){
  const last=page.total===null?start+page.rowCount-1:Math.max(0,page.total-1);
  return page.total===null&&page.hasNextPage?start+page.pageSize:Math.min(last,index+page.pageSize);
 }
 return null;
}
