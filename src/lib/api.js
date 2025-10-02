const BASE = import.meta.env.VITE_BACKEND_URL || "https://api.alfonsomalavolta.com";

async function json(path, init = {}) {
  const { body, headers: extraHeaders, ...rest } = init;
  const isForm = typeof FormData !== "undefined" && body instanceof FormData;
  const defaultHeaders =
    body === undefined || isForm
      ? {}
      : { "Content-Type": "application/json" };

  const r = await fetch(`${BASE}${path}`, {
    credentials: "include",
    body,
    ...rest,
    headers: {
      ...defaultHeaders,
      ...(extraHeaders || {}),
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
  createNuovo: (body) =>
    json(`/api/trattori/nuovi`, { method: "POST", body }),
  updateNuovo: (id, body) =>
    json(`/api/trattori/nuovi/${id}`, {
      method: "PATCH",
      body,
    }),
  deleteNuovo: (id) => json(`/api/trattori/nuovi/${id}`, { method: "DELETE" }),

  // USATI
  listUsati: (q = "") =>
    json(`/api/trattori/usati${q ? `?q=${encodeURIComponent(q)}` : ""}`),
  getUsato: (id) => json(`/api/trattori/usati/${id}`),
  createUsato: (body) =>
    json(`/api/trattori/usati`, { method: "POST", body }),
  updateUsato: (id, body) =>
    json(`/api/trattori/usati/${id}`, {
      method: "PATCH",
      body,
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
