# Admin 2.0

Adress: /admin/ (även /admin omdirigeras dit). Befintlig Netlify Identity används;
nya konton kan inte självregistreras. Behörighet att skriva styrs av samma Git Gateway
som tidigare. Använd Logga ut på en delad dator.

På stallzebjonasson.se, www.stallzebjonasson.se och projektets vanliga Netlify-adress
sparar panelen till main. På grendeployer sparar den enbart till codex-admin-v2.
Okända värdnamn stoppar sparning. URL-parametrar kan inte byta målgren.

Spara och publicera uppdaterar data/admin-v2.json och sex genererade innehållsfiler i
samma Git-commit. Netlify bygger sedan hemsidan. En sparning är inte samma sak som ett
färdigt bygge; ett misslyckat bygge lämnar föregående publicerade version kvar.
Revisionskontroll och icke-tvingad grenflytt hindrar samtidiga överskrivningar.

Bilder laddas upp till images/uploads/ i samma repository. En uppladdning ändrar inte
bildvalet på hemsidan förrän posten sparas. Välj huvudbild och galleri i editorn och
spara posten. Förhandsbilder i admin läses direkt från arbetsgrenens GitHub-filer så
att de fungerar även innan Netlify hunnit bygga. JPEG, PNG och WebP stöds.

Nyheter publiceras när de sparas. Försäljningsannonser kan vara Utkast, Till salu,
Reserverad, Såld eller Arkiverad. Utkast, sålda och arkiverade annonser visas inte
publikt. Arkivering behåller hästarnas profiler och historiska kopplingar.

Källdata är data/admin-v2.json. Övriga JSON-filer skapas från samma modell och ska
inte redigeras separat. Befintliga texter och bilder har bevarats vid migreringen.
Nyhets- och personalrelationer kan kompletteras i panelen; gamla nyhetstexter skrivs
inte om när hästens uppgifter ändras.

Kontroller: node scripts/test-production.mjs; npm run build.
Efter bygge: npm run test:public kontrollerar filtrering, försäljningspuff och bildfiler.

Netlify publicerar enbart dist/, som byggs från en uttrycklig lista över publika filer.
data/admin-v2.json, äldre mallar, testmappar och byggskript kopieras inte till webbplatsen.
Publika relationer använder data/public-content.json. Bara aktiva personalposter och
annonser med status Till salu eller Reserverad ingår; tidigare stallhästars publika
profiler och historik behålls. Nyheter publiceras fortfarande när de sparas.
Tidigare starter och kommentarer visas endast på Startkommentarer, inte på
hästprofilerna. Uppgifterna i admin och startkommentarsfilen är bevarade.
Kända publika fält väljs uttryckligen, så att nya interna fält inte följer med automatiskt.
Repositoryt är offentligt: denna filtrering skyddar webbpubliceringen men gör inte
GitHub-filer eller tidigare Git-/Netlify-versioner privata. Lägg inte hemligheter i Git.

Startsidan får sin försäljningspuff från publicerade annonser vid varje bygge.
Till salu prioriteras framför Reserverad. Utan någon sådan annons döljs puffen.
Bilder som används publikt får WebP-varianter i upp till 480, 960 och 1600 pixlars
bredd utan beskärning. Logotyper och originalfiler behålls. Nya uppladdningar behandlas
automatiskt i nästa bygge. Filnamnen bygger på bildinnehållet för säker cachelagring.
Återställning vid problem: återställ Netlify-projektets tidigare publicerade deploy
eller skapa en återställningscommit av releaseändringen. Före första releasen låg
main på 6cf18c544bb3161243cc58d5aa6618976c2d2069 och Netlifys publicerade deploy var
6ae9f0ee2f34a036b8bc3764. Återställ även Git-källan om en äldre frontend återtas så
att senare automatiska byggen inte återinför den oönskade versionen.
