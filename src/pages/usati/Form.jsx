import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { api } from "../../lib/api";

export default function UsatiForm() {
  const { id } = useParams();
  const isEdit = !!id;
  const nav = useNavigate();
  const [form, setForm] = useState({
    name: "",
    photo: "",
    description: "",
    price: "",
    quantity: 0,
  });
  const [err, setErr] = useState(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!isEdit) return;
    (async () => {
      try {
        const d = await api.getUsato(id);
        setForm({
          name: d.name || "",
          photo: d.photo_url || "",
          description: d.description || "",
          price: (d.price_cents ?? 0) / 100,
          quantity: d.quantity ?? 0,
        });
      } catch (e) {
        setErr(e.message);
      }
    })();
  }, [id]);

  const submit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setErr(null);
    try {
      const body = {
        name: form.name,
        photo: form.photo || null,
        description: form.description || null,
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
      <h2 style={{ marginTop: 0 }}>
        {isEdit ? `Modifica trattore (usati) #${id}` : "Nuovo trattore (usati)"}
      </h2>
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
            <label className="label">Foto (URL)</label>
            <input
              className="input"
              placeholder="https://..."
              value={form.photo}
              onChange={(e) => setForm({ ...form, photo: e.target.value })}
            />
          </div>
          <div>
            <label className="label">Anteprima</label>
            <div
              style={{
                border: "1px solid #e5e7eb",
                borderRadius: 12,
                height: 120,
                display: "grid",
                placeItems: "center",
                background: "#f7f7f9",
                overflow: "hidden",
              }}
            >
              {form.photo ? (
                <img
                  src={form.photo}
                  alt=""
                  style={{ maxHeight: 120, objectFit: "cover" }}
                />
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
          />
        </div>

        <div className="row">
          <div>
            <label className="label">Prezzo (€)</label>
            <input
              type="number"
              step="0.01"
              className="input"
              value={form.price}
              onChange={(e) => setForm({ ...form, price: e.target.value })}
            />
          </div>
          <div>
            <label className="label">Quantità</label>
            <input
              type="number"
              className="input"
              value={form.quantity}
              onChange={(e) => setForm({ ...form, quantity: e.target.value })}
            />
          </div>
        </div>

        <button className="btn" disabled={saving}>
          {saving ? "Salvo…" : isEdit ? "Salva" : "Crea"}
        </button>
      </form>
    </div>
  );
}
