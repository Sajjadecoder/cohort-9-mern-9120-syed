import bcrypt from "bcrypt";
import { expect } from "chai";
import jwt from "jsonwebtoken";
import request from "supertest";
import app from "../src/app.js";
import sequelize, { User, TokenBlacklist } from "../src/models/index.js";

const JWT_SECRET = "test-secret";

const createUser = async (overrides = {}) => {
  const timeStamp = Date.now();
  const password = overrides.password || "Password123";

  return User.create({
    name: "Alice",
    email: `alice.${timeStamp}@example.com`,
    password: await bcrypt.hash(password, 10),
    ...overrides,
  });
};

const createToken = (user) =>
  jwt.sign({ id: user.id }, process.env.JWT_SECRET, { expiresIn: "7d" });

before(async () => {
  process.env.JWT_SECRET = JWT_SECRET;
  await sequelize.sync({ force: true });
});

beforeEach(async () => {
  await TokenBlacklist.destroy({ where: {} });
  await User.destroy({ where: {} });
});

describe("Auth API", () => {
  describe("POST /api/auth/register", () => {
    it("should reject incomplete registration payload", async () => {
      const res = await request(app).post("/api/auth/register").send({
        name: "Alice",
      });

      expect(res.status).to.equal(400);
      expect(res.body.success).to.equal(false);
      expect(res.body.message).to.equal("All fields are required");
    });

    it("should reject invalid email format", async () => {
      const res = await request(app).post("/api/auth/register").send({
        name: "Alice",
        email: "not-an-email",
        password: "Password123",
      });

      expect(res.status).to.equal(400);
      expect(res.body.success).to.equal(false);
      expect(res.body.message).to.equal("Invalid email format");
    });

    it("should register a valid user", async () => {
      const email = `register.${Date.now()}@example.com`;
      const res = await request(app).post("/api/auth/register").send({
        name: "Alice",
        email,
        password: "Password123",
      });

      expect(res.status).to.equal(201);
      expect(res.body.success).to.equal(true);
      expect(res.body.message).to.equal("User registered successfully");

      const createdUser = await User.findOne({ where: { email } });
      expect(createdUser).to.not.equal(null);
      expect(createdUser.name).to.equal("Alice");
    });

    it("should reject duplicate email registration", async () => {
      const email = `duplicate.${Date.now()}@example.com`;
      await request(app).post("/api/auth/register").send({
        name: "Alice",
        email,
        password: "Password123",
      });

      const res = await request(app).post("/api/auth/register").send({
        name: "Bob",
        email,
        password: "Password456",
      });

      expect(res.status).to.equal(409);
      expect(res.body.success).to.equal(false);
      expect(res.body.message).to.equal("Email already registered");
    });

    it("should reject weak passwords", async () => {
      const res = await request(app).post("/api/auth/register").send({
        name: "Alice",
        email: `weak.${Date.now()}@example.com`,
        password: "weak",
      });

      expect(res.status).to.equal(400);
      expect(res.body.success).to.equal(false);
      expect(res.body.message).to.equal(
        "Password must be at least 8 characters long and contain at least one uppercase letter, one lowercase letter, and one number."
      );
    });
  });

  describe("POST /api/auth/login", () => {
    it("should reject missing email or password", async () => {
      const res = await request(app).post("/api/auth/login").send({
        email: "alice@example.com",
      });

      expect(res.status).to.equal(400);
      expect(res.body.success).to.equal(false);
      expect(res.body.message).to.equal("Email and password are required");
    });

    it("should reject invalid credentials", async () => {
      const res = await request(app).post("/api/auth/login").send({
        email: "no-user@example.com",
        password: "WrongPass123",
      });

      expect(res.status).to.equal(401);
      expect(res.body.success).to.equal(false);
      expect(res.body.message).to.equal("Invalid email or password");
    });

    it("should login a valid user and return a token", async () => {
      const user = await createUser({ email: `login.${Date.now()}@example.com` });
      const res = await request(app).post("/api/auth/login").send({
        email: user.email,
        password: "Password123",
      });

      expect(res.status).to.equal(200);
      expect(res.body.success).to.equal(true);
      expect(res.body.message).to.equal("Login successful");
      expect(res.body.token).to.be.a("string");
      expect(res.body.token.length).to.be.greaterThan(20);
    });
  });

  describe("GET /api/auth/me", () => {
    it("should reject requests without a bearer token", async () => {
      const res = await request(app).get("/api/auth/me");

      expect(res.status).to.equal(401);
      expect(res.body.success).to.equal(false);
      expect(res.body.message).to.equal("Access denied. No token provided.");
    });

    it("should reject an invalid bearer token", async () => {
      const res = await request(app)
        .get("/api/auth/me")
        .set("Authorization", "Bearer invalid.token.here");

      expect(res.status).to.equal(401);
      expect(res.body.success).to.equal(false);
      expect(res.body.message).to.equal("Invalid or expired token.");
    });

    it("should return the authenticated user profile", async () => {
      const user = await createUser({ email: `me.${Date.now()}@example.com` });
      const token = createToken(user);

      const res = await request(app)
        .get("/api/auth/me")
        .set("Authorization", `Bearer ${token}`);

      expect(res.status).to.equal(200);
      expect(res.body.success).to.equal(true);
      expect(res.body.user).to.include({
        id: user.id,
        name: user.name,
        email: user.email,
      });
    });

    it("should return 404 when the token belongs to a deleted user", async () => {
      const user = await createUser({ email: `missing.${Date.now()}@example.com` });
      const token = createToken(user);

      await User.destroy({ where: { id: user.id } });

      const res = await request(app)
        .get("/api/auth/me")
        .set("Authorization", `Bearer ${token}`);

      expect(res.status).to.equal(404);
      expect(res.body.success).to.equal(false);
      expect(res.body.message).to.equal("User not found");
    });
  });

  describe("POST /api/auth/logout", () => {
    it("should reject logout without a bearer token", async () => {
      const res = await request(app).post("/api/auth/logout");

      expect(res.status).to.equal(401);
      expect(res.body.success).to.equal(false);
      expect(res.body.message).to.equal("Access denied. No token provided.");
    });

    it("should revoke a valid token on logout", async () => {
      const user = await createUser({ email: `logout.${Date.now()}@example.com` });
      const token = createToken(user);

      const logoutRes = await request(app)
        .post("/api/auth/logout")
        .set("Authorization", `Bearer ${token}`);

      expect(logoutRes.status).to.equal(200);
      expect(logoutRes.body.success).to.equal(true);
      expect(logoutRes.body.message).to.equal("Token revoked successfully. You are now logged out.");

      const blacklistedToken = await TokenBlacklist.findOne({
        where: { token },
      });
      expect(blacklistedToken).to.not.be.null;
    });

    it("should reject access with a revoked token", async () => {
      const user = await createUser({ email: `revoked.${Date.now()}@example.com` });
      const token = createToken(user);

      await request(app)
        .post("/api/auth/logout")
        .set("Authorization", `Bearer ${token}`);

      const res = await request(app)
        .get("/api/auth/me")
        .set("Authorization", `Bearer ${token}`);

      expect(res.status).to.equal(401);
      expect(res.body.success).to.equal(false);
      expect(res.body.message).to.equal("Token has been revoked. Please login again.");
    });
  });
});
