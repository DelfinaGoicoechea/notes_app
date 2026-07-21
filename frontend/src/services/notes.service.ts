import { api } from "../api/api";
import type { Note } from "../types/note";

export const getActiveNotes = async (
  category?: string,
  search?: string
): Promise<Note[]> => {
  const res = await api.get("/notes", { params: { category, search } });
  return res.data;
};


export const getArchivedNotes = async (
  category?: string,
  search?: string
): Promise<Note[]> => {
  const res = await api.get("/notes/archived", { params: { category, search } });
  return res.data;
};

export const createNote = async (data: {
  title: string;
  content: string;
}): Promise<Note> => {
  const res = await api.post("/notes", data);
  return res.data;
};

export const updateNote = async (
  id: number,
  data: { title: string; content: string }
): Promise<Note> => {
  const res = await api.patch(`/notes/${id}`, data);
  return res.data;
};

export const deleteNote = async (id: number) => {
  await api.delete(`/notes/${id}`);
};

export const archiveNote = async (id: number): Promise<Note> => {
  const res = await api.patch(`/notes/${id}/archive`);
  return res.data;
};

export const unarchiveNote = async (id: number): Promise<Note> => {
  const res = await api.patch(`/notes/${id}/unarchive`);
  return res.data;
};

export const addCategoryToNote = async (id: number, name: string): Promise<Note> => {
  const res = await api.post(`/notes/${id}/categories`, { name });
  return res.data;
};

export const removeCategoryFromNote = async (id: number, name: string): Promise<Note> => {
  const res = await api.delete(`/notes/${id}/categories`, { params: { name } });
  return res.data;
};