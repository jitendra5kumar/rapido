import express from "express";
import path from "path";
import { fileURLToPath } from "url";

const app = express();

// __dirname fix (ESM ke liye important)
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// =========================
// EJS SETUP (FIXED)
// =========================
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views")); // 🔥 FIX

app.use(express.json());

app.get("/test", (req, res) => {
  res.render("test");
});

export default app;