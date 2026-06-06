// api/books.js
import { getUserMap, parseGoodreadsUser, getCachedResult, setCachedResult } from "../helper.js";

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: "Method not allowed" });

  try {
    const user = req.body.user;
    if (!user) return res.status(400).json({ error: "Missing user parameter" });

    const userId = parseGoodreadsUser(user);

    const cached = await getCachedResult(userId);
    if (cached) return res.json(cached);

    const result = await getUserMap(userId);
    await setCachedResult(userId, result);
    return res.json(result);
  } catch (e) {
    console.error("Caught error:", e.message);
    if (e.message.includes("401")) {
      return res.status(401).json({ error: "This Goodreads profile is private. Make your shelf public and try again." });
    }
    return res.status(500).json({ error: e.message });
  }
}