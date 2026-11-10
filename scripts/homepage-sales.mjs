const esc=value=>String(value||'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
export function salesPromotion(listings){
 const listing=listings.find(s=>s.status==='available')||listings.find(s=>s.status==='reserved');
 if(!listing)return '';
 const title=listing.status==='reserved'?listing.namn+' är reserverad':listing.typ==='Andel'?'Andelar finns i '+listing.namn:listing.namn+' är till salu';
 const text=listing.status==='reserved'?'Läs mer om hästen och kontakta stallet för aktuell information.':'Var med på resan – läs mer om hästen och möjligheten att bli '+(listing.typ==='Andel'?'delägare.':'hästägare.');
 return `<section class="owner-strip"><a class="owner-banner" href="/hastar-till-salu"><div class="owner-photo">${listing.bild?`<img src="${esc(listing.bild)}" alt="${esc(listing.namn)}">`:''}</div><div class="owner-copy"><div class="eyebrow">Bli hästägare</div><h2>${esc(title)}</h2><p>${esc(text)}</p></div><span class="owner-cta">Läs mer →</span></a></section>`;
}
