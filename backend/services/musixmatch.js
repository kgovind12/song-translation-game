import axios from "axios";

export const getLyrics = async (artist, track) => {
  const res = await axios.get(
    "https://api.musixmatch.com/ws/1.1/matcher.lyrics.get",
    {
      params: {
        apikey: process.env.MUSIXMATCH_API_KEY,
        q_artist: artist,
        q_track: track,
      },
    }
  );

  return res.data.message.body.lyrics?.lyrics_body || null;
};