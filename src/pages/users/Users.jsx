import { useEffect, useMemo, useState } from "react";
import { BadgeCheck, CalendarClock, Mail, UserPlus } from "lucide-react";
import { api } from "../../lib/api";

const takeOptions = [10, 25, 50];

export default function Users() {
  const [items, setItems] = useState([]);
  const [page, setPage] = useState(1);
  const [take, setTake] = useState(25);
  const [pagination, setPagination] = useState(null);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState(null);

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        setLoading(true);
        setErr(null);
        const data = await api.users.list({ page, take });
        if (!active) return;
        setItems(data.items || []);
        setPagination(data.pagination || null);
      } catch (error) {
        console.error("Errore utenti:", error);
        if (active) setErr(error.message || "Errore nel recupero utenti");
      } finally {
        if (active) setLoading(false);
      }
    })();
    return () => {
      active = false;
    };
  }, [page, take]);

  const total = pagination?.total ?? items.length;
  const pages = pagination?.pages ?? 1;
  const showingFrom = useMemo(() => (total === 0 ? 0 : (page - 1) * take + 1), [page, take, total]);
  const showingTo = useMemo(
    () => (total === 0 ? 0 : Math.min(page * take, total)),
    [page, take, total]
  );

  const canPrev = page > 1;
  const canNext = page < pages;

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h1 className="page-title">
            <BadgeCheck size={24} aria-hidden="true" /> Utenti
          </h1>
          <p className="page-description">
            Elenco degli account che possono accedere all'area amministrativa.
          </p>
        </div>
        <div className="page-actions">
          <button type="button" className="btn secondary" disabled>
            Esporta CSV
          </button>
          <button type="button" className="btn">
            <UserPlus size={16} aria-hidden="true" /> Nuovo utente
          </button>
        </div>
      </div>

      <div className="card filters-card">
        <div
          className="filters-row"
          style={{ alignItems: "center", gridTemplateColumns: "auto auto 1fr" }}
        >
          <div className="muted-text">Mostra</div>
          <select
            className="input"
            value={take}
            onChange={(e) => {
              setPage(1);
              setTake(Number(e.target.value));
            }}
            style={{ maxWidth: 120 }}
          >
            {takeOptions.map((opt) => (
              <option key={opt} value={opt}>
                {opt} per pagina
              </option>
            ))}
          </select>
          <div className="muted-text" style={{ justifySelf: "end" }}>
            {total ? `Risultati ${showingFrom} – ${showingTo} su ${total}` : "Nessun utente"}
          </div>
        </div>
      </div>

      {err && <p className="err">{err}</p>}

      <div className="card">
        {loading ? (
          <div className="empty-state">Caricamento utenti…</div>
        ) : items.length ? (
          <>
            <table className="data-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Nome</th>
                  <th>Email</th>
                  <th>Creato</th>
                </tr>
              </thead>
              <tbody>
                {items.map((user) => (
                  <tr key={user.id}>
                    <td>#{user.id}</td>
                    <td>
                      <strong>{user.name || "—"}</strong>
                    </td>
                    <td>
                      <div className="contact-row">
                        <Mail size={14} aria-hidden="true" />
                        <a href={`mailto:${user.email}`}>{user.email}</a>
                      </div>
                    </td>
                    <td>
                      <div className="contact-row">
                        <CalendarClock size={14} aria-hidden="true" />
                        {user.createdAt
                          ? new Date(user.createdAt).toLocaleString("it-IT", {
                              dateStyle: "short",
                              timeStyle: "short",
                            })
                          : "—"}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            <div className="table-footer">
              <div className="muted-text">Pagina {page} di {pages}</div>
              <div className="table-pagination">
                <button
                  className="btn secondary"
                  type="button"
                  onClick={() => canPrev && setPage((p) => Math.max(1, p - 1))}
                  disabled={!canPrev}
                >
                  Precedente
                </button>
                <button
                  className="btn secondary"
                  type="button"
                  onClick={() => canNext && setPage((p) => p + 1)}
                  disabled={!canNext}
                >
                  Successiva
                </button>
              </div>
            </div>
          </>
        ) : (
          <div className="empty-state">Nessun utente disponibile.</div>
        )}
      </div>
    </div>
  );
}
