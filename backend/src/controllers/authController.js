import {
  registerUser,
  loginUser,
  getMe,
  logoutUser,
} from "../services/authService.js";
import logger from "../config/logger.js";

export const register = async (req, res, next) => {
  try {
    const result = await registerUser(req.body);

    return res.status(201).json(result);
  } catch (error) {
    next(error);
  }
};

export const login = async (req, res, next) => {
  try {
    const result = await loginUser(req.body);

    return res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};

export const getCurrentUser = async (req, res, next) => {
  try {
    const result = await getMe(req.user.id);

    return res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};

export const logout = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader.split(" ")[1];

    const result = await logoutUser(req.user.id, token);

    return res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};