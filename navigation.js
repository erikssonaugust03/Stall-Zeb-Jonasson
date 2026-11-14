const siteNavigation = document.querySelector('.site-navigation');
if (siteNavigation) {
 const button = siteNavigation.querySelector('.site-menu-button');
 const menu = siteNavigation.querySelector('.site-mobile');
 const dropdowns = [...siteNavigation.querySelectorAll('details')];
 const close = () => {
  menu.hidden = true;
  button.setAttribute('aria-expanded','false');
  dropdowns.forEach(dropdown => { dropdown.open = false; });
 };
 button.addEventListener('click', () => {
  if (!menu.hidden) return close();
  menu.hidden = false;
  button.setAttribute('aria-expanded','true');
 });
 document.addEventListener('click', event => {
  if (!siteNavigation.contains(event.target)) close();
  for (const dropdown of dropdowns) {
   if (!dropdown.contains(event.target)) dropdown.open = false;
  }
 });
 document.addEventListener('keydown', event => {
  if (event.key !== 'Escape') return;
  const activeDropdown = dropdowns.find(dropdown => dropdown.open && dropdown.contains(document.activeElement));
  if (activeDropdown) {
   activeDropdown.open = false;
   activeDropdown.querySelector('summary').focus();
  } else if (!menu.hidden) {
   close();
   button.focus();
  }
 });
 matchMedia('(max-width:1000px)').addEventListener('change', close);
}
