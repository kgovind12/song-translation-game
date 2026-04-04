import axios from "axios";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { dirname } from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const TOKENS_FILE = path.join(__dirname, "../tokens.json");

let accessToken = null;
let refreshToken = null;

const REDIRECT_URI = process.env.REDIRECT_URI || "http://127.0.0.1:3001/api/spotify/callback";
const SCOPES = "playlist-read-private playlist-read-collaborative";

// Load tokens from file on startup
const loadTokens = () => {
  try {
    if (fs.existsSync(TOKENS_FILE)) {
      const data = JSON.parse(fs.readFileSync(TOKENS_FILE, "utf8"));
      accessToken = data.accessToken;
      refreshToken = data.refreshToken;
      console.log("✅ Loaded saved Spotify tokens");
      return true;
    }
  } catch (error) {
    console.error("Error loading tokens:", error.message);
  }
  return false;
};

// Save tokens to file
const saveTokens = () => {
  try {
    fs.writeFileSync(
      TOKENS_FILE,
      JSON.stringify({ accessToken, refreshToken }, null, 2)
    );
    console.log("💾 Tokens saved");
  } catch (error) {
    console.error("Error saving tokens:", error.message);
  }
};

// Load tokens on module initialization
loadTokens();

export const getAuthUrl = () => {
  const params = new URLSearchParams({
    client_id: process.env.SPOTIFY_CLIENT_ID,
    response_type: "code",
    redirect_uri: REDIRECT_URI,
    scope: SCOPES,
  });
  
  const authUrl = `https://accounts.spotify.com/authorize?${params.toString()}`;
  console.log("Auth URL:", authUrl);
  console.log("Redirect URI being used:", REDIRECT_URI);
  
  return authUrl;
};

export const exchangeCodeForToken = async (code) => {
  try {
    const res = await axios.post(
      "https://accounts.spotify.com/api/token",
      new URLSearchParams({
        grant_type: "authorization_code",
        code: code,
        redirect_uri: REDIRECT_URI,
      }),
      {
        headers: {
          Authorization:
            "Basic " +
            Buffer.from(
              process.env.SPOTIFY_CLIENT_ID +
                ":" +
                process.env.SPOTIFY_CLIENT_SECRET
            ).toString("base64"),
          "Content-Type": "application/x-www-form-urlencoded",
        },
      }
    );

    accessToken = res.data.access_token;
    refreshToken = res.data.refresh_token;
    
    saveTokens(); // Persist tokens
    
    console.log("✅ User authenticated with Spotify");
    return { accessToken, refreshToken };
  } catch (error) {
    console.error("Token exchange error:", error.response?.data || error.message);
    throw error;
  }
};

const refreshAccessToken = async () => {
  if (!refreshToken) {
    throw new Error("No refresh token available. Please login again.");
  }

  try {
    const res = await axios.post(
      "https://accounts.spotify.com/api/token",
      new URLSearchParams({
        grant_type: "refresh_token",
        refresh_token: refreshToken,
      }),
      {
        headers: {
          Authorization:
            "Basic " +
            Buffer.from(
              process.env.SPOTIFY_CLIENT_ID +
                ":" +
                process.env.SPOTIFY_CLIENT_SECRET
            ).toString("base64"),
          "Content-Type": "application/x-www-form-urlencoded",
        },
      }
    );

    accessToken = res.data.access_token;
    saveTokens(); // Persist refreshed token
    
    console.log("🔄 Access token refreshed");
    return accessToken;
  } catch (error) {
    console.error("Token refresh error:", error.response?.data || error.message);
    throw error;
  }
};

export const getPlaylistTracks = async (playlistId) => {
  if (!accessToken) {
    throw new Error("Not authenticated. Please login at /api/spotify/login");
  }

  try {
    const res = await axios.get(
      `https://api.spotify.com/v1/playlists/${playlistId}/items`,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      }
    );

    return res.data.items.map((item) => ({
      artist: item.item.artists[0].name,
      track: item.item.name,
    }));
  } catch (error) {
    // If token expired, try to refresh
    if (error.response?.status === 401 && refreshToken) {
      console.log("Token expired, refreshing...");
      await refreshAccessToken();
      
      // Retry the request with new token
      const res = await axios.get(
        `https://api.spotify.com/v1/playlists/${playlistId}/items`,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );

      return res.data.items.map((item) => ({
        artist: item.item.artists[0].name,
        track: item.item.name,
      }));
    }
    
    console.error("Playlist error details:", error.response?.data);
    console.error("Status:", error.response?.status);
    console.error("Playlist ID:", playlistId);
    throw error;
  }
};