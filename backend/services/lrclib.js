import axios from "axios";

export const getLyricsFromLRCLIB = async (artist, track) => {
  try {
    const res = await axios.get("https://lrclib.net/api/get", {
      params: {
        artist_name: artist,
        track_name: track,
      },
    });

    return res.data?.plainLyrics || null;
  } catch (err) {
    return null;
  }
};