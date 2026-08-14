import bcrypt from "bcrypt";
import { expect } from "chai";
import jwt from "jsonwebtoken";
import request from "supertest";
import app from "../src/app.js";
import sequelize, { User, Note } from "../src/models/index.js";

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
  await Note.destroy({ where: {} });
  await User.destroy({ where: {} });
});

describe("Backend API", () => {
  describe("GET /health", () => {
    it("should return backend health status", async () => {
      const res = await request(app).get("/health");

      expect(res.status).to.equal(200);
      expect(res.body).to.have.property("success", true);
      expect(res.body.message).to.equal("Backend is running successfully");
    });
  });

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

    it("should reject invalid credentials before hitting database logic", async () => {
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
  });

  describe("GET /api/notes", () => {
    it("should require authentication", async () => {
      const res = await request(app).get("/api/notes");

      expect(res.status).to.equal(401);
      expect(res.body.success).to.equal(false);
      expect(res.body.message).to.equal("Access denied. No token provided.");
    });

    it("should reject an invalid token on protected note routes", async () => {
      const res = await request(app)
        .get("/api/notes")
        .set("Authorization", "Bearer invalid.token.here");

      expect(res.status).to.equal(401);
      expect(res.body.success).to.equal(false);
      expect(res.body.message).to.equal("Invalid or expired token.");
    });

    it("should return all notes for an authenticated user", async () => {
      const user = await createUser({ email: `notes.${Date.now()}@example.com` });
      const token = createToken(user);

      await Note.create({
        title: "First note",
        content: "A note body",
        userId: user.id,
      });

      const res = await request(app)
        .get("/api/notes")
        .set("Authorization", `Bearer ${token}`);

      expect(res.status).to.equal(200);
      expect(res.body.success).to.equal(true);
      expect(res.body.notes).to.be.an("array");
      expect(res.body.notes).to.have.lengthOf(1);
      expect(res.body.notes[0].title).to.equal("First note");
    });
  });

  describe("Note CRUD flows", () => {
    it("should create, fetch, update, and delete a note for the authenticated user", async () => {
      const user = await createUser({ email: `crud.${Date.now()}@example.com` });
      const token = createToken(user);

      const createRes = await request(app)
        .post("/api/notes")
        .set("Authorization", `Bearer ${token}`)
        .send({
          title: "Project plan",
          content: "Outline implementation details",
        });

      expect(createRes.status).to.equal(201);
      expect(createRes.body.success).to.equal(true);
      expect(createRes.body.message).to.equal("Note created successfully");
      expect(createRes.body.note.title).to.equal("Project plan");

      const noteId = createRes.body.note.id;

      const getAllRes = await request(app)
        .get("/api/notes")
        .set("Authorization", `Bearer ${token}`);

      expect(getAllRes.status).to.equal(200);
      expect(getAllRes.body.success).to.equal(true);
      expect(getAllRes.body.notes).to.have.lengthOf(1);

      const getOneRes = await request(app)
        .get(`/api/notes/${noteId}`)
        .set("Authorization", `Bearer ${token}`);

      expect(getOneRes.status).to.equal(200);
      expect(getOneRes.body.success).to.equal(true);
      expect(getOneRes.body.note.id).to.equal(noteId);

      const updateRes = await request(app)
        .put(`/api/notes/${noteId}`)
        .set("Authorization", `Bearer ${token}`)
        .send({
          title: "Updated project plan",
          content: "Updated implementation details",
        });

      expect(updateRes.status).to.equal(200);
      expect(updateRes.body.success).to.equal(true);
      expect(updateRes.body.message).to.equal("Note updated successfully");
      expect(updateRes.body.note.title).to.equal("Updated project plan");

      const deleteRes = await request(app)
        .delete(`/api/notes/${noteId}`)
        .set("Authorization", `Bearer ${token}`);

      expect(deleteRes.status).to.equal(200);
      expect(deleteRes.body.success).to.equal(true);
      expect(deleteRes.body.message).to.equal("Note deleted successfully");

      const fetchAfterDelete = await request(app)
        .get(`/api/notes/${noteId}`)
        .set("Authorization", `Bearer ${token}`);

      expect(fetchAfterDelete.status).to.equal(404);
      expect(fetchAfterDelete.body.message).to.equal("Note not found");
    });
  });
});
