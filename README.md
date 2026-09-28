# D365 CRM Dashboard

A React + Vite app that integrates with **Dynamics 365 Sales** via the Web API (OData v4), authenticated with **Azure AD / MSAL**.

---

## Project structure

```
src/
  authConfig.js          ← Azure AD + D365 config (edit this first)
  main.jsx               ← App entry, MSAL provider
  App.jsx                ← Auth gate + router
  index.css              ← Global styles
  hooks/
    useD365.js           ← Token acquisition + CRUD helpers
  components/
    Layout.jsx           ← Sidebar nav + topbar
    ui.jsx               ← StatCard, Badge, Spinner, etc.
  pages/
    Dashboard.jsx        ← Metrics + recent accounts/leads
    Accounts.jsx         ← Searchable/filterable accounts table
    Leads.jsx            ← Leads list with rating + stage
    Pipeline.jsx         ← Kanban board by opportunity stage
    NewLead.jsx          ← Validated lead creation form
```

---

## Setup

### 1. Azure AD app registration

1. Go to [Azure Portal → App Registrations](https://portal.azure.com/#blade/Microsoft_AAD_RegisteredApps/ApplicationsListBlade) → **New registration**
2. Set **Redirect URI** → type: `SPA`, value: `http://localhost:3000`
3. Under **API Permissions** → Add → `Dynamics CRM` → `user_impersonation`
4. Grant admin consent
5. Copy your **Client ID** and **Tenant ID**

### 2. Configure the app

Edit `src/authConfig.js`:

```js
export const AZURE_CLIENT_ID = "xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx";
export const AZURE_TENANT_ID = "xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx";
export const D365_ORG_URL    = "https://yourorg.crm.dynamics.com";
```

### 3. Install and run

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) — sign in with your Microsoft account.

---

## Run with Docker

### Development container (Vite with hot reload)

```bash
docker compose up --build app-dev
```

App URL: `http://localhost:3000`

### Production container (Nginx serving build)

```bash
docker compose --profile prod up --build app-prod
```

App URL: `http://localhost:8080`

### Optional: plain Docker (without Compose)

```bash
# Development image
docker build --target dev -t d365-crm-app:dev .
docker run --rm -p 3000:3000 d365-crm-app:dev

# Production image
docker build --target prod -t d365-crm-app:prod .
docker run --rm -p 8080:80 d365-crm-app:prod
```

### MSAL redirect URI reminder

Your app uses `window.location.origin` as the redirect URI. Add each Docker URL you use (for example `http://localhost:3000` and/or `http://localhost:8080`) to the Azure App Registration SPA redirect URIs.

---

## Features

| Page | Description |
|---|---|
| **Dashboard** | KPI cards + recent accounts and leads |
| **Accounts** | Search, filter by industry, paginated table |
| **Leads** | Filter by rating (Hot/Warm/Cold), sortable list |
| **Pipeline** | Kanban board grouped by opportunity stage |
| **New Lead** | Validated form with POST to D365 Web API |

---

## Key API patterns used

```
GET  /api/data/v9.2/accounts?$select=name,revenue&$filter=statecode eq 0
GET  /api/data/v9.2/leads?$orderby=createdon desc&$top=50
GET  /api/data/v9.2/opportunities?$filter=statecode eq 0
POST /api/data/v9.2/leads          ← create lead
PATCH /api/data/v9.2/leads({id})   ← update lead
```

---

## Notes

- **Token refresh** is handled automatically by `acquireTokenSilent` with popup fallback
- **Retry logic** with exponential backoff handles D365 throttling (HTTP 429)
- **Option set values** (lead source, rating) are mapped in `authConfig.js`
- For production, set `redirectUri` to your deployed domain in both `authConfig.js` and Azure portal
