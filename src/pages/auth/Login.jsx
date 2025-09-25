import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../../lib/auth";

export default function Login() {
  // The CLI bundles separately; we fallback to window context injection set in main
  const { login } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [err, setErr] = useState(null);
  const [loading, setLoading] = useState(false);
  const nav = useNavigate();
  const loc = useLocation();

  const submit = async (e) => {
    e.preventDefault();
    setErr(null);
    setLoading(true);
    try {
      await login(email, password);
      const to = loc.state?.from?.pathname || "/nuovi";
      nav(to, { replace: true });
    } catch (e) {
      setErr(e.message || "Login fallito");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 px-4">
      <div className="w-full max-w-sm bg-white p-6 rounded-lg shadow">
        <h2 className="text-xl font-bold mb-6 text-center">Login</h2>
        <form onSubmit={submit} className="space-y-3">
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="border rounded px-3 py-2 w-full focus:outline-none focus:ring-2 focus:ring-black"
            placeholder="Email"
            required
          />
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="border rounded px-3 py-2 w-full focus:outline-none focus:ring-2 focus:ring-black"
            placeholder="Password"
            required
          />
          {err && <p className="text-red-600 text-sm">{err}</p>}
          <button disabled={loading} className="bg-black text-white px-4 py-2 rounded w-full hover:bg-gray-800 disabled:opacity-50 transition">
            {loading ? "…" : "Entra"}
          </button>
        </form>
      </div>
    </div>
  );
}
