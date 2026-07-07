import { useState, useEffect, useMemo } from "react";
import { useD365 } from "../hooks/useD365";
import { Badge, Spinner, Empty, ErrorBanner, PageHeader } from "../components/ui";

const PAGE_SIZE = 10;

export default function Accounts() {
  const { fetchRecords } = useD365();
  const [accounts, setAccounts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState(null);
  const [search, setSearch]   = useState("");
  const [industry, setIndustry] = useState("");
  const [page, setPage]       = useState(0);

  useEffect(() => {
    fetchRecords("accounts", {
      select: "name,telephone1,emailaddress1,industrycode,revenue,statecode,_ownerid_value",
      orderby: "name asc",
      top: 200,
    })
      .then(setAccounts)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, [fetchRecords]);

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return accounts.filter((a) => {
      const matchQ = !q || a.name?.toLowerCase().includes(q) || a.emailaddress1?.toLowerCase().includes(q);
      const matchI = !industry || String(a.industrycode) === industry;
      return matchQ && matchI;
    });
  }, [accounts, search, industry]);

  const paged   = filtered.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE);
  const pages   = Math.ceil(filtered.length / PAGE_SIZE);

  if (loading) return <Spinner />;

  return (
    <div>
      <PageHeader title={`Accounts (${filtered.length})`} />
      {error && <ErrorBanner message={error} />}

      <div style={toolbar}>
        <input
          style={{ flex: 1, fontSize: 13 }}
          placeholder="Search by name or email…"
          value={search}
          onChange={(e) => { setSearch(e.target.value); setPage(0); }}
        />
        <select
          style={{ fontSize: 13 }}
          value={industry}
          onChange={(e) => { setIndustry(e.target.value); setPage(0); }}
        >
          <option value="">All industries</option>
          <option value="7">Technology</option>
          <option value="4">Finance</option>
          <option value="9">Healthcare</option>
          <option value="13">Retail</option>
          <option value="1">Agriculture</option>
        </select>
      </div>

      <div style={card}>
        <table style={tbl}>
          <thead>
            <tr>
              {["Account","Email","Phone","Revenue","Status"].map((h) => (
                <th key={h} style={th}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {paged.length === 0
              ? <tr><td colSpan={5}><Empty /></td></tr>
              : paged.map((a) => (
                <tr key={a.accountid} style={trStyle}>
                  <td style={td}>
                    <div style={nameCell}>
                      <div style={avatar}>{initials(a.name)}</div>
                      <span style={{ fontWeight: 500, fontSize: 13 }}>{a.name}</span>
                    </div>
                  </td>
                  <td style={{ ...td, color: "#0078d4", fontSize: 13 }}>{a.emailaddress1 || "—"}</td>
                  <td style={{ ...td, fontSize: 13 }}>{a.telephone1 || "—"}</td>
                  <td style={{ ...td, fontSize: 13 }}>
                    {a.revenue ? `$${Number(a.revenue).toLocaleString()}` : "—"}
                  </td>
                  <td style={td}>
                    <Badge variant={a.statecode === 0 ? "green" : "gray"}>
                      {a.statecode === 0 ? "Active" : "Inactive"}
                    </Badge>
                  </td>
                </tr>
              ))
            }
          </tbody>
        </table>
      </div>

      {pages > 1 && (
        <div style={pagination}>
          <button disabled={page === 0} onClick={() => setPage(page - 1)} style={pageBtn}>← Prev</button>
          <span style={{ fontSize: 13, color: "#888" }}>Page {page + 1} of {pages}</span>
          <button disabled={page >= pages - 1} onClick={() => setPage(page + 1)} style={pageBtn}>Next →</button>
        </div>
      )}
    </div>
  );
}

function initials(name = "") {
  return name.split(" ").slice(0, 2).map((n) => n[0] ?? "").join("").toUpperCase();
}

const card = { background: "#fff", border: "0.5px solid #e5e5e5", borderRadius: 12, overflow: "hidden", marginBottom: 12 };
const tbl  = { width: "100%", borderCollapse: "collapse", tableLayout: "fixed" };
const th   = { textAlign: "left", fontSize: 12, fontWeight: 500, color: "#888", padding: "10px 12px", borderBottom: "0.5px solid #e5e5e5" };
const td   = { padding: "10px 12px", borderBottom: "0.5px solid #f5f5f3", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" };
const trStyle = { cursor: "pointer" };
const nameCell = { display: "flex", alignItems: "center", gap: 8 };
const avatar   = { width: 28, height: 28, borderRadius: "50%", background: "#E6F1FB", color: "#0C447C", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, fontWeight: 500, flexShrink: 0 };
const toolbar  = { display: "flex", gap: 10, marginBottom: 12 };
const pagination = { display: "flex", alignItems: "center", justifyContent: "center", gap: 16, marginTop: 8 };
const pageBtn  = { fontSize: 13, padding: "6px 14px", border: "0.5px solid #ddd", borderRadius: 6, background: "#fff", cursor: "pointer" };
