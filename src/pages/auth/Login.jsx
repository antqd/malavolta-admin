import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Mail, Lock, LoaderCircle } from "lucide-react";
import { useAuth } from "../../lib/auth";

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
    <div className="auth-page">
      <div className="auth-card">
        <h1 className="auth-title">Area Amministratore</h1>
        <p className="auth-subtitle">
          Accedi per gestire catalogo, utenti e notifiche della piattaforma Tieri.
        </p>

        <form onSubmit={submit} className="space-y-4">
          <label className="input-with-icon">
            <Mail size={18} aria-hidden="true" />
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Email"
              required
            />
          </label>

          <label className="input-with-icon">
            <Lock size={18} aria-hidden="true" />
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Password"
              required
            />
          </label>

          {err && <p className="err text-center">{err}</p>}

          <button
            disabled={loading}
            className="btn large"
            type="submit"
          >
            {loading ? (
              <span className="btn-loading">
                <LoaderCircle className="spin" size={16} aria-hidden="true" />
                Accesso in corso…
              </span>
            ) : (
              "Entra"
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
