import express from "express";
import { getPlaylistTracks } from "../services/spotify.js";
import { translateLyrics } from "../services/translate.js";
import { getLyricsFromLRCLIB } from "../services/lrclib.js";
import { getLyricsFromOVH } from "../services/lyricsovh.js";

const router = express.Router();

// Example playlist IDs (replace later)
const playlists = {
  en: "37i9dQZF1DXcBWIGoYBM5M", // English (Today's Top Hits)
  hi: "5haXqGhMX44HRO9rWRdEfZ", // Bollywood Hits
  es: "1x5OgWCPDfRtsGsdbWGAYm", // Spanish
  fr: "5haXqGhMX44HRO9rWRdEfZ", // Top 50 Global
};

router.get("/", async (req, res) => {
  const { lang = "hi", target = "en" } = req.query;

  try {
    const tracks = await getPlaylistTracks(playlists[lang]);

    // Try multiple songs until we find one with lyrics
    for (let i = 0; i < 5; i++) {
      const random =
        tracks[Math.floor(Math.random() * tracks.length)];

      console.log("Trying:", random);

      let lyrics =
        (await getLyricsFromLRCLIB(random.artist, random.track)) ||
        (await getLyricsFromOVH(random.artist, random.track));

      if (!lyrics) continue;

      const translated = await translateLyrics(
        lyrics,
        lang,
        target
      );

      return res.json({
        artist: random.artist,
        track: random.track,
        translated,
      });
    }

    res.status(404).json({ error: "No songs with lyrics found" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Something failed" });
  }
});

export default router;