import { expect } from "chai";
import jwt from "jsonwebtoken";
import request from "supertest";
import app from "../src/app.js";
import sequelize, { User, Note } from "../src/models/index.js";

const JWT_SECRET = "test-secret";

const createUser = async (overrides = {}) => {
  const timeStamp = Date.now();

  return User.create({
    name: "Alice",
    email: `alice.${timeStamp}@example.com`,
    password: "hashed-password",
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

describe("Notes API", () => {
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

    it("should reject empty title and content when creating a note", async () => {
      const user = await createUser({ email: `empty.${Date.now()}@example.com` });
      const token = createToken(user);

      const res = await request(app)
        .post("/api/notes")
        .set("Authorization", `Bearer ${token}`)
        .send({
          title: "   ",
          content: " ",
        });

      expect(res.status).to.equal(400);
      expect(res.body.success).to.equal(false);
      expect(res.body.message).to.equal("Title is required");
    });

    it("should reject empty title updates", async () => {
      const user = await createUser({ email: `update.${Date.now()}@example.com` });
      const token = createToken(user);
      const note = await Note.create({
        title: "Old title",
        content: "Old content",
        userId: user.id,
      });

      const res = await request(app)
        .put(`/api/notes/${note.id}`)
        .set("Authorization", `Bearer ${token}`)
        .send({
          title: "   ",
          content: "Updated content",
        });

      expect(res.status).to.equal(400);
      expect(res.body.success).to.equal(false);
      expect(res.body.message).to.equal("Title cannot be empty");
    });

    it("should reject invalid note id format", async () => {
      const user = await createUser({ email: `invalidid.${Date.now()}@example.com` });
      const token = createToken(user);

      const res = await request(app)
        .get("/api/notes/not-a-valid-uuid")
        .set("Authorization", `Bearer ${token}`);

      expect(res.status).to.equal(400);
      expect(res.body.success).to.equal(false);
      expect(res.body.message).to.equal("Invalid note id");
    });

    it("should reject access to notes belonging to another user", async () => {
      const firstUser = await createUser({ email: `first.${Date.now()}@example.com` });
      const secondUser = await createUser({ email: `second.${Date.now()}@example.com` });

      const note = await Note.create({
        title: "Private note",
        content: "This should not be accessible",
        userId: firstUser.id,
      });

      const token = createToken(secondUser);
      const res = await request(app)
        .get(`/api/notes/${note.id}`)
        .set("Authorization", `Bearer ${token}`);

      expect(res.status).to.equal(404);
      expect(res.body.success).to.equal(false);
      expect(res.body.message).to.equal("Note not found");
    });
  });
});
