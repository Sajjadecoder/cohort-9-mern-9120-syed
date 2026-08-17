import express from "express";
import cors from "cors";
import authRoutes from "./routes/authRoutes.js";
import noteRoutes from "./routes/noteRoutes.js";
import morgan from "morgan";
import pinoHttp from "pino-http";
import errorHandler from "./middleware/errorHandler.js";
import logger from "./config/logger.js";
const app = express();

const allowedOrigins = [
  "http://localhost:5173",
  "http://localhost:5174",
];


app.use(cors(
    {
        origin: allowedOrigins,
    }
));
app.use(express.json());
app.use(pinoHttp({ logger }));
app.use(morgan("dev"));
app.use(express.urlencoded({ extended: true }));


app.get("/health", (req, res) => {
  res.status(200).json({
    success: true,
    message: "Backend is running successfully",
  });
});

app.use("/api/auth", authRoutes);
app.use("/api/notes",noteRoutes);


app.use(errorHandler);
export default app;