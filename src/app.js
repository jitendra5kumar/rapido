import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import cors from "cors";
const app = express();

// __dirname fix
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// =========================
// EJS SETUP
// =========================
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.use(
  cors({
    origin: "*",
    methods: ["GET", "POST", "PUT", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"],
  }),
);
// =========================
// 🔥 STATIC FILES (VERY IMPORTANT)
// =========================
app.use(express.static(path.join(__dirname, "../public"))); 
// 👆 agar public root me hai


// =========================
app.use(express.json());

// TEST ROUTE
app.get("/test", (req, res) => {
  res.render("test");
});

app.get("/ride-test", (req, res) => {
  res.render("ride-test");
});

export default app;