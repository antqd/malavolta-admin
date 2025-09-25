import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../../lib/auth";
import { Mail, Lock } from "lucide-react";

export default function Login() {
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
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-100 to-gray-300 px-4">
      <div className="w-full max-w-md bg-white rounded-xl shadow-2xl p-8">
        <h1 className="text-2xl font-extrabold text-center text-gray-800 mb-6">
          Area Amministratore
        </h1>
        <form onSubmit={submit} className="space-y-4">
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="pl-10 border rounded-lg px-3 py-2 w-full focus:outline-none focus:ring-2 focus:ring-black focus:border-black transition"
              placeholder="Email"
              required
            />
          </div>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="pl-10 border rounded-lg px-3 py-2 w-full focus:outline-none focus:ring-2 focus:ring-black focus:border-black transition"
              placeholder="Password"
              required
            />
          </div>

          {err && (
            <p className="text-red-600 text-sm text-center font-medium">{err}</p>
          )}

          <button
            disabled={loading}
            className="bg-black text-white font-semibold px-4 py-2 rounded-lg w-full hover:bg-gray-800 disabled:opacity-50 transition-colors"
          >
            {loading ? "Accesso in corso…" : "Entra"}
          </button>
        </form>
      </div>
    </div>
  );
}