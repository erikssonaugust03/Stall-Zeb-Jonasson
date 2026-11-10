'use strict';
// Only the explicitly published projection is available to visitors.
fetch('/data/public-content.json').then(r=>{if(!r.ok)throw new Error('content');return r.json()}).then(data=>{
  const make=(tag,text,cls)=>{const el=document.createElement(tag);if(text!==undefined)el.textContent=text;if(cls)el.className=cls;return el;};
  const link=(text,path)=>{const a=make('a',text);a.href=path;a.style.cssText='color:var(--accent,#c8d8e8);display:block;margin:12px 0';return a;};
  const parts=location.pathname.split('/').filter(Boolean);
  if(parts[0]==='personal'||parts[0]==='personal.html'){
    const container=document.querySelector('.personal-cards');if(!container)return;
    container.replaceChildren();
    for(const person of data.staff.filter(p=>p.status==='active')){
      const card=make('div',undefined,'personal-card');
      const photo=make('div',undefined,'personal-card-image');
      if(person.bild){const image=make('img');window.publicImages.set(image,person.bild,{sizes:'(max-width: 800px) 100vw, 33vw'});image.alt=person.namn;photo.append(image);}
      const info=make('div',undefined,'personal-card-info');
      info.append(make('div',person.roll,'personal-card-role'),make('div',person.namn,'personal-card-name'));
      if(person.presentation)info.append(make('p',person.presentation));
      const horses=data.horses.filter(h=>h.status==='active'&&h.staffIds.includes(person.id));
      if(horses.length){info.append(make('p','Sköthästar'));horses.forEach(h=>info.append(link(h.namn,'/hastar/'+encodeURIComponent(h.slug))));}
      card.append(photo,info);container.append(card);
    }
  }
  if(parts[0]==='hastar'&&parts[1]){
    const h=data.horses.find(h=>h.slug===decodeURIComponent(parts[1])||(h.aliases||[]).includes(decodeURIComponent(parts[1])));if(!h)return;
    const section=make('section');section.style.marginTop='48px';
    if(h.status==='archived'){
      section.append(make('h2','Tidigare stallhäst'),make('p','Den här hästen har lämnat stallet. Profilen finns kvar.'));
    }
    if(h.bilder?.length){section.append(make('h2','Bildgalleri'));const gallery=make('div');gallery.style.cssText='display:grid;grid-template-columns:repeat(auto-fit,minmax(200px,1fr));gap:16px';for(const source of h.bilder){const image=make('img');window.publicImages.set(image,source,{sizes:'(max-width: 600px) 100vw, 33vw'});image.alt=h.namn;image.style.cssText='width:100%;height:220px;object-fit:contain;background:#0d1b2e';gallery.append(image);}section.append(gallery);}
    const news=data.news.filter(n=>n.horseIds.includes(h.id)).sort((a,b)=>b.datum.localeCompare(a.datum));
    section.append(make('h2','Nyheter om '+h.namn));
    if(!news.length)section.append(make('p','Inga nyheter har kopplats till hästen ännu.'));
    news.forEach(n=>section.append(link(n.datum+' · '+n.titel,'/nyheter/'+encodeURIComponent(n.slug))));
    document.querySelector('main')?.append(section);
  }
  if(parts[0]==='nyheter'&&parts[1]){
    const n=data.news.find(n=>n.slug===decodeURIComponent(parts[1]));if(!n||!n.horseIds.length)return;
    const section=make('section');section.style.marginTop='40px';section.append(make('h2','Hästar i nyheten'));
    for(const id of n.horseIds){const h=data.horses.find(h=>h.id===id);if(h)section.append(link(h.namn+(h.status==='archived'?' · tidigare stallhäst':''),'/hastar/'+encodeURIComponent(h.slug)));}
    document.querySelector('.article-shell article, .nyhet-page')?.append(section);
  }
}).catch(()=>{ /* The original page remains usable if relation data is unavailable. */ });
