const collections=['horses','news','starts','sales','staff'];const copy=x=>structuredClone(x);const fail=(message,status=400)=>{throw Object.assign(new Error(message),{status})};
function validate(data){
 const ids={};for(const key of collections){if(!Array.isArray(data[key])||data[key].length>300)fail('För många testposter.');ids[key]=new Set();for(const item of data[key]){if(!item||typeof item!=='object'||typeof item.id!=='string'||!/^[a-z0-9-]{1,101}$/.test(item.id)||ids[key].has(item.id))fail('Ogiltigt eller dubblerat ID.');ids[key].add(item.id);}}
 const text=(v,label,required=false)=>{if(typeof v!=='string'||v.length>30000||(required&&!v.trim()))fail('Kontrollera '+label+'.')};
 const image=v=>{text(v,'bild');if(v&&(!v.startsWith('/')||v.startsWith('//')||/[\\?#\r\n]/.test(v)||v.split('/').includes('..')))fail('Välj en bild från biblioteket.');};
 const refs=(a,set)=>{if(!Array.isArray(a)||a.some(id=>!set.has(id)))fail('En koppling pekar på en okänd post.');};
 const date=d=>{if(typeof d!=='string'||!/^\d{4}-\d{2}-\d{2}$/.test(d)||!Number.isFinite(Date.parse(d))||new Date(d).toISOString().slice(0,10)!==d)fail('Kontrollera datumet.');};
 for(const key of ['horses','news']){const slugs=new Set();for(const item of data[key]){for(const s of [item.slug,...(item.aliases||[])]){if(typeof s!=='string'||!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(s)||slugs.has(s))fail('URL-namnet måste vara giltigt och unikt.');slugs.add(s);}}}
 for(const key of collections)for(const item of data[key]){
  for(const field of ['namn','titel','text','far','mor','agare','uppfodare','skotare','alder','kon','beskrivning','roll','presentation','tid'])if(field in item)text(item[field],field);
  if('bild'in item)image(item.bild);if('bilder'in item){if(!Array.isArray(item.bilder)||item.bilder.length>30)fail('Max 30 galleribilder.');item.bilder.forEach(image);}
  for(const f of ['travsport','youtube'])if(item[f]&&(typeof item[f]!=='string'||!/^https:\/\//.test(item[f])))fail('Länkar måste börja med https://.');
  if(key==='horses'){text(item.namn,'hästnamn',true);if(!['active','archived'].includes(item.status))fail('Ogiltig status.');if(item.birthYear!==null&&(!Number.isInteger(item.birthYear)||item.birthYear<1970||item.birthYear>new Date().getUTCFullYear()))fail('Kontrollera födelseår.');refs(item.staffIds,ids.staff);}
  if(key==='news'){text(item.titel,'rubrik',true);text(item.text,'nyhetstext',true);date(item.datum);refs(item.horseIds,ids.horses);if(item.tid&&!/^([01]\d|2[0-3]):[0-5]\d$/.test(item.tid))fail('Kontrollera tid.');}
  if(key==='starts'){date(item.datum);text(item.lopp,'bana',true);if(!Array.isArray(item.hastar)||!item.hastar.length||item.hastar.length>50)fail('Välj minst en startande häst.');for(const e of item.hastar){if(!ids.horses.has(e.horseId))fail('Välj en häst.');text(e.namn,'hästnamn',true);text(e.start,'lopp',true);text(e.kommentar,'kommentar');}}
  if(key==='sales'){if(!ids.horses.has(item.horseId))fail('Välj häst.');if(!['draft','available','reserved','sold','archived'].includes(item.status)||!['Andel','Hel häst'].includes(item.typ))fail('Kontrollera annonstyp och status.');for(const f of ['pris','antal_andelar'])if(typeof item[f]!=='string'||(item[f]&&!/^\d+(?:[.,]\d{1,2})?$/.test(item[f])))fail('Kontrollera pris och andelar.');if(item.antal_andelar&&!/^\d+$/.test(item.antal_andelar))fail('Antal andelar ska vara heltal.');}
  if(key==='staff'){text(item.namn,'namn',true);text(item.roll,'roll',true);if(!['active','archived'].includes(item.status))fail('Ogiltig personalstatus.');}
 }
}
function update(current,request){if(request.revision!==current.revision)fail('Ett annat fönster har sparat. Ladda om admin innan du försöker igen.',409);if(!collections.includes(request.collection)||!request.record||typeof request.record!=='object')fail('Ogiltig ändring.');const data=copy(current),key=request.collection,record=copy(request.record);const i=data[key].findIndex(x=>x.id===record.id);if(i<0)data[key].push(record);else{const old=data[key][i];if(['horses','news'].includes(key)){record.aliases=[...(old.aliases||[])];if(old.slug!==record.slug)record.aliases=[...record.aliases.filter(s=>s!==record.slug),old.slug];}if(old.legacySnapshot)record.legacySnapshot=old.legacySnapshot;data[key][i]=record;}data.revision++;validate(data);return data;}

export {validate,update};
