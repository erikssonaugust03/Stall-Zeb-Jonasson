# Test av befintlig Netlify Identity och Git Gateway

Separat sida: `/admin-v2-test/`. Befintlig `/admin/`, dess konfiguration och main är oförändrade.
Använder den befintliga Identity-tjänsten på stallzebjonasson.se och Git Gateway, inte Sites-demodatabasen.
Adapterkodens fasta målgren är codex-admin-v2. Ingen inställning eller UI kan välja main.
Sparning skapar blobbar, träd och en commit med sex JSON-filer; branchref uppdateras sist utan force.
En samtidig grenändring stoppar uppdateringen i stället för att skriva över den.

Kör `node admin-v2-test/test.mjs` för isolerade adaptertester med simulerade API-svar.
Dessa är inte ett bevis på att riktig inloggning och autentiserad Gateway-skrivning fungerar.

Verifierat 2026-11-10 med skrivskyddade nätanrop:
- /admin/ svarar 200 och använder befintlig Identity-widget samt Netlify CMS.
- /.netlify/identity/settings svarar 200: e-post och Google är aktiverade, signup är avstängt.
- /.netlify/git/settings svarar 401 utan Bearer-token, vilket är väntat.

Återstående integrationstest kräver ett befintligt adminkonto. Lösenord och inloggningstoken
ska inte skickas i chatten. Testa via användarens vanliga Identity-inloggning.
En Netlify-grenförhandsvisning kan behöva tillåtas som origin av Identity. Kontrollera
Netlifys branch-deploy-inställningar innan någon push; gör ingen produktionspublicering.

Sidan innehåller en testadapter, inte en färdig ersättning för produktionsadmin. Sparning
av den nya gemensamma modellen skriver även kompatibla JSON-filer för nuvarande hemsida
på arbetsgrenen. Visning av personal/profilrelationer behöver fortfarande kopplas in
på originalsidans frontend innan en skarp övergång.
