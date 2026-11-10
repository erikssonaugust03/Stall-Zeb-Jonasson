'use strict';
let data, token, active = 'horses', editing = null, editingCollection, dirty = false, saving = false;
const labels = {horses:'Hästar',news:'Nyheter',starts:'Starter',sales:'Försäljning',staff:'Personal'};
const $ = id => document.getElementById(id);
const esc = v => String(v ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const horse = id => data.horses.find(h => h.id === id);
const horseName = id => horse(id)?.namn || 'Saknar hästkoppling';
const row = (label,value) => `<dt>${esc(label)}</dt><dd>${esc(value ?? '–')}</dd>`;
const statuses = {active:'Aktiv',archived:'Arkiverad',draft:'Testutkast',available:'Till salu',reserved:'Reserverad',sold:'Såld'};
function card(item) {
  let title = '', body = '', url = '';
  if (active === 'horses') {
    title = item.namn;
    body = row('Status',statuses[item.status]) + row('Far / Mor',[item.far,item.mor].filter(Boolean).join(' / '))
      + row('Starter i historiken',data.starts.filter(s=>s.hastar.some(h=>h.horseId===item.id)).length)
      + row('Relaterade nyheter',data.news.filter(n=>n.horseIds.includes(item.id)).length)
      + row('Skötare',item.staffIds.map(id=>data.staff.find(p=>p.id===id)?.namn).join(', ') || item.skotare || 'Ej kopplad');
    url = '/hastar/' + encodeURIComponent(item.slug);
  } else if (active === 'news') {
    title=item.titel; body=row('Datum',item.datum)+row('Hästar',item.horseIds.map(horseName).join(', ')||'Ej kopplad')+row('Text',item.text);
    url='/nyheter/'+encodeURIComponent(item.slug);
  } else if (active === 'starts') {
    title=item.datum+' · '+item.lopp;
    body=item.hastar.map(h=>row(h.start,horseName(h.horseId) || h.namn)+row('Kommentar',h.kommentar)).join(''); url='/startkommentarer';
  } else if (active === 'sales') {
    title=horseName(item.horseId); body=row('Status',statuses[item.status])+row('Typ',item.typ)+row('Pris',item.pris+' kr')+row('Andelar',item.antal_andelar)+row('Text',item.beskrivning); url='/hastar-till-salu';
  } else {
    title=item.namn; body=row('Roll',item.roll)+row('Status',statuses[item.status])+row('Presentation',item.presentation); url='/personal';
  }
  return `<article><h2>${esc(title)}</h2><dl>${body}</dl><div class="actions"><button type="button" data-edit="${esc(item.id)}">Redigera</button><a href="${url}" target="_blank" rel="noopener">Visa i testhemsidan →</a></div></article>`;
}
function render() {
  $('tabs').innerHTML=Object.entries(labels).map(([key,label])=>`<button type="button" data-key="${key}" aria-pressed="${key===active}">${label} (${data[key].length})</button>`).join('');
  $('horseFilter').hidden=active!=='horses';
  const q=$('search').value.trim().toLocaleLowerCase('sv');
  const items=data[active].filter(x=>(active!=='horses'||$('statusFilter').value==='all'||x.status===$('statusFilter').value)&&JSON.stringify(x).toLocaleLowerCase('sv').includes(q));
  $('count').textContent=items.length+' av '+data[active].length+' poster';
  $('records').innerHTML=items.map(card).join('')||'<div class="empty">Inga poster att visa. Ändra sökningen eller lägg till en ny post.</div>';
  $('notes').innerHTML=data.reviewNotes.map(n=>`<li>${esc(n)}</li>`).join('');
}
function input(name,label,value='',type='text',required=false) {
  return `<label>${esc(label)}<input name="${name}" type="${type}" value="${esc(value)}" ${required?'required':''} ${type==='number'?'min="1970" step="1"':''}></label>`;
}
function area(name,label,value='') { return `<label class="wide">${esc(label)}<textarea name="${name}">${esc(value)}</textarea></label>`; }
function select(name,label,value,options) {
  return `<label>${esc(label)}<select name="${name}">${options.map(([v,l])=>`<option value="${esc(v)}" ${v===value?'selected':''}>${esc(l)}</option>`).join('')}</select></label>`;
}
function choices(name,label,selected,items) {
  return `<fieldset><legend>${esc(label)}</legend><div class="check-options">${items.map(([id,text])=>`<label><input type="checkbox" name="${name}" value="${esc(id)}" ${selected.includes(id)?'checked':''}>${esc(text)}</label>`).join('')||'<small>Inga poster ännu.</small>'}</div></fieldset>`;
}
function horseOptions(){return [['','Välj häst…'],...data.horses.map(h=>[h.id,h.namn+(h.status==='archived'?' (arkiverad)':'')])];}
function entryFields(entry={}) {
  return `<div class="entry">${select('entryHorse','Häst',entry.horseId||'',horseOptions())}${input('entryName','Historiskt hästnamn',entry.namn||'')}${input('entryRace','Lopp, exempelvis Lopp 1',entry.start||'','text',true)}${area('entryComment','Kommentar',entry.kommentar||'')}<button type="button" data-remove-entry>Ta bort startraden</button></div>`;
}
function newRecord(){
  const id=active.slice(0,-1)+'-'+crypto.randomUUID();
  const defaults={horses:{namn:'',slug:'',status:'active',birthYear:null,staffIds:[],far:'',mor:'',kon:'Sto',alder:'',bilder:[]},news:{titel:'',slug:'',datum:new Date().toLocaleDateString('sv-SE'),tid:'',text:'',horseIds:[]},starts:{datum:new Date().toLocaleDateString('sv-SE'),lopp:'',hastar:[]},sales:{horseId:'',status:'draft',typ:'Andel',pris:'',antal_andelar:'',beskrivning:'',bilder:[]},staff:{namn:'',roll:'',bild:'',presentation:'',status:'active'}};
  return {id,...defaults[active]};
}
function edit(record){
  editing=structuredClone(record); editingCollection=active; dirty=false; $('editError').textContent='';
  $('editorTitle').textContent=(data[active].some(x=>x.id===record.id)?'Redigera ':'Lägg till ')+labels[active].toLocaleLowerCase('sv');
  let fields=''; const statusOptions=[['active','Aktiv'],['archived','Arkiverad']];
  if(active==='horses'){
    fields='<div class="grid">'+input('namn','Namn',record.namn,'text',true)+input('slug','URL-namn',record.slug,'text',true)
      +select('status','Status',record.status,statusOptions)+input('birthYear','Födelseår (lämna tomt om okänt)',record.birthYear??'','number')
      +select('kon','Kön',record.kon||'Sto',[['Sto','Sto'],['Valack','Valack'],['Hingst','Hingst']])
      +input('alder','Äldre åldersuppgift (används utan födelseår)',record.alder||'')
      +['far','mor','agare','uppfodare'].map((n,i)=>input(n,['Far','Mor','Ägare','Uppfödare'][i],record[n]||'')).join('')
      +input('travsport','Svensk Travsport-länk',record.travsport||'','url')+input('bild','Huvudbild',record.bild||'')+'</div>'
      +area('bilder','Bildgalleri',(record.bilder||[]).join('\n'))
      +choices('staffIds','Koppla personal',record.staffIds,data.staff.map(p=>[p.id,p.namn]));
  } else if(active==='news'){
    fields=input('titel','Rubrik',record.titel,'text',true)+input('slug','URL-namn',record.slug,'text',true)+'<div class="grid">'+input('datum','Datum',record.datum,'date',true)+input('tid','Tid',record.tid||'','time')+'</div>'+area('text','Nyhetstext',record.text)+input('bild','Bild',record.bild||'')+input('youtube','YouTube-länk (visning blockerad i lokalt säkerhetstest)',record.youtube||'','url')+choices('horseIds','Relaterade hästar',record.horseIds,data.horses.map(h=>[h.id,h.namn+(h.status==='archived'?' (arkiverad)':'')]));
  } else if(active==='starts'){
    fields=input('datum','Datum',record.datum,'date',true)+input('lopp','Bana / evenemang',record.lopp,'text',true)+'<fieldset><legend>Startande hästar</legend><div id="entries">'+(record.hastar.length?record.hastar:[{}]).map(entryFields).join('')+'</div><button type="button" id="addEntry">Lägg till startande häst</button></fieldset>';
  } else if(active==='sales'){
    fields=select('horseId','Häst',record.horseId,horseOptions())+select('status','Försäljningsstatus',record.status,[['draft','Testutkast'],['available','Till salu'],['reserved','Reserverad'],['sold','Såld'],['archived','Arkiverad']])+select('typ','Typ',record.typ,[['Andel','Andel'],['Hel häst','Hel häst']])+input('pris','Pris i kr',record.pris)+input('antal_andelar','Antal andelar',record.antal_andelar)+area('beskrivning','Beskrivning',record.beskrivning)+area('bilder','Extra annonsbilder',(record.bilder||[]).join('\n'))+'<small>Namn, huvudbild och härstamning hämtas från hästregistret. Sålda och arkiverade annonser döljs i testhemsidan.</small>';
  } else {
    fields=input('namn','Namn',record.namn,'text',true)+input('roll','Roll',record.roll,'text',true)+input('bild','Bild',record.bild||'')+area('presentation','Presentation',record.presentation||'')+select('status','Status',record.status,statusOptions);
  }
  $('fields').innerHTML=fields; $('editor').showModal();
}
function closeEditor(){if(saving)return;if(dirty&&!confirm('Stäng utan att spara de osparade teständringarna?'))return;$('editor').close();}
$('editForm').addEventListener('input',()=>dirty=true);
$('editor').addEventListener('cancel',e=>{e.preventDefault();closeEditor()});
$('closeEditor').onclick=closeEditor; $('cancel').onclick=closeEditor;
$('fields').addEventListener('click',e=>{if(e.target.id==='addEntry'){$('entries').insertAdjacentHTML('beforeend',entryFields());dirty=true;}if(e.target.hasAttribute('data-remove-entry')){e.target.closest('.entry').remove();dirty=true;}});
$('fields').addEventListener('change',e=>{if(e.target.name==='entryHorse'){const h=horse(e.target.value);if(h)e.target.closest('.entry').querySelector('[name=entryName]').value=h.namn;}});
$('editForm').addEventListener('submit',async e=>{
  e.preventDefault(); if(saving)return;
  const form=new FormData(e.target), record=structuredClone(editing);
  const fields={horses:['namn','slug','status','kon','alder','far','mor','agare','uppfodare','travsport','bild'],news:['titel','slug','datum','tid','text','bild','youtube'],starts:['datum','lopp'],sales:['horseId','status','typ','pris','antal_andelar','beskrivning'],staff:['namn','roll','bild','presentation','status']}[editingCollection];
  fields.forEach(n=>record[n]=String(form.get(n)||'').trim());
  if(editingCollection==='horses'){record.birthYear=form.get('birthYear')?Number(form.get('birthYear')):null;record.staffIds=form.getAll('staffIds');}
  if(editingCollection==='news')record.horseIds=form.getAll('horseIds');
  if(['horses','sales'].includes(editingCollection))record.bilder=String(form.get('bilder')||'').split('\n').map(s=>s.trim()).filter(Boolean);
  if(editingCollection==='starts')record.hastar=[...document.querySelectorAll('.entry')].map(el=>({horseId:el.querySelector('[name=entryHorse]').value||null,namn:el.querySelector('[name=entryName]').value.trim(),start:el.querySelector('[name=entryRace]').value.trim(),kommentar:el.querySelector('[name=entryComment]').value.trim()}));
  saving=true; $('save').disabled=true; $('save').textContent='Sparar testutkast…'; $('editError').textContent='';
  try{
    const response=await fetch('/api/drafts',{method:'POST',headers:{'Content-Type':'application/json','X-Sandbox-Token':token},body:JSON.stringify({revision:data.revision,collection:editingCollection,record})});
    const result=await response.json(); if(!response.ok)throw Error(result.error||'Kunde inte spara.');
    data=result.data; dirty=false; $('editor').close(); $('feedback').textContent='Sparat på codex-admin-v2. Netlify-förhandsvisningen uppdateras efter nästa bygge.'; render();
  }catch(error){$('editError').textContent=error.message;}
  finally{saving=false;$('save').disabled=false;$('save').textContent='Spara i min testkopia';}
});
$('tabs').addEventListener('click',e=>{const b=e.target.closest('button');if(!b)return;active=b.dataset.key;$('search').value='';render();});
$('search').addEventListener('input',render);$('statusFilter').addEventListener('change',render);
$('create').onclick=()=>edit(newRecord());
$('records').addEventListener('click',e=>{const b=e.target.closest('[data-edit]');if(b)edit(data[active].find(x=>x.id===b.dataset.edit));});
fetch('/api/state',{headers:{'X-Demo-Request':'1'}}).then(r=>{if(!r.ok)throw Error();return r.json();}).then(result=>{data=result.data;token=result.token;render();}).catch(()=>{$('error').textContent='Testdata kunde inte läsas. Ladda om sidan för att försöka igen.';});
