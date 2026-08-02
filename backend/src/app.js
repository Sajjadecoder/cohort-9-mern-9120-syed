import express from "express";
import cors from "cors";
import authRoutes from "./routes/authRoutes.js";
import morgan from "morgan";
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
app.use(morgan("dev"));
app.use(express.urlencoded({ extended: true }));


app.get("/health", (req, res) => {
  res.status(200).json({
    success: true,
    message: "Backend is running successfully",
  });
});

app.use("/api/auth", authRoutes);

export default app;