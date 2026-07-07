import { Routes, Route, Navigate } from "react-router-dom";
import { AuthenticatedTemplate, UnauthenticatedTemplate } from "@azure/msal-react";
import SignIn from "./pages/SignIn";
import Dashboard from "./pages/Dashboard";
import Accounts  from "./pages/Accounts";
import Leads     from "./pages/Leads";
import Pipeline  from "./pages/Pipeline";
import NewLead   from "./pages/NewLead";
import Layout    from "./components/Layout";

// Sign-in UI moved to src/pages/SignIn.jsx

export default function App() {
  return (
    <>
      <UnauthenticatedTemplate>
        <SignIn />
      </UnauthenticatedTemplate>

      <AuthenticatedTemplate>
        <Layout>
          <Routes>
            <Route path="/"          element={<Navigate to="/dashboard" replace />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/accounts"  element={<Accounts />} />
            <Route path="/leads"     element={<Leads />} />
            <Route path="/pipeline"  element={<Pipeline />} />
            <Route path="/leads/new" element={<NewLead />} />
          </Routes>
        </Layout>
      </AuthenticatedTemplate>
    </>
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
  loginBtn: {
    background: "#0078d4",
    color: "#fff",
    border: "none",
    borderRadius: 6,
    padding: "10px 24px",
    fontSize: 14,
    cursor: "pointer",
    width: "100%",
  },
};
