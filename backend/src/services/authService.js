import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { User, TokenBlacklist } from "../models/index.js";
import ApiError from "../utils/ApiError.js";
import logger from "../config/logger.js";


export const registerUser = async ({ name, email, password }) => {
  if (!name || !email || !password) {
    throw new ApiError(400, "All fields are required");
  }

  const isValidEmail = (email) => {
    const atIndex = email.indexOf("@");
    const dotIndex = email.lastIndexOf(".");

    return (
      atIndex > 0 &&
      dotIndex > atIndex + 1 &&
      dotIndex < email.length - 1 &&
      !/\s/.test(email)
    );
  };

  if (!isValidEmail(email)) {
    throw new ApiError(400, "Invalid email format");
  }

  const passwordRegex =
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/;

  if (!passwordRegex.test(password)) {
    throw new ApiError(
      400,
      "Password must be at least 8 characters long and contain at least one uppercase letter, one lowercase letter, and one number."
    );
  }

  const existingUser = await User.findOne({
    where: { email },
  });

  if (existingUser) {
    throw new ApiError(409, "Email already registered");
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  const newUser = await User.create({
    name,
    email,
    password: hashedPassword,
  });

  logger.info({ userId: newUser.id }, "User registered successfully");

  return {
    success: true,
    message: "User registered successfully",
  };
};



export const loginUser = async ({ email, password }) => {
  if (!email || !password) {
    throw new ApiError(400, "Email and password are required");
  }

  const user = await User.findOne({
    where: { email },
  });

  if (!user) {
    throw new ApiError(401, "Invalid email or password");
  }

  const isPasswordValid = await bcrypt.compare(
    password,
    user.password
  );

  if (!isPasswordValid) {
    logger.warn({}, "Failed login attempt - invalid password");
    throw new ApiError(401, "Invalid email or password");
  }

  const token = jwt.sign(
    {
      id: user.id,
    },
    process.env.JWT_SECRET,
    {
      expiresIn: "7d",
    }
  );

  logger.info({ userId: user.id }, "User logged in successfully");

  return {
    success: true,
    message: "Login successful",
    token,
  };
};

export const getMe = async (userId) => {
  const user = await User.findByPk(userId, {
    attributes: ["id", "name", "email", "createdAt"],
  });

  if (!user) {
    throw new ApiError(404, "User not found");
  }

  return {
    success: true,
    user,
  };
};

export const logoutUser = async (userId, token) => {
  const decoded = jwt.decode(token);

  if (!decoded || !decoded.exp) {
    throw new ApiError(400, "Invalid token");
  }

  const expiresAt = new Date(decoded.exp * 1000);

  await TokenBlacklist.create({
    token,
    userId,
    expiresAt,
  });

  logger.info({ userId }, "Token revoked and added to blacklist");

  return {
    success: true,
    message: "Token revoked successfully. You are now logged out.",
  };
};