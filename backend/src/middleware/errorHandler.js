import Sequelize from "sequelize";

const { UniqueConstraintError } = Sequelize;
import ApiError from "../utils/ApiError.js";
import logger from "../config/logger.js";

export default function errorHandler(err, req, res, next) {
  if (err instanceof UniqueConstraintError) {
    logger.warn({ error: err.message }, "Unique constraint violation");
    return res.status(409).json({
      success: false,
      message: "Resource already exists",
    });
  }

  if (err instanceof ApiError) {
    logger.warn({ status: err.status, message: err.message }, "API Error");
    return res.status(err.status).json({
      success: false,
      message: err.message,
    });
  }

  logger.error({ error: err.stack, message: err.message }, "Unexpected error");

  return res.status(500).json({
    success: false,
    message: "Internal server error",
  });
}