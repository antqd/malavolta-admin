import { useEffect, useRef, useState } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import { ArrowLeft, Package, Save, Upload } from "lucide-react";
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

  const title = isEdit ? `Modifica trattore (Usati) #${id}` : "Nuovo trattore (Usati)";

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h1 className="page-title">
            <Package size={24} aria-hidden="true" /> {title}
          </h1>
          <p className="page-description">
            Mantieni aggiornati dati, foto e condizioni dei trattori usati in vendita.
          </p>
        </div>
        <Link to="/usati" className="btn secondary">
          <ArrowLeft size={16} aria-hidden="true" /> Lista
        </Link>
      </div>

      {err && <p className="err">{err}</p>}

      <div className="card form-card">
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

          <div className="row form-row">
            <div>
              <label className="label">Foto (URL o carica file)</label>
              <div className="file-picker">
                <input
                  className="input"
                  placeholder="https://… oppure verrà riempito se carichi un file"
                  value={form.photo}
                  onChange={(e) => setForm({ ...form, photo: e.target.value })}
                />
                <button
                  type="button"
                  className="btn secondary"
                  onClick={() => fileRef.current?.click()}
                  title="Carica immagine"
                >
                  <Upload size={16} aria-hidden="true" /> Carica
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
              <div className="preview-box">
                {preview ? (
                  <img src={preview} alt="Anteprima" />
                ) : (
                  <span>Nessuna immagine</span>
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

          <div className="row form-row">
            <div>
              <label className="label">Prezzo (€)</label>
              <div className="price-row">
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
              <div className="qty-row">
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

          <div className="form-actions">
            <Link to="/usati" className="btn secondary">
              Annulla
            </Link>
            <button className="btn" disabled={saving}>
              <Save size={16} aria-hidden="true" />
              {saving ? " Salvo…" : isEdit ? " Salva modifiche" : " Crea trattore"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
