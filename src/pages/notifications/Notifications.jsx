import { useEffect, useState } from "react";
import { BellRing, CheckCircle2, Clock, Info, ShieldAlert } from "lucide-react";
import { api } from "../../lib/api";

const iconMap = {
  success: CheckCircle2,
  warning: ShieldAlert,
  info: Info,
  muted: Clock,
};

function classify(action = "") {
  const lower = action.toLowerCase();
  if (lower.includes("delete") || lower.includes("error") || lower.includes("fail")) return "warning";
  if (lower.includes("create") || lower.includes("insert") || lower.includes("login")) return "success";
  if (lower.includes("update") || lower.includes("patch")) return "info";
  return "muted";
}

function formatTitle(action, entity) {
  const base = action ? action.replace(/_/g, " ") : "attività";
  const capitalised = base.charAt(0).toUpperCase() + base.slice(1);
  return entity ? `${capitalised} • ${entity}` : capitalised;
}

function formatMessage(meta) {
  if (!meta) return "";
  if (typeof meta === "string") return meta;
  if (meta.message) return meta.message;
  if (meta.detail) return meta.detail;
  const entries = Object.entries(meta);
  if (!entries.length) return "";
  return entries
    .slice(0, 3)
    .map(([key, value]) => `${key}: ${typeof value === "object" ? JSON.stringify(value) : value}`)
    .join(" • ");
}

function formatTime(ts) {
  if (!ts) return "";
  const d = new Date(ts);
  if (Number.isNaN(d.getTime())) return "";
  return d.toLocaleString("it-IT", { dateStyle: "short", timeStyle: "short" });
}

export default function Notifications() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState(null);

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        setLoading(true);
        setErr(null);
        const data = await api.audit.list();
        if (!active) return;
        setItems(data.items || []);
      } catch (error) {
        console.error("Errore notifiche:", error);
        if (active) setErr(error.message || "Errore nel recupero notifiche");
      } finally {
        if (active) setLoading(false);
      }
    })();
    return () => {
      active = false;
    };
  }, []);

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h1 className="page-title">
            <BellRing size={24} aria-hidden="true" /> Notifiche
          </h1>
          <p className="page-description">
            Attività recenti registrate nel log di audit dell'applicazione.
          </p>
        </div>
        <button className="btn" type="button" disabled>
          Segna tutto come letto
        </button>
      </div>

      {err && <p className="err">{err}</p>}

      {loading ? (
        <div className="card">
          <div className="empty-state">Caricamento notifiche…</div>
        </div>
      ) : items.length ? (
        <section className="notifications-grid">
          {items.map(({ action, entity, meta, createdAt }, idx) => {
            const type = classify(action);
            const Icon = iconMap[type] || Info;
            const title = formatTitle(action, entity);
            const message = formatMessage(meta);
            const time = formatTime(createdAt);

            return (
              <article key={`${action}-${entity}-${idx}`} className={`notification-card is-${type}`}>
                <div className="notification-icon" aria-hidden="true">
                  <Icon size={20} />
                </div>
                <div className="notification-content">
                  <header>
                    <h2>{title}</h2>
                    <span>{time}</span>
                  </header>
                  {message ? <p>{message}</p> : null}
                  {!message && meta ? (
                    <pre className="notification-meta">{JSON.stringify(meta, null, 2)}</pre>
                  ) : null}
                </div>
              </article>
            );
          })}
        </section>
      ) : (
        <div className="card">
          <div className="empty-state">Nessuna attività recente.</div>
        </div>
      )}
    </div>
  );
}
