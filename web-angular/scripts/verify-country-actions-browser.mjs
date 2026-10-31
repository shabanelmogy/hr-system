import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import {chromium,expect} from '@playwright/test';
import {sessionFixture} from '../src/app/platform/auth/auth.fixture.ts';
import {dashboardFixture} from '../src/app/platform/tenants/dashboard.fixture.ts';

// All business writes are intercepted fixtures. No host credentials or SQL writes.
const root=path.resolve(import.meta.dirname,'..'),origin=process.env.ANGULAR_PREVIEW_ORIGIN??'https://localhost:4220';
const api=process.env.ANGULAR_API_ORIGIN??'https://shabanhrms.runasp.net';
const output=path.resolve(root,'../.codex-tmp/angular-country-actions');fs.mkdirSync(output,{recursive:true});
const core=JSON.parse(fs.readFileSync(path.join(root,'src/locales/generated/core.json'),'utf8'));
const captions=JSON.parse(fs.readFileSync(path.join(root,'src/locales/generated/reference-countries.json'),'utf8'));
const version=fs.readFileSync(path.join(root,'src/app/platform/localization/catalog.generated.ts'),'utf8').match(/[a-f0-9]{64}/)[0];
const browser=await chromium.launch({channel:'chrome',headless:true}),results=[];
try{
 for(const mode of ['light','dark'])for(const language of ['en','ar'])for(const width of [390,1440]){
  const reducedMotion=mode==='dark';
  const context=await browser.newContext({ignoreHTTPSErrors:true,viewport:{width,height:width===390?780:1050},reducedMotion:reducedMotion?'reduce':'no-preference'});
  await context.addCookies(Object.entries({i18next:language,currentMode:mode,themePalette:'green'}).map(([name,value])=>({name,value,url:origin})));
  const rows=Array.from({length:12},(_,index)=>({id:index+1,nameAr:'دولة '+(index+1),nameEn:'Country '+(index+1),alpha2Code:null,alpha3Code:null,phoneCode:null,currencyCode:null,isDeleted:false,createdOn:`2026-01-${String(index+1).padStart(2,'0')}T00:00:00Z`,updatedOn:null,statesCount:0}));
  const writes=[],errors=[];let writeMode='success',lifecycleMode='success',readOnly=false,hold=false,release=()=>{};
  await context.route(api+'/api/**',async route=>{
   const request=route.request(),url=new URL(request.url()),p=url.pathname,method=request.method();let body,status=200;
   if(p.endsWith('/csrf'))body={requestToken:'synthetic-csrf'};
   else if(p.endsWith('/session')||p.endsWith('/refresh'))body={isAuthenticated:true,user:{...sessionFixture,roles:['super_admin'],permissions:['Countries:View','Countries:Create','Countries:Edit','Countries:Archive','Countries:Restore'],tenantReadOnly:readOnly}};
   else if(p.endsWith('/runtime'))body={catalogVersion:version,revision:0,overrides:[]};
   else if(p.endsWith('/getDashboardSummary'))body=dashboardFixture;
   else if(p.endsWith('/modules/accessible'))body=[];
   else if(p==='/api/v1/countries'&&method==='GET'){
    const size=Number(url.searchParams.get('pageSize')),number=Number(url.searchParams.get('pageNumber')),statusFilter=url.searchParams.get('status');
    const search=(url.searchParams.get('search')??'').toLowerCase();let filtered=rows.filter(row=>(statusFilter==='all'||row.isDeleted===(statusFilter==='archived'))&&(!search||row.nameEn.toLowerCase().includes(search)||row.nameAr.includes(search)));
    filtered=[...filtered].sort((a,b)=>b.createdOn.localeCompare(a.createdOn));const totalCount=filtered.length,totalPages=Math.ceil(totalCount/size);
    body={items:filtered.slice((number-1)*size,number*size),metaData:{currentPage:number,pageNumber:number,pageSize:size,totalCount,totalPages,hasNext:number<totalPages,hasPrev:number>1}};
   }else if(/^\/api\/v1\/countries\/\d+$/.test(p)&&method==='GET'){
    const row=rows.find(row=>row.id===Number(p.split('/').at(-1)));assert.ok(row);const{statesCount,...detail}=row;body=detail;
   }else if((p==='/api/v1/countries'&&method==='POST')||(/^\/api\/v1\/countries\/\d+$/.test(p)&&method==='PUT')){
    assert.equal(request.headers()['x-erp-xsrf'],'synthetic-csrf');assert.equal(request.headers().authorization,undefined);const payload=request.postDataJSON();assert.deepEqual(Object.keys(payload).sort(),['alpha2Code','alpha3Code','currencyCode','nameAr','nameEn','phoneCode']);
    writes.push({method,path:p,payload});if(hold)await new Promise(resolve=>release=resolve);
    if(writeMode==='field'){status=400;body={errors:{NameEn:['Use a unique English name']}};}
    else if(writeMode==='conflict'){status=409;body={title:'Duplicate country'};}
    else{
     const id=method==='POST'?Math.max(...rows.map(row=>row.id))+1:Number(p.split('/').at(-1));
     const row=method==='POST'?{id,...payload,createdOn:`2026-10-30T12:00:${String(id).padStart(2,'0')}Z`,updatedOn:null,isDeleted:false,statesCount:0}:rows.find(row=>row.id===id);assert.ok(row);Object.assign(row,payload);if(method==='POST')rows.push(row);else row.updatedOn='2026-10-30T12:00:00Z';
     if(writeMode==='lost'){await route.abort('failed');return;}
     const{statesCount,...detail}=row;body=detail;status=method==='POST'?201:200;
    }
   }else if((method==='DELETE'&&/^\/api\/v1\/countries\/\d+$/.test(p))||(method==='POST'&&(/^\/api\/v1\/countries\/\d+\/restore$/.test(p)||p.endsWith('/bulk-archive')))){
    assert.equal(request.headers()['x-erp-xsrf'],'synthetic-csrf');assert.equal(request.headers().authorization,undefined);
    const bulk=p.endsWith('/bulk-archive'),restore=p.endsWith('/restore'),payload=bulk?request.postDataJSON():null;
    const ids=bulk?payload.ids:[Number(p.split('/').at(restore?-2:-1))];assert.ok(ids.length&&ids.length<=100);assert.equal(new Set(ids).size,ids.length);if(bulk)assert.deepEqual(Object.keys(payload),['ids']);
    writes.push({method,path:p,payload});if(hold)await new Promise(resolve=>release=resolve);
    if(lifecycleMode==='dependency'){status=400;body={errors:{'Country.CountryInUseByState':['Internal detail must not render']}};}
    else{
     let archivedCount=0;for(const id of ids){const row=rows.find(row=>row.id===id);assert.ok(row);if(!restore&&!row.isDeleted)archivedCount++;row.isDeleted=!restore;}
     if(lifecycleMode==='lost'){await route.abort('failed');return;}
     if(!bulk){await route.fulfill({status:204,body:''});return;}body={archivedCount};
    }
   }else throw Error('Unexpected actions API '+method+' '+p);
   await route.fulfill({status,contentType:'application/json',body:JSON.stringify(body)});
  });
  const page=await context.newPage();page.on('pageerror',error=>errors.push(error.message));page.on('dialog',async dialog=>{errors.push('Native dialog '+dialog.type());await dialog.dismiss();});
  const text=core[language],country=captions[language],region=page.getByTestId('countries');
  await page.goto(origin+'/home');await page.getByTestId('open-data').getByRole('button').click();await page.getByRole('complementary').getByRole('button',{name:text['menu.countries'],exact:true}).click();await expect(region).toHaveAttribute('data-kind','ready');
  if(width===1440)await page.locator('.drawer-header').getByRole('button',{name:text['menu.closeSidebar'],exact:true}).click();
  await expect(page.locator('th.action-cell')).toHaveText(text['actions.buttons']);
  const tableScroll=region.locator('.p-datatable-table-container');
  const alignment=async()=>page.evaluate(()=>{
   const header=document.querySelector('th.action-cell'),cell=document.querySelector('td.action-cell'),viewport=document.querySelector('.p-datatable-table-container');
   if(!header||!cell||!viewport)return false;const h=header.getBoundingClientRect(),c=cell.getBoundingClientRect(),v=viewport.getBoundingClientRect();
   return getComputedStyle(header).position==='sticky'&&Math.abs(h.left-c.left)<2&&Math.abs(h.width-c.width)<2&&h.left>=v.left-2&&h.right<=v.right+2;
  });
  await expect.poll(alignment).toBe(true);
  await tableScroll.evaluate((element,rtl)=>element.scrollLeft=rtl?-element.scrollWidth:element.scrollWidth,language==='ar');await expect.poll(alignment).toBe(true);
  await tableScroll.evaluate(element=>element.scrollLeft=0);await expect.poll(alignment).toBe(true);

  const record=id=>region.locator(`[data-collection-row='${JSON.stringify(['number',id])}']`);
  const activeRecord=()=>region.locator('[data-collection-row][tabindex="0"]');
  const expectActive=async id=>{await expect(record(id)).toHaveAttribute('tabindex','0');await expect(record(id)).toBeFocused();};
  await record(12).click();await expectActive(12);
  await page.keyboard.press('ArrowDown');await expectActive(11);
  await page.keyboard.press(language==='ar'?'ArrowRight':'ArrowLeft');await expectActive(12);
  await page.keyboard.press('End');await expectActive(3);
  await page.keyboard.press('Home');await expectActive(12);
  await page.keyboard.press('PageDown');await expectActive(2);
  await page.keyboard.press('ArrowDown');await expectActive(1);
  await page.keyboard.press('ArrowDown');await expectActive(1);
  await page.keyboard.press('Control+Home');await expectActive(12);
  await page.keyboard.press('Control+End');await expectActive(1);
  await page.keyboard.press('PageUp');await expectActive(11);
  await page.keyboard.press('Control+Home');await expectActive(12);
  await page.keyboard.press('Enter');const detail=page.getByRole('dialog',{name:country['countries.view'],exact:true});await expect(detail).toBeVisible();await detail.getByRole('button',{name:text['actions.close'],exact:true}).last().click();await expect(detail).not.toBeVisible();
  const search=region.locator('erp-collection-frame .search-controls erp-text-field input');await search.click();await expect(search).toBeFocused();const beforeInput=await activeRecord().getAttribute('data-collection-row');await page.keyboard.press('ArrowDown');assert.equal(await activeRecord().getAttribute('data-collection-row'),beforeInput);await expect(search).toBeFocused();

  const add=page.locator('erp-page-header .primary-action').getByRole('button'),form=()=>page.getByRole('dialog',{name:country['countries.add'],exact:true});
  const fill=async(dialog,name='New Country')=>{for(const[field,value]of Object.entries({nameAr:'دولة جديدة',nameEn:name,alpha2Code:'zz',alpha3Code:'zzz',phoneCode:'+123',currencyCode:'usd'}))await dialog.locator(`input[name=${field}]`).fill(value);};
  const save=dialog=>dialog.locator('button[type=submit]'),cancel=dialog=>dialog.getByRole('button',{name:text['actions.cancel'],exact:true});
  const discard=async()=>{const confirmation=page.getByRole('dialog',{name:text['messages.unsavedChangesTitle'],exact:true});await expect(confirmation).toBeVisible();await confirmation.getByRole('button',{name:text['messages.discardChanges'],exact:true}).click();};
  const heading=await page.locator('erp-page-header h1').boundingBox();assert.ok(heading&&heading.height<65,'Collection title must not collapse into individual letters');await add.click();await expect(form()).toBeVisible();await expect(save(form())).toBeEnabled();
  await expect(form().locator('.p-badge')).toHaveCount(6);const inputFields=form().locator('erp-text-field');const bounds=await inputFields.evaluateAll(fields=>fields.map(field=>{const box=field.getBoundingClientRect();return{x:box.x,y:box.y,width:box.width,height:box.height};}));for(let i=1;i<bounds.length;i++){assert.ok(Math.abs(bounds[i].x-bounds[0].x)<2);assert.ok(bounds[i].y>=bounds[i-1].y+bounds[i-1].height+15);}
  for(const[field,maximum]of Object.entries({nameAr:100,nameEn:100,alpha2Code:2,alpha3Code:3,phoneCode:10,currencyCode:3})){await expect(form().locator(`input[name=${field}]`)).toHaveAttribute('maxlength',String(maximum));await expect(form().locator(`erp-text-field:has(input[name=${field}]) .p-badge`)).toHaveText('0/'+maximum);}
  await expect(save(form())).toBeInViewport();await expect(save(form())).toHaveText(country['countries.add']);await page.screenshot({path:path.join(output,`${mode}-${language}-${width}-add-form.png`),fullPage:true,animations:'disabled'});await form().screenshot({path:path.join(output,`${mode}-${language}-${width}-add-form-dialog.png`),animations:'disabled'});
  const alpha2=form().locator('erp-text-field:has(input[name=alpha2Code])');await alpha2.locator('input').fill('AA');await expect(alpha2.locator('.p-badge')).toHaveText('2/2');await alpha2.getByRole('button',{name:text['general.clear'],exact:true}).click();await expect(alpha2.locator('.p-badge')).toHaveText('0/2');
  await form().getByRole('button',{name:country['countries.generateMockData'],exact:true}).click();for(const field of ['nameAr','nameEn'])await expect(form().locator(`input[name=${field}]`)).not.toHaveValue('');await expect(alpha2.locator('.p-badge')).toHaveText('2/2');await cancel(form()).click();await discard();await add.click();
  await save(form()).click();await expect(form().locator('[aria-invalid=true]')).toHaveCount(2);await expect(form().locator('input[name=nameAr]')).toBeFocused();assert.equal(writes.length,0);
  await fill(form());await expect(form().locator('erp-text-field:has(input[name=alpha2Code]) .p-badge')).toHaveText('2/2');await cancel(form()).click();const consent=page.getByRole('dialog',{name:text['messages.unsavedChangesTitle'],exact:true});await expect(consent).toBeVisible();await consent.locator('.dialog-actions').getByRole('button',{name:text['actions.cancel'],exact:true}).click();await expect(form().locator('input[name=nameEn]')).toHaveValue('New Country');
  await cancel(form()).click();await discard();await expect(form()).not.toBeVisible();assert.equal(writes.length,0);
  await add.click();await fill(form());hold=true;await save(form()).click();await expect.poll(()=>writes.length).toBe(1);await expect(save(form())).toBeDisabled();await expect(form().locator('input[name=nameEn]')).toHaveAttribute('readonly','');release();hold=false;
  await expect(form()).not.toBeVisible();await expect(page.locator('.p-toast-message')).toContainText(country['countries.created']);await expect(region).toHaveAttribute('data-kind','ready');
  assert.equal(writes[0].payload.alpha2Code,'ZZ');assert.equal(writes[0].payload.currencyCode,'USD');
  const toastStyle=await page.locator('.p-toast-message').first().evaluate(element=>({background:getComputedStyle(element).backgroundColor,color:getComputedStyle(element).color}));assert.notEqual(toastStyle.background,'rgba(0, 0, 0, 0)');
  await page.screenshot({path:path.join(output,`${mode}-${language}-${width}-created.png`),fullPage:true,animations:'disabled'});
  await region.locator('[data-row-action=edit][data-action-row="13"]').getByRole('button').click();const edit=page.getByRole('dialog',{name:country['countries.edit'],exact:true});await expect(edit.locator('input[name=nameEn]')).toHaveValue('New Country');await edit.locator('input[name=nameEn]').fill('Updated Country');await save(edit).click();await expect(edit).not.toBeVisible();await expect(region).toContainText('Updated Country');await expect(page.locator('.p-toast-message').last()).toContainText(country['countries.updated']);assert.equal(writes[1].method,'PUT');
  await expectActive(13);await expect(record(13)).toHaveClass(/edited-row/);
  const flashStyle=await record(13).locator('td').first().evaluate(element=>({animation:getComputedStyle(element).animationName,background:getComputedStyle(element).backgroundColor}));if(reducedMotion)assert.equal(flashStyle.animation,'none');else assert.match(flashStyle.animation,/erp-edited-record-flash$/);assert.notEqual(flashStyle.background,'rgba(0, 0, 0, 0)');
  await page.screenshot({path:path.join(output,`${mode}-${language}-${width}-edited-flash.png`),fullPage:true});
  await expect(record(13)).not.toHaveClass(/edited-row/,{timeout:5000});await expectActive(13);
  await region.locator('[data-row-action=edit][data-action-row="13"]').getByRole('button').click();await save(edit).click();await expect(edit).not.toBeVisible();await expectActive(13);await expect(record(13)).toHaveClass(/edited-row/);await record(13).locator('td').nth(1).hover();await page.keyboard.press('ArrowDown');await expectActive(12);await expect(record(13)).not.toHaveClass(/edited-row/);await expect(region.locator('tr.active-row')).toHaveCount(1);const oldCell=await record(13).locator('td').nth(1).evaluate(element=>({background:getComputedStyle(element).backgroundColor,animation:getComputedStyle(element).animationName}));const ordinaryCell=await record(11).locator('td').nth(1).evaluate(element=>getComputedStyle(element).backgroundColor);assert.equal(oldCell.background,ordinaryCell);assert.equal(oldCell.animation,'none');await page.screenshot({path:path.join(output,`${mode}-${language}-${width}-keyboard-single-focus.png`),fullPage:true});await page.keyboard.press('ArrowUp');await expectActive(13);await expect(record(13)).not.toHaveClass(/edited-row/);
  await page.locator('erp-page-header [data-view=cards]').getByRole('button').click();await expect(record(13)).not.toHaveClass(/edited-row/);await region.locator('[data-row-action=edit][data-action-row="13"]').getByRole('button').click();await expect(edit.locator('input[name=nameEn]')).toHaveValue('Updated Country');await cancel(edit).click();await expect(edit).not.toBeVisible();
  await region.locator('[data-row-action=edit][data-action-row="13"]').getByRole('button').click();await save(edit).click();await expect(edit).not.toBeVisible();await expectActive(13);await expect(record(13)).toHaveClass(/edited-row/);const cardAnimation=await record(13).evaluate(element=>getComputedStyle(element).animationName);if(reducedMotion)assert.equal(cardAnimation,'none');else assert.match(cardAnimation,/erp-edited-card-flash$/);await page.keyboard.press('ArrowDown');await expectActive(12);await expect(record(13)).not.toHaveClass(/edited-row/);await expect(region.locator('article.active')).toHaveCount(1);await page.keyboard.press('Home');await expectActive(13);await expect(record(13)).not.toHaveClass(/edited-row/);
  await record(13).click();await page.keyboard.press('ArrowDown');await expectActive(12);await page.keyboard.press('Home');await expectActive(13);
  await page.locator('erp-page-header [data-view=grid]').getByRole('button').click();
  await add.click();await fill(form(),'Rejected Country');writeMode='field';await save(form()).click();await expect(form().locator('erp-text-field')).toContainText(['','Use a unique English name','','','','']);await expect(form().locator('input[name=nameEn]')).toBeFocused();await expect(page.getByRole('dialog',{name:text['errorDialog.title'],exact:true})).toHaveCount(0);
  await form().locator('input[name=nameEn]').fill('Another Country');writeMode='conflict';await save(form()).click();const error=page.getByRole('dialog',{name:text['errorDialog.title'],exact:true});await expect(error).toBeVisible();await expect(error).toContainText(country['countries.createError']);await error.locator('.dialog-actions').getByRole('button',{name:text['actions.close'],exact:true}).click();await expect(form().locator('input[name=nameEn]')).toHaveValue('Another Country');
  writeMode='lost';const beforeLost=writes.length;await save(form()).click();const uncertain=page.getByRole('dialog',{name:text['imports.submissionUncertainTitle'],exact:true});await expect(uncertain).toBeVisible();await expect(uncertain).toContainText(country['countries.mutationUncertain']);await uncertain.locator('.dialog-actions').getByRole('button',{name:text['actions.close'],exact:true}).click();await expect(save(form())).toBeDisabled();assert.equal(writes.length,beforeLost+1);await cancel(form()).click();await discard();await expect(form()).not.toBeVisible();await expect(region).toHaveAttribute('data-kind','ready');await expect(region).toContainText('Another Country');
  const rowAction=(action,id)=>region.locator(`[data-row-action=${action}][data-action-row="${id}"]`).getByRole('button');
  const confirm=title=>page.getByRole('dialog',{name:country[title],exact:true});
  const changeStatus=async value=>{await page.getByTestId('status').getByRole('combobox').click();await page.getByRole('option',{name:country['countries.status.'+value],exact:true}).click();await expect(region).toHaveAttribute('data-kind','ready');};
  await rowAction('archive',14).click();const archive=confirm('countries.archiveTitle');await expect(archive).toBeVisible();await expect(archive.locator('.dialog-actions').getByRole('button',{name:text['actions.cancel'],exact:true})).toBeFocused();const beforeCancel=writes.length;await archive.locator('.dialog-actions').getByRole('button',{name:text['actions.cancel'],exact:true}).click();assert.equal(writes.length,beforeCancel);
  await rowAction('archive',14).click();hold=true;await archive.locator('.dialog-actions').getByRole('button',{name:text['actions.archive'],exact:true}).click();await expect.poll(()=>writes.length).toBe(beforeCancel+1);for(const button of await archive.locator('.dialog-actions button').all())await expect(button).toBeDisabled();release();hold=false;await expect(archive).not.toBeVisible();await expect(rowAction('archive',14)).toHaveCount(0);await expect(page.locator('.p-toast-message').last()).toContainText(country['countries.archived']);
  await expectActive(13);await changeStatus('archived');await expect(rowAction('edit',14)).toHaveCount(0);await expect(region.getByRole('checkbox').last()).toBeDisabled();await rowAction('restore',14).click();const restore=confirm('countries.restoreTitle');await restore.locator('.dialog-actions').getByRole('button',{name:text['actions.restore'],exact:true}).click();await expect(restore).not.toBeVisible();await expect(region).toContainText(country['countries.noCountriesAvailable']);await changeStatus('active');
  await rowAction('archive',12).click();await archive.locator('.dialog-actions').getByRole('button',{name:text['actions.archive'],exact:true}).click();await expect(archive).not.toBeVisible();await expectActive(13);
  await changeStatus('archived');await rowAction('restore',12).click();await restore.locator('.dialog-actions').getByRole('button',{name:text['actions.restore'],exact:true}).click();await expect(restore).not.toBeVisible();await changeStatus('active');
  const selectRow=async id=>{const checkbox=rowAction('archive',id).locator('xpath=ancestor::tr').getByRole('checkbox');await checkbox.check();};
  await selectRow(14);await selectRow(13);const bulk=page.getByTestId('archive-selected').getByRole('button');await expect(bulk).toContainText('2');await bulk.click();const batch=confirm('countries.bulkArchiveTitle');await expect(batch).toContainText(language==='ar'?'دولة جديدة':'Updated Country');lifecycleMode='dependency';const beforeBatch=writes.length;await batch.locator('.dialog-actions').getByRole('button',{name:country['countries.bulkArchiveConfirm'].replace('{{count}}','2'),exact:true}).click();await expect(error).toBeVisible();await expect(error).toContainText(country['countries.inUseByState']);assert.equal(rows.filter(row=>row.isDeleted).length,0);for(const id of [13,14])await expect(rowAction('archive',id).locator('xpath=ancestor::tr').getByRole('checkbox')).toBeChecked();await page.screenshot({path:path.join(output,`${mode}-${language}-${width}-dependency-modal.png`),fullPage:true,animations:'disabled'});await error.locator('.dialog-actions').getByRole('button',{name:text['actions.close'],exact:true}).click();
  lifecycleMode='success';await bulk.click();await batch.locator('.dialog-actions').getByRole('button',{name:country['countries.bulkArchiveConfirm'].replace('{{count}}','2'),exact:true}).click();await expect(batch).not.toBeVisible();await expect(rowAction('archive',14)).toHaveCount(0);await expect(bulk).toHaveCount(0);assert.deepEqual([...writes.at(-1).payload.ids].sort((a,b)=>a-b),[13,14]);assert.equal(writes.length,beforeBatch+2);await expect(page.locator('.p-toast-message').last()).toContainText(country['countries.bulkArchived'].replace('{{count}}','2'));
  await expectActive(12);await page.keyboard.press('PageDown');await expectActive(2);await rowAction('archive',2).click();await archive.locator('.dialog-actions').getByRole('button',{name:text['actions.archive'],exact:true}).click();await expect(archive).not.toBeVisible();await expectActive(3);
  await changeStatus('archived');await rowAction('restore',2).click();await restore.locator('.dialog-actions').getByRole('button',{name:text['actions.restore'],exact:true}).click();await expect(restore).not.toBeVisible();
  await page.locator('erp-page-header [data-view=cards]').getByRole('button').click();await rowAction('restore',14).click();await restore.locator('.dialog-actions').getByRole('button',{name:text['actions.restore'],exact:true}).click();await expect(restore).not.toBeVisible();await changeStatus('active');
  lifecycleMode='lost';await rowAction('archive',14).click();await archive.locator('.dialog-actions').getByRole('button',{name:text['actions.archive'],exact:true}).click();await expect(uncertain).toBeVisible();await expect(uncertain).toContainText(country['countries.lifecycleUncertain']);const afterLifecycleLost=writes.length;await uncertain.locator('.dialog-actions').getByRole('button',{name:text['actions.close'],exact:true}).click();await expect(rowAction('archive',14)).toHaveCount(0);assert.equal(writes.length,afterLifecycleLost);
  readOnly=true;await page.evaluate(()=>{const channel=new BroadcastChannel('erp-browser-session-context');channel.postMessage({kind:'session-changed'});channel.close();});await expect(add).toHaveCount(0);await expect(region.locator('[data-row-action=edit]')).toHaveCount(0);await expect(region.locator('[data-row-action=view]').first()).toBeVisible();
  assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1));assert.deepEqual(errors,[]);
  await expect(region.locator('[data-row-action=archive],[data-row-action=restore]')).toHaveCount(0);
  results.push({mode,language,width,reducedMotion,writes:writes.length,toastStyle,formSingleColumn:true,nativeCounterBadges:true,keyboard:true,inputKeyboardIsolation:true,editedActiveFlash:true,flashExpiresWithoutReplay:true,cardsRepeatedEditFlash:true,oldFlashClearedOnMove:true,stationaryHoverCleared:true,singleActiveFocus:true,archivePreviousRow:true,archivePageBoundary:true,create:true,edit:true,cards:true,inlineFieldErrors:true,generalErrorModal:true,uncertainNoReplay:true,archive:true,restore:true,bulk:true,atomicDependencyRejection:true,lifecycleNoReplay:true,readOnlyGuard:true,passed:true});await context.close();console.log(`Countries actions passed ${mode}/${language}/${width}`);
 }
 fs.writeFileSync(path.join(output,'edit-results.json'),JSON.stringify(results,null,2));
}finally{await browser.close();}
