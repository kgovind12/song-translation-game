import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import songRoute from "./routes/song.js";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

app.use("/api/song", songRoute);

app.listen(3001, () => {
  console.log("Server running on port 3001");
});