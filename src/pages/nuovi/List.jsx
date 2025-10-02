import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Tractor, Plus, RefreshCcw } from "lucide-react";
import { api } from "../../lib/api";

const euro = (cents) =>
  typeof cents === "number"
    ? (cents / 100).toLocaleString("it-IT", { style: "currency", currency: "EUR", maximumFractionDigits: 0 })
    : "—";

export default function NuoviList() {
  const [items, setItems] = useState([]);
  const [q, setQ] = useState("");
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState(null);

  const load = async () => {
    try {
      setLoading(true);
      setErr(null);
      const d = await api.listNuovi(q);
      setItems(d.items || []);
    } catch (e) {
      setErr(e.message);
    } finally {
      setLoading(false);
    }
  };

  const delItem = async (id) => {
    if (!confirm("Eliminare questo trattore?")) return;
    await api.deleteNuovo(id);
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
            <Tractor size={24} aria-hidden="true" /> Trattori nuovi
          </h1>
          <p className="page-description">
            Gestisci il catalogo dei trattori nuovi, aggiorna prezzi e disponibilità in tempo reale.
          </p>
        </div>
        <div className="page-actions">
          <button className="btn secondary" type="button" onClick={load}>
            <RefreshCcw size={16} aria-hidden="true" /> Aggiorna
          </button>
          <Link to="/nuovi/new" className="btn">
            <Plus size={16} aria-hidden="true" /> Nuovo
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
                <div className="row inventory-row">
                  <img
                    src={
                      (p.photo_url || "").startsWith("http") || (p.photo_url || "").startsWith("data:")
                        ? p.photo_url
                        : (p.photo_url || "").startsWith("/")
                        ? p.photo_url
                        : "https://via.placeholder.com/240x160?text=No+Photo"
                    }
                    className="thumb thumb-list"
                    alt={p.name}
                  />

                  <div className="inventory-content">
                    <div className="row inventory-header">
                      <h3 className="inventory-title">
                        {p.name}
                      </h3>
                      <span className="badge">{euro(p.price_cents)}</span>
                    </div>

                    <div className="inventory-description">
                      {p.description || "—"}
                    </div>

                    <div className="row inventory-footer">
                      <span>
                        Codice: <strong>{p.id}</strong> • Qty: <strong>{p.quantity}</strong>
                      </span>
                      {p.quantity === 1 && (
                        <span className="badge badge-warning">
                          Solo 1 disponibile
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="actions inventory-actions">
                    <Link to={`/nuovi/${p.id}`} className="btn secondary">Modifica</Link>
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
