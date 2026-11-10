export function project(data,year=new Date().getFullYear()){
 const all=data.horses.map(h=>({...h,alder:h.birthYear?String(year-h.birthYear)+' år':h.alder,skotare:h.staffIds.length?h.staffIds.map(id=>data.staff.find(p=>p.id===id).namn).join(', '):h.skotare}));
 const horses=all.filter(h=>h.status==='active');
 const sales=data.sales.flatMap(s=>{const h=horses.find(h=>h.id===s.horseId);return !h||['draft','sold','archived'].includes(s.status)?[]:[{...s,namn:h.namn,far:h.far,mor:h.mor,bild:h.bild,alder_kon:[h.alder,h.kon].filter(Boolean).join(' · '),bilder:s.bilder?.length?s.bilder:h.bilder||[]}];});
 return {'admin-v2':data,hastar:{hastar:horses},'hastar-alla':{hastar:all},nyheter:{nyheter:data.news},startkommentarer:{starter:data.starts},'hastar-till-salu':{hastar:sales},personal:{personal:data.staff.filter(p=>p.status==='active')}};
}
