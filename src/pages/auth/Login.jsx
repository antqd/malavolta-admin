import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useContext } from "react";
import { createContext } from "react";

// We will consume AuthCtx defined in main via globalThis to avoid circular import
const AuthCtx = (globalThis).__ADMIN_AUTH_CTX__ || createContext(null);

export default function Login() {
  // The CLI bundles separately; we fallback to window context injection set in main
  const auth = useContext(AuthCtx);
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
      await auth.login(email, password);
      const to = loc.state?.from?.pathname || "/nuovi";
      nav(to, { replace: true });
    } catch (e) {
      setErr(e.message || "Login fallito");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-sm mx-auto">
      <h2 className="text-lg font-semibold mb-4">Login</h2>
      <form onSubmit={submit} className="space-y-3">
        <input
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="border p-2 w-full"
          placeholder="Email"
        />
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="border p-2 w-full"
          placeholder="Password"
        />
        {err && <p className="text-red-600">{err}</p>}
        <button disabled={loading} className="bg-black text-white px-4 py-2 rounded w-full">
          {loading ? "…" : "Entra"}
        </button>
      </form>
    </div>
  );
}

