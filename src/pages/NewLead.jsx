import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useD365 } from "../hooks/useD365";
import { ErrorBanner, PageHeader } from "../components/ui";
import { LEAD_SOURCE_CODES, LEAD_QUALITY_CODES } from "../authConfig";

const INITIAL = {
  firstname: "", lastname: "", emailaddress1: "", telephone1: "",
  companyname: "", jobtitle: "", leadsourcecode: "Web",
  leadqualitycode: "Warm", description: "",
};

export default function NewLead() {
  const { createRecord } = useD365();
  const navigate = useNavigate();
  const [form,     setForm]     = useState(INITIAL);
  const [saving,   setSaving]   = useState(false);
  const [error,    setError]    = useState(null);
  const [success,  setSuccess]  = useState(false);
  const [fieldErr, setFieldErr] = useState({});

  function set(key, value) {
    setForm((f) => ({ ...f, [key]: value }));
    setFieldErr((e) => ({ ...e, [key]: null }));
  }

  function validate() {
    const errs = {};
    if (!form.firstname.trim()) errs.firstname = "Required";
    if (!form.lastname.trim())  errs.lastname  = "Required";
    if (!form.companyname.trim()) errs.companyname = "Required";
    if (form.emailaddress1 && !/\S+@\S+\.\S+/.test(form.emailaddress1))
      errs.emailaddress1 = "Invalid email";
    return errs;
  }

  async function handleSubmit() {
    const errs = validate();
    if (Object.keys(errs).length) { setFieldErr(errs); return; }

    setSaving(true);
    setError(null);
    try {
      await createRecord("leads", {
        crceb_firstname:       form.firstname.trim(),
        crceb_lastname:        form.lastname.trim(),
        crceb_emailaddress:    form.emailaddress1.trim() || undefined,
        crceb_telephone:       form.telephone1.trim()    || undefined,
        crceb_companyname:     form.companyname.trim(),
        crceb_jobtitle:        form.jobtitle.trim()      || undefined,
        crceb_leadsourcecode:  form.leadsourcecode,
        crceb_leadqualitycode: form.leadqualitycode,
        crceb_description:     form.description.trim()   || undefined,
      });
      setSuccess(true);
      setTimeout(() => navigate("/leads"), 1500);
    } catch (e) {
      setError(e.message);
    } finally {
      setSaving(false);
    }
  }

  return (
    <div style={{ maxWidth: 680 }}>
      <PageHeader title="New lead">
        <button style={cancelBtn} onClick={() => navigate("/leads")}>Cancel</button>
      </PageHeader>

      {error   && <ErrorBanner message={error} />}
      {success && (
        <div style={successBanner}>
          ✓ Lead created! Redirecting to leads…
        </div>
      )}

      <div style={card}>
        <h2 style={section}>Contact info</h2>
        <div style={grid2}>
          <Field label="First name *" error={fieldErr.firstname}>
            <input value={form.firstname} onChange={(e) => set("firstname", e.target.value)} placeholder="Jane" />
          </Field>
          <Field label="Last name *" error={fieldErr.lastname}>
            <input value={form.lastname} onChange={(e) => set("lastname", e.target.value)} placeholder="Smith" />
          </Field>
          <Field label="Email" error={fieldErr.emailaddress1}>
            <input type="email" value={form.emailaddress1} onChange={(e) => set("emailaddress1", e.target.value)} placeholder="jane@company.com" />
          </Field>
          <Field label="Phone">
            <input type="tel" value={form.telephone1} onChange={(e) => set("telephone1", e.target.value)} placeholder="+1 (555) 000-0000" />
          </Field>
        </div>

        <h2 style={{ ...section, marginTop: "1.5rem" }}>Company info</h2>
        <div style={grid2}>
          <Field label="Company *" error={fieldErr.companyname}>
            <input value={form.companyname} onChange={(e) => set("companyname", e.target.value)} placeholder="Acme Corp" />
          </Field>
          <Field label="Job title">
            <input value={form.jobtitle} onChange={(e) => set("jobtitle", e.target.value)} placeholder="VP of Sales" />
          </Field>
          <Field label="Lead source">
            <select value={form.leadsourcecode} onChange={(e) => set("leadsourcecode", e.target.value)}>
              {Object.keys(LEAD_SOURCE_CODES).map((s) => <option key={s}>{s}</option>)}
            </select>
          </Field>
          <Field label="Rating">
            <select value={form.leadqualitycode} onChange={(e) => set("leadqualitycode", e.target.value)}>
              {Object.keys(LEAD_QUALITY_CODES).map((r) => <option key={r}>{r}</option>)}
            </select>
          </Field>
        </div>

        <h2 style={{ ...section, marginTop: "1.5rem" }}>Notes</h2>
        <textarea
          style={{ width: "100%", minHeight: 80, fontSize: 13, padding: 10, fontFamily: "inherit", resize: "vertical" }}
          placeholder="Add any relevant context…"
          value={form.description}
          onChange={(e) => set("description", e.target.value)}
        />

        <div style={{ display:"flex", justifyContent:"flex-end", gap:8, marginTop:"1.25rem" }}>
          <button style={cancelBtn} onClick={() => navigate("/leads")}>Cancel</button>
          <button style={saveBtn} onClick={handleSubmit} disabled={saving}>
            {saving ? "Creating…" : "Create lead"}
          </button>
        </div>
      </div>
    </div>
  );
}

function Field({ label, error, children }) {
  return (
    <div style={{ display:"flex", flexDirection:"column", gap:4 }}>
      <label style={{ fontSize:12, color: error ? "#A32D2D" : "#666" }}>{label}</label>
      {children}
      {error && <span style={{ fontSize:11, color:"#A32D2D" }}>{error}</span>}
    </div>
  );
}

const card        = { background:"#fff", border:"0.5px solid #e5e5e5", borderRadius:12, padding:"1.5rem" };
const grid2       = { display:"grid", gridTemplateColumns:"1fr 1fr", gap:14 };
const section     = { fontSize:13, fontWeight:500, color:"#888", marginBottom:12 };
const cancelBtn   = { fontSize:13, padding:"8px 16px", border:"0.5px solid #ddd", borderRadius:8, background:"#fff", cursor:"pointer" };
const saveBtn     = { fontSize:13, fontWeight:500, padding:"8px 20px", border:"none", borderRadius:8, background:"#111", color:"#fff", cursor:"pointer" };
const successBanner = { background:"#EAF3DE", color:"#27500A", border:"0.5px solid #C0DD97", borderRadius:8, padding:"10px 14px", fontSize:13, marginBottom:16 };
