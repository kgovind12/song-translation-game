import express from "express";
import { getPlaylistTracks } from "../services/spotify.js";
import { translateLyrics } from "../services/translate.js";
import { getLyricsFromLRCLIB } from "../services/lrclib.js";
import { getLyricsFromOVH } from "../services/lyricsovh.js";

const router = express.Router();

// Spotify playlist IDs
const playlists = {
  en: "2krHga3EykNYxzctKR1TjT", // English (Today's Top Hits)
  hi: "3JbQTZaXs0VvKE6NTGD4sU", // Bollywood Hits
  es: "0P7BfLf0GoAAjLq9pIv8Yu", // Spanish
  fr: "43wRnCXnxE2zIXDCYwrvlt", // French
  ko: "2EBz0TQEyNBxkIiOGfspTq", // Korean
  ta: "21LU3jxAcBvTNHR5LT90rh", // Tamil
};

router.get("/", async (req, res) => {
  const { lang = "hi", target = "en" } = req.query;
  
  console.log("=== SONG REQUEST RECEIVED ===");
  console.log("Lang:", lang);
  console.log("Target:", target);
  console.log("Playlist ID:", playlists[lang]);

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
    console.error("ERROR:", err);
    console.error("Error message:", err.message);
    console.error("Error stack:", err.stack);
    res.status(500).json({ error: "Something failed" });
  }
});

export default router;