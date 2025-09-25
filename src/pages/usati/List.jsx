import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Package, Plus, RefreshCcw } from "lucide-react";
import { api } from "../../lib/api";

const euro = (cents) =>
  typeof cents === "number"
    ? (cents / 100).toLocaleString("it-IT", { style: "currency", currency: "EUR", maximumFractionDigits: 0 })
    : "—";

export default function UsatiList() {
  const [items, setItems] = useState([]);
  const [q, setQ] = useState("");
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState(null);

  const load = async () => {
    try {
      setLoading(true);
      setErr(null);
      const d = await api.listUsati(q);
      setItems(d.items || []);
    } catch (e) {
      setErr(e.message);
    } finally {
      setLoading(false);
    }
  };

  const delItem = async (id) => {
    if (!confirm("Eliminare questo trattore?")) return;
    await api.deleteUsato(id);
    setItems((prev) => prev.filter((x) => x.id !== id));
  };

  useEffect(() => {
    load();
  }, []);

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h1 className="page-title">
            <Package size={24} aria-hidden="true" /> Trattori usati
          </h1>
          <p className="page-description">
            Controlla lo stato dei trattori usati, aggiorna annunci e disponibilità.
          </p>
        </div>
        <div className="page-actions">
          <button className="btn secondary" type="button" onClick={load}>
            <RefreshCcw size={16} aria-hidden="true" /> Aggiorna
          </button>
          <Link to="/usati/new" className="btn">
            <Plus size={16} aria-hidden="true" /> Nuovo usato
          </Link>
        </div>
      </div>

      <div className="card filters-card">
        <div className="filters-row">
          <input
            className="input"
            placeholder="Cerca per nome o descrizione…"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && load()}
          />
          <button className="btn secondary" type="button" onClick={load}>
            Cerca
          </button>
        </div>
      </div>

      {err && <p className="err">{err}</p>}

      <div className="card list-card">
        {loading ? (
          <div className="empty-state">Caricamento…</div>
        ) : items.length ? (
          <div className="grid">
            {items.map((p) => (
              <div key={p.id} className="cardItem">
                <div className="row" style={{ gap: 12, gridTemplateColumns: "120px 1fr auto" }}>
                  <img
                    src={
                      (p.photo_url || "").startsWith("http") || (p.photo_url || "").startsWith("data:")
                        ? p.photo_url
                        : (p.photo_url || "").startsWith("/")
                        ? p.photo_url
                        : "https://via.placeholder.com/240x160?text=No+Photo"
                    }
                    className="thumb"
                    alt={p.name}
                    style={{ height: 80, width: 120, objectFit: "cover", borderRadius: 8 }}
                  />

                  <div style={{ minWidth: 0 }}>
                    <div className="row" style={{ justifyContent: "space-between", alignItems: "center" }}>
                      <h3 style={{ margin: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                        {p.name}
                      </h3>
                      <span className="badge">{euro(p.price_cents)}</span>
                    </div>

                    <div style={{ fontSize: 12, color: "#666", marginTop: 2 }}>
                      {p.description || "—"}
                    </div>

                    <div className="row" style={{ justifyContent: "space-between", marginTop: 6 }}>
                      <span style={{ fontSize: 12 }}>
                        Codice: <strong>{p.id}</strong> • Qty: <strong>{p.quantity}</strong>
                      </span>
                      {p.quantity === 1 && (
                        <span className="badge" style={{ background: "#fee2e2", color: "#b91c1c" }}>
                          Solo 1 disponibile
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="actions" style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                    <Link to={`/usati/${p.id}`} className="btn secondary">Modifica</Link>
                    <button onClick={() => delItem(p.id)} className="btn danger">Elimina</button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="empty-state">Nessun trattore.</div>
        )}
      </div>
    </div>
  );
}
