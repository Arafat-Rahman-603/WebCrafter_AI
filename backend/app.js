import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import dotenv from "dotenv";

import authRoutes from "./route/auth.route.js";
import userRoutes from "./route/user.route.js";
import websiteRoutes from "./route/website.route.js";

dotenv.config();

const app = express();

// Allow both local dev and production frontend
const allowedOrigins = [
  "http://localhost:3000",
  "https://webcrafter-ai.vercel.app",
  "https://webcrafter-ai-server.vercel.app",
];

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (e.g. curl, Postman)
      if (!origin) return callback(null, true);

      // Check if origin is in the allowed list or is a Vercel deployment URL
      const isAllowed =
        allowedOrigins.includes(origin) || origin.endsWith(".vercel.app");

      if (isAllowed) {
        callback(null, true);
      } else {
        callback(new Error(`CORS blocked: ${origin}`));
      }
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
    exposedHeaders: ["Set-Cookie"],
  }),
);

app.use(cookieParser());
app.use(express.json({ limit: "2mb" }));

// Health check
app.get("/", (req, res) => {
  res.json({ success: true, message: "WebCrafter AI server is running 🚀" });
});

app.use("/api/auth", authRoutes);
app.use("/api/user", userRoutes);
app.use("/api/website", websiteRoutes);

export default app;
