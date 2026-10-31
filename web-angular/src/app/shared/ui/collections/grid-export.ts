import type { CollectionColumn } from './collection.types';
export interface GridCsvOptions {readonly filename?:string;readonly separator?:','|';'|'\t';readonly selectedOnly?:boolean;}
/** Strings that spreadsheet programs treat as formulas are escaped before CSV quoting. */
export function gridCsvCell(value:unknown,separator:string):string{
 let text=value===null||value===undefined?'':String(value);
 if(typeof value==='string'&&/^[\s\u0000-\u001f]*[=+@-]/u.test(text))text="'"+text;
 return text.includes(separator)||/[\r\n"]/u.test(text)?'"'+text.replaceAll('"','""')+'"':text;
}
export function createGridCsv<T>(columns:readonly CollectionColumn<T>[],rows:readonly T[],options:GridCsvOptions={}):string{
 const separator=options.separator??',';if(![',',';','\t'].includes(separator))throw Error('Unsupported CSV separator');
 return '\uFEFF'+[columns.map(column=>gridCsvCell(column.header,separator)).join(separator),...rows.map(row=>columns.map(column=>gridCsvCell(column.value(row),separator)).join(separator))].join('\r\n')+'\r\n';
}
export function gridCsvFilename(value:string|undefined):string{
 const base=(value??'records').replace(/[^\p{Letter}\p{Number} _.-]/gu,'').replace(/^\.+/,'').trim().slice(0,100)||'records';
 return base.toLowerCase().endsWith('.csv')?base:base+'.csv';
}
