"use client";

import { useState } from "react";

interface SongData {
  artist: string;
  track: string;
  translated: string;
}

// Developer Notes content
const DEVELOPER_NOTES = {
  name: "Krithika",
  intro: "Hi! My name is Krithika and I love creating games. A few notes about Strofi:",
  notes: [
    "This game uses real song lyrics from popular playlists across different languages.",
    "The name Strofi comes from the word 'strophe', which is used in many languages to mean 'stanza' or 'verse'.",
    "The translation is powered by Google Cloud Translation API, which is why the lyrics may sound a bit funny at times.",
    "Playlists are fetched using the Spotify API, and lyrics are retrieved using Lyrics.ovh and LRCLIB. Both of these services have rate limits, so if you see any errors, that's likely why!",
    "Feel free to submit feedback using the feedback button in the top right of the page.",
    "This is a passion project I built in my free time to combine my love for music, languages, and coding. I hope you enjoy playing it as much as I enjoyed building it!",
    "Lastly, please support me by sharing the game with your friends and following me using the links below. I have many more fun projects in the works!"
  ],
  links: [
    { label: "LinkedIn", url: "https://linkedin.com/in/krithikagovind" },
    { label: "GitHub", url: "https://github.com/kgovind12" },
    { label: "Personal Website", url: "https://krithikagovind.me" }
  ]
};

export default function Home() {
  const [fromLang, setFromLang] = useState("hi");
  const [toLang, setToLang] = useState("en");
  const [guess, setGuess] = useState("");
  const [songData, setSongData] = useState<SongData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [visibleStanzas, setVisibleStanzas] = useState(1);
  const [showDevNotes, setShowDevNotes] = useState(false);

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

    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:3001';

    try {
      const response = await fetch(
        `${apiUrl}/api/song?lang=${fromLang}&target=${toLang}`
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
      {/* Developer Notes Button - Fixed to top right */}
      <button
        onClick={() => setShowDevNotes(true)}
        className="fixed top-4 right-4 text-gray-400 hover:text-white text-sm font-medium transition-colors cursor-pointer z-10"
      >
        Developer Notes
      </button>

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

      {/* Developer Notes Modal */}
      {showDevNotes && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4"
          onClick={() => setShowDevNotes(false)}
        >
          <div 
            className="bg-[#1a1a1a] rounded-2xl p-8 border border-gray-800 max-w-2xl w-full"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-3xl font-bold">Developer Notes</h2>
              <button
                onClick={() => setShowDevNotes(false)}
                className="text-gray-400 hover:text-white text-2xl cursor-pointer"
              >
                ×
              </button>
            </div>
            
            <p className="text-gray-300 mb-4">
              {DEVELOPER_NOTES.intro}
            </p>
            
            <ul className="list-disc list-outside ml-5 space-y-2 text-gray-300 mb-6">
              {DEVELOPER_NOTES.notes.map((note, index) => (
                <li key={index}>{note}</li>
              ))}
            </ul>

            <div className="border-t border-gray-700 pt-4">
              <p className="text-gray-400 text-sm mb-3">Connect with me:</p>
              <div className="flex flex-wrap gap-4">
                {DEVELOPER_NOTES.links.map((link, index) => (
                  <a
                    key={index}
                    href={link.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-orange-400 hover:text-orange-300 text-sm font-medium transition-colors cursor-pointer underline"
                  >
                    {link.label}
                  </a>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
