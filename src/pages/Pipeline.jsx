import { useState, useEffect } from "react";
import { useD365 } from "../hooks/useD365";
import { Spinner, ErrorBanner, PageHeader } from "../components/ui";

export default function Pipeline() {
  const { fetchRecords } = useD365();
  const [opps,    setOpps]    = useState([]);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState(null);

  useEffect(() => {
    fetchRecords("opportunities", {
      select: "crceb_name,crceb_estimatedvalue,crceb_contactname",
      filter: "statecode eq 0",
      orderby: "crceb_estimatedvalue desc",
      top: 100,
    })
      .then(setOpps)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, [fetchRecords]);

  const totalValue = opps.reduce((s, o) => s + toNumber(o.crceb_estimatedvalue), 0);

  if (loading) return <Spinner />;

  return (
    <div>
      <PageHeader title="Pipeline">
        <span style={{ fontSize: 13, color: "#555" }}>
          Total: <strong>${totalValue.toLocaleString()}</strong>
        </span>
      </PageHeader>
      {error && <ErrorBanner message={error} />}

      <div style={col}>
        <div style={colHeader}>
          <span style={{ fontWeight: 500, fontSize: 13 }}>Open opportunities</span>
          <span style={countBadge}>{opps.length}</span>
        </div>
        {opps.length === 0
          ? <div style={empty}>No opportunities</div>
          : opps.map((o, idx) => <OppCard key={o.crceb_opportunitiesid ?? `${o.crceb_name}-${idx}`} opp={o} />)
        }
      </div>
    </div>
  );
}

function OppCard({ opp }) {
  return (
    <div style={oppCard}>
      <div style={{ fontSize: 13, fontWeight: 500, marginBottom: 4 }}>{opp.crceb_name || "Unnamed opportunity"}</div>
      {opp.crceb_estimatedvalue != null && (
        <div style={{ fontSize: 12, color: "#27500A", marginBottom: 4 }}>
          ${toNumber(opp.crceb_estimatedvalue).toLocaleString()}
        </div>
      )}
      {opp.crceb_contactname && (
        <div style={{ fontSize: 11, color: "#777" }}>{opp.crceb_contactname}</div>
      )}
    </div>
  );
}

function toNumber(value) {
  if (typeof value === "number") return Number.isFinite(value) ? value : 0;
  if (typeof value === "string") {
    const parsed = Number(value.replace(/[^0-9.-]/g, ""));
    return Number.isFinite(parsed) ? parsed : 0;
  }
  return 0;
}

const board      = { display:"grid", gridTemplateColumns:"minmax(0,1fr)", gap:12 };
const col        = { background:"#f5f5f3", borderRadius:10, padding:"12px 10px", minHeight:300 };
const colHeader  = { display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:4 };
const countBadge = { background:"#e5e5e5", color:"#555", fontSize:11, fontWeight:500, padding:"2px 7px", borderRadius:10 };
const oppCard    = { background:"#fff", border:"0.5px solid #e5e5e5", borderRadius:8, padding:"10px 12px", marginBottom:8 };
const empty      = { fontSize:12, color:"#bbb", textAlign:"center", paddingTop:16 };
