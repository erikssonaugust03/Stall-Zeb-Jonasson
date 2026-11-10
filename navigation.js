(function(){
 'use strict';
 function init(){
  const button=document.querySelector('#hamburger, .profile-toggle');
  const menu=document.querySelector('#mobileMenu, nav .links');
  if(!button||!menu)return;
  // Both horse destinations stay directly visible in the open mobile menu.
  menu.querySelectorAll('.mobile-expand-main').forEach(label=>{label.style.display='none';});
  menu.querySelectorAll('.mobile-sub').forEach(sub=>{sub.style.display='flex';sub.querySelectorAll('a').forEach(a=>{a.style.paddingLeft='2rem';});});
  if(!menu.id)menu.id='profileMenu';
  button.setAttribute('aria-controls',menu.id);button.setAttribute('aria-expanded','false');
  const close=()=>{menu.classList.remove('open');button.classList.remove('open');button.setAttribute('aria-expanded','false');};
  button.addEventListener('click',event=>{
   event.preventDefault();event.stopImmediatePropagation();
   const open=menu.classList.toggle('open');button.classList.toggle('open',open);button.setAttribute('aria-expanded',String(open));
  },true);
  menu.addEventListener('click',event=>{if(event.target.closest('a'))close();});
  document.addEventListener('keydown',event=>{if(event.key==='Escape')close();});
 }
 if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init);else init();
})();
