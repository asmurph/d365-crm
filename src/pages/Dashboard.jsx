import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useD365 } from "../hooks/useD365";
import { StatCard, Badge, Spinner, ErrorBanner, PageHeader } from "../components/ui";

export default function Dashboard() {
  const { fetchRecords } = useD365();
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function load() {
      try {
        const [accounts, leads, opps] = await Promise.all([
          fetchRecords("accounts", {
            select: "name,statecode",
            filter: "statecode eq 0",
            top: 5,
            orderby: "createdon desc",
          }),
          fetchRecords("leads", {
            filter: "statecode eq 0",
            top: 5,
            orderby: "createdon desc",
          }),
          fetchRecords("opportunities", {
            select: "crceb_name,crceb_estimatedvalue,crceb_contactname",
            filter: "statecode eq 0",
          }),
        ]);

        const pipelineValue = opps.reduce(
          (sum, o) => sum + (o.crceb_estimatedvalue ?? 0), 0
        );
        const hotLeads = leads.filter((l) => leadQualityCode(l) === 1).length;

        setData({ accounts, leads, opps, pipelineValue, hotLeads });
      } catch (e) {
        setError(e.message);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [fetchRecords]);

  if (loading) return <Spinner />;

  return (
    <div>
      <PageHeader title="Dashboard">
        <button style={btn} onClick={() => navigate("/leads/new")}>
          + New lead
        </button>
      </PageHeader>

      {error && <ErrorBanner message={error} />}

      <div style={grid4}>
        <StatCard
          label="Active accounts"
          value={data?.accounts.length ?? "—"}
          sub="Last 5 shown"
        />
        <StatCard
          label="Open leads"
          value={data?.leads.length ?? "—"}
          sub={`${data?.hotLeads ?? 0} hot leads`}
          color="#0C447C"
        />
        <StatCard
          label="Pipeline value"
          value={`$${((data?.pipelineValue ?? 0) / 1_000_000).toFixed(1)}M`}
          sub="Open opportunities"
          color="#27500A"
        />
        <StatCard
          label="Open opps"
          value={data?.opps.length ?? "—"}
          sub="Active pipeline"
        />
      </div>

      <div style={grid2}>
        <section>
          <h2 style={sectionTitle}>Recent accounts</h2>
          <div style={card}>
            {data?.accounts.map((a) => (
              <div key={a.accountid} style={row}>
                <div style={initCircle("blue")}>{initials(a.name)}</div>
                <span style={{ fontSize: 13 }}>{a.name}</span>
                <Badge variant="green">Active</Badge>
              </div>
            ))}
            <button style={linkBtn} onClick={() => navigate("/accounts")}>
              View all accounts →
            </button>
          </div>
        </section>

        <section>
          <h2 style={sectionTitle}>Recent leads</h2>
          <div style={card}>
            {data?.leads.map((l) => (
              <div key={leadId(l)} style={row}>
                <div style={initCircle("amber")}>{initials(leadName(l))}</div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 13, fontWeight: 500 }}>{leadName(l)}</div>
                  <div style={{ fontSize: 11, color: "#888" }}>{leadCompany(l)}</div>
                </div>
                <Badge variant={leadQualityCode(l) === 1 ? "green" : leadQualityCode(l) === 2 ? "amber" : "gray"}>
                  {leadQualityCode(l) === 1 ? "Hot" : leadQualityCode(l) === 2 ? "Warm" : "Cold"}
                </Badge>
              </div>
            ))}
            <button style={linkBtn} onClick={() => navigate("/leads")}>
              View all leads →
            </button>
          </div>
        </section>  
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
  return lead.crceb_companyname || lead.companyname || "-";
}

function leadQualityCode(lead) {
  return lead.crceb_leadqualitycode ?? lead.leadqualitycode;
}

function leadId(lead) {
  return lead.crceb_leadsid || lead.crceb_leadid || lead.leadid || lead.id || leadName(lead);
}

const btn = {
  background: "#111", color: "#fff", border: "none", borderRadius: 8,
  padding: "8px 18px", fontSize: 13, cursor: "pointer", fontWeight: 500,
};
const grid4  = { display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 12, marginBottom: "1.5rem" };
const grid2  = { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 };
const card   = { background: "#fff", border: "0.5px solid #e5e5e5", borderRadius: 12, padding: "1rem" };
const row    = { display: "flex", alignItems: "center", gap: 10, padding: "8px 0", borderBottom: "0.5px solid #f0f0ee" };
const sectionTitle = { fontSize: 14, fontWeight: 500, marginBottom: 10 };
const linkBtn = { background: "none", border: "none", color: "#0078d4", fontSize: 12, cursor: "pointer", marginTop: 8 };
function initCircle(color) {
  const colors = { blue: ["#E6F1FB","#0C447C"], amber: ["#FAEEDA","#633806"] };
  const [bg, fg] = colors[color] ?? colors.blue;
  return {
    width: 28, height: 28, borderRadius: "50%", background: bg, color: fg,
    display: "flex", alignItems: "center", justifyContent: "center",
    fontSize: 11, fontWeight: 500, flexShrink: 0,
  };
}
