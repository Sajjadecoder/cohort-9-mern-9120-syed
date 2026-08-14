import {
  createNote,
  getNotes,
  getNoteById,
  updateNote,
  deleteNote,
} from "../services/noteService.js";

export const create = async (req, res, next) => {
  try {
    const result = await createNote(req.user.id, req.body);

    return res.status(201).json(result);
  } catch (error) {
    next(error);
  }
};

export const getAll = async (req, res, next) => {
  try {
    const result = await getNotes(req.user.id, req.query);

    return res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};

export const getOne = async (req, res, next) => {
  try {
    const result = await getNoteById(req.user.id, req.params.id);

    return res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};

export const update = async (req, res, next) => {
  try {
    const result = await updateNote(req.user.id, req.params.id, req.body);

    return res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};

export const remove = async (req, res, next) => {
  try {
    const result = await deleteNote(req.user.id, req.params.id);

    return res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};