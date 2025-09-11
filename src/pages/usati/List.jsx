import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { api } from "../../lib/api";

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
    if (!confirm("Eliminare?")) return;
    await api.deleteUsato(id);
    setItems((prev) => prev.filter((x) => x.id !== id));
  };

  useEffect(() => {
    load();
  }, []);

  return (
    <div className="space-y">
      <div className="row" style={{ gridTemplateColumns: "1fr auto auto" }}>
        <input
          className="input"
          placeholder="Cerca per nome/descrizione…"
          value={q}
          onChange={(e) => setQ(e.target.value)}
        />
        <button className="btn secondary" onClick={load}>
          Cerca
        </button>
        <Link to="/usati/new" className="btn">
          + Usato
        </Link>
      </div>

      {err && <p className="err">{err}</p>}
      {loading ? (
        <p>Caricamento…</p>
      ) : (
        <div className="grid">
          {items.map((p) => (
            <div key={p.id} className="cardItem">
              <img
                src={
                  p.photo_url ||
                  "https://via.placeholder.com/400x260?text=No+Photo"
                }
                className="thumb"
                alt=""
              />
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  marginTop: 8,
                  alignItems: "center",
                }}
              >
                <h3 style={{ margin: 0 }}>{p.name}</h3>
                <span className="badge">
                  {(p.price_cents / 100).toFixed(2)} €
                </span>
              </div>
              <p style={{ fontSize: 12, color: "#666" }}>
                {p.description || "-"}
              </p>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  marginTop: 8,
                }}
              >
                <span style={{ fontSize: 12 }}>Qty: {p.quantity}</span>
                <div className="actions">
                  <Link to={`/usati/${p.id}`} className="btn secondary">
                    Modifica
                  </Link>
                  <button onClick={() => delItem(p.id)} className="btn danger">
                    Elimina
                  </button>
                </div>
              </div>
            </div>
          ))}
          {!items.length && <p>Nessun trattore usato.</p>}
        </div>
      )}
    </div>
  );
}
