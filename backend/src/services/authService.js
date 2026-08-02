import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { User } from "../models/index.js";

export const registerUser = async ({ name, email, password }) => {
  // Validate input
  if (!name || !email || !password) {
    throw {
      status: 400,
      message: "All fields are required",
    };
  }

  // Validate email format
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  if (!emailRegex.test(email)) {
    throw {
      status: 400,
      message: "Invalid email format",
    };
  }

  // Validate password
  const passwordRegex =
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/;

  if (!passwordRegex.test(password)) {
    throw {
      status: 400,
      message:
        "Password must be at least 8 characters long and contain at least one uppercase letter, one lowercase letter, and one number.",
    };
  }

  // Check if email already exists
  const existingUser = await User.findOne({
    where: { email },
  });

  if (existingUser) {
    throw {
      status: 409,
      message: "Email already registered",
    };
  }

  // Hash password
  const hashedPassword = await bcrypt.hash(password, 10);

  // Create user
  await User.create({
    name,
    email,
    password: hashedPassword,
  });

  return {
    success: true,
    message: "User registered successfully",
  };
};
export const loginUser = async ({ email, password }) => {
  // Validate input
  if (!email || !password) {
    throw {
      status: 400,
      message: "Email and password are required",
    };
  }

  // Find user
  const user = await User.findOne({
    where: { email },
  });

  if (!user) {
    throw {
      status: 401,
      message: "Invalid email or password",
    };
  }

  // Compare password
  const isPasswordValid = await bcrypt.compare(password, user.password);

  if (!isPasswordValid) {
    throw {
      status: 401,
      message: "Invalid email or password",
    };
  }

  // Generate JWT
  const token = jwt.sign(
    {
      id: user.id,
    },
    process.env.JWT_SECRET,
    {
      expiresIn: "7d",
    }
  );

  return {
    success: true,
    message: "Login successful",
    token
    
  };
};

export const getMe = async (userId) => {
  const user = await User.findByPk(userId, {
    attributes: ["id", "name", "email", "createdAt"],
  });

  if (!user) {
    throw {
      status: 404,
      message: "User not found",
    };
  }

  return {
    success: true,
    user,
  };
};