import { useEffect, useState } from "react";
import { NavLink, Outlet, useLocation } from "react-router-dom";
import { Bell, LogOut, Package, Tractor, Users } from "lucide-react";
import { useAuth } from "./lib/auth";
import { api } from "./lib/api";

const primaryNav = [
  { to: "/nuovi", label: "Nuovi", icon: Tractor, match: ["/", "/nuovi"] },
  { to: "/usati", label: "Usati", icon: Package, match: ["/usati"] },
  { to: "/users", label: "Utenti", icon: Users, match: ["/users"] },
];

function AppShell() {
  const { user, logout } = useAuth();
  const location = useLocation();
  const [notifCount, setNotifCount] = useState(null);

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const data = await api.audit.list();
        if (!active) return;
        const total = typeof data.total === "number" ? data.total : data.items?.length || 0;
        setNotifCount(total);
      } catch (err) {
        console.error("Errore caricamento notifiche:", err);
        if (active) setNotifCount(0);
      }
    })();
    return () => {
      active = false;
    };
  }, []);

  const handleLogout = async () => {
    try {
      await logout();
    } catch (err) {
      console.error(err);
    }
  };

  const initials = (user?.name || user?.email || "?")
    .split(" ")
    .map((part) => part?.[0] || "")
    .join("")
    .slice(0, 2)
    .toUpperCase();

  const notificationsLabel =
    notifCount && notifCount > 0 ? `Notifiche (${notifCount})` : "Notifiche";

  const renderNavClass = (to, match, isActive) => {
    const manual = (match || [to]).some((path) =>
      path === "/"
        ? location.pathname === "/"
        : location.pathname === path || location.pathname.startsWith(`${path}/`)
    );
    return `app-nav-item${isActive || manual ? " is-active" : ""}`;
  };

  return (
    <div className="app-shell">
      <header className="app-navbar">
        <NavLink to="/nuovi" className="app-brand" aria-label="Dashboard trattori">
          <div className="brand-logo">AT</div>
          <div>
            <p className="brand-title">Admin Tieri</p>
            <p className="brand-subtitle">Console di gestione</p>
          </div>
        </NavLink>

        <nav className="app-nav">
          {primaryNav.map(({ to, label, icon: Icon, match }) => (
            <NavLink key={to} to={to} className={({ isActive }) => renderNavClass(to, match, isActive)}>
              <Icon size={18} aria-hidden="true" />
              <span>{label}</span>
            </NavLink>
          ))}
        </nav>

        <div className="app-actions">
          <NavLink
            to="/notifications"
            className={({ isActive }) => `app-icon-button${isActive ? " is-active" : ""}`}
            aria-label={notificationsLabel}
            title={notificationsLabel}
          >
            <span className="icon-wrapper">
              <Bell size={18} aria-hidden="true" />
              {notifCount ? (
                <span className="badge-count" aria-hidden="true">
                  {notifCount > 99 ? "99+" : notifCount}
                </span>
              ) : null}
            </span>
            <span className="hidden-sm">Notifiche</span>
          </NavLink>

          {user && (
            <div className="app-user" title={user.email || undefined}>
              <div className="avatar" aria-hidden="true">{initials || "?"}</div>
              <div className="user-meta">
                <span className="user-name">{user.name || "Utente"}</span>
                <span className="user-role">Amministratore</span>
              </div>
            </div>
          )}

          <button type="button" className="app-icon-button" onClick={handleLogout}>
            <LogOut size={18} aria-hidden="true" />
            <span className="hidden-sm">Esci</span>
          </button>
        </div>
      </header>

      <main className="app-main">
        <Outlet />
      </main>
    </div>
  );
}

export default AppShell;
