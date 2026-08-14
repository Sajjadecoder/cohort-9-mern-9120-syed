import Sequelize from "sequelize";

const { Op } = Sequelize;
import { Note } from "../models/index.js";
import ApiError from "../utils/ApiError.js";
import logger from "../config/logger.js";

const UUID_REGEX =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;


const findOwnedNote = async (noteId, userId) => {
  if (!UUID_REGEX.test(noteId)) {
    throw new ApiError(400, "Invalid note id");
  }

  const note = await Note.findByPk(noteId);

  if (!note || note.userId !== userId) {
    throw new ApiError(404, "Note not found");
  }

  return note;
};

export const createNote = async (userId, { title, content }) => {
  if (!title || !title.trim()) {
    throw new ApiError(400, "Title is required");
  }

  if (!content || !content.trim()) {
    throw new ApiError(400, "Content is required");
  }

  const note = await Note.create({
    title: title.trim(),
    content,
    userId,
  });

  logger.info({ userId, noteId: note.id }, "Note created");

  return {
    success: true,
    message: "Note created successfully",
    note,
  };
};

export const getNotes = async (userId, { search } = {}) => {
  const where = { userId };

  if (search && search.trim()) {
    where.title = { [Op.iLike]: `%${search.trim()}%` };
  }

  const notes = await Note.findAll({
    where,
    order: [["updatedAt", "DESC"]],
  });

  return {
    success: true,
    notes,
  };
};

export const getNoteById = async (userId, noteId) => {
  const note = await findOwnedNote(noteId, userId);

  return {
    success: true,
    note,
  };
};

export const updateNote = async (userId, noteId, { title, content }) => {
  const note = await findOwnedNote(noteId, userId);

  if (title !== undefined) {
    if (!title.trim()) {
      throw new ApiError(400, "Title cannot be empty");
    }
    note.title = title.trim();
  }

  if (content !== undefined) {
    if (!content.trim()) {
      throw new ApiError(400, "Content cannot be empty");
    }
    note.content = content;
  }

  await note.save();

  logger.info({ userId, noteId: note.id }, "Note updated");

  return {
    success: true,
    message: "Note updated successfully",
    note,
  };
};

export const deleteNote = async (userId, noteId) => {
  const note = await findOwnedNote(noteId, userId);

  await note.destroy();

  logger.info({ userId, noteId }, "Note deleted");

  return {
    success: true,
    message: "Note deleted successfully",
  };
};