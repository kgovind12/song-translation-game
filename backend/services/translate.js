import axios from "axios";

export const translateLyrics = async (text, from, to) => {
  const res = await axios.post(
    `https://translation.googleapis.com/language/translate/v2?key=${process.env.GOOGLE_API_KEY}`,
    {
      q: text,
      source: from,
      target: to,
      format: "text",
    },
    {
      headers: {
        "Content-Type": "application/json",
      },
    }
  );

  return res.data.data.translations[0].translatedText;
};