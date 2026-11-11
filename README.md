# App template

Basis voor eigen apps op **Azure Static Web Apps** met een React-frontend, Azure Functions-API en Azure SQL.

## Structuur

```
src/                  Frontend (React + Vite + TypeScript)
  pages/              Schermen. Items.tsx is een voorbeeldmodule.
  lib/api.ts          Centrale fetch-wrapper voor de API
  lib/useUser.ts      Ingelogde gebruiker en rollen (alleen voor de interface)
api/                  Azure Functions (de backend)
  src/lib/http.ts     Authenticatie, rolcontrole, foutafhandeling
  src/lib/db.ts       Databaseverbinding (één pool)
  src/functions/      Eén bestand per module: items.ts, settings.ts
db/schema.sql         Basisschema (settings, items)
staticwebapp.config.json   Routes, rollen, beveiligingsheaders
.github/workflows/    Deploy naar Azure, incl. preview per pull request
```

## Lokaal starten

1. `npm install` in de hoofdmap en `npm install` in `api/`.
2. Kopieer `api/local.settings.json.example` naar `api/local.settings.json` en vul de connectionstring in.
3. Frontend: `npm run dev`. API: `cd api && npm run build && func start` (vereist Azure Functions Core Tools).

Lokaal is er geen SWA-login. Voor inloggen en rollen test je het beste via de Azure-omgeving of met de SWA CLI.

## Een nieuwe app maken uit deze template

1. Kopieer de map, of maak een nieuwe repo van deze template op GitHub.
2. Pas `app_name` aan in `db/schema.sql` en de titel in `index.html`.
3. Vervang `Items` door je eigen modules: kopieer `src/pages/Items.tsx` en `api/src/functions/items.ts` als startpunt.
4. Voeg routes toe in `src/App.tsx` en in `staticwebapp.config.json` als ze beveiligd moeten zijn.
5. Maak in Azure een Static Web App aan, koppel de GitHub-repo, en zet het deployment token als secret `AZURE_STATIC_WEB_APPS_API_TOKEN`.
6. Zet `SQL_CONNECTION_STRING` in de app settings van de SWA, en voer `db/schema.sql` uit op de database.
7. Ken de rol `admin` toe aan beheerders via de SWA-uitnodigingen (`/.auth/invite/aad`).

## Beveiligingsregels

- Rollen worden afgedwongen in `staticwebapp.config.json` **én** in elke API-functie. Alleen de frontend verbergen is geen beveiliging.
- Geheimen staan nooit in de frontend of in de repo. Gebruik app settings of Key Vault.
- Alle databasequeries gebruiken parameters (`input`), geen string-aaneenschakeling.
