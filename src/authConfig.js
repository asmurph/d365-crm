// ─────────────────────────────────────────────
// Replace these three values with your own:
// ─────────────────────────────────────────────
export const AZURE_CLIENT_ID = "";
export const AZURE_TENANT_ID = "";
export const D365_ORG_URL   = "";
// ─────────────────────────────────────────────

export const msalConfig = {
  auth: {
    clientId:    AZURE_CLIENT_ID,
    authority:   `https://login.microsoftonline.com/${AZURE_TENANT_ID}`,
    redirectUri: window.location.origin,
  },
  cache: {
    cacheLocation:    "sessionStorage",
    storeAuthStateInCookie: false,
  },
};

export const loginRequest = {
  scopes: [`${D365_ORG_URL}/.default`],
};

export const D365_ENTITY_LOGICAL_NAMES = {
  lead: "crceb_leads",
  leads: "crceb_leads",
  opportunity: "crceb_opportunities",
  opportunities: "crceb_opportunities",
};

// D365 option-set mappings
export const LEAD_SOURCE_CODES = {
  Advertisement:  1,
  "Cold call":    2,
  Employee:       3,
  Event:          4,
  Partner:        5,
  Referral:       6,
  Web:            8,
  LinkedIn:       9,
  Other:         10,
};

export const LEAD_QUALITY_CODES = {
  Hot:  1,
  Warm: 2,
  Cold: 3,
};

export const OPPORTUNITY_STAGES = ["New", "Qualify", "Propose", "Close"];
