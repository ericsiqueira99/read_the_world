import express from "express";
import cors from "cors";
import path from 'path';
import { readFileSync, existsSync, writeFileSync } from "fs";
import { getUserMap, parseGoodreadsUser, getCachedResult, setCachedResult } from "./helper.js";
import { fileURLToPath } from 'url';
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const app = express();
app.use(cors());
app.use(express.json());

app.post("/api/books", async (req, res) => {
  try {
    const user = req.body.user;
    if (!user) return res.status(400).json({ error: "Missing user parameter" });
    const userId = parseGoodreadsUser(user);
    const result = await getUserMap(userId);
    return res.json(result);
  } catch (e) {
    console.error("Caught error:", e.message);
    if (e.message.includes("401")) {
      return res.status(401).json({ error: "This Goodreads profile is private. Make your shelf public and try again." });
    }
    return res.status(500).json({ error: e.message });
  }
});

// --- Serve React frontend ---
app.use(express.static(path.join(__dirname, './frontend/dist')));

// Catch-all: send index.html for any non-API route (for React Router)
app.get('/{*path}', (req, res) => {
  res.sendFile(path.join(__dirname, './frontend/dist/index.html'));
});

app.listen(3001, () => console.log("Server running on http://localhost:3001"));
