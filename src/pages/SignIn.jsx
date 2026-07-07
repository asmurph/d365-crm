import React from "react";
import { useMsal } from "@azure/msal-react";
import { loginRequest } from "../authConfig";

export default function SignIn() {
  const { instance } = useMsal();

  const handleSignIn = () => {
    // Use redirect flow for authentication
    instance.loginRedirect(loginRequest).catch((e) => {
      // fallback: log error to console (UI error handling can be added)
      // eslint-disable-next-line no-console
      console.error("MSAL loginRedirect error", e);
    });
  };

  return (
    <div style={styles.loginWrap}>
      <div style={styles.loginCard}>
        <h1 style={styles.loginTitle}>D365 CRM</h1>
        <p style={styles.loginSub}>Sign in with your Microsoft account to continue.</p>

        <button
          style={styles.brandBtn}
          onClick={handleSignIn}
          aria-label="Sign in with Microsoft"
        >
          <span style={styles.logoWrap} aria-hidden>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <rect x="1" y="1" width="10" height="10" fill="#F35325"/>
              <rect x="13" y="1" width="10" height="10" fill="#81BC06"/>
              <rect x="1" y="13" width="10" height="10" fill="#05A6F0"/>
              <rect x="13" y="13" width="10" height="10" fill="#FFBA08"/>
            </svg>
          </span>
          <span style={styles.brandText}>Sign in with Microsoft</span>
        </button>
      </div>
    </div>
  );
}

const styles = {
  loginWrap: {
    minHeight: "100vh",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    background: "#f5f5f3",
  },
  loginCard: {
    background: "#fff",
    border: "0.5px solid #ddd",
    borderRadius: 12,
    padding: "2.5rem 2rem",
    maxWidth: 360,
    width: "100%",
    textAlign: "center",
  },
  loginTitle: { fontSize: 22, fontWeight: 500, marginBottom: 8 },
  loginSub:   { fontSize: 14, color: "#666", marginBottom: 24 },
  brandBtn: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: 12,
    background: "#ffffff",
    color: "#222",
    border: "1px solid #d0d0d0",
    borderRadius: 6,
    padding: "10px 16px",
    fontSize: 14,
    cursor: "pointer",
    width: "100%",
    boxShadow: "0 1px 2px rgba(0,0,0,0.04)",
  },
  logoWrap: {
    display: "inline-flex",
    width: 20,
    height: 20,
  },
  brandText: {
    fontWeight: 500,
  },
};
