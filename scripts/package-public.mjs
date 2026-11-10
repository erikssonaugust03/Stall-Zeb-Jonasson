import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import {createRequire} from 'node:module';
import {fileURLToPath} from 'node:url';
import {salesPromotion} from './homepage-sales.mjs';
const require=createRequire(import.meta.url),sharp=require('sharp');
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const output=path.join(root,'dist');
const read=name=>fs.readFileSync(path.join(root,name),'utf8');
const json=name=>JSON.parse(read(name));
const dataFiles=['hastar','hastar-alla','nyheter','startkommentarer','hastar-till-salu','personal','public-content'];
const publicData=Object.fromEntries(dataFiles.map(name=>[name,json('data/'+name+'.json')]));
const pages=['index.html','hastar.html','hastprofil.html','hastar-till-salu.html','nyheter.html','startkommentarer.html','personal.html','anlaggning.html','om-tranaren.html','kontakt.html','integritetspolicy.html'];
const htmlFiles=new Map(pages.map(name=>[name,read(name)]));
htmlFiles.set('index.html',htmlFiles.get('index.html').replace('<!-- SALE_PROMOTION -->',salesPromotion(publicData['hastar-till-salu'].hastar)));
for(const news of publicData.nyheter.nyheter){const name='nyheter/'+news.slug+'/index.html';htmlFiles.set(name,read(name));}
// Build from an allowlist into a clean directory. Never copy the repository root.
fs.rmSync(output,{recursive:true,force:true});fs.mkdirSync(output,{recursive:true});
const write=(name,value)=>{const target=path.join(output,name);fs.mkdirSync(path.dirname(target),{recursive:true});fs.writeFileSync(target,value);};
const copy=name=>write(name,fs.readFileSync(path.join(root,name)));
const assets=new Set();
function addAsset(value){
 if(typeof value!=='string')return;
 let name=value;
 if(/^https?:/.test(name)){const u=new URL(name);if(!u.hostname.endsWith('stallzebjonasson.se')&&!u.hostname.endsWith('netlify.app'))return;name=u.pathname;}
 try{name=decodeURIComponent(name).replace(/^\//,'');}catch{return;}
 if(!/\.(?:jpe?g|png|webp|gif|svg|ico)$/i.test(name)||name.includes('..'))return;
 const file=path.resolve(root,name);if(!file.startsWith(root+path.sep))return;
 if(fs.existsSync(file)&&fs.statSync(file).isFile())assets.add(name);
}
function collect(value){if(typeof value==='string')addAsset(value);else if(Array.isArray(value))value.forEach(collect);else if(value&&typeof value==='object')Object.values(value).forEach(collect);}
Object.values(publicData).forEach(collect);
for(const text of [...htmlFiles.values(),read('style.css')]){
 for(const match of text.matchAll(/(?:https?:\/\/[^\s"'<>`{}()]+|\/?[\w/%+.-]+)\.(?:jpe?g|png|webp|gif|svg|ico)\b/gi))addAsset(match[0]);
}
for(const name of ['favicon.ico','apple-touch-icon.png'])addAsset(name);
const manifest={};let originalBytes=0,optimizedBytes=0;
for(const name of assets){
 copy(name);
 // Keep logos and icons byte-for-byte; preserve photographs' full framing.
 if(!/\.(?:jpe?g|png|webp)$/i.test(name)||/logo|logga|icon/i.test(name))continue;
 const bytes=fs.readFileSync(path.join(root,name));
 const image=sharp(bytes).rotate();const meta=await image.metadata();
 if(meta.pages>1)continue;
 const width=meta.autoOrient?.width||([5,6,7,8].includes(meta.orientation)?meta.height:meta.width);
 const hash=crypto.createHash('sha256').update(bytes).digest('hex').slice(0,16);
 const widths=[...new Set([480,960,1600].map(w=>Math.min(w,width)))].sort((a,b)=>a-b);
 const variants=[];
 for(const w of widths){const file='media/'+hash+'-'+w+'.webp';const result=await sharp(bytes).rotate().resize({width:w,withoutEnlargement:true}).webp({quality:84,alphaQuality:100}).toBuffer();write(file,result);variants.push({url:'/'+file,width:w,bytes:result.length});}
 const fallback=variants.find(v=>v.width>=960)||variants.at(-1);
 manifest['/'+name]={fallback:fallback.url,srcset:variants.map(v=>v.url+' '+v.width+'w').join(', ')};
 originalBytes+=bytes.length;optimizedBytes+=fallback.bytes;
}
function transformImage(tag){
 const match=tag.match(/\bsrc=["']([^"']+)["']/i);if(!match||match[1].includes('${'))return tag;
 const key='/'+match[1].replace(/^\//,'');const image=manifest[key];
 if(image)tag=tag.replace(match[0],`src="${image.fallback}" srcset="${image.srcset}" sizes="(max-width: 800px) 100vw, 50vw"`);
 if(!/\bdecoding=/.test(tag))tag=tag.replace(/>$/,' decoding="async">');
 if(!/\bloading=/.test(tag))tag=tag.replace(/>$/,/logo|hero2|hero\.png/.test(key)?' loading="eager">':' loading="lazy">');
 if(key==='/hero2.jpg')tag=tag.replace(/>$/,' fetchpriority="high">');
 return tag;
}
for(const [name,original] of htmlFiles){
 const html=original.replace(/<img\b[^>]*>/gi,transformImage).replace('</head>','<script src="/image-manifest.js"></script><script src="/public-images.js"></script><script src="/navigation.js" defer></script></head>');
 write(name,html);
}
for(const [name,value] of Object.entries(publicData))write('data/'+name+'.json',JSON.stringify(value)+'\n');
for(const file of ['style.css','content-data.js','public-images.js','navigation.js','_redirects','sitemap.xml','robots.txt'])copy(file);
for(const file of ['index.html','admin.css','bootstrap.mjs','environment.mjs','gateway.mjs','projection.mjs','validation.mjs','ui.js','media.js','config.yml'])copy('admin/'+file);
write('image-manifest.js','window.publicImageManifest='+JSON.stringify(manifest)+';\n');
write('404.html','<!doctype html><html lang="sv"><meta charset="utf-8"><title>Sidan finns inte</title><h1>Sidan finns inte</h1><a href="/">Till startsidan</a></html>');
write('_headers','/media/*\n  Cache-Control: public, max-age=31536000, immutable\n/data/*\n  Cache-Control: public, max-age=0, must-revalidate\n');
console.log(`Packaged ${htmlFiles.size} public pages, ${dataFiles.length} public data files and ${Object.keys(manifest).length} responsive images.`);
console.log(`Image fallbacks: ${(originalBytes/1048576).toFixed(1)} MB → ${(optimizedBytes/1048576).toFixed(1)} MB. Admin source data excluded.`);
