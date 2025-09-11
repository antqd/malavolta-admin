import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter, Routes, Route, Link } from "react-router-dom";
import NuoviList from "./pages/nuovi/List.jsx";
import NuoviForm from "./pages/nuovi/Form.jsx";
import UsatiList from "./pages/usati/List.jsx";
import UsatiForm from "./pages/usati/Form.jsx";
import "./index.css";

function Layout() {
  return (
    <div className="wrap">
      <header className="topbar">
        <h1>Admin</h1>
        <nav>
          <Link to="/nuovi">Nuovi</Link>
          <Link to="/usati">Usati</Link>
        </nav>
      </header>

      <div className="card">
        <Routes>
          <Route path="/" element={<NuoviList />} />
          <Route path="/nuovi" element={<NuoviList />} />
          <Route path="/nuovi/new" element={<NuoviForm />} />
          <Route path="/nuovi/:id" element={<NuoviForm />} />
          <Route path="/usati" element={<UsatiList />} />
          <Route path="/usati/new" element={<UsatiForm />} />
          <Route path="/usati/:id" element={<UsatiForm />} />
        </Routes>
      </div>
    </div>
  );
}

ReactDOM.createRoot(document.getElementById("root")).render(
  <BrowserRouter>
    <Layout />
  </BrowserRouter>
);
