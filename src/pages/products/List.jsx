import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { api } from "../../lib/api";

export default function ProductsList() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState(null);

  const load = async () => {
    try {
      setLoading(true);
      const d = await api.listProducts();
      setItems(d.items || []);
    } catch (e) {
      setErr(e.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const delItem = async (id) => {
    if (!confirm("Eliminare?")) return;
    await api.deleteProduct(id);
    setItems(prev => prev.filter(x => x.id !== id));
  };

  if (loading) return <p>Caricamento…</p>;
  if (err) return <p className="text-red-600">{err}</p>;

  return (
    <div>
      <div className="flex gap-2 mb-4">
        <Link to="/products/new" className="px-3 py-2 rounded bg-emerald-600 text-white">+ Prodotto</Link>
      </div>
      <div className="grid md:grid-cols-2 gap-4">
        {items.map(p => (
          <div key={p.id} className="p-4 bg-white shadow rounded-xl">
            <img src={p.photo_url || "https://via.placeholder.com/120x80"} className="w-full h-32 object-cover rounded" />
            <h3 className="font-semibold">{p.name || p.title}</h3>
            {typeof p.price_cents === 'number' && <p>{(p.price_cents/100).toFixed(2)} €</p>}
            {typeof p.quantity !== 'undefined' && <p>Qty: {p.quantity}</p>}
            <div className="mt-2 flex gap-3">
              <Link to={`/products/${p.id}`} className="text-blue-600">Modifica</Link>
              <button onClick={() => delItem(p.id)} className="text-red-600">Elimina</button>
            </div>
          </div>
        ))}
        {!items.length && <p>Nessun prodotto.</p>}
      </div>
    </div>
  );
}

