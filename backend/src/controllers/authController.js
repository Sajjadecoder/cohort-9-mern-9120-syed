import {
  registerUser,
  loginUser,
  getMe,
} from "../services/authService.js";

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