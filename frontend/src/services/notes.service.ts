import { api } from "../api/api";
import type { Note } from "../types/note";

export const getActiveNotes = async (): Promise<Note[]> => {
  const res = await api.get("/notes");
  return res.data;
};

export const getActiveNotesByCategory = async (
  category: string
): Promise<Note[]> => {
  const res = await api.get("/notes", { params: { category } });
  return res.data;
};

export const getArchivedNotes = async (): Promise<Note[]> => {
  const res = await api.get("/notes/archived");
  return res.data;
};

export const getArchivedNotesByCategory = async (
  category: string
): Promise<Note[]> => {
  const res = await api.get("/notes/archived", { params: { category } });
  return res.data;
};

export const createNote = async (data: {
  title: string;
  content: string;
}) => {
  await api.post("/notes", data);
};

export const updateNote = async (
  id: number,
  data: { title: string; content: string }
) => {
  await api.patch(`/notes/${id}`, data);
};

export const deleteNote = async (id: number) => {
  await api.delete(`/notes/${id}`);
};

export const archiveNote = async (id: number) => {
  await api.patch(`/notes/${id}/archive`);
};

export const unarchiveNote = async (id: number) => {
  await api.patch(`/notes/${id}/unarchive`);
};

export const addCategoryToNote = async (id: number, name: string) => {
  const res = await api.post(`/notes/${id}/categories`, { name });
  return res.data as Note;
};

export const removeCategoryFromNote = async (id: number, name: string) => {
  const res = await api.delete(`/notes/${id}/categories`, { params: { name } });
  return res.data as Note;
};