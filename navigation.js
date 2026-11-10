(function(){
 'use strict';
 function init(){
  const button=document.querySelector('#hamburger, .profile-toggle');
  const menu=document.querySelector('#mobileMenu, nav .links');
  if(!button||!menu)return;
  const horseLinks=[...menu.querySelectorAll('a')].filter(a=>/^\/hastar(?:-till-salu)?(?:\.html)?\/?$/.test(new URL(a.href).pathname));
  let collapseHorses=()=>{};
  if(horseLinks.length){
   const group=document.createElement('div');group.className='horse-mobile-dropdown';
   const toggle=document.createElement('button');toggle.type='button';toggle.className='mobile-expand-main horse-dropdown-toggle';toggle.textContent='Hästar ▾';
   toggle.style.cssText='border:0;background:none;text-align:left;width:100%;cursor:pointer;font-family:inherit';
   const sub=document.createElement('div');sub.className='horse-dropdown-sub';sub.id='horseDestinations';sub.hidden=true;
   toggle.setAttribute('aria-controls',sub.id);toggle.setAttribute('aria-expanded','false');
   for(const [href,text] of [['/hastar','Våra hästar'],['/hastar-till-salu','Hästar till salu']]){
    const a=document.createElement('a');a.href=href;a.textContent=text;sub.append(a);
   }
   group.append(toggle,sub);
   let slot=horseLinks[0];while(slot.parentElement!==menu)slot=slot.parentElement;
   menu.insertBefore(group,slot);
   if(menu.matches('.links'))horseLinks.forEach(a=>a.classList.add('horse-desktop-link'));
   else{horseLinks.forEach(a=>a.remove());menu.querySelectorAll('.mobile-expand-main:not(.horse-dropdown-toggle)').forEach(label=>label.remove());}
   collapseHorses=()=>{sub.hidden=true;toggle.setAttribute('aria-expanded','false');toggle.textContent='Hästar ▾';};
   toggle.addEventListener('click',()=>{const open=sub.hidden;sub.hidden=!open;toggle.setAttribute('aria-expanded',String(open));toggle.textContent=open?'Hästar ▴':'Hästar ▾';});
   const style=document.createElement('style');style.textContent='.horse-dropdown-sub[hidden]{display:none!important}.horse-dropdown-sub{display:flex;flex-direction:column}.horse-dropdown-sub a{padding-left:3.5rem!important}.links .horse-mobile-dropdown{display:none}.links .horse-dropdown-toggle{padding:0;color:var(--dim);font-size:.78rem;text-transform:uppercase;letter-spacing:.18em}.links .horse-dropdown-sub a{display:block;padding:16px 0 0 20px!important}@media(max-width:900px){.links .horse-mobile-dropdown{display:block}.links .horse-desktop-link{display:none}}';document.head.append(style);
  }
  if(!menu.id)menu.id='profileMenu';
  button.setAttribute('aria-controls',menu.id);button.setAttribute('aria-expanded','false');
  const close=()=>{menu.classList.remove('open');button.classList.remove('open');button.setAttribute('aria-expanded','false');collapseHorses();};
  button.addEventListener('click',event=>{
   event.preventDefault();event.stopImmediatePropagation();
   const open=menu.classList.toggle('open');button.classList.toggle('open',open);button.setAttribute('aria-expanded',String(open));if(!open)collapseHorses();
  },true);
  menu.addEventListener('click',event=>{if(event.target.closest('a'))close();});
  document.addEventListener('keydown',event=>{if(event.key==='Escape')close();});
 }
 if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init);else init();
})();
