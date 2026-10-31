export type ReferenceId=string|number;
export interface ReferenceOption{readonly value:ReferenceId;readonly label:string;readonly disabled?:boolean;readonly description?:string;}
export interface ReferenceQuery{readonly scopeKey:string;readonly search:string;}
export interface ReferenceResult{readonly query:ReferenceQuery;readonly options:readonly ReferenceOption[];readonly hasMore:boolean;}
export interface ReferenceSource{readonly query:ReferenceQuery;readonly kind:'loading'|'ready'|'error'|'forbidden';readonly result?:ReferenceResult;}
export interface ReferenceSelection{readonly scopeKey:string;readonly value:ReferenceId;readonly kind:'loading'|'ready'|'missing'|'error';readonly option?:ReferenceOption;}
export const validReferenceId=(id:unknown):id is ReferenceId=>typeof id==='number'?Number.isSafeInteger(id):typeof id==='string'&&!!id.trim();
/** PrimeNG22 marks disabled options visually; expose the same state to assistive tech. */
export function referenceOptionAttributes(options:unknown):{'aria-disabled':'true'|'false'}{
 const context=typeof options==='object'&&options!==null&&'context'in options?options.context:null;
 return{'aria-disabled':typeof context==='object'&&context!==null&&'disabled'in context&&context.disabled===true?'true':'false'};
}
export function inspectReference(source:ReferenceSource,search:string):{kind:ReferenceSource['kind'];options:readonly ReferenceOption[];hasMore:boolean}{
 const empty={kind:source.kind,options:[],hasMore:false};
 if(!source.query.scopeKey.trim()||source.kind==='forbidden')return{...empty,kind:'forbidden'};
 if(source.kind!=='ready')return empty;
 const result=source.result;
 if(!result||source.query.search!==search||result.query.scopeKey!==source.query.scopeKey||result.query.search!==search)return{...empty,kind:'loading'};
 const keys=result.options.map(option=>JSON.stringify([typeof option.value,option.value]));
 if(new Set(keys).size!==keys.length||result.options.some(option=>!validReferenceId(option.value)||!option.label.trim()))return{...empty,kind:'error'};
 return{kind:'ready',options:result.options,hasMore:result.hasMore};
}
export function resolvedReference(selection:ReferenceSelection|null,scope:string,value:ReferenceId|null):ReferenceOption|null{
 if(value===null||!selection||selection.scopeKey!==scope||selection.value!==value||selection.kind!=='ready'||selection.option?.value!==value||!selection.option.label.trim())return null;
 return selection.option;
}
