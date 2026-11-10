import {Gateway,BRANCH} from './gateway.mjs';
import {LIVE} from './environment.mjs';
const realFetch=window.fetch.bind(window),status=document.getElementById('connectionStatus');let started=false;
window.adminLive=LIVE;window.adminSaveLabel=LIVE?'Spara och publicera':'Spara på arbetsgrenen';
document.getElementById('save').textContent=window.adminSaveLabel;
document.getElementById('environmentNotice').textContent=LIVE?'Produktion: sparade innehållsändringar publiceras automatiskt efter Netlifys bygge.':'Förhandsvisning: sparning sker endast på codex-admin-v2. Den riktiga hemsidan påverkas inte.';
async function start(user){if(!user||started)return;status.textContent='Kontrollerar inloggning och innehåll…';try{
 const gateway=new Gateway({fetcher:realFetch,token:()=>user.jwt()});await gateway.head();
 const imageCache=new Map();window.adminImageSource=async path=>{if(!path.startsWith('/images/'))return path;if(!imageCache.has(path))imageCache.set(path,gateway.image(path).then(blob=>URL.createObjectURL(blob)));try{return await imageCache.get(path);}catch{return path;}};
 window.fetch=async(input,options={})=>{const url=new URL(typeof input==='string'?input:input.url,location.href);if(url.origin!==location.origin||!url.pathname.startsWith('/api/'))return realFetch(input,options);try{let result;switch(url.pathname){case '/api/state':result={...(await gateway.state()),token:'identity-session'};break;case '/api/drafts':result=await gateway.save(JSON.parse(options.body));break;case '/api/media':result=await gateway.media();break;case '/api/upload':result=await gateway.upload(new Uint8Array(await options.body.arrayBuffer()),decodeURIComponent(options.headers['X-Filename']||'Bild'));break;default:throw Error('Okänd adminfunktion.');}return Response.json(result);}catch(error){return Response.json({error:error.message},{status:error.status||400});}};
 started=true;document.querySelector('main').hidden=false;status.textContent='Inloggad · '+(LIVE?'Produktion':'Arbetsgren: '+BRANCH);document.getElementById('login').hidden=true;document.getElementById('logout').hidden=false;
 for(const src of ['/admin/ui.js','/admin/media.js'])await new Promise((resolve,reject)=>{const script=document.createElement('script');script.src=src;script.onload=resolve;script.onerror=reject;document.body.append(script);});
 }catch(error){status.textContent=error.message;}}
if(!window.netlifyIdentity)status.textContent='Inloggningen kunde inte laddas. Ladda om sidan.';
else{netlifyIdentity.on('init',start);netlifyIdentity.on('login',user=>{netlifyIdentity.close();start(user);});netlifyIdentity.on('logout',()=>location.reload());document.getElementById('login').onclick=()=>netlifyIdentity.open('login');document.getElementById('logout').onclick=()=>netlifyIdentity.logout();netlifyIdentity.init({APIUrl:'https://stallzebjonasson.se/.netlify/identity'});}
