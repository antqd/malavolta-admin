import { useEffect, useRef, useState } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import { api } from "../../lib/api";

const euro = (v) => {
  const n = Number(v || 0);
  return n.toLocaleString("it-IT", { style: "currency", currency: "EUR" });
};

export default function UsatiForm() {
  const { id } = useParams();
  const isEdit = !!id;
  const nav = useNavigate();
  const fileRef = useRef(null);

  const [form, setForm] = useState({
    name: "",
    photo: "",
    description: "",
    price: "",
    quantity: 0,
  });
  const [err, setErr] = useState(null);
  const [saving, setSaving] = useState(false);
  const [preview, setPreview] = useState("");

  useEffect(() => {
    const s = (form.photo || "").trim();
    if (!s) return setPreview("");
    if (s.startsWith("http://") || s.startsWith("https://") || s.startsWith("data:") || s.startsWith("/"))
      setPreview(s);
    else setPreview("");
  }, [form.photo]);

  useEffect(() => {
    if (!isEdit) return;
    (async () => {
      try {
        const d = await api.getUsato(id);
        setForm({
          name: d.name || "",
          photo: d.photo_url || "",
          description: d.description || "",
          price: ((d.price_cents ?? 0) / 100).toString(),
          quantity: d.quantity ?? 0,
        });
      } catch (e) {
        setErr(e.message);
      }
    })();
  }, [id, isEdit]);

  const onPickFile = async (e) => {
    const f = e.target.files?.[0];
    if (!f) return;
    const reader = new FileReader();
    reader.onload = () => setForm((x) => ({ ...x, photo: String(reader.result) }));
    reader.readAsDataURL(f);
  };

  const onDecQty = () =>
    setForm((x) => ({ ...x, quantity: Math.max(0, Number(x.quantity || 0) - 1) }));
  const onIncQty = () =>
    setForm((x) => ({ ...x, quantity: Number(x.quantity || 0) + 1 }));

  const submit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setErr(null);
    try {
      const body = {
        name: form.name.trim(),
        photo: form.photo || null,
        description: form.description?.trim() || null,
        price: form.price ? Number(String(form.price).replace(",", ".")) : 0,
        quantity: Number(form.quantity) || 0,
      };
      if (isEdit) await api.updateUsato(id, body);
      else await api.createUsato(body);
      nav("/usati");
    } catch (e) {
      setErr(e.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div>
      <div className="row" style={{ alignItems: "center", marginBottom: 16 }}>
        <h2 style={{ margin: 0 }}>
          {isEdit ? `Modifica trattore (Usati) #${id}` : "Nuovo trattore (Usati)"}
        </h2>
        <div style={{ marginLeft: "auto" }}>
          <Link to="/usati" className="btn secondary">← Torna alla lista</Link>
        </div>
      </div>

      {err && <p className="err">{err}</p>}

      <form onSubmit={submit} className="space-y-4">
        <div>
          <label className="label">Nome *</label>
          <input
            className="input"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            required
          />
        </div>

        <div className="row">
          <div>
            <label className="label">Foto (URL o carica file)</label>
            <div className="row" style={{ gap: 8, gridTemplateColumns: "1fr auto" }}>
              <input
                className="input"
                placeholder="https://… oppure verrà riempito se carichi un file"
                value={form.photo}
                onChange={(e) => setForm({ ...form, photo: e.target.value })}
              />
              <button
                type="button"
                className="btn"
                onClick={() => fileRef.current?.click()}
                title="Carica immagine"
              >
                + Immagine
              </button>
              <input
                ref={fileRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={onPickFile}
              />
            </div>
          </div>

          <div>
            <label className="label">Anteprima</label>
            <div
              style={{
                border: "1px solid #e5e7eb",
                borderRadius: 12,
                height: 140,
                width: 220,
                display: "grid",
                placeItems: "center",
                background: "#f7f7f9",
                overflow: "hidden",
              }}
            >
              {preview ? (
                <img src={preview} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
              ) : (
                <span style={{ fontSize: 12, color: "#999" }}>nessuna</span>
              )}
            </div>
          </div>
        </div>

        <div>
          <label className="label">Descrizione</label>
          <textarea
            className="textarea"
            rows={4}
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
            placeholder="Note, caratteristiche, condizioni…"
          />
        </div>

        <div className="row">
          <div>
            <label className="label">Prezzo (€)</label>
            <div className="row" style={{ gridTemplateColumns: "1fr auto", gap: 8 }}>
              <input
                type="number"
                step="0.01"
                className="input"
                value={form.price}
                onChange={(e) => setForm({ ...form, price: e.target.value })}
                placeholder="es. 15999"
                min="0"
              />
              <div className="badge">{euro(form.price)}</div>
            </div>
          </div>

          <div>
            <label className="label">Quantità</label>
            <div className="row" style={{ gridTemplateColumns: "auto 1fr auto", gap: 8 }}>
              <button type="button" className="btn secondary" onClick={onDecQty}>−</button>
              <input
                type="number"
                className="input"
                value={form.quantity}
                onChange={(e) => setForm({ ...form, quantity: e.target.value })}
                min="0"
              />
              <button type="button" className="btn secondary" onClick={onIncQty}>+</button>
            </div>
          </div>
        </div>

        <div className="row" style={{ justifyContent: "flex-end", gap: 8 }}>
          <Link to="/usati" className="btn secondary">Annulla</Link>
          <button className="btn" disabled={saving}>
            {saving ? "Salvo…" : isEdit ? "Salva modifiche" : "Crea trattore"}
          </button>
        </div>
      </form>
    </div>
  );
}