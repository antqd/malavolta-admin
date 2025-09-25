import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import AppShell from "./App.jsx";
import NuoviList from "./pages/nuovi/List.jsx";
import NuoviForm from "./pages/nuovi/Form.jsx";
import UsatiList from "./pages/usati/List.jsx";
import UsatiForm from "./pages/usati/Form.jsx";
import Notifications from "./pages/notifications/Notifications.jsx";
import Users from "./pages/users/Users.jsx";
import "./index.css";
import { AuthProvider, RequireAuth } from "./lib/auth";
import Login from "./pages/auth/Login.jsx";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route element={<RequireAuth />}>
            <Route path="/" element={<AppShell />}>
              <Route index element={<NuoviList />} />
              <Route path="nuovi" element={<NuoviList />} />
              <Route path="nuovi/new" element={<NuoviForm />} />
              <Route path="nuovi/:id" element={<NuoviForm />} />
              <Route path="usati" element={<UsatiList />} />
              <Route path="usati/new" element={<UsatiForm />} />
              <Route path="usati/:id" element={<UsatiForm />} />
              <Route path="notifications" element={<Notifications />} />
              <Route path="users" element={<Users />} />
            </Route>
          </Route>
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  </React.StrictMode>
);
