// Explicit public fields: future editor-only fields never become public by accident.
const pick=(item,fields)=>Object.fromEntries(fields.filter(key=>item[key]!==undefined).map(key=>[key,item[key]]));
const published=item=>item.status===undefined||item.status==='published';
export function project(data,year=new Date().getFullYear()){
 const staff=data.staff.filter(p=>p.status==='active').map(p=>pick(p,['id','namn','roll','bild','presentation','status']));
 const staffIds=new Set(staff.map(p=>p.id));
 const all=data.horses.map(source=>{
  const h=pick(source,['id','namn','slug','aliases','status','kon','far','mor','agare','uppfodare','travsport','bild','bilder']);
  h.alder=source.birthYear?String(year-source.birthYear)+' år':source.alder;
  h.staffIds=source.staffIds.filter(id=>staffIds.has(id));
  h.skotare=source.staffIds.length?h.staffIds.map(id=>staff.find(p=>p.id===id).namn).join(', '):source.skotare;
  return h;
 });
 const horses=all.filter(h=>h.status==='active');
 const sales=data.sales.flatMap(s=>{const h=horses.find(h=>h.id===s.horseId);return !h||!['available','reserved'].includes(s.status)?[]:[{...pick(s,['id','horseId','status','typ','pris','antal_andelar','beskrivning']),namn:h.namn,slug:h.slug,far:h.far,mor:h.mor,bild:h.bild,alder_kon:[h.alder,h.kon].filter(Boolean).join(' · '),bilder:s.bilder?.length?s.bilder:h.bilder||[]}];});
 const news=data.news.filter(published).map(n=>pick(n,['id','slug','aliases','datum','tid','titel','text','bild','youtube','horseIds']));
 const starts=data.starts.filter(published).map(s=>({...pick(s,['id','datum','lopp']),hastar:s.hastar.map(e=>({...pick(e,['horseId','start','kommentar']),namn:all.find(h=>h.id===e.horseId)?.namn||e.namn}))}));
 return {'admin-v2':data,hastar:{hastar:horses},'hastar-alla':{hastar:all},nyheter:{nyheter:news},startkommentarer:{starter:starts},'hastar-till-salu':{hastar:sales},personal:{personal:staff}};
}
export function publicContent(projected){
 return {horses:projected['hastar-alla'].hastar,news:projected.nyheter.nyheter,staff:projected.personal.personal};
}
