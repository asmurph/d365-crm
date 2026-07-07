export function StatCard({ label, value, sub, color = "#111" }) {
  return (
    <div style={s.card}>
      <div style={s.label}>{label}</div>
      <div style={{ ...s.value, color }}>{value}</div>
      {sub && <div style={s.sub}>{sub}</div>}
    </div>
  );
}

export function Badge({ children, variant = "gray" }) {
  const colors = {
    green:  { bg: "#EAF3DE", color: "#27500A" },
    amber:  { bg: "#FAEEDA", color: "#633806" },
    blue:   { bg: "#E6F1FB", color: "#0C447C" },
    red:    { bg: "#FCEBEB", color: "#791F1F" },
    gray:   { bg: "#F1EFE8", color: "#444441" },
    purple: { bg: "#EEEDFE", color: "#3C3489" },
  };
  const c = colors[variant] ?? colors.gray;
  return (
    <span style={{ ...s.badge, background: c.bg, color: c.color }}>
      {children}
    </span>
  );
}

export function Spinner() {
  return (
    <div style={s.spinWrap}>
      <div style={s.spin} />
    </div>
  );
}

export function Empty({ message = "No records found." }) {
  return <div style={s.empty}>{message}</div>;
}

export function ErrorBanner({ message }) {
  return <div style={s.error}>⚠ {message}</div>;
}

export function PageHeader({ title, children }) {
  return (
    <div style={s.header}>
      <h1 style={s.title}>{title}</h1>
      <div>{children}</div>
    </div>
  );
}

const s = {
  card: {
    background: "#f5f5f3", borderRadius: 8, padding: "1rem",
  },
  label: { fontSize: 12, color: "#888", marginBottom: 6 },
  value: { fontSize: 22, fontWeight: 500 },
  sub:   { fontSize: 11, color: "#aaa", marginTop: 4 },
  badge: {
    display: "inline-block", fontSize: 11, fontWeight: 500,
    padding: "2px 8px", borderRadius: 6,
  },
  spinWrap: { display: "flex", justifyContent: "center", padding: "3rem 0" },
  spin: {
    width: 28, height: 28, border: "2px solid #e5e5e5",
    borderTopColor: "#555", borderRadius: "50%",
    animation: "spin 0.7s linear infinite",
  },
  empty: { textAlign: "center", color: "#aaa", padding: "3rem 0", fontSize: 14 },
  error: {
    background: "#FCEBEB", color: "#791F1F", border: "0.5px solid #F09595",
    borderRadius: 8, padding: "10px 14px", fontSize: 13, marginBottom: 16,
  },
  header: {
    display: "flex", alignItems: "center", justifyContent: "space-between",
    marginBottom: "1.5rem",
  },
  title: { fontSize: 20, fontWeight: 500 },
};
