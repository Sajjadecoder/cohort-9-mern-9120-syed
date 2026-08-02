import { UniqueConstraintError } from "sequelize";
import ApiError from "../utils/ApiError.js";
import logger from "../config/logger.js";

export default function errorHandler(err, req, res, next) {
  if (err instanceof UniqueConstraintError) {
    return res.status(409).json({
      success: false,
      message: "Resource already exists",
    });
  }

  if (err instanceof ApiError) {
    return res.status(err.status).json({
      success: false,
      message: err.message,
    });
  }

  logger.error(err);

  return res.status(500).json({
    success: false,
    message: "Internal server error",
  });
}