import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import {fileURLToPath} from 'node:url';
import {project,publicContent} from '../admin/projection.mjs';
import {salesPromotion} from './homepage-sales.mjs';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..'),dist=path.join(root,'dist');
const read=name=>fs.readFileSync(path.join(root,name),'utf8');
const data=JSON.parse(read('data/admin-v2.json'));
let checks=0;const check=(name,run)=>{run();checks++;console.log('OK',name);};
check('no editor fields or unpublished records in public projections',()=>{
 const d=structuredClone(data);
 for(const collection of ['horses','news','starts','sales','staff'])for(const item of d[collection]){item.privateNote='PRIVATE-MARKER';item.legacySnapshot={hidden:'PRIVATE-MARKER'};}
 d.news.push({...d.news[0],id:'private-news',slug:'private-news',text:'DRAFT-MARKER',status:'draft'});
 d.starts.push({...d.starts[0],id:'private-start',lopp:'DRAFT-MARKER',status:'draft'});
 d.sales.push({...d.sales[0],id:'private-sale',beskrivning:'DRAFT-MARKER',status:'draft'});
 d.staff.push({...d.staff[0],id:'private-staff',namn:'DRAFT-MARKER',status:'archived'});
 d.horses[0].staffIds=['private-staff'];
 const p=project(d),publicFiles={...p};delete publicFiles['admin-v2'];
 const serialized=JSON.stringify([publicFiles,publicContent(p)]);
 for(const marker of ['PRIVATE-MARKER','DRAFT-MARKER','legacySnapshot','privateNote','revision','mode'])assert.ok(!serialized.includes(marker),marker);
 assert.ok(p['admin-v2'].news.some(n=>n.id==='private-news'));
 assert.ok(publicContent(p).horses.some(h=>h.slug==='follow-the-cash'&&h.status==='archived'));
});
check('sales banner follows published status and current horse data',()=>{
 for(const status of ['draft','sold','archived']){const d=structuredClone(data);d.sales[0].status=status;assert.equal(salesPromotion(project(d)['hastar-till-salu'].hastar),'');}
 const d=structuredClone(data);d.horses.find(h=>h.id===d.sales[0].horseId).namn='Nytt hästnamn';
 assert.match(salesPromotion(project(d)['hastar-till-salu'].hastar),/Andelar finns i Nytt hästnamn/);
 d.sales[0].status='reserved';assert.match(salesPromotion(project(d)['hastar-till-salu'].hastar),/Nytt hästnamn är reserverad/);
 d.sales[0].status='available';d.sales[0].typ='Hel häst';assert.match(salesPromotion(project(d)['hastar-till-salu'].hastar),/Nytt hästnamn är till salu/);
 assert.ok(!salesPromotion([{...project(d)['hastar-till-salu'].hastar[0],namn:'<script>alert(1)</script>'}]).includes('<script>'));
});
check('clean deploy excludes admin data, templates, source and stale generated pages',()=>{
 for(const file of ['data/admin-v2.json','scripts','docs','sandbox','admin-v2-test','.git','nyhet-mall.html','package.json','netlify.toml'])assert.ok(!fs.existsSync(path.join(dist,file)),file);
 assert.deepEqual(fs.readdirSync(path.join(dist,'data')).sort(),['hastar-alla.json','hastar-till-salu.json','hastar.json','nyheter.json','personal.json','public-content.json','startkommentarer.json'].sort());
 assert.deepEqual(fs.readdirSync(path.join(dist,'nyheter')).sort(),project(data).nyheter.nyheter.map(n=>n.slug).sort());
 assert.ok(fs.existsSync(path.join(dist,'admin/bootstrap.mjs')));
 assert.ok(!read('content-data.js').includes('/data/admin-v2.json'));
 assert.match(read('netlify.toml'),/publish = "dist"/);
});
const window={};vm.runInNewContext(fs.readFileSync(path.join(dist,'image-manifest.js'),'utf8'),{window});
vm.runInNewContext(read('public-images.js'),{window});
check('responsive image files exist, large originals shrink and logo stays exact',()=>{
 for(const source of ['/images/img_3996.jpeg','/images/just-hell-bent.jpeg','/zeb2.jpg','/hage.png','/moa.png']){
  const attrs=window.publicImages.attributes(source);
  assert.match(attrs.srcset,/\d+w/);assert.ok(attrs.sizes);assert.equal(attrs.loading,'lazy');
  const target=path.join(dist,attrs.src);assert.ok(fs.existsSync(target));
  assert.ok(fs.statSync(target).size<fs.statSync(path.join(root,source)).size*.6,source);
 }
 const hero=window.publicImages.attributes('/hero2.jpg',{eager:true,priority:true});assert.equal(hero.loading,'eager');assert.equal(hero.fetchpriority,'high');
 assert.ok(fs.readFileSync(path.join(dist,'logo-zeb.png')).equals(fs.readFileSync(path.join(root,'logo-zeb.png'))));
 const unknown=window.publicImages.attributes('/unknown.jpg');assert.equal(unknown.src,'/unknown.jpg');
 assert.ok(!window.publicImages.html('" onerror="alert(1)').includes('src="" onerror='));
});
check('built pages compile and published home keeps design and active sale',()=>{
 function walk(dir){return fs.readdirSync(dir,{withFileTypes:true}).flatMap(e=>e.isDirectory()?walk(path.join(dir,e.name)):[path.join(dir,e.name)]);}
 for(const file of walk(dist).filter(f=>f.endsWith('.html'))){
  const html=fs.readFileSync(file,'utf8');
  for(const script of html.matchAll(/<script\b[^>]*>([\s\S]*?)<\/script>/g))new Function(script[1]);
  if(file.includes('/admin/'))continue;
  for(const image of html.matchAll(/<img\b[^>]*>/g)){
   const src=image[0].match(/\bsrc="([^"]+)"/)?.[1];
   if(src&&!src.includes('${')&&!/^https?:/.test(src))assert.ok(fs.existsSync(path.join(dist,src)),src+' in '+file);
  }
 }
 const home=fs.readFileSync(path.join(dist,'index.html'),'utf8');
 assert.match(home,/class="owner-strip"/);assert.match(home,/Andelar finns i Just Hell Bent/);assert.ok(!home.includes('<!-- SALE_PROMOTION -->'));
 assert.match(home,/srcset="\/media\//);assert.match(home,/fetchpriority="high"/);
});
console.log(checks+' public release checks passed');
