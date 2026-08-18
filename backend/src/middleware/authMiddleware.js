import jwt from "jsonwebtoken";
import logger from "../config/logger.js";
import { TokenBlacklist } from "../models/index.js";

export const authenticate = async (req, res, next) => {
  let token = req.cookies?.token;
  
  if (!token) {
    const authHeader = req.headers.authorization;
    if (authHeader?.startsWith("Bearer ")) {
      token = authHeader.split(" ")[1];
    }
  }

  if (!token) {
    logger.warn({}, "Access denied - no token provided");
    return res.status(401).json({
      success: false,
      message: "Access denied. No token provided.",
    });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const blacklistedToken = await TokenBlacklist.findOne({
      where: { token },
    });

    if (blacklistedToken) {
      logger.warn({ userId: decoded.id }, "Attempt to use revoked token");
      return res.status(401).json({
        success: false,
        message: "Token has been revoked. Please login again.",
      });
    }

    req.user = decoded;
    req.token = token;

    next();
  } catch (error) {
    logger.warn({ error: error.message }, "Invalid or expired token provided");
    return res.status(401).json({
      success: false,
      message: "Invalid or expired token.",
    });
  }
};