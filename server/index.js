import jobsRoute from "./routes/jobs";
app.use("/api/jobs", jobsRoute);

import dotenv from "dotenv";
dotenv.config();

import express from "express";
import cors from "cors";

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Verify environment variables loaded
console.log("Environment check:");
console.log("RAPIDAPI_HOST:", process.env.RAPIDAPI_HOST);
console.log("PORT:", process.env.PORT);

// Health check endpoint
app.get("/health", (req, res) => {
  res.json({ 
    status: "ok",
    timestamp: new Date().toISOString(),
    env_loaded: !!process.env.RAPIDAPI_HOST
  });
});

// Jobs search endpoint (requires RAPIDAPI_KEY)
app.get("/api/jobs/search", async (req, res) => {
  try {
    if (!process.env.RAPIDAPI_KEY) {
      return res.status(500).json({ 
        error: "RAPIDAPI_KEY not configured",
        message: "Please add your RapidAPI key to server/.env file"
      });
    }
    
    // TODO: Implement actual RapidAPI call
    res.json({ 
      message: "API ready - Add your RAPIDAPI_KEY to server/.env",
      query: req.query,
      env_host: process.env.RAPIDAPI_HOST
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
  console.log(`Health check: http://localhost:${PORT}/health`);
});
