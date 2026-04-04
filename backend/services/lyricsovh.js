import axios from "axios";

export const getLyricsFromOVH = async (artist, track) => {
  try {
    const res = await axios.get(
      `https://api.lyrics.ovh/v1/${artist}/${track}`
    );

    return res.data.lyrics || null;
  } catch {
    return null;
  }
};