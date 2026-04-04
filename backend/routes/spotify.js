import express from "express";
import { getAuthUrl, exchangeCodeForToken } from "../services/spotify.js";

const router = express.Router();

// Redirect user to Spotify login
router.get("/login", (req, res) => {
  const authUrl = getAuthUrl();
  res.redirect(authUrl);
});

// Handle Spotify callback
router.get("/callback", async (req, res) => {
  const { code, error } = req.query;

  if (error) {
    return res.status(400).json({ error: "Authentication failed" });
  }

  if (!code) {
    return res.status(400).json({ error: "No code provided" });
  }

  try {
    await exchangeCodeForToken(code);
    
    // Redirect to frontend or send success message
    res.send(`
      <html>
        <body>
          <h1>✅ Successfully authenticated with Spotify!</h1>
          <p>You can close this window and go back to the app.</p>
          <script>
            setTimeout(() => window.close(), 2000);
          </script>
        </body>
      </html>
    `);
  } catch (err) {
    console.error("Callback error:", err);
    res.status(500).json({ error: "Failed to authenticate" });
  }
});

// Check auth status
router.get("/status", (req, res) => {
  res.json({ authenticated: !!accessToken });
});

export default router;
