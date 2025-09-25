const BASE = import.meta.env.VITE_BACKEND_URL || "https://api.alfonsomalavolta.com";

async function json(path, init) {
  const r = await fetch(`${BASE}${path}`, {
    credentials: "include",
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...(init && init.headers),
    },
  });
  const ct = r.headers.get("content-type") || "";
  const data = ct.includes("application/json")
    ? await r.json()
    : await r.text();
  if (!r.ok) throw new Error(data?.error || data?.raw || data || "Errore API");
  return data;
}

export const api = {
  // NUOVI
  listNuovi: (q = "") =>
    json(`/api/trattori/nuovi${q ? `?q=${encodeURIComponent(q)}` : ""}`),
  getNuovo: (id) => json(`/api/trattori/nuovi/${id}`),
  createNuovo: (b) =>
    json(`/api/trattori/nuovi`, { method: "POST", body: JSON.stringify(b) }),
  updateNuovo: (id, b) =>
    json(`/api/trattori/nuovi/${id}`, {
      method: "PATCH",
      body: JSON.stringify(b),
    }),
  deleteNuovo: (id) => json(`/api/trattori/nuovi/${id}`, { method: "DELETE" }),

  // USATI
  listUsati: (q = "") =>
    json(`/api/trattori/usati${q ? `?q=${encodeURIComponent(q)}` : ""}`),
  getUsato: (id) => json(`/api/trattori/usati/${id}`),
  createUsato: (b) =>
    json(`/api/trattori/usati`, { method: "POST", body: JSON.stringify(b) }),
  updateUsato: (id, b) =>
    json(`/api/trattori/usati/${id}`, {
      method: "PATCH",
      body: JSON.stringify(b),
    }),
  deleteUsato: (id) => json(`/api/trattori/usati/${id}`, { method: "DELETE" }),

  // USERS
  users: {
    list: ({ page = 1, take = 50 } = {}) =>
      json(`/api/users?page=${page}&take=${take}`),
    get: (id) => json(`/api/users/${id}`),
  },

  // AUDIT
  audit: {
    list: () => json(`/api/audit`),
  },

  // AUTH (cookie-based)
  auth: {
    login: (email, password) =>
      json(`/api/auth/login`, {
        method: "POST",
        body: JSON.stringify({ email, password }),
      }),
    me: () => json(`/api/auth/me`, { method: "GET" }),
    logout: () => json(`/api/auth/logout`, { method: "POST" }),
  },
};
