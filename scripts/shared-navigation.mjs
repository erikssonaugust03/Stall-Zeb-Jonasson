const pages = [
 ['/nyheter','Nyheter'], ['/startkommentarer','Startkommentarer'],
 ['/hastar','Hästar'], ['/anlaggning','Anläggning'], ['/om-tranaren','Om tränaren'],
 ['/personal','Personal'], ['/kontakt','Kontakt']
];

export function renderNavigation(file) {
 const route = '/' + file.replace(/(?:\/index)?\.html$/,'');
 const link = (href,label,section=false) => {
  const current = route === href;
  const active = current || (section && route.startsWith(href+'/'));
  return `<a href="${href}"${current?' aria-current="page"':''}${active?' class="current"':''}>${label}</a>`;
 };
 const destinations = () => link('/hastar','Våra hästar') + link('/hastar-till-salu','Hästar till salu');
 const items = () => pages.map(([href,label]) => href!=='/hastar'
  ? '<li>'+link(href,label,true)+'</li>'
  : `<li class="site-horses"><details class="site-horse-menu"><summary${/^\/hastar(?:\/|-till-salu|$)/.test(route)?' class="current"':''}>Hästar <span aria-hidden="true">▾</span></summary><div>${destinations()}</div></details></li>`).join('');
 return `<nav class="site-navigation" aria-label="Huvudnavigation">
 <a class="site-brand" href="/"><img src="/logo-zeb.png" alt="Stall Zeb Jonasson"></a>
 <ul class="site-desktop">${items()}</ul>
 <button class="site-menu-button" type="button" aria-label="Meny" aria-expanded="false" aria-controls="site-mobile-menu"><span></span><span></span><span></span></button>
 <ul class="site-mobile" id="site-mobile-menu" hidden>${items()}</ul>
 </nav>`;
}

export function replaceNavigation(html,file) {
 const nav=/<nav\b[^>]*>[\s\S]*?<\/nav>/.exec(html);
 if(!nav)throw new Error('Missing navigation in '+file);
 let tail=html.slice(nav.index+nav[0].length);
 const mobile=/^\s*<div\b[^>]*\bid=["']mobileMenu["'][^>]*>/i.exec(tail);
 if(mobile){
  let depth=1,end=mobile[0].length;
  for(const tag of tail.slice(end).matchAll(/<\/?div\b[^>]*>/gi)){
   depth+=tag[0].startsWith('</')?-1:1;
   if(depth===0){tail=tail.slice(end+tag.index+tag[0].length);break;}
  }
  if(depth)throw new Error('Unclosed mobile menu in '+file);
 }
 return (html.slice(0,nav.index)+renderNavigation(file)+tail).replace(/<script>document\.querySelector\("\.profile-toggle"\)[\s\S]*?<\/script>/,'');
}
