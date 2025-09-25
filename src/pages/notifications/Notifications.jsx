import { useEffect, useState } from "react";
import { BellRing, CheckCircle2, Clock, Info, ShieldAlert, UserCircle } from "lucide-react";
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

function formatTitle(action) {
  const base = action ? action.replace(/_/g, " ") : "attività";
  const capitalised = base.charAt(0).toUpperCase() + base.slice(1);
  return capitalised;
}

function formatMessage(meta) {
  if (!meta) return "";
  if (typeof meta === "string") return meta;
  if (meta.message) return meta.message;
  if (meta.detail) return meta.detail;
  return "";
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
        const list = Array.isArray(data?.items)
          ? data.items
          : Array.isArray(data)
          ? data
          : [];
        setItems(list);
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
          {items.map((item, idx) => {
            const {
              id,
              action,
              entity,
              meta,
              createdAt,
              userEmail,
              userId,
              ip,
              ua,
            } = item || {};
            const type = classify(action);
            const Icon = iconMap[type] || Info;
            const title = formatTitle(action);
            const message = formatMessage(meta);
            const time = formatTime(createdAt);
            const key = id ?? `${action}-${entity}-${idx}`;
            const userLabel = userEmail || (userId ? `Utente #${userId}` : null);
            const metaEntries =
              meta && typeof meta === "object"
                ? Object.entries(meta).filter(([k]) => k !== "message" && k !== "detail")
                : [];
            const entityLabel = entity ? entity.replace(/_/g, " ") : null;

            return (
              <article key={key} className={`notification-card is-${type}`}>
                <div className="notification-icon" aria-hidden="true">
                  <Icon size={20} />
                </div>
                <div className="notification-content">
                  <header>
                    <h2>{title}</h2>
                    <span>{time}</span>
                  </header>
                  {entityLabel ? (
                    <span className={`entity-pill entity-${type}`}>{entityLabel}</span>
                  ) : null}
                  {userLabel ? (
                    <div className="notification-info">
                      <UserCircle size={14} aria-hidden="true" />
                      <span>{userLabel}</span>
                      {ip ? <span className="dot" /> : null}
                      {ip ? <span className="ip">IP {ip}</span> : null}
                    </div>
                  ) : null}
                  {message ? <p>{message}</p> : null}
                  {metaEntries.length ? (
                    <ul className="meta-list">
                      {metaEntries.map(([metaKey, value], metaIdx) => (
                        <li key={`${metaKey}-${metaIdx}`} className="meta-chip">
                          <span className="meta-key">{metaKey}</span>
                          <span className="meta-value">
                            {typeof value === "object" ? JSON.stringify(value) : String(value)}
                          </span>
                        </li>
                      ))}
                    </ul>
                  ) : null}
                  {ua ? <div className="ua">User-Agent: {ua}</div> : null}
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
