import express from "express";
import { getPlaylistTracks } from "../services/spotify.js";
import { getLyrics } from "../services/musixmatch.js";
import { translateLyrics } from "../services/translate.js";

const router = express.Router();

// Example playlist IDs (replace later)
const playlists = {
  hi: "37i9dQZF1DX0XUfTFmNBRM", // Hindi
  es: "37i9dQZF1DX10zKzsJ2jva", // Spanish
};

router.get("/", async (req, res) => {
  const { lang = "hi", target = "en" } = req.query;

  try {
    const tracks = await getPlaylistTracks(playlists[lang]);

    // Pick random song
    const random = tracks[Math.floor(Math.random() * tracks.length)];

    const lyrics = await getLyrics(random.artist, random.track);

    if (!lyrics) {
      return res.status(404).json({ error: "Lyrics not found" });
    }

    const translated = await translateLyrics(lyrics, lang, target);

    res.json({
      artist: random.artist,
      track: random.track,
      translated,
    });
  } catch (err) {
    res.status(500).json({ error: "Something failed" });
  }
});

export default router;