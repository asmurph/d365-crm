import React, { useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { useMsal } from "@azure/msal-react";

const NAV = [
  { to: "/dashboard", label: "Dashboard",  icon: "⊞" },
  { to: "/accounts",  label: "Accounts",   icon: "🏢" },
  { to: "/leads",     label: "Leads",      icon: "👤" },
  { to: "/pipeline",  label: "Pipeline",   icon: "▤"  },
];

export default function Layout({ children }) {
  const { instance, accounts } = useMsal();
  const navigate = useNavigate();
  const user = accounts[0];
  const [showConfirm, setShowConfirm] = useState(false);

  return (
    <div style={s.shell}>
      <aside style={s.sidebar}>
        <div style={s.logo}>D365 CRM</div>
        <nav style={s.nav}>
          {NAV.map(({ to, label, icon }) => (
            <NavLink
              key={to}
              to={to}
              style={({ isActive }) => ({
                ...s.navLink,
                ...(isActive ? s.navLinkActive : {}),
              })}
            >
              <span style={{ marginRight: 10 }}>{icon}</span>
              {label}
            </NavLink>
          ))}
        </nav>
        <button
          style={s.newLead}
          onClick={() => navigate("/leads/new")}
        >
          + New lead
        </button>
        <div style={s.userBlock}>
          <div style={s.avatar}>{initials(user?.name)}</div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={s.userName}>{user?.name}</div>
            <div style={s.userEmail}>{user?.username}</div>
          </div>
          <button
            style={s.signOut}
            onClick={() => setShowConfirm(true)}
            title="Sign out"
            aria-label="Sign out"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden>
              <path d="M16 17l5-5-5-5" stroke="#666" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M21 12H9" stroke="#666" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M13 19H7a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2h6" stroke="#666" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
        </div>
      </aside>

      {showConfirm && (
        <div style={s.modalOverlay} role="dialog" aria-modal="true" aria-labelledby="logout-title">
          <div style={s.modal}>
            <h3 id="logout-title" style={{ margin: 0, marginBottom: 8 }}>Sign out</h3>
            <p style={{ marginTop: 0, marginBottom: 16 }}>Are you sure you want to sign out?</p>
            <div style={s.modalButtons}>
              <button
                style={s.modalBtn}
                onClick={() => setShowConfirm(false)}
              >
                Cancel
              </button>
              <button
                style={s.modalBtnPrimary}
                onClick={() => {
                  // Proceed with logout via redirect
                  instance.logoutRedirect();
                }}
              >
                Sign out
              </button>
            </div>
          </div>
        </div>
      )}

      <main style={s.main}>{children}</main>
    </div>
  );
}

function initials(name = "") {
  return name.split(" ").slice(0, 2).map((n) => n[0]).join("").toUpperCase();
}

const s = {
  shell:   { display: "flex", height: "100vh", overflow: "hidden" },
  sidebar: {
    width: 220, flexShrink: 0, display: "flex", flexDirection: "column",
    background: "#fff", borderRight: "0.5px solid #e5e5e5", padding: "1.25rem 1rem",
  },
  logo:    { fontSize: 16, fontWeight: 500, marginBottom: "1.5rem", padding: "0 4px" },
  nav:     { display: "flex", flexDirection: "column", gap: 2, flex: 1 },
  navLink: {
    display: "flex", alignItems: "center", padding: "8px 10px",
    borderRadius: 8, fontSize: 14, color: "#555", textDecoration: "none",
    transition: "background 0.15s",
  },
  navLinkActive: { background: "#f0f0ee", color: "#111", fontWeight: 500 },
  newLead: {
    margin: "1rem 0", padding: "9px 14px", background: "#111", color: "#fff",
    border: "none", borderRadius: 8, fontSize: 13, cursor: "pointer", fontWeight: 500,
  },
  userBlock: {
    display: "flex", alignItems: "center", gap: 8,
    paddingTop: "1rem", borderTop: "0.5px solid #e5e5e5",
  },
  avatar: {
    width: 32, height: 32, borderRadius: "50%", background: "#e6f1fb",
    display: "flex", alignItems: "center", justifyContent: "center",
    fontSize: 12, fontWeight: 500, color: "#0c447c", flexShrink: 0,
  },
  userName:  { fontSize: 13, fontWeight: 500, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" },
  userEmail: { fontSize: 11, color: "#888", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" },
  signOut:   { background: "none", border: "none", cursor: "pointer", fontSize: 16, color: "#888" },
  main:      { flex: 1, overflow: "auto", padding: "2rem", background: "#fafaf9" },
  modalOverlay: {
    position: "fixed",
    inset: 0,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    background: "rgba(0,0,0,0.35)",
    zIndex: 60,
  },
  modal: {
    background: "#fff",
    borderRadius: 8,
    padding: "1.25rem",
    width: 360,
    boxShadow: "0 8px 24px rgba(0,0,0,0.12)",
  },
  modalButtons: { display: "flex", justifyContent: "flex-end", gap: 8, marginTop: 8 },
  modalBtn: { padding: "8px 12px", borderRadius: 6, border: "1px solid #d0d0d0", background: "#fff", cursor: "pointer" },
  modalBtnPrimary: { padding: "8px 12px", borderRadius: 6, border: "none", background: "#c62828", color: "#fff", cursor: "pointer" },
};
