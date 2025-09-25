// src/lib/auth.js
import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { Navigate, Outlet, useLocation } from "react-router-dom";
import { api } from "./api";

// ---- CONTEXT ----
export const AuthContext = createContext(null);

// ---- PROVIDER ----
export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);      // { id, name, email } | null
  const [loading, setLoading] = useState(true); // caricamento iniziale sessione

  // Boot: controlla se c'è una sessione valida
  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const me = await api.auth.me();
        if (active) setUser(me);
      } catch {
        if (active) setUser(null);
      } finally {
        if (active) setLoading(false);
      }
    })();
    return () => { active = false; };
  }, []);

  const login = useCallback(async (email, password) => {
    await api.auth.login(email, password); // set-cookie lato server
    const me = await api.auth.me();
    setUser(me);
    return me;
  }, []);

  const logout = useCallback(async () => {
    try {
      await api.auth.logout();
    } finally {
      setUser(null);
    }
  }, []);

  const value = useMemo(() => ({ user, loading, login, logout }), [user, loading, login, logout]);

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

// ---- HOOK ----
export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within <AuthProvider>");
  return ctx;
}

// ---- ROUTE GUARD (React Router v6) ----
export function RequireAuth() {
  const { user, loading } = useAuth();
  const loc = useLocation();

  if (loading) {
    // Spinner super semplice; personalizza se vuoi
    return (
      <div className="w-full flex items-center justify-center py-16">
        <div className="animate-pulse text-gray-500">Verifica sessione…</div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace state={{ from: loc }} />;
  }

  return <Outlet />;
}
