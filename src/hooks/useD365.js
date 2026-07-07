import { useCallback } from "react";
import { useMsal } from "@azure/msal-react";
import { loginRequest, D365_ORG_URL, D365_ENTITY_LOGICAL_NAMES } from "../authConfig";

const BASE = `${D365_ORG_URL}/api/data/v9.2`;
const ENTITY_SET_CACHE = new Map();
const LOGICAL_ENTITY_ALIASES = {
  account: "account",
  accounts: "account",
  lead: "lead",
  leads: "lead",
  opportunity: "opportunity",
  opportunities: "opportunity",
};

const DEFAULT_HEADERS = {
  "OData-MaxVersion": "4.0",
  "OData-Version":    "4.0",
  Accept:             "application/json",
  "Content-Type":     "application/json",
};

async function withRetry(fn, retries = 3, delayMs = 800) {
  for (let attempt = 0; attempt < retries; attempt++) {
    try {
      return await fn();
    } catch (err) {
      const isThrottle = err?.status === 429;
      if (!isThrottle || attempt === retries - 1) throw err;
      await new Promise((r) => setTimeout(r, delayMs * 2 ** attempt));
    }
  }
}

export function useD365() {
  const { instance, accounts } = useMsal();

  const getToken = useCallback(async () => {
    try {
      const res = await instance.acquireTokenSilent({
        ...loginRequest,
        account: accounts[0],
      });
      return res.accessToken;
    } catch {
      // Silent failure (e.g. consent needed) — fall back to popup
      const res = await instance.acquireTokenPopup(loginRequest);
      return res.accessToken;
    }
  }, [instance, accounts]);

  const authHeaders = useCallback(
    async () => ({
      ...DEFAULT_HEADERS,
      Authorization: `Bearer ${await getToken()}`,
    }),
    [getToken]
  );

  const resolveEntitySetName = useCallback(
    async (entity) => {
      const requested = String(entity).trim();
      const normalized = requested.toLowerCase();
      const logicalName = D365_ENTITY_LOGICAL_NAMES[normalized] ?? LOGICAL_ENTITY_ALIASES[normalized] ?? normalized;
      const cached = ENTITY_SET_CACHE.get(normalized) ?? ENTITY_SET_CACHE.get(logicalName);

      if (cached) return cached;

      const res = await fetch(
        `${BASE}/EntityDefinitions(LogicalName='${logicalName}')?$select=EntitySetName`,
        { headers: await authHeaders() }
      );

      if (!res.ok) {
        ENTITY_SET_CACHE.set(normalized, requested);
        return requested;
      }

      const json = await res.json();
      const entitySetName = json.EntitySetName ?? requested;
      ENTITY_SET_CACHE.set(normalized, entitySetName);
      ENTITY_SET_CACHE.set(logicalName, entitySetName);
      return entitySetName;
    },
    [authHeaders]
  );

  /** List records — supports $select, $filter, $orderby, $top, $expand */
  const fetchRecords = useCallback(
    async (entity, options = {}) => {
      const entitySetName = await resolveEntitySetName(entity);
      const params = new URLSearchParams();
      if (options.select)  params.set("$select",  options.select);
      if (options.filter)  params.set("$filter",  options.filter);
      if (options.orderby) params.set("$orderby", options.orderby);
      if (options.top)     params.set("$top",     options.top);
      if (options.expand)  params.set("$expand",  options.expand);

      const qs = params.toString() ? `?${params}` : "";
      const url = `${BASE}/${entitySetName}${qs}`;

      return withRetry(async () => {
        const res = await fetch(url, { headers: await authHeaders() });
        if (!res.ok) {
          const body = await res.text().catch(() => "");
          const err = new Error(`D365 ${res.status}: ${res.statusText} | ${url}${body ? ` | ${body}` : ""}`);
          err.status = res.status;
          throw err;
        }
        const json = await res.json();
        return json.value;
      });
    },
    [authHeaders, resolveEntitySetName]
  );

  /** Get a single record by ID */
  const getRecord = useCallback(
    async (entity, id, select = "") => {
      const entitySetName = await resolveEntitySetName(entity);
      const qs = select ? `?$select=${select}` : "";
      const res = await fetch(`${BASE}/${entitySetName}(${id})${qs}`, {
        headers: await authHeaders(),
      });
      if (!res.ok) throw new Error(`D365 ${res.status}`);
      return res.json();
    },
    [authHeaders, resolveEntitySetName]
  );

  /** Create a record — returns the created record (Prefer: return=representation) */
  const createRecord = useCallback(
    async (entity, data) => {
      const entitySetName = await resolveEntitySetName(entity);
      return withRetry(async () => {
        const res = await fetch(`${BASE}/${entitySetName}`, {
          method: "POST",
          headers: {
            ...(await authHeaders()),
            Prefer: "return=representation",
          },
          body: JSON.stringify(data),
        });
        if (!res.ok) {
          const body = await res.json().catch(() => ({}));
          throw new Error(body?.error?.message ?? `Create failed: ${res.status}`);
        }
        return res.json();
      });
    },
    [authHeaders, resolveEntitySetName]
  );

  /** Update a record (PATCH) */
  const updateRecord = useCallback(
    async (entity, id, data) => {
      const entitySetName = await resolveEntitySetName(entity);
      const res = await fetch(`${BASE}/${entitySetName}(${id})`, {
        method: "PATCH",
        headers: await authHeaders(),
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error(`Update failed: ${res.status}`);
    },
    [authHeaders, resolveEntitySetName]
  );

  /** Delete a record */
  const deleteRecord = useCallback(
    async (entity, id) => {
      const entitySetName = await resolveEntitySetName(entity);
      const res = await fetch(`${BASE}/${entitySetName}(${id})`, {
        method: "DELETE",
        headers: await authHeaders(),
      });
      if (!res.ok) throw new Error(`Delete failed: ${res.status}`);
    },
    [authHeaders, resolveEntitySetName]
  );

  return { fetchRecords, getRecord, createRecord, updateRecord, deleteRecord };
}
