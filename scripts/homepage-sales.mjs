const esc=value=>String(value||'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
export function salesPromotion(listings){
 const listing=listings.find(s=>s.status==='available')||listings.find(s=>s.status==='reserved');
 if(!listing)return '';
 const title=listing.status==='reserved'?listing.namn+' är reserverad':listing.typ==='Andel'?'Andelar finns i '+listing.namn:listing.namn+' är till salu';
 const text=listing.status==='reserved'?'Läs mer om hästen och kontakta stallet för aktuell information.':'Var med på resan – läs mer om hästen och möjligheten att bli '+(listing.typ==='Andel'?'delägare.':'hästägare.');
 const price=listing.pris!==''&&Number.isFinite(Number(String(listing.pris).replace(',','.')))
  ? new Intl.NumberFormat('sv-SE').format(Number(String(listing.pris).replace(',','.')))+' kr'+(listing.typ==='Andel'?' / andel':'')
  : 'Pris på förfrågan';
 const status=listing.status==='reserved'?'Reserverad':listing.typ==='Andel'?'Andel till salu':'Hel häst till salu';
 return `<section class="owner-strip" aria-labelledby="sale-preview-title">
 <div class="owner-banner">
 <div class="owner-photo">${listing.bild?`<img src="${esc(listing.bild)}" alt="${esc(listing.namn)}">`:''}</div>
 <div class="owner-copy">
 <div class="eyebrow">Bli hästägare · ${status}</div>
 <h2 id="sale-preview-title">${esc(title)}</h2>
 <p>${esc(text)}</p><p class="owner-facts">${esc(price)}${listing.alder_kon?' · '+esc(listing.alder_kon):''}</p>
 <div class="owner-actions"><a class="owner-cta" href="/hastar-till-salu#${encodeURIComponent(listing.slug||listing.id)}">Se annonsen →</a><a href="/hastar-till-salu">Alla annonser</a></div>
 </div></div></section>`;
}
