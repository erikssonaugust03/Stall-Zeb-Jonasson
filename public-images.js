(function(){
 'use strict';
 const esc=value=>String(value||'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
 function attributes(source,options={}){
  const key='/'+String(source||'').replace(/^\//,'');
  const variants=(window.publicImageManifest||{})[key];
  const attrs={src:variants?variants.fallback:source,decoding:'async',loading:options.eager?'eager':'lazy'};
  if(variants){attrs.srcset=variants.srcset;attrs.sizes=options.sizes||'(max-width: 800px) 100vw, 50vw';}
  if(options.priority)attrs.fetchpriority='high';
  return attrs;
 }
 window.publicImages={
  attributes,
  html:(source,options)=>Object.entries(attributes(source,options)).map(([key,value])=>key+'="'+esc(value)+'"').join(' '),
  set:(image,source,options)=>{const attrs=attributes(source,options);for(const key of ['sizes','srcset','decoding','loading','fetchpriority','src'])if(attrs[key])image.setAttribute(key,attrs[key]);}
 };
})();
