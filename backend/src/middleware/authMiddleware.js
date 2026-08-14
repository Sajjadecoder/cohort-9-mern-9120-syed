import jwt from "jsonwebtoken";
import logger from "../config/logger.js";

export const authenticate = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    logger.warn({}, "Access denied - no token provided");
    return res.status(401).json({
      success: false,
      message: "Access denied. No token provided.",
    });
  }

  const token = authHeader.split(" ")[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    req.user = decoded;

    next();
  } catch (error) {
    logger.warn({ error: error.message }, "Invalid or expired token provided");
    return res.status(401).json({
      success: false,
      message: "Invalid or expired token.",
    });
  }
};