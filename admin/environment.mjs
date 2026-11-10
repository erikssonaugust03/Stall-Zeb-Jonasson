export function branchForHost(host){
 if(['stallzebjonasson.se','www.stallzebjonasson.se','stallzebjonasson.netlify.app'].includes(host))return 'main';
 if(host==='localhost'||host==='127.0.0.1'||host.endsWith('--stallzebjonasson.netlify.app'))return 'codex-admin-v2';
 throw new Error('Okänd webbplats. Sparning är avstängd.');
}
export const BRANCH=branchForHost(globalThis.location?.hostname||'localhost');
export const LIVE=BRANCH==='main';
