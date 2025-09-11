import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { api } from "../../lib/api";

export default function ProductForm() {
  const { id } = useParams();
  const nav = useNavigate();
  const [form, setForm] = useState({
    name: "",
    photo: "",
    description: "",
    price: "",
    quantity: 0,
  });

  useEffect(() => {
    if (!id) return;
    api.listProducts().then((d) => {
      const f = d.items.find((x) => x.id === Number(id));
      if (f)
        setForm({
          name: f.name || f.title || "",
          photo: f.photo_url || "",
          description: f.description || "",
          price: typeof f.price_cents === 'number' ? f.price_cents / 100 : "",
          quantity: typeof f.quantity !== 'undefined' ? f.quantity : 0,
        });
    });
  }, [id]);

  const submit = async (e) => {
    e.preventDefault();
    const body = {
      name: form.name,
      description: form.description,
      photo_url: form.photo,
      price: Number(form.price),
      quantity: Number(form.quantity),
    };
    if (id) await api.updateProduct(id, body);
    else await api.createProduct(body);
    nav("/products");
  };

  return (
    <form onSubmit={submit} className="space-y-4">
      <input
        value={form.name}
        onChange={(e) => setForm({ ...form, name: e.target.value })}
        placeholder="Nome"
        className="border p-2 w-full"
      />
      <input
        value={form.photo}
        onChange={(e) => setForm({ ...form, photo: e.target.value })}
        placeholder="Foto URL"
        className="border p-2 w-full"
      />
      <textarea
        value={form.description}
        onChange={(e) => setForm({ ...form, description: e.target.value })}
        placeholder="Descrizione"
        className="border p-2 w-full"
      />
      <input
        type="number"
        step="0.01"
        value={form.price}
        onChange={(e) => setForm({ ...form, price: e.target.value })}
        placeholder="Prezzo (€)"
        className="border p-2 w-full"
      />
      <input
        type="number"
        value={form.quantity}
        onChange={(e) => setForm({ ...form, quantity: e.target.value })}
        placeholder="Quantità"
        className="border p-2 w-full"
      />
      <button className="bg-black text-white px-4 py-2 rounded">
        {id ? "Salva" : "Crea"}
      </button>
    </form>
  );
}

