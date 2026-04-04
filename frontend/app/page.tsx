"use client";

import { useState } from "react";

interface SongData {
  artist: string;
  track: string;
  translated: string;
}

export default function Home() {
  const [fromLang, setFromLang] = useState("hi");
  const [toLang, setToLang] = useState("en");
  const [guess, setGuess] = useState("");
  const [songData, setSongData] = useState<SongData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [visibleStanzas, setVisibleStanzas] = useState(1);

  const languages = [
    { code: "en", name: "English" },
    { code: "hi", name: "Hindi" },
    { code: "es", name: "Spanish" },
    { code: "fr", name: "French" },
    { code: "ta", name: "Tamil" },
    { code: "ko", name: "Korean" },
  ];

  const handleSwap = () => {
    setFromLang(toLang);
    setToLang(fromLang);
  };

  const getSong = async () => {
    setLoading(true);
    setError("");
    setSongData(null);
    setGuess("");
    setVisibleStanzas(1); // Reset to show only first stanza

    try {
      const response = await fetch(
        `https://song-translation-game.onrender.com/api/song?lang=${fromLang}&target=${toLang}`
      );

      if (!response.ok) {
        throw new Error("Failed to fetch song");
      }

      const data = await response.json();
      setSongData(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  const showMoreStanzas = () => {
    setVisibleStanzas((prev) => prev + 1);
  };

  // Split lyrics into sections of 4 lines each
  const getStanzas = (lyrics: string) => {
    const lines = lyrics.split('\n').filter(line => line.trim());
    const sections: string[] = [];
    
    for (let i = 0; i < lines.length; i += 4) {
      const section = lines.slice(i, i + 4).join('\n');
      sections.push(section);
    }
    
    return sections;
  };

  const handleSubmitGuess = () => {
    if (!songData) return;

    const correctAnswer = `${songData.artist} - ${songData.track}`.toLowerCase();
    const userGuess = guess.toLowerCase().trim();

    if (
      userGuess === correctAnswer ||
      userGuess === songData.track.toLowerCase()
    ) {
      alert("🎉 Correct! Well done!");
    } else {
      alert(`❌ Wrong! The correct answer was: ${songData.artist} - ${songData.track}`);
    }
  };

  return (
    <div className="min-h-screen bg-[#0f0f0f] text-white px-4 py-10">
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl md:text-5xl font-bold mb-3">
           Welcome to Strofi 🎵
          </h1>
          <p className="text-gray-400 text-lg">
            Guess the original song based on its translated lyrics. Pick
            languages and test your music knowledge across cultures.
          </p>
        </div>

        {/* Controls Card */}
        <div className="bg-[#1a1a1a] rounded-2xl shadow-lg p-6 border border-gray-800 mb-8">
          <div className="flex flex-col md:flex-row items-end gap-4">
            {/* From */}
            <div className="w-full md:w-1/2">
              <label className="block mb-2 text-sm text-gray-400">From:</label>
              <select
                value={fromLang}
                onChange={(e) => setFromLang(e.target.value)}
                className="w-full p-3 rounded-lg bg-[#0f0f0f] border border-gray-700 focus:outline-none focus:ring-2 focus:ring-orange-500"
              >
                {languages.map((lang) => (
                  <option key={lang.code} value={lang.code}>
                    {lang.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Swap Button */}
            <div className="flex items-end justify-center">
              <button
                onClick={handleSwap}
                className="bg-orange-500 hover:bg-orange-600 transition-colors text-white font-semibold px-4 py-3 rounded-lg mt-6 md:mt-0"
              >
                ⇄
              </button>
            </div>

            {/* To */}
            <div className="w-full md:w-1/2">
              <label className="block mb-2 text-sm text-gray-400">To:</label>
              <select
                value={toLang}
                onChange={(e) => setToLang(e.target.value)}
                className="w-full p-3 rounded-lg bg-[#0f0f0f] border border-gray-700 focus:outline-none focus:ring-2 focus:ring-orange-500"
              >
                {languages.map((lang) => (
                  <option key={lang.code} value={lang.code}>
                    {lang.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Get Song Button */}
          <button 
            onClick={getSong}
            disabled={loading}
            className="w-full mt-6 bg-orange-500 hover:bg-orange-600 transition-colors text-white font-semibold py-3 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? "Loading..." : "Get Song"}
          </button>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-900/20 border border-red-500 rounded-2xl p-4 mb-8 text-red-300">
            {error}
          </div>
        )}

        {/* Lyrics Display */}
        <div className="bg-[#1a1a1a] rounded-2xl p-6 border border-gray-800 mb-8 min-h-[200px]">
          {songData ? (
            <>
              <div className="whitespace-pre-wrap text-gray-200 leading-relaxed">
                {getStanzas(songData.translated)
                  .slice(0, visibleStanzas)
                  .map((stanza, index) => (
                    <div key={index} className="mb-4 last:mb-0">
                      {stanza}
                    </div>
                  ))}
              </div>
              
              {visibleStanzas < getStanzas(songData.translated).length && (
                <button
                  onClick={showMoreStanzas}
                  className="mt-4 text-orange-400 hover:text-orange-300 text-sm font-medium flex items-center gap-1 transition-colors"
                >
                  Show more ↓
                </button>
              )}
              
              {visibleStanzas >= getStanzas(songData.translated).length && (
                <p className="mt-4 text-gray-500 text-sm italic">
                  Full song revealed
                </p>
              )}
            </>
          ) : (
            <p className="text-gray-400">
              Translated lyrics will appear here...
            </p>
          )}
        </div>

        {/* Guess Form */}
        <div className="bg-[#1a1a1a] rounded-2xl p-6 border border-gray-800">
          <label className="block mb-2 text-sm text-gray-400">
            Guess the song:
          </label>
          <div className="flex gap-3">
            <input
              type="text"
              value={guess}
              onChange={(e) => setGuess(e.target.value)}
              onKeyPress={(e) => e.key === "Enter" && handleSubmitGuess()}
              placeholder="Enter song name..."
              disabled={!songData}
              className="flex-1 p-3 rounded-lg bg-[#0f0f0f] border border-gray-700 focus:outline-none focus:ring-2 focus:ring-orange-500 disabled:opacity-50"
            />
            <button 
              onClick={handleSubmitGuess}
              disabled={!songData || !guess.trim()}
              className="bg-orange-500 hover:bg-orange-600 transition-colors text-white font-semibold px-5 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Submit
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
