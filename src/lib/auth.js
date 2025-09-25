// src/routes/auth.js
import express from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { pool } from "../db.js";

const router = express.Router();

const isProd = () => process.env.NODE_ENV === "production";
const cookieOpts = {
  httpOnly: true,
  secure: isProd(), // HTTPS in produzione
  sameSite: isProd() ? "none" : "lax", // necessario per subdomini diversi
  maxAge: 7 * 24 * 60 * 60 * 1000, // 7 giorni
  path: "/", // cookie valido su tutto il sito
};

function signToken(admin) {
  return jwt.sign(
    { id: admin.id, email: admin.email, name: admin.name },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES || "7d" }
  );
}

/**
 * POST /api/auth/login
 * body: { email, password }
 * set-cookie: malavolta_token
 */
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body || {};
    if (!email || !password) {
      return res.status(400).json({ error: "Email e password obbligatorie" });
    }

    const [rows] = await pool.query(
      "SELECT id, name, email, password FROM admins WHERE email = ? LIMIT 1",
      [email]
    );
    const admin = rows[0];
    if (!admin) {
      return res.status(401).json({ error: "Email o password errati" });
    }

    const ok = await bcrypt.compare(password, admin.password);
    if (!ok) {
      return res.status(401).json({ error: "Email o password errati" });
    }

    const token = signToken(admin);
    res.cookie("malavolta_token", token, cookieOpts);
    return res.json({ id: admin.id, name: admin.name, email: admin.email });
  } catch (err) {
    console.error("POST /api/auth/login error:", err);
    return res.status(500).json({ error: "Errore login" });
  }
});

/**
 * GET /api/auth/me
 * ritorna i dati dell'utente se il cookie è valido
 */
router.get("/me", async (req, res) => {
  try {
    const token = req.cookies?.malavolta_token;
    if (!token) return res.status(401).json({ error: "Non autenticato" });

    const payload = jwt.verify(token, process.env.JWT_SECRET);
    // opzionale: ricarica da DB per essere sicuri che esista ancora
    const [rows] = await pool.query(
      "SELECT id, name, email FROM admins WHERE id = ? LIMIT 1",
      [payload.id]
    );
    const admin = rows[0];
    if (!admin) return res.status(401).json({ error: "Non autenticato" });

    return res.json(admin);
  } catch (err) {
    return res.status(401).json({ error: "Token non valido" });
  }
});

/**
 * POST /api/auth/logout
 * invalida il cookie
 */
router.post("/logout", (req, res) => {
  try {
    res.clearCookie("malavolta_token", {
      httpOnly: true,
      secure: isProd(),
      sameSite: isProd() ? "none" : "lax",
      path: "/",
    });
    return res.json({ ok: true });
  } catch (err) {
    return res.status(200).json({ ok: true });
  }
});

export default router;
