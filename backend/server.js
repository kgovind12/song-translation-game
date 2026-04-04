import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { fileURLToPath } from "url";
import { dirname, join } from "path";
import songRoute from "./routes/song.js";
import spotifyRoute from "./routes/spotify.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

dotenv.config({ path: join(__dirname, ".env") });

const app = express();
app.use(cors());
app.use(express.json());

app.use("/api/song", songRoute);
app.use("/api/spotify", spotifyRoute);

app.listen(3001, () => {
  console.log("Server running on http://localhost:3001");
});