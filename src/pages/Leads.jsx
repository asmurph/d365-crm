import { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useD365 } from "../hooks/useD365";
import { Badge, Spinner, Empty, ErrorBanner, PageHeader } from "../components/ui";

const QUALITY = { 1: ["Hot","green"], 2: ["Warm","amber"], 3: ["Cold","gray"] };
const SOURCE  = { 1:"Ad", 2:"Cold call", 3:"Employee", 4:"Event", 6:"Referral", 8:"Web", 9:"LinkedIn" };

export default function Leads() {
  const { fetchRecords } = useD365();
  const navigate = useNavigate();
  const [leads,   setLeads]   = useState([]);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState(null);
  const [search,  setSearch]  = useState("");
  const [rating,  setRating]  = useState("");

  useEffect(() => {
    fetchRecords("leads", {
      orderby: "createdon desc",
      top: 200,
    })
      .then(setLeads)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, [fetchRecords]);

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return leads.filter((l) => {
      const matchQ = !q
        || leadName(l).toLowerCase().includes(q)
        || leadCompany(l).toLowerCase().includes(q);
      const matchR = !rating || String(leadQualityCode(l) ?? "") === rating;
      return matchQ && matchR;
    });
  }, [leads, search, rating]);

  if (loading) return <Spinner />;

  return (
    <div>
      <PageHeader title={`Leads (${filtered.length})`}>
        <button style={btn} onClick={() => navigate("/leads/new")}>+ New lead</button>
      </PageHeader>
      {error && <ErrorBanner message={error} />}

      <div style={toolbar}>
        <input
          style={{ flex: 1, fontSize: 13 }}
          placeholder="Search by name or company…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <select style={{ fontSize: 13 }} value={rating} onChange={(e) => setRating(e.target.value)}>
          <option value="">All ratings</option>
          <option value="1">Hot</option>
          <option value="2">Warm</option>
          <option value="3">Cold</option>
        </select>
      </div>

      <div style={card}>
        <table style={tbl}>
          <thead>
            <tr>
              {["Lead","Company","Source","Rating","Stage","Created"].map((h) => (
                <th key={h} style={th}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0
              ? <tr><td colSpan={6}><Empty /></td></tr>
              : filtered.map((l) => {
                const quality = leadQualityCode(l);
                const [rLabel, rVariant] = QUALITY[quality] ?? ["—", "gray"];
                return (
                  <tr key={leadId(l)} style={{ cursor: "pointer" }}>
                    <td style={td}>
                      <div style={{ display:"flex", alignItems:"center", gap:8 }}>
                        <div style={ava}>{initials(leadName(l))}</div>
                        <span style={{ fontSize:13, fontWeight:500 }}>{leadName(l)}</span>
                      </div>
                    </td>
                    <td style={{ ...td, fontSize:13, color:"#666" }}>{leadCompany(l)}</td>
                    <td style={{ ...td, fontSize:13 }}>{SOURCE[leadSourceCode(l)] || "—"}</td>
                    <td style={td}><Badge variant={rVariant}>{rLabel}</Badge></td>
                    <td style={td}><Badge variant="gray">{leadStage(l)}</Badge></td>
                    <td style={{ ...td, fontSize:12, color:"#888" }}>
                      {l.createdon ? new Date(l.createdon).toLocaleDateString() : "—"}
                    </td>
                  </tr>
                );
              })
            }
          </tbody>
        </table>
      </div>
    </div>
  );
}

function initials(name = "") {
  return name.split(" ").slice(0, 2).map((n) => n[0] ?? "").join("").toUpperCase();
}

function leadName(lead) {
  return (
    lead.crceb_fullname
    || lead.crceb_name
    || [lead.crceb_firstname, lead.crceb_lastname].filter(Boolean).join(" ")
    || lead.fullname
    || [lead.firstname, lead.lastname].filter(Boolean).join(" ")
    || "Unnamed lead"
  );
}

function leadCompany(lead) {
  return lead.crceb_companyname || lead.companyname || "—";
}

function leadQualityCode(lead) {
  return lead.crceb_leadqualitycode ?? lead.leadqualitycode;
}

function leadSourceCode(lead) {
  return lead.crceb_leadsourcecode ?? lead.leadsourcecode;
}

function leadStage(lead) {
  return lead.crceb_stepname || lead.stepname || "New";
}

function leadId(lead) {
  return lead.crceb_leadsid || lead.crceb_leadid || lead.leadid || lead.id || leadName(lead);
}

const card    = { background:"#fff", border:"0.5px solid #e5e5e5", borderRadius:12, overflow:"hidden" };
const tbl     = { width:"100%", borderCollapse:"collapse", tableLayout:"fixed" };
const th      = { textAlign:"left", fontSize:12, fontWeight:500, color:"#888", padding:"10px 12px", borderBottom:"0.5px solid #e5e5e5" };
const td      = { padding:"10px 12px", borderBottom:"0.5px solid #f5f5f3", overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" };
const toolbar = { display:"flex", gap:10, marginBottom:12 };
const btn     = { background:"#111", color:"#fff", border:"none", borderRadius:8, padding:"8px 18px", fontSize:13, cursor:"pointer", fontWeight:500 };
const ava     = { width:28, height:28, borderRadius:"50%", background:"#FAEEDA", color:"#633806", display:"flex", alignItems:"center", justifyContent:"center", fontSize:11, fontWeight:500, flexShrink:0 };
