import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import debateRoute from "./routes/debate.js";
import authRoute from "./routes/auth.js";
import historyRoute from "./routes/history.js";
import feedbackRoute from "./routes/feedback.js";
import exportRoute from "./routes/export.js";
import { connectDB } from "./config/db.js";

dotenv.config();

const app = express();

// Enable CORS globally for all origins, methods, and headers
app.use(cors({
  origin: true, // Reflect request origin
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With", "Accept"]
}));

app.use(express.json());

// Initialize MongoDB connection
connectDB();

app.get("/", (req, res) => {
  res.send("LexAgent Backend Running 🚀");
});

// Mount Authentication, History, Feedback, Export & Debate Routes
app.use("/api/auth", authRoute);
app.use("/api/history", historyRoute);
app.use("/api/feedback", feedbackRoute);
app.use("/api/export", exportRoute);
app.use("/api/debate", debateRoute);

const PORT = process.env.PORT || 5000;

app.listen(PORT, "0.0.0.0", () => {
  console.log(`Server running on http://localhost:${PORT} and http://127.0.0.1:${PORT}`);
});